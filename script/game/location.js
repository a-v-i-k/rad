/* --- IMPORTS --- */
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Location as default };

/*
 * CLASS: Location [UML]
 *****************************************************************************/
const Location = class {
  /* --- C'TOR: constructor --- */
  constructor(x, y) {
    Location.#validator(x, y);
    this.x = x;
    this.y = y;
  }

  /* --- METHOD: #validator --- */
  static #validator(x, y) {
    if (!Number.isInteger(x)) {
      throw new ETypeError(`input is not an integer`, x);
    }
    if (x < 0) {
      throw new ERangeError(`input is negative`, x);
    }

    if (!Number.isInteger(y)) {
      throw new ETypeError(`input is not an integer`, y);
    }
    if (y < 0) {
      throw new ERangeError(`input is negative`, y);
    }
  }

  /* --- METHOD: isEqualTo --- */
  isEqualTo(that) {
    if (!(that instanceof Location)) {
      throw new ETypeError(`input is not of type Location`, that);
    }
    return this.x == that.x && this.y == that.y;
  }

  /* --- METHOD: clone --- */
  clone() {
    return new Location(this.x, this.y);
  }
};
