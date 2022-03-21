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

  /* --- subclassOf --- */
  static subclassOf(type1, type2) {
    if (!(type1 === type2 || type1.prototype instanceof type2)) {
      throw new ETypeError(`${type1.name} is not a subclass of ${type2.name}`);
    }
  }

  /* --- integer --- */
  static integer(input) {
    if (!Number.isInteger(input)) {
      throw new ETypeError(`input is not an integer`, input);
    }
  }

  /* --- boolean --- */
  static boolean(input) {
    if (typeof input !== "boolean") {
      throw new ETypeError(`input is not a boolean`, input);
    }
  }

  /* --- string --- */
  static string(input) {
    if (typeof input !== "string") {
      throw new ETypeError(`input is not a string`, input);
    }
  }

  /* --- function --- */
  static function(input) {
    if (typeof input !== "function") {
      throw new ETypeError(`input is not a function`, input);
    }
  }

  /// RANGE

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

  /* --- integerAtLeast --- */
  static integerAtLeast(input, low) {
    Validator.integer(input);
    if (input < low) {
      throw new ERangeError(`input must be at least ${low}`, input);
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
