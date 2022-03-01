/* --- IMPORTS --- */
import Random from "../library/random.js";
import Direction from "../game/direction.js";
import { StatusError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Randy as default };

/* --- ENUM: RandyStatus --- */
const RandyStatus = {
  IDLE: "IDLE",
  CHOOSING: "CHOOSING",
  WALKING: "WALKING",
  INSPECTING: "INSPECTING",
};
Object.freeze(RandyStatus);

/*
 * CLASS: Randy [Randy March – The Random Walker]
 *****************************************************************************/
// TODO: Split Randy class into a RandomWalker class wrapped by a Randy class?
const Randy = class {
  #status;
  #lastState;
  #goingTo;

  /* --- INNER: Status --- */
  static Status = RandyStatus;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#setStatus(Randy.Status.IDLE);
    this.#clear();
  }

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /* --- METHOD: start --- */
  start() {
    this.#setStatus(Randy.Status.CHOOSING);
  }

  /* --- METHOD: choose --- */
  // TODO [ID]
  choose(state) {
    this.#validateStatus(Randy.Status.CHOOSING);

    let goingTo = null;
    const occupiedLocs = state.room.getOccupiedLocations();
    for (const loc of occupiedLocs) {
      // if there is an exit door in the room, then choose it
      if (state.room.isExitLocation(loc)) {
        goingTo = loc;
      }
    }

    if (goingTo === null) {
      // no exit point found, choose neighbor randomly
      if (this.#lastState != null && occupiedLocs.length > 1) {
        // don't go back to the room you just came from
        let index = occupiedLocs.findIndex((loc) => {
          return state.room.peek(loc).open() === this.#lastState.room;
        });
        if (index != -1) {
          occupiedLocs.splice(index, 1);
        }
      }
      goingTo = Random.getRandomChoice(occupiedLocs);
    }

    this.#goingTo = goingTo;
    this.#setStatus(Randy.Status.WALKING);
  }

  /* --- METHOD: walk --- */
  // TODO [ID]
  walk(state) {
    this.#validateStatus(Randy.Status.WALKING);

    const goingTo = this.#goingTo;
    if (state.loc.isEqualTo(goingTo)) {
      this.#setStatus(Randy.Status.INSPECTING);
      return null;
    } else {
      let axis;
      if (state.loc.x == goingTo.x) {
        axis = 1;
      } else if (state.loc.y == goingTo.y) {
        axis = 0;
      } else {
        axis = Random.getRandomInteger(0, 2); // coin flip
      }

      let direction;
      if (axis == 0) {
        if (state.loc.x < goingTo.x) {
          direction = Direction.RIGHT;
        } else {
          direction = Direction.LEFT;
        }
      } else {
        // axis == 1
        if (state.loc.y < goingTo.y) {
          direction = Direction.DOWN;
        } else {
          direction = Direction.UP;
        }
      }

      return direction;
    }
  }

  /* --- METHOD: next --- */
  next(state) {
    // TODO [ID]
    // input is the state before leaving the current room
    this.#lastState = state; // TODO [ID]
    this.#setStatus(Randy.Status.CHOOSING);
  }

  /* --- METHOD: halt --- */
  halt() {
    this.#setStatus(Randy.Status.IDLE);
    this.#clear();
  }

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in Randy.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: #validateStatus --- */
  #validateStatus(expected) {
    console.assert(expected in Randy.Status); // sanity check
    const status = this.getStatus();
    if (status !== expected) {
      throw new StatusError(`random walker status is not ${expected}`, status);
    }
  }

  /* --- METHOD: #clear --- */
  #clear() {
    this.#lastState = null;
    this.#goingTo = null;
  }
};
