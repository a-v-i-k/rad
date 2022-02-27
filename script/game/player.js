/* --- IMPORTS --- */
import Element from "./element.js";
import Room from "./room.js";
// import Location from "./location.js";
import Direction from "./direction.js";
import Position from "./position.js";
import { ETypeError, StateError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Player as default };

/* --- ENUM: PlayerState --- */
const PlayerState = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
};
Object.freeze(PlayerState);

/*
 * CLASS: Player [UML]
 *****************************************************************************/
const Player = class extends Element {
  #state;
  #position;
  #trace;

  /* --- INNER: State --- */
  static State = PlayerState;

  /* --- C'TOR: constructor --- */
  constructor() {
    super();
    this.#setState(Player.State.IDLE);
    this.#clear();
  }

  /* --- METHOD: #clear --- */
  #clear() {
    this.#position = null;
    this.#trace = [];
  }

  /* --- METHOD: getState --- */
  getState() {
    return this.#state;
  }

  /* --- METHOD: getPosition --- */
  getPosition() {
    this.#validateState(Player.State.PLAYING);
    console.assert(this.#position !== null); // sanity check
    return this.#position.clone();
  }

  /* --- METHOD: play --- */
  play() {
    this.#validateState(Player.State.IDLE);
    this.#setState(Player.State.PLAYING);
  }

  /* --- METHOD: enter --- */
  enter(room, loc = null) {
    this.#validateState(Player.State.PLAYING);
    console.assert(this.#position === null); // sanity check

    if (!(room instanceof Room)) {
      throw new ETypeError(`input is not of type Room`, room);
    }
    if (loc !== null) room.validateLocation(loc);

    if (loc === null) {
      loc = room.getWelcomeLocation();
    }
    this.#position = new Position(room, loc);
  }

  /* --- METHOD: inspect --- */
  inspect() {
    this.#validateState(Player.State.PLAYING);
    console.assert(this.#position !== null); // sanity check

    const door = this.#position.room.peek(this.#position.loc);
    if (door === null) {
      console.log("Nothing to inspect...");
    } else {
      const record = this.getPosition();
      this.#trace.push(record);
      this.exit();
      this.enter(door.open());
    }
  }

  /* --- METHOD: backtrack --- */
  backtrack() {
    this.#validateState(Player.State.PLAYING);
    if (this.#trace.length > 0) {
      const position = this.#trace.pop();
      this.exit();
      this.enter(position.room, position.loc);
    } else {
      console.log("Source room cannot be exited. You are stuck here FOREVER.");
    }
  }

  /* --- METHOD: toggleMark --- */
  toggleMark() {
    this.#validateState(Player.State.PLAYING);
    console.assert(this.#position !== null); // sanity check
    this.#position.room.toggleMark(this.#position.loc);
  }

  /* --- METHOD: move --- */
  move(dir) {
    this.#validateState(Player.State.PLAYING);
    console.assert(this.#position !== null); // sanity check
    if (!(dir in Direction)) {
      throw new ETypeError(`input is not of a Direction`, dir);
    }

    const dims = this.#position.room.getDimensions();
    const loc = this.#position.loc;
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
    this.#validateState(Player.State.PLAYING);
    console.assert(this.#position !== null); // sanity check
    this.#position = null;
  }

  /* ---METHOD:  stop --- */
  stop() {
    this.#validateState(Player.State.PLAYING);
    this.#setState(Player.State.IDLE);
    this.#clear();
  }

  /* --- METHOD: #setState --- */
  #setState(state) {
    console.assert(state in Player.State); // sanity check
    this.#state = state;
  }

  /* --- METHOD: #validateState --- */
  #validateState(expected) {
    console.assert(expected in Player.State); // sanity check
    const state = this.getState();
    if (state !== expected) {
      throw new StateError(`player state is not ${expected}`, state);
    }
  }
};
