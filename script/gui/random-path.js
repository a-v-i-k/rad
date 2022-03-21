/* --- IMPORTS --- */
import Validator from "../library/validation.js";
import Random from "../library/random.js";
import Direction from "../game/direction.js";
import Location from "../game/location.js";
import TIterator from "./timed-iterator.js";

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
    Validator.positiveInteger(delay);
    Validator.instanceOf(src, Location);
    Validator.instanceOf(dst, Location);
    Validator.function(stepCallback);
    Validator.function(endCallback);
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

  /* --- isActive() --- */
  isActive() {
    return this.#active;
  }

  /* --- METHOD: pause --- */
  pause() {
    if (!this.isActive()) return;
    this.#titer.pause();
  }

  /* --- METHOD: resume --- */
  resume() {
    if (!this.isActive()) return;
    this.#titer.resume();
  }

  /* --- METHOD: cancel --- */
  cancel() {
    if (!this.isActive()) return;
    this.#titer.cancel();
    this.#active = false;
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
