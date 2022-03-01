/* --- IMPORTS --- */
import Element from "./element.js";
import Door from "./door.js";
import { ETypeError, RuntimeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Cell as default };

/* --- ENUM: CellType --- */
const CellType = {
  PLAIN: "PLAIN",
  WELCOME: "WELCOME",
};
Object.freeze(CellType);

/*
 * CLASS: Cell [UML]
 *****************************************************************************/
const Cell = class extends Element {
  #type;
  #door;

  /* --- INNER: Type --- */
  static Type = CellType;

  /* --- C'TOR: constructor --- */
  constructor(type = Cell.Type.PLAIN) {
    super();
    Cell.#validator(type);
    this.#type = type;
    this.#door = null;
  }

  /* --- METHOD: #validator --- */
  static #validator(type) {
    if (!(type in Cell.Type)) {
      throw new ETypeError(`input is not of type Cell.Type`, type);
    }
  }

  /* --- METHOD: attach --- */
  attach(door) {
    if (this.getDoor() !== null) {
      throw new RuntimeError(
        `trying to attach a door while one already exists`
      );
    }
    if (!(door instanceof Door)) {
      throw new ETypeError(`input is not of type Door`, door);
    }
    this.#door = door;
  }

  /* --- METHOD: getType --- */
  getType() {
    return this.#type;
  }

  /* --- METHOD: getDoor --- */
  getDoor() {
    return this.#door;
  }

  // NOTE: this method will be useful in breaking circular references
  /* --- METHOD: detach --- */
  detach() {
    if (this.getDoor() === null) {
      throw new RuntimeError(
        `trying to detach a door while one does not exist`
      );
    }
    this.#door = null;
  }
};
