/* --- IMPORTS --- */
import Random from "../library/random.js";
import Element from "./element.js";
import Location from "./location.js";
import Cell from "./cell.js";
import Door from "./door.js";
import Stone from "./stone.js";
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Room as default };

/*
 * CLASS: Room [UML]
 *****************************************************************************/
const Room = class extends Element {
  #rows;
  #columns;
  #grid;
  #welcomeLoc;
  #doorLocs;
  #stoneLocs;
  #availableLocs;

  /* --- C'TOR: constructor --- */
  constructor(rows, columns) {
    super();
    Room.#validator(rows, columns);
    [this.#rows, this.#columns] = [rows, columns];

    // create grid
    this.#createGrid();

    // set (random) welcome location
    const x = Random.getRandomInteger(0, columns),
      y = Random.getRandomInteger(0, rows);
    this.setWelcomeLocation(new Location(x, y));

    // create cells
    this.#createCells();
  }

  /* --- METHOD: #validator --- */
  static #validator(rows, columns) {
    if (!Number.isInteger(rows)) {
      throw new ETypeError(`input is not an integer`, rows);
    }
    if (rows < 0) {
      throw new ERangeError(`input is negative`, rows);
    }

    if (!Number.isInteger(columns)) {
      throw new ETypeError(`input is not an integer`, columns);
    }
    if (columns < 0) {
      throw new ERangeError(`input is negative`, columns);
    }
  }

  /* --- METHOD: validateLocation --- */
  validateLocation(loc) {
    if (!(loc instanceof Location)) {
      throw new ETypeError(`input is not of type Location`, loc);
    }
    const rows = this.rows,
      columns = this.columns;
    if (loc.x < 0 || loc >= columns || loc.y < 0 || loc.y >= rows) {
      throw new ERangeError(
        `location is not in the range [${0}, ${rows}] x [${0}, ${columns}]`,
        loc
      );
    }
  }

  /* --- METHOD: getDimensions --- */
  getDimensions() {
    return [this.#rows, this.#columns];
  }

  /* --- METHOD: getCell --- */
  getCell(loc) {
    this.validateLocation(loc);
    return this.#grid[loc.x][loc.y];
  }

  /* --- METHOD: setWelcomeLocation --- */
  setWelcomeLocation(welcomeLoc) {
    this.validateLocation(welcomeLoc);
    this.#welcomeLoc = welcomeLoc;
  }

  /* --- METHOD: getWelcomeLocation --- */
  getWelcomeLocation() {
    return this.#welcomeLoc.clone();
  }

  /* --- METHOD: getDoorLocations --- */
  getDoorLocations() {
    return this.#getElementLocations(this.#doorLocs);
  }

  /* --- METHOD: getStoneLocations --- */
  getStoneLocations() {
    return this.#getElementLocations(this.#stoneLocs);
  }

  /* --- METHOD: getElementLocations --- */
  #getElementLocations(elementList) {
    const elementLocs = [];
    for (let x in elementList) {
      for (let y in elementList[x]) {
        elementLocs.push(elementList[x][y].clone());
      }
    }
    return elementLocs;
  }

  /* --- METHOD: isWelcomeLocation --- */
  isWelcomeLocation(loc) {
    this.validateLocation(loc);
    return loc.isEqualTo(this.getWelcomeLocation());
  }

  /* --- METHOD: isDoorLocation --- */
  isDoorLocation(loc) {
    this.validateLocation(loc);
    return loc.x in this.#doorLocs && loc.y in this.#doorLocs[loc.x];
  }

  /* --- METHOD: isStoneLocation --- */
  isStoneLocation(loc) {
    this.validateLocation(loc);
    return loc.x in this.#stoneLocs && loc.y in this.#stoneLocs[loc.x];
  }

  /* --- METHOD: isAvailable --- */
  isAvailable(loc) {
    this.validateLocation(loc);
    // return !(this.isWelcomeLocation(loc) || this.isDoorLocation(loc));
    return loc.x in this.#availableLocs && loc.y in this.#availableLocs[loc.x];
  }

  /* --- METHOD: addDoor --- */
  addDoor(door, loc = null) {
    return this.#addElement(door, loc, this.#doorLocs);
  }

  /* --- METHOD: addStone --- */
  addStone(stone, loc = null) {
    return this.#addElement(stone, loc, this.#stoneLocs);
  }

  /* --- METHOD: addElement --- */
  #addElement(element, loc, elementList) {
    if (!(element instanceof Door || element instanceof Stone)) {
      throw new ETypeError(`input is not of type Door or Stone`, element);
    }
    if (loc !== null) this.validateLocation(loc);

    if (Object.keys(this.#availableLocs).length == 0) {
      console.log(
        "Cannot add element because there are no available locations."
      );
      return false;
    }

    // if no location specified, choose it randomly
    if (loc === null) {
      const x = Random.getRandomChoice(Object.keys(this.#availableLocs));
      const y = Random.getRandomChoice(Object.keys(this.#availableLocs[x]));
      loc = this.#availableLocs[x][y];
    }

    if (!this.isAvailable(loc)) {
      console.log("Cannot add element because location is not available.");
      return false;
    }

    // update door/stone and available locations
    if (!(loc.x in elementList)) {
      elementList[loc.x] = {};
    }
    elementList[loc.x][loc.y] = loc;
    delete this.#availableLocs[loc.x][loc.y];
    if (Object.keys(this.#availableLocs[loc.x]).length == 0) {
      delete this.#availableLocs[loc.x];
    }

    this.getCell(loc).attach(element);
    return true;
  }

  /* --- METHOD: removeDoor --- */
  removeDoor(loc) {
    return this.#removeElement(loc, this.#doorLocs);
  }

  /* --- METHOD: removeStone --- */
  removeStone(loc) {
    return this.#removeElement(loc, this.#stoneLocs);
  }

  /* --- METHOD: removeElement --- */
  #removeElement(loc, elementList) {
    this.validateLocation(loc);

    if (!this.isDoorLocation(loc)) {
      console.log("Cannot remove element because location is not occupied.");
      return false;
    }
    this.getCell(loc).detach();

    // update door/stone and available locations
    if (!(loc.x in this.#availableLocs)) {
      this.#availableLocs[loc.x] = {};
    }
    this.#availableLocs[loc.x][loc.y] = loc;
    delete elementList[loc.x][loc.y];
    if (Object.keys(elementList[loc.x]).length == 0) {
      delete elementList[loc.x];
    }

    return true;
  }

  /* --- METHOD: clear --- */
  clear() {
    const [rows, columns] = this.getDimensions();
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const loc = new Location(x, y);
        if (this.isDoorLocation(loc)) {
          this.removeDoor(loc);
        } else if (this.isStoneLocation(loc)) {
          this.removeStone(loc);
        }
      }
    }
  }

  /* --- METHOD: #createGrid --- */
  #createGrid() {
    console.assert(this.#grid === undefined); // sanity check
    const [rows, columns] = this.getDimensions();

    this.#grid = [];
    for (let x = 0; x < columns; x++) {
      this.#grid[x] = [];
      for (let y = 0; y < rows; y++) {
        this.#grid[x][y] = null;
      }
    }
  }

  /* --- METHOD: #createCells --- */
  #createCells() {
    console.assert(this.#availableLocs === undefined); // sanity check
    console.assert(this.#doorLocs === undefined); // sanity check
    console.assert(this.#stoneLocs === undefined); // sanity check
    const [rows, columns] = this.getDimensions();

    this.#availableLocs = {};
    this.#doorLocs = {};
    this.#stoneLocs = {};
    for (let x = 0; x < columns; x++) {
      this.#availableLocs[x] = {};
      for (let y = 0; y < rows; y++) {
        const loc = new Location(x, y);
        if (this.isWelcomeLocation(loc)) {
          this.#grid[x][y] = new Cell(Cell.Type.WELCOME);
          // NOTE: Welcome location is reserved.
        } else {
          this.#grid[x][y] = new Cell();
          this.#availableLocs[x][y] = loc;
        }
      }
    }
  }
};
