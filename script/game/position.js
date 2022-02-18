/* --- IMPORTS --- */
import Room from "./room.js";
import { ETypeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Position as default };

/*
 * CLASS: Position
 *****************************************************************************/
const Position = class {
  /* --- C'TOR: constructor --- */
  constructor(room, loc) {
    Position.#validator(room, loc);
    this.room = room;
    this.loc = loc;
  }

  /* --- METHOD: #validator --- */
  static #validator(room, loc) {
    if (!(room instanceof Room)) {
      throw new ETypeError(`input is not of type Room`, room);
    }
    room.validateLocation(loc);
  }

  /* --- METHOD: clone --- */
  clone() {
    return new Position(this.room, this.loc.clone());
  }
};
