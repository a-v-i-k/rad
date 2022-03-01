/* --- IMPORTS --- */
import Random from "../../library/random.js";
import Direction from "../direction.js";
import { StatusError } from "../../library/errors.js";

/* --- EXPORTS --- */
export { RandomWalker as default };

/* --- ENUM: RandomWalkerStatus --- */
const RandomWalkerStatus = {
  IDLE: "IDLE",
  CHOOSING: "CHOOSING",
  WALKING: "WALKING",
  INSPECTING: "INSPECTING",
};
Object.freeze(RandomWalkerStatus);

/*
 * CLASS: RandomWalker
 *****************************************************************************/
const RandomWalker = class {
  #status;
  #lastState;
  #goingTo;

  /* --- INNER: Status --- */
  static Status = RandomWalkerStatus;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#setStatus(RandomWalker.Status.IDLE);
    this.#clear();
  }

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /* --- METHOD: start --- */
  start() {
    this.#setStatus(RandomWalker.Status.CHOOSING);
  }

  /* --- METHOD: choose --- */
  choose(state) {
    // TODO [ID]
    this.#validateStatus(RandomWalker.Status.CHOOSING);

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
    this.#setStatus(RandomWalker.Status.WALKING);
  }

  /* --- METHOD: walk --- */
  walk(state) {
    // TODO [ID]
    this.#validateStatus(RandomWalker.Status.WALKING);

    const goingTo = this.#goingTo;
    if (state.loc.isEqualTo(goingTo)) {
      this.#setStatus(RandomWalker.Status.INSPECTING);
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
    this.#setStatus(RandomWalker.Status.CHOOSING);
  }

  /* --- METHOD: halt --- */
  halt() {
    this.#setStatus(RandomWalker.Status.IDLE);
    this.#clear();
  }

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in RandomWalker.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: #validateStatus --- */
  #validateStatus(expected) {
    console.assert(expected in RandomWalker.Status); // sanity check
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
