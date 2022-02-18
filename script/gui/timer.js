/* --- IMPORTS --- */
import Scheduler from "./scheduler.js";
import { ETypeError, ERangeError, StateError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Timer as default };

/* --- ENUM: TimerState --- */
const TimerState = {
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  IDLE: "IDLE",
};
Object.freeze(TimerState);

/*
 * CLASS: Timer
 *****************************************************************************/
const Timer = class {
  #state;
  #time;
  #delay;
  #callbacks;
  #jobId;

  /* --- INNER: State --- */
  static State = TimerState;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#setState(Timer.State.IDLE);
    this.#jobId = null;
  }

  /* --- METHOD: getState --- */
  getState() {
    return this.#state;
  }

  /* --- METHOD: start --- */
  start(startTime, delay, intervalCallback, finalCallback) {
    this.#validateState(Timer.State.IDLE);

    // argument validation
    if (!Number.isInteger(startTime)) {
      throw new ETypeError(`input is not an integer`, startTime);
    }
    if (startTime <= 0) {
      throw new ERangeError(`input is not positive`, startTime);
    }
    if (!Number.isInteger(delay)) {
      throw new ETypeError(`input is not an integer`, delay);
    }
    if (delay <= 0) {
      throw new ERangeError(`input is not positive`, delay);
    }
    if (typeof intervalCallback !== "function") {
      throw new ETypeError(`callback is not a function`, intervalCallback);
    }
    if (typeof intervalCallback !== "function") {
      throw new ETypeError(`callback is not a function`, finalCallback);
    }

    this.#time = startTime;
    this.#delay = delay;
    this.#callbacks = [intervalCallback, finalCallback];
    this.#jobId = Scheduler.after(delay, () => {
      this.#handler();
    });
    this.#setState(Timer.State.RUNNING);
  }

  /* --- METHOD: pause --- */
  pause() {
    this.#validateState(Timer.State.RUNNING);
    Scheduler.cancel(this.#jobId);
    this.#setState(Timer.State.PAUSED);
  }

  /* --- METHOD: resume --- */
  resume() {
    this.#validateState(Timer.State.PAUSED);
    this.#jobId = Scheduler.after(this.#delay, () => {
      this.#handler();
    });
    this.#setState(Timer.State.RUNNING);
  }

  /* --- METHOD: stop --- */
  stop() {
    if (this.getState() == Timer.State.IDLE) return;
    Scheduler.cancel(this.#jobId);
    this.#jobId = null;
    this.#setState(Timer.State.IDLE);
  }

  /* --- METHOD: #handler --- */
  #handler() {
    this.#time -= this.#delay;
    if (this.#time <= 0) {
      this.#callbacks[1](); // final callback
    } else {
      this.#callbacks[0](this.#time); // interval callback
      this.#jobId = Scheduler.after(this.#delay, () => {
        this.#handler();
      });
    }
  }

  /* --- METHOD: #setState --- */
  #setState(state) {
    console.assert(state in Timer.State); // sanity check
    this.#state = state;
  }

  /* --- METHOD: #validateState --- */
  #validateState(expected) {
    console.assert(expected in Timer.State); // sanity check
    const state = this.getState();
    if (state !== expected) {
      throw new StateError(`timer state is not ${expected}`, state);
    }
  }
};
