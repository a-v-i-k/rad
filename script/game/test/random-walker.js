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
  #lastRoomId;
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
    this.#validateStatus(RandomWalker.Status.CHOOSING);

    let goingTo = null;
    const doors = state.doors;
    for (const door of doors) {
      // if there is an exit door in the room, then choose it
      if (door.exit) {
        goingTo = door.loc;
      }
    }

    if (goingTo === null) {
      // no exit point found, choose neighbor randomly
      if (this.#lastRoomId !== null && doors.length > 1) {
        // don't go back to the room you just came from
        const index = doors.findIndex((door) => {
          return door.ownerId === this.#lastRoomId;
        });
        if (index != -1) {
          doors.splice(index, 1);
        }
      }
      goingTo = Random.getRandomChoice(doors).loc;
    }

    this.#goingTo = goingTo;
    this.#setStatus(RandomWalker.Status.WALKING);
  }

  /* --- METHOD: walk --- */
  walk(state) {
    this.#validateStatus(RandomWalker.Status.WALKING);

    const playerLoc = state.player.loc;
    const goingTo = this.#goingTo;
    let direction = null; // return value
    if (playerLoc.isEqualTo(goingTo)) {
      this.#setStatus(RandomWalker.Status.INSPECTING);
    } else {
      let axis;
      if (playerLoc.x == goingTo.x) {
        axis = 1;
      } else if (playerLoc.y == goingTo.y) {
        axis = 0;
      } else {
        axis = Random.getRandomInteger(0, 2); // coin flip
      }

      if (axis == 0) {
        if (playerLoc.x < goingTo.x) {
          direction = Direction.RIGHT;
        } else {
          direction = Direction.LEFT;
        }
      } else {
        // axis == 1
        if (playerLoc.y < goingTo.y) {
          direction = Direction.DOWN;
        } else {
          direction = Direction.UP;
        }
      }
    }

    return direction;
  }

  /* --- METHOD: next --- */
  next(state) {
    // input is the state before leaving the current room
    this.#lastRoomId = state.room.id;
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
    this.#lastRoomId = null;
    this.#goingTo = null;
  }
};
