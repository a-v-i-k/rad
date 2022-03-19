/* --- IMPORTS --- */
import { ETypeError, ERangeError } from "./errors.js";

/* --- EXPORTS --- */
export { Validator as default };

/*
 * CLASS: Validator
 *****************************************************************************/
const Validator = class {
  /// TYPE

  /* --- instanceOf --- */
  static instanceOf(input, type) {
    if (!(input instanceof type)) {
      throw new ETypeError(`input is not of type ${type.name}`, input);
    }
  }

  /* --- enumMember --- */
  static enumMember(input, enumObject) {
    if (!(input in enumObject)) {
      const enums = Object.keys(enumObject).join("/");
      throw new ETypeError(`input is not a one of ${enums}`, input);
    }
  }

  /// INTEGER

  /* --- integer --- */
  static integer(input) {
    if (!Number.isInteger(input)) {
      throw new ETypeError(`input is not an integer`, input);
    }
  }

  /* --- positiveInteger --- */
  static positiveInteger(input) {
    Validator.integer(input);
    if (input <= 0) {
      throw new ERangeError(`input is not positive`, input);
    }
  }

  /* --- nonnegativeInteger --- */
  static nonnegativeInteger(input) {
    Validator.integer(input);
    if (input < 0) {
      throw new ERangeError(`input is negative`, input);
    }
  }

  /* --- range --- */
  static range(input, low, high) {
    // NOTE: This method assumes all arguments passed to it are integers.
    console.assert(Number.isInteger(input));
    console.assert(Number.isInteger(low));
    console.assert(Number.isInteger(high));
    console.assert(low <= high);

    if (input < low || input > high) {
      throw new ERangeError(
        `input is not in the range [${low}, ${high}]`,
        input
      );
    }
  }
};
