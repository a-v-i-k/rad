/* --- IMPORTS --- */
import Validator from "../library/validation.js";
import Element from "./element.js";
import Room from "./room.js";

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
    Validator.enumMember(type, Door.Type);
    Validator.instanceOf(room, Room);
    this.#type = type;
    this.#owner = room;
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
