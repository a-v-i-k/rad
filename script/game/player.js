/* --- IMPORTS --- */
import Element from "./element.js";
import Room from "./room.js";
// import Location from "./location.js";
import Direction from "./direction.js";
import { ETypeError, StatusError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Player as default };

/* --- ENUM: PlayerStatus --- */
const PlayerStatus = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
};
Object.freeze(PlayerStatus);

/*
 * CLASS: Player [UML]
 *****************************************************************************/
const Player = class extends Element {
  #status;
  #room;
  #loc;
  #trace;

  /* --- INNER: Status --- */
  static Status = PlayerStatus;

  /* --- C'TOR: constructor --- */
  constructor() {
    super();
    this.#setStatus(Player.Status.IDLE);
    this.#clear();
  }

  /* --- METHOD: #clear --- */
  #clear() {
    this.#room = null;
    this.#loc = null;
    this.#trace = [];
  }

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /* --- METHOD: getRoom --- */
  getRoom() {
    this.#validateStatus(Player.Status.PLAYING);
    return this.#room;
  }

  /* --- METHOD: getLocation --- */
  getLocation() {
    this.#validateStatus(Player.Status.PLAYING);
    return this.#loc;
  }

  /* --- METHOD: play --- */
  play() {
    this.#validateStatus(Player.Status.IDLE);
    this.#setStatus(Player.Status.PLAYING);
  }

  /* --- METHOD: enter --- */
  enter(room, loc = null) {
    this.#validateStatus(Player.Status.PLAYING);
    console.assert(this.#room === null); // sanity check

    if (!(room instanceof Room)) {
      throw new ETypeError(`input is not of type Room`, room);
    }
    if (loc !== null) room.validateLocation(loc);

    if (loc === null) {
      loc = room.getWelcomeLocation();
    }
    this.#room = room;
    this.#loc = loc;
  }

  /* --- METHOD: inspect --- */
  inspect() {
    this.#validateStatus(Player.Status.PLAYING);

    const door = this.#room.peek(this.#loc);
    if (door === null) {
      console.log("Nothing to inspect...");
    } else {
      const record = [this.getRoom(), this.getLocation()];
      this.#trace.push(record);
      this.exit();
      this.enter(door.open());
    }
  }

  /* --- METHOD: backtrack --- */
  backtrack() {
    this.#validateStatus(Player.Status.PLAYING);
    if (this.#trace.length > 0) {
      const [room, loc] = this.#trace.pop();
      this.exit();
      this.enter(room, loc);
    } else {
      console.log("Source room cannot be exited. You are stuck here FOREVER.");
    }
  }

  /* --- METHOD: move --- */
  move(dir) {
    this.#validateStatus(Player.Status.PLAYING);

    if (!(dir in Direction)) {
      throw new ETypeError(`input is not of a Direction`, dir);
    }

    const dims = this.#room.getDimensions();
    const loc = this.#loc;
    switch (dir) {
      case Direction.LEFT:
        loc.x = loc.x > 0 ? loc.x - 1 : loc.x;
        break;
      case Direction.RIGHT:
        loc.x = loc.x < dims[1] - 1 ? loc.x + 1 : loc.x;
        break;
      case Direction.UP:
        loc.y = loc.y > 0 ? loc.y - 1 : loc.y;
        break;
      case Direction.DOWN:
        loc.y = loc.y < dims[0] - 1 ? loc.y + 1 : loc.y;
        break;
      default:
        // never gonna happen
        break;
    }
  }

  /* --- METHOD: exit --- */
  exit() {
    this.#validateStatus(Player.Status.PLAYING);
    console.assert(this.#room !== null); // sanity check
    this.#room = null;
    this.#loc = null;
  }

  /* ---METHOD:  stop --- */
  stop() {
    this.#validateStatus(Player.Status.PLAYING);
    this.#setStatus(Player.Status.IDLE);
    this.#clear();
  }

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in Player.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: #validateStatus --- */
  #validateStatus(expected) {
    console.assert(expected in Player.Status); // sanity check
    const status = this.getStatus();
    if (status !== expected) {
      throw new StatusError(`player status is not ${expected}`, status);
    }
  }
};
