/* --- IMPORTS --- */
import Location from "./location.js";
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Grid as default };

/*
 * CLASS: Grid
 *****************************************************************************/
const Grid = class {
  #items;

  /* --- C'TOR: constructor --- */
  constructor(rows, columns) {
    Grid.#validator(rows, columns);
    this.rows = rows;
    this.columns = columns;

    this.#items = [];
    for (let x = 0; x < this.columns; x++) {
      this.#items[x] = [];
      for (let y = 0; y < this.rows; y++) {
        this.#items[x][y] = null;
      }
    }
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

  /* --- METHOD: set --- */
  set(loc, item) {
    this.validateLocation(loc);
    this.#items[loc.x][loc.y] = item;
  }

  /* --- METHOD: get --- */
  get(loc) {
    this.validateLocation(loc);
    return this.#items[loc.x][loc.y];
  }
};
