/* --- IMPORTS --- */
import Validator from "../library/validation.js";

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
    Validator.nonnegativeInteger(x);
    Validator.nonnegativeInteger(y);
    this.points.push([x, y]);
  }
};
