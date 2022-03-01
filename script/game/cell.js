/* --- IMPORTS --- */
import Element from "./element.js";
import Door from "./door.js";
import { ETypeError, RuntimeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Cell as default, WelcomeCell };

/*
 * CLASS: Cell [UML]
 *****************************************************************************/
const Cell = class extends Element {
  #door;

  /* --- C'TOR: constructor --- */
  constructor() {
    super();
    this.#door = null;
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

/*
 * CLASS: WelcomeCell [UML]
 *****************************************************************************/
const WelcomeCell = class extends Cell {};
