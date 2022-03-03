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
const Randy = class {
  #status;
  #lastRoomId;
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
  choose(state) {
    this.#validateStatus(Randy.Status.CHOOSING);

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
    this.#setStatus(Randy.Status.WALKING);
  }

  /* --- METHOD: walk --- */
  walk(state) {
    this.#validateStatus(Randy.Status.WALKING);

    const playerLoc = state.player.loc;
    const goingTo = this.#goingTo;
    let direction = null; // return value
    if (playerLoc.isEqualTo(goingTo)) {
      this.#setStatus(Randy.Status.INSPECTING);
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
    this.#lastRoomId = null;
    this.#goingTo = null;
  }
};
