/* --- IMPORTS --- */
import Validator from "../library/validation.js";

/* --- EXPORTS --- */
export { BoundingBox as default };

/*
 * CLASS: BoundingBox
 *****************************************************************************/
const BoundingBox = class {
  /* --- C'TOR: constructor --- */
  constructor(x0, y0, width, height) {
    Validator.nonnegativeInteger(x0);
    Validator.nonnegativeInteger(y0);
    Validator.positiveInteger(width);
    Validator.positiveInteger(height);
    this.x0 = x0;
    this.y0 = y0;
    this.width = width;
    this.height = height;
  }
};
