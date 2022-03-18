/* --- IMPORTS --- */
import Element from "./element.js";
import Room from "./room.js";
import { ETypeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Door as default };

/* --- ENUM: DoorType --- */
const DoorType = {
  PLAIN: "PLAIN",
  EXIT: "EXIT",
};
Object.freeze(DoorType);

/*
 * CLASS: Door
 *****************************************************************************/
const Door = class extends Element {
  #type;
  #owner;

  /* --- INNER: Type --- */
  static Type = DoorType;

  /* --- C'TOR: constructor --- */
  constructor(type, room) {
    super();
    Door.#validator(type, room);
    this.#type = type;
    this.#owner = room;
  }

  /* --- METHOD: #validator --- */
  static #validator(type, room) {
    if (!(type in Door.Type)) {
      throw new ETypeError(`input is not of type Door.Type`, type);
    }
    if (!(room instanceof Room)) {
      throw new ETypeError(`input is not of type Room`, room);
    }
  }

  /* --- METHOD: getType --- */
  getType() {
    return this.#type;
  }

  /* --- METHOD: open --- */
  open() {
    return this.#owner;
  }
};
