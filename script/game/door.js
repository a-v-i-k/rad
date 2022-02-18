/* --- IMPORTS --- */
import Element from "./element.js";
import Room from "./room.js";
import { ETypeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Door as default, ExitDoor };

/*
 * CLASS: Door [UML]
 *****************************************************************************/
const Door = class extends Element {
  #owner;

  /* --- C'TOR: constructor --- */
  constructor(room) {
    super();
    Door.#validator(room);
    this.#owner = room;
  }

  /* --- METHOD: #validator --- */
  static #validator(room) {
    if (!(room instanceof Room)) {
      throw new ETypeError(`input is not of type Room`, room);
    }
  }

  /* --- METHOD: open --- */
  open() {
    return this.#owner;
  }
};

/*
 * CLASS: ExitDoor [UML]
 *****************************************************************************/
const ExitDoor = class extends Door {};
