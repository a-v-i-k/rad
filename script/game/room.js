/* --- IMPORTS --- */
import { ETypeError } from "../library/errors.js";
import Validator from "../library/validation.js";
import Random from "../library/random.js";
import Location from "./location.js";
import Element from "./element.js";
import Cell from "./cell.js";
// import Door from "./door.js";
// import Stone from "./stone.js";

/* --- EXPORTS --- */
export { Room as default };

/*
 * CLASS: Room
 *****************************************************************************/
const Room = class extends Element {
  #rows;
  #columns;
  #grid;
  #welcomeLoc;
  #availableLocs;
  #occupiedLocs;

  /* --- C'TOR: constructor --- */
  constructor(rows, columns) {
    super();
    Validator.positiveInteger(rows);
    Validator.positiveInteger(columns);
    [this.#rows, this.#columns] = [rows, columns];

    // create grid
    this.#createGrid();

    // set (random) welcome location
    const x = Random.getRandomInteger(0, columns),
      y = Random.getRandomInteger(0, rows);
    this.#setWelcomeLocation(new Location(x, y));

    // create cells
    this.#createCells();
  }

  /* --- METHOD: validateElementTypeName --- */
  static validateElementTypeName(typeName) {
    if (!(typeName === "Door" || typeName === "Stone")) {
      throw new ETypeError(`type name is not 'Door' or 'Stone'`, typeName);
    }
  }

  /* --- METHOD: validateLocation --- */
  validateLocation(loc) {
    Validator.instanceOf(loc, Location);
    Validator.range(loc.x, 0, this.#columns - 1);
    Validator.range(loc.y, 0, this.#rows - 1);
  }

  /* --- METHOD: getDimensions --- */
  getDimensions() {
    return [this.#rows, this.#columns];
  }

  /* --- METHOD: getWelcomeLocation --- */
  getWelcomeLocation() {
    return this.#welcomeLoc.clone();
  }

  /* --- METHOD: getElement --- */
  getElement(loc) {
    this.validateLocation(loc);
    return this.#getCell(loc).getElement();
  }

  /* --- METHOD: getCell --- */
  // TODO: This should be removed.
  getCell(loc) {
    return this.#grid[loc.x][loc.y];
  }

  /* --- METHOD: getElementLocations --- */
  getElementLocations(elementType) {
    Room.validateElementTypeName(elementType.name);
    const elementLocs = [];
    for (let x in this.#occupiedLocs) {
      for (let y in this.#occupiedLocs[x]) {
        const element = this.getElement(this.#occupiedLocs[x][y]);
        if (element instanceof elementType) {
          elementLocs.push(this.#occupiedLocs[x][y].clone());
        }
      }
    }
    return elementLocs;
  }

  /* --- METHOD: isWelcomeLocation --- */
  isWelcomeLocation(loc) {
    this.validateLocation(loc);
    return loc.isEqualTo(this.getWelcomeLocation());
  }

  /* --- METHOD: isAvailable --- */
  isAvailable(loc) {
    this.validateLocation(loc);
    return loc.x in this.#availableLocs && loc.y in this.#availableLocs[loc.x];
  }

  /* --- METHOD: isOccupied --- */
  isOccupied(loc) {
    this.validateLocation(loc);
    return loc.x in this.#occupiedLocs && loc.y in this.#occupiedLocs[loc.x];
  }

  /* --- METHOD: addElement --- */
  addElement(element, loc = null) {
    Room.validateElementTypeName(element.constructor.name);
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
    } else if (!this.isAvailable(loc)) {
      console.log("Cannot add element because location is not available.");
      return false;
    }

    // update available/occupied locations
    if (!(loc.x in this.#occupiedLocs)) {
      this.#occupiedLocs[loc.x] = {};
    }
    this.#occupiedLocs[loc.x][loc.y] = loc;
    delete this.#availableLocs[loc.x][loc.y];
    if (Object.keys(this.#availableLocs[loc.x]).length == 0) {
      delete this.#availableLocs[loc.x];
    }

    // attach element to cell
    this.#getCell(loc).attach(element);
  }

  /* --- METHOD: removeElement --- */
  removeElement(loc) {
    this.validateLocation(loc);

    if (!this.isOccupied(loc)) {
      console.log("Cannot remove element because location is not occupied.");
      return false;
    }

    // detach element from cell
    this.#getCell(loc).detach();

    // update available/occupied locations
    if (!(loc.x in this.#availableLocs)) {
      this.#availableLocs[loc.x] = {};
    }
    this.#availableLocs[loc.x][loc.y] = loc;
    delete this.#occupiedLocs[loc.x][loc.y];
    if (Object.keys(this.#occupiedLocs[loc.x]).length == 0) {
      delete this.#occupiedLocs[loc.x];
    }
  }

  /* --- METHOD: clear --- */
  clear() {
    for (let x in this.#occupiedLocs) {
      for (let y in this.#occupiedLocs[x]) {
        this.removeElement(this.#occupiedLocs[x][y]);
      }
    }
  }

  /* --- METHOD: #setWelcomeLocation --- */
  #setWelcomeLocation(welcomeLoc) {
    this.#welcomeLoc = welcomeLoc;
  }

  /* --- METHOD: #getCell --- */
  #getCell(loc) {
    return this.#grid[loc.x][loc.y];
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
    console.assert(this.#occupiedLocs === undefined); // sanity check
    const [rows, columns] = this.getDimensions();

    this.#availableLocs = {};
    this.#occupiedLocs = {};
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
