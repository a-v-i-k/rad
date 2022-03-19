/* --- IMPORTS --- */
import { ETypeError, RuntimeError } from "../library/errors.js";
import Validator from "../library/validation.js";
import Element from "./element.js";
import Door from "./door.js";
import Stone from "./stone.js";

/* --- EXPORTS --- */
export { Cell as default };

/* --- ENUM: CellType --- */
const CellType = {
  PLAIN: "PLAIN",
  WELCOME: "WELCOME",
};
Object.freeze(CellType);

/*
 * CLASS: Cell
 *****************************************************************************/
const Cell = class extends Element {
  #type;
  #element;

  /* --- INNER: Type --- */
  static Type = CellType;

  /* --- C'TOR: constructor --- */
  constructor(type = Cell.Type.PLAIN) {
    super();
    Validator.enumMember(type, Cell.Type);
    this.#type = type;
    this.#element = null;
  }

  /* --- METHOD: attach --- */
  attach(element) {
    if (this.getElement() !== null) {
      throw new RuntimeError(`cannot attach elements to an occupied cell`);
    }
    if (!(element instanceof Door || element instanceof Stone)) {
      throw new ETypeError(`element is not of type Door or Stone`, element);
    }
    this.#element = element;
  }

  /* --- METHOD: getType --- */
  getType() {
    return this.#type;
  }

  /* --- METHOD: getElement --- */
  getElement() {
    return this.#element;
  }

  // NOTE: this method will be useful in breaking circular references
  /* --- METHOD: detach --- */
  detach() {
    if (this.getElement() === null) {
      throw new RuntimeError(`trying to detach an element from an empty cell`);
    }
    this.#element = null;
  }
};
