/* --- IMPORTS --- */
import Random from "../../library/random.js";
import Direction from "../direction.js";
// import Position from "../game/position.js";
import { StateError } from "../../library/errors.js";

/* --- EXPORTS --- */
export { RandomWalker as default };

/* --- ENUM: RandomWalkerState --- */
const RandomWalkerState = {
  IDLE: "IDLE",
  CHOOSING: "CHOOSING",
  WALKING: "WALKING",
  INSPECTING: "INSPECTING",
};
Object.freeze(RandomWalkerState);

/*
 * CLASS: RandomWalker
 *****************************************************************************/
const RandomWalker = class {
  #state;
  #lastPosition;
  #goingTo;

  /* --- INNER: State --- */
  static State = RandomWalkerState;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#setState(RandomWalker.State.IDLE);
    this.#clear();
  }

  /* --- METHOD: getState --- */
  getState() {
    return this.#state;
  }

  /* --- METHOD: start --- */
  start() {
    // this.#lastPosition = null;
    // this.#goingTo = null;
    this.#setState(RandomWalker.State.CHOOSING);
  }

  /* --- METHOD: choose --- */
  choose(position) {
    this.#validateState(RandomWalker.State.CHOOSING);

    let goingTo = null;
    const occupiedLocs = position.room.getOccupiedLocations();
    for (const loc of occupiedLocs) {
      // if there is an exit door in the room, then choose it
      if (position.room.isExitLocation(loc)) {
        goingTo = loc;
      }
    }

    if (goingTo === null) {
      // no exit point found, choose neighbor randomly
      if (this.#lastPosition != null && occupiedLocs.length > 1) {
        // don't go back to the room you just came from
        let index = occupiedLocs.findIndex((loc) => {
          return position.room.peek(loc).open() === this.#lastPosition.room;
        });
        if (index != -1) {
          occupiedLocs.splice(index, 1);
        }
      }
      goingTo = Random.getRandomChoice(occupiedLocs);
    }

    this.#goingTo = goingTo;
    this.#setState(RandomWalker.State.WALKING);
  }

  /* --- METHOD: walk --- */
  walk(position) {
    this.#validateState(RandomWalker.State.WALKING);

    const goingTo = this.#goingTo;
    if (position.loc.isEqualTo(goingTo)) {
      this.#setState(RandomWalker.State.INSPECTING);
      return null;
    } else {
      let axis;
      if (position.loc.x == goingTo.x) {
        axis = 1;
      } else if (position.loc.y == goingTo.y) {
        axis = 0;
      } else {
        axis = Random.getRandomInteger(0, 2); // coin flip
      }

      let direction;
      if (axis == 0) {
        if (position.loc.x < goingTo.x) {
          direction = Direction.RIGHT;
        } else {
          direction = Direction.LEFT;
        }
      } else {
        // axis == 1
        if (position.loc.y < goingTo.y) {
          direction = Direction.DOWN;
        } else {
          direction = Direction.UP;
        }
      }

      return direction;
    }
  }

  /* --- METHOD: next --- */
  next(position) {
    // input is the position before leaving the current room
    this.#lastPosition = position.clone();
    this.#setState(RandomWalker.State.CHOOSING);
  }

  /* --- METHOD: halt --- */
  halt() {
    this.#setState(RandomWalker.State.IDLE);
    this.#clear();
  }

  /* --- METHOD: #setState --- */
  #setState(state) {
    console.assert(state in RandomWalker.State); // sanity check
    this.#state = state;
  }

  /* --- METHOD: #validateState --- */
  #validateState(expected) {
    console.assert(expected in RandomWalker.State); // sanity check
    const state = this.getState();
    if (state !== expected) {
      throw new StateError(`random walker state is not ${expected}`, state);
    }
  }

  /* --- METHOD: #clear --- */
  #clear() {
    this.#lastPosition = null;
    this.#goingTo = null;
  }
};
