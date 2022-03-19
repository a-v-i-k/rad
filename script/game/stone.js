/* --- IMPORTS --- */
import Validator from "../library/validation.js";
import Element from "./element.js";

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
    Validator.enumMember(type, Stone.Type);
    this.#type = type;
  }

  /* --- METHOD: getType --- */
  getType() {
    return this.#type;
  }
};
