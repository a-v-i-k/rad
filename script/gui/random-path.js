/* --- IMPORTS --- */
import Random from "../library/random.js";
import Location from "../game/location.js";
import Direction from "../game/direction.js";
import TIterator from "./timed-iterator.js";
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { RandomPath as default };

/*
 * CLASS: RandomPath
 *****************************************************************************/
const RandomPath = class {
  #loc;
  #goingTo;
  #stepCallback;
  #active;
  #titer;

  /* --- C'TOR: constructor --- */
  constructor(delay, src, dst, stepCallback, endCallback) {
    RandomPath.#validator(delay, src, dst, stepCallback, endCallback);
    this.#loc = src;
    this.#goingTo = dst;
    this.#stepCallback = stepCallback;
    this.#active = true;
    this.#titer = new TIterator(
      delay,
      () => this.#walk(),
      () => {
        endCallback();
        this.#active = false;
      }
    );
  }

  /* --- METHOD: #validator --- */
  static #validator(delay, src, dst, stepCallback, endCallback) {
    if (!Number.isInteger(delay)) {
      throw new ETypeError(`input is not an integer`, delay);
    }
    if (delay <= 0) {
      throw new ERangeError(`input is not positive`, delay);
    }
    if (!(src instanceof Location)) {
      throw new ETypeError(`input is not of type Location`, src);
    }
    if (!(dst instanceof Location)) {
      throw new ETypeError(`input is not of type Location`, dst);
    }
    if (typeof stepCallback !== "function") {
      throw new ETypeError(`callback is not a function`, stepCallback);
    }
    if (typeof endCallback !== "function") {
      throw new ETypeError(`callback is not a function`, endCallback);
    }
  }

  /* --- isActive() --- */
  isActive() {
    return this.#active;
  }

  /* --- METHOD: cancel --- */
  cancel() {
    if (!this.isActive()) return;
    this.#titer.cancel();
  }

  /* --- METHOD: #step --- */
  #walk() {
    if (this.#loc.isEqualTo(this.#goingTo)) {
      return false;
    }

    let axis;
    if (this.#loc.x == this.#goingTo.x) {
      axis = 1;
    } else if (this.#loc.y == this.#goingTo.y) {
      axis = 0;
    } else {
      axis = Random.getRandomInteger(0, 2); // coin flip
    }

    let direction;
    if (axis == 0) {
      if (this.#loc.x < this.#goingTo.x) {
        direction = Direction.RIGHT;
        this.#loc.x++;
      } else {
        direction = Direction.LEFT;
        this.#loc.x--;
      }
    } else {
      // axis == 1
      if (this.#loc.y < this.#goingTo.y) {
        direction = Direction.DOWN;
        this.#loc.y++;
      } else {
        direction = Direction.UP;
        this.#loc.y--;
      }
    }

    this.#stepCallback(direction);
    return true;
  }
};
