/* --- IMPORTS --- */
import { RuntimeError } from "../library/errors.js";
import Validator from "../library/validation.js";
import Element from "./element.js";

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
    Validator.instanceOf(element, Element);
    if (this.getElement() !== null) {
      throw new RuntimeError(`cannot attach elements to an occupied cell`);
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

  /* --- METHOD: detach --- */
  // NOTE: This method will be useful in breaking circular references.
  detach() {
    if (this.getElement() === null) {
      throw new RuntimeError(`trying to detach an element from an empty cell`);
    }
    this.#element = null;
  }
};
