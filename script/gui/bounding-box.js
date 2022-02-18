/* --- IMPORTS --- */
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { BoundingBox as default };

/*
 * CLASS: BoundingBox [UML]
 *****************************************************************************/
const BoundingBox = class {
  /* --- C'TOR: constructor --- */
  constructor(x0, y0, width, height) {
    BoundingBox.#validator(x0, y0, width, height);
    this.x0 = x0;
    this.y0 = y0;
    this.width = width;
    this.height = height;
  }

  /* --- METHOD: #validator --- */
  static #validator(x0, y0, width, height) {
    if (!Number.isInteger(x0)) {
      throw new ETypeError(`input is not an integer`, x0);
    }
    if (x0 < 0) {
      throw new ERangeError(`input is negative`, x0);
    }

    if (!Number.isInteger(y0)) {
      throw new ETypeError(`input is not an integer`, y0);
    }
    if (y0 < 0) {
      throw new ERangeError(`input is negative`, y0);
    }

    if (!Number.isInteger(width)) {
      throw new ETypeError(`input is not an integer`, width);
    }
    if (width <= 0) {
      throw new ERangeError(`input is not positive`, width);
    }

    if (!Number.isInteger(height)) {
      throw new ETypeError(`input is not an integer`, height);
    }
    if (height <= 0) {
      throw new ERangeError(`input is not positive`, height);
    }
  }
};
