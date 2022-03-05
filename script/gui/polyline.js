/* --- IMPORTS --- */
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Polyline as default };

/*
 * CLASS: Polyline
 *****************************************************************************/
const Polyline = class {
  points;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.points = [];
  }

  /* --- addPoint --- */
  addPoint(x, y) {
    if (!Number.isInteger(x)) {
      throw new ETypeError(`coordinate is not an integer`, x);
    }
    if (x < 0) {
      throw new ERangeError(`coordinate is negative`, x);
    }
    if (!Number.isInteger(y)) {
      throw new ETypeError(`coordinate is not an integer`, y);
    }
    if (y < 0) {
      throw new ERangeError(`coordinate is negative`, y);
    }
    this.points.push([x, y]);
  }
};
