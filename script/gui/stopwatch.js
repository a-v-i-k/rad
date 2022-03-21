/* --- IMPORTS --- */
import Validator from "../library/validation.js";
import { StatusError } from "../library/errors.js";
import Scheduler from "./scheduler.js";

/* --- EXPORTS --- */
export { Stopwatch as default };

/* --- ENUM: StopwatchStatus --- */
const StopwatchStatus = {
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  IDLE: "IDLE",
};
Object.freeze(StopwatchStatus);

/*
 * CLASS: Stopwatch
 *****************************************************************************/
const Stopwatch = class {
  #status;
  #time;
  #delay;
  #callback;
  #jobId;

  /* --- INNER: Status --- */
  static Status = StopwatchStatus;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#setStatus(Stopwatch.Status.IDLE);
    this.#jobId = null;
  }

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /* --- METHOD: start --- */
  start(delay, callback) {
    this.#validateStatus(Stopwatch.Status.IDLE);

    // argument validation
    Validator.positiveInteger(delay);
    Validator.function(callback);

    this.#time = 0;
    this.#delay = delay;
    this.#callback = callback;
    this.#jobId = Scheduler.after(delay, () => {
      this.#handler();
    });
    this.#setStatus(Stopwatch.Status.RUNNING);
  }

  /* --- METHOD: pause --- */
  pause() {
    this.#validateStatus(Stopwatch.Status.RUNNING);
    Scheduler.cancel(this.#jobId);
    this.#setStatus(Stopwatch.Status.PAUSED);
  }

  /* --- METHOD: resume --- */
  resume() {
    this.#validateStatus(Stopwatch.Status.PAUSED);
    this.#jobId = Scheduler.after(this.#delay, () => {
      this.#handler();
    });
    this.#setStatus(Stopwatch.Status.RUNNING);
  }

  /* --- METHOD: stop --- */
  stop() {
    if (this.getStatus() == Stopwatch.Status.IDLE) return;
    Scheduler.cancel(this.#jobId);
    this.#jobId = null;
    this.#setStatus(Stopwatch.Status.IDLE);
  }

  /* --- METHOD: #handler --- */
  #handler() {
    this.#time += this.#delay;
    this.#callback(this.#time); // interval callback
    this.#jobId = Scheduler.after(this.#delay, () => {
      this.#handler();
    });
  }

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in Stopwatch.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: #validateStatus --- */
  #validateStatus(expected) {
    console.assert(expected in Stopwatch.Status); // sanity check
    const status = this.getStatus();
    if (status !== expected) {
      throw new StatusError(`stopwatch status is not ${expected}`, status);
    }
  }
};
