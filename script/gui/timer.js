/* --- IMPORTS --- */
import Scheduler from "./scheduler.js";
import { ETypeError, ERangeError, StatusError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Timer as default };

/* --- ENUM: TimerStatus --- */
const TimerStatus = {
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  IDLE: "IDLE",
};
Object.freeze(TimerStatus);

/*
 * CLASS: Timer
 *****************************************************************************/
const Timer = class {
  #status;
  #time;
  #delay;
  #callbacks;
  #jobId;

  /* --- INNER: Status --- */
  static Status = TimerStatus;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#setStatus(Timer.Status.IDLE);
    this.#jobId = null;
  }

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /* --- METHOD: start --- */
  start(startTime, delay, intervalCallback, finalCallback) {
    this.#validateStatus(Timer.Status.IDLE);

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
    this.#setStatus(Timer.Status.RUNNING);
  }

  /* --- METHOD: pause --- */
  pause() {
    this.#validateStatus(Timer.Status.RUNNING);
    Scheduler.cancel(this.#jobId);
    this.#setStatus(Timer.Status.PAUSED);
  }

  /* --- METHOD: resume --- */
  resume() {
    this.#validateStatus(Timer.Status.PAUSED);
    this.#jobId = Scheduler.after(this.#delay, () => {
      this.#handler();
    });
    this.#setStatus(Timer.Status.RUNNING);
  }

  /* --- METHOD: stop --- */
  stop() {
    if (this.getStatus() == Timer.Status.IDLE) return;
    Scheduler.cancel(this.#jobId);
    this.#jobId = null;
    this.#setStatus(Timer.Status.IDLE);
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

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in Timer.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: #validateStatus --- */
  #validateStatus(expected) {
    console.assert(expected in Timer.Status); // sanity check
    const status = this.getStatus();
    if (status !== expected) {
      throw new StatusError(`timer status is not ${expected}`, status);
    }
  }
};
