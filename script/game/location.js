/* --- IMPORTS --- */
import Validator from "../library/validation.js";

/* --- EXPORTS --- */
export { Location as default };

/*
 * CLASS: Location
 *****************************************************************************/
const Location = class {
  /* --- C'TOR: constructor --- */
  constructor(x, y) {
    Validator.nonnegativeInteger(x);
    Validator.nonnegativeInteger(y);
    this.x = x;
    this.y = y;
  }

  /* --- METHOD: isEqualTo --- */
  isEqualTo(that) {
    Validator.instanceOf(that, Location);
    return this.x == that.x && this.y == that.y;
  }

  /* --- METHOD: clone --- */
  clone() {
    return new Location(this.x, this.y);
  }
};
