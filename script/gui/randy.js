/* --- IMPORTS --- */
import Random from "../library/random.js";
import Direction from "../game/direction.js";
// import Position from "../game/position.js";
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
  #lastPosition;
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
    // this.#lastPosition = null;
    // this.#goingTo = null;
    this.#setStatus(Randy.Status.CHOOSING);
  }

  /* --- METHOD: choose --- */
  choose(position) {
    this.#validateStatus(Randy.Status.CHOOSING);

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
    this.#setStatus(Randy.Status.WALKING);
  }

  /* --- METHOD: walk --- */
  walk(position) {
    this.#validateStatus(Randy.Status.WALKING);

    const goingTo = this.#goingTo;
    if (position.loc.isEqualTo(goingTo)) {
      this.#setStatus(Randy.Status.INSPECTING);
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
    this.#lastPosition = null;
    this.#goingTo = null;
  }
};
