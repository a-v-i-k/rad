/* --- IMPORTS --- */
import Random from "../library/random.js";
import Element from "./element.js";
import Location from "./location.js";
import Cell from "./cell.js";
import Door, { ExitDoor } from "./door.js";

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
  #availableLocs;
  #occupiedLocs;

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

  /* --- METHOD: getAvailableLocations --- */
  getAvailableLocations() {
    const availableLocs = [];
    for (let x in this.#availableLocs) {
      for (let y in this.#availableLocs[x])
        availableLocs.push(this.#availableLocs[x][y]);
    }
    return availableLocs;
  }

  /* --- METHOD: getOccupiedLocations --- */
  getOccupiedLocations() {
    const occupiedLocs = [];
    for (let x in this.#occupiedLocs) {
      for (let y in this.#occupiedLocs[x])
        occupiedLocs.push(this.#occupiedLocs[x][y]);
    }
    return occupiedLocs;
  }

  /* --- METHOD: isWelcomeLocation --- */
  isWelcomeLocation(loc) {
    this.validateLocation(loc);
    return loc.isEqualTo(this.getWelcomeLocation());
  }

  /* --- METHOD: isExitLocation --- */
  isExitLocation(loc) {
    this.validateLocation(loc);
    return this.peek(loc) instanceof ExitDoor;
  }

  /* --- METHOD: isAvailable --- */
  isAvailable(loc) {
    this.validateLocation(loc);
    return loc.x in this.#availableLocs && loc.y in this.#availableLocs[loc.x];
  }

  /* --- METHOD: isOccupied --- */
  isOccupied(loc) {
    this.validateLocation(loc);
    return !(this.isWelcomeLocation(loc) || this.isAvailable(loc));
  }

  /* --- METHOD: addDoor --- */
  addDoor(door, loc = null) {
    if (!(door instanceof Door)) {
      throw new ETypeError(`input is not of type Door`, door);
    }
    if (loc !== null) this.validateLocation(loc);

    const availableLocs = this.getAvailableLocations();
    if (loc === null) {
      // if no location specified, choose it randomly
      loc = Random.getRandomChoice(availableLocs);
    }

    if (!this.isAvailable(loc)) {
      console.log("Cannot add door because room is not available.");
      return false;
    }
    this.#occupiedLocs[loc.x][loc.y] = loc;
    delete this.#availableLocs[loc.x][loc.y];
    this.getCell(loc).attach(door);
    return true;
  }

  /* --- METHOD: peek --- */
  peek(loc) {
    this.validateLocation(loc);
    return this.getCell(loc).getDoor();
  }

  /* --- METHOD: removeDoor --- */
  removeDoor(loc) {
    this.validateLocation(loc);

    if (!this.isOccupied(loc)) {
      console.log("Cannot remove door because room is not occupied.");
      return false;
    }
    this.getCell(loc).detach();
    this.#availableLocs[loc.x][loc.y] = loc;
    delete this.#occupiedLocs[loc.x][loc.y];
    return true;
  }

  /* --- METHOD: clear --- */
  clear() {
    const [rows, columns] = this.getDimensions();
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const loc = new Location(x, y);
        if (this.isOccupied(loc)) {
          this.removeDoor(loc);
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
    const [rows, columns] = this.getDimensions();

    const availableLocs = {},
      occupiedLocs = {};
    for (let x = 0; x < columns; x++) {
      availableLocs[x] = {};
      occupiedLocs[x] = {};
      for (let y = 0; y < rows; y++) {
        const loc = new Location(x, y);
        if (this.isWelcomeLocation(loc)) {
          this.#grid[x][y] = new Cell(Cell.Type.WELCOME);
          // NOTE: Welcome location is reserved.
        } else {
          this.#grid[x][y] = new Cell();
          availableLocs[x][y] = loc;
        }
      }
    }

    this.#availableLocs = availableLocs;
    this.#occupiedLocs = occupiedLocs;
  }
};
