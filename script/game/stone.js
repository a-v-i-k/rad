/* --- IMPORTS --- */
import Element from "./element.js";
import { ETypeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Stone as default };

/* --- ENUM: StoneType --- */
const StoneType = {
  RUBY: "RUBY",
  EMERALD: "EMERALD",
  TOPAZ: "TOPAZ",
  GARNET: "GARNET",
  SAPPHIRE: "SAPPHIRE",
  DIAMOND: "DIAMOND",
  OPAL: "OPAL",
  AGATE: "AGATE",
  AMETHYST: "AMETHYST",
  AQUAMARINE: "AQUAMARINE",
  ONYX: "ONYX",
  JASPER: "JASPER",
};
Object.freeze(StoneType);

/*
 * CLASS: Stone
 *****************************************************************************/
const Stone = class extends Element {
  #type;

  /* --- INNER: Type --- */
  static Type = StoneType;

  /* --- C'TOR: constructor --- */
  constructor(type) {
    super();
    Stone.#validator(type);
    this.#type = type;
  }

  /* --- METHOD: #validator --- */
  static #validator(type) {
    if (!(type in Stone.Type)) {
      throw new ETypeError(`input is not of type Stone.Type`, type);
    }
  }

  /* --- METHOD: getType --- */
  getType() {
    return this.#type;
  }
};
