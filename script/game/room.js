/* --- IMPORTS --- */
import Random from "../library/random.js";
import Element from "./element.js";
import Grid from "./grid.js";
import Location from "./location.js";
import Cell, { WelcomeCell } from "./cell.js";
import Door, { ExitDoor } from "./door.js";

/* --- EXPORTS --- */
export { Room as default };

/*
 * CLASS: Room [UML]
 *****************************************************************************/
const Room = class extends Element {
  #grid;
  #welcomeLoc;
  #availableLocs;
  #occupiedLocs;

  /* --- C'TOR: constructor --- */
  constructor(rows, columns) {
    super();

    // create grid
    // NOTE: rows and columns validation is delegated to the Grid class.
    this.#grid = new Grid(rows, columns);

    // set (random) welcome location
    const x = Random.getRandomInteger(0, columns),
      y = Random.getRandomInteger(0, rows);
    this.setWelcomeLocation(new Location(x, y));

    // create cells
    this.#createCells(rows, columns);
  }

  /* --- METHOD: validateLocation --- */
  validateLocation(loc) {
    this.#grid.validateLocation(loc);
  }

  /* --- METHOD: getDimensions --- */
  getDimensions() {
    return [this.#grid.rows, this.#grid.columns];
  }

  /* --- METHOD: getCell --- */
  getCell(loc) {
    this.validateLocation(loc);
    return this.#grid.get(loc);
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

  /* --- METHOD: isMarked --- */
  isMarked(loc) {
    this.validateLocation(loc);
    return this.getCell(loc).isMarked();
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

  /* --- METHOD: toggleMark --- */
  toggleMark(loc) {
    this.validateLocation(loc);

    if (this.isWelcomeLocation(loc)) {
      console.log("Cannot mark welcome location.");
      return false;
    } else if (this.isOccupied(loc)) {
      console.log("Cannot mark occupied locations.");
    } else {
      this.getCell(loc).toggleMark();
    }
    return true;
  }

  /* --- METHOD: clear --- */
  clear() {
    for (let x = 0; x < this.#grid.columns; x++) {
      for (let y = 0; y < this.#grid.rows; y++) {
        const loc = new Location(x, y);
        if (this.isOccupied(loc)) {
          this.removeDoor(loc);
        }
      }
    }
  }

  /* --- METHOD: #createCells --- */
  #createCells(rows, columns) {
    console.assert(this.#availableLocs === undefined);

    const availableLocs = {},
      occupiedLocs = {};
    for (let x = 0; x < columns; x++) {
      availableLocs[x] = {};
      occupiedLocs[x] = {};
      for (let y = 0; y < rows; y++) {
        const loc = new Location(x, y);
        if (this.isWelcomeLocation(loc)) {
          this.#grid.set(loc, new WelcomeCell());
          // NOTE: Welcome location is reserved.
        } else {
          this.#grid.set(loc, new Cell());
          availableLocs[x][y] = loc;
        }
      }
    }

    this.#availableLocs = availableLocs;
    this.#occupiedLocs = occupiedLocs;
  }
};
