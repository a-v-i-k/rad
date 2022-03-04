/* --- IMPORTS --- */
import Scheduler from "./scheduler.js";
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { TIterator as default };

/*
 * CLASS: TIterator
 *****************************************************************************/
const TIterator = class {
  #delay;
  #stepCallback;
  #endCallback;
  #jobId;

  /* --- C'TOR: constructor --- */
  constructor(delay, stepCallback, endCallback) {
    TIterator.#validator(delay, stepCallback, endCallback);
    this.#delay = delay;
    this.#stepCallback = stepCallback;
    this.#endCallback = endCallback;

    this.#jobId = Scheduler.after(delay, () => {
      this.#stepWrapper();
    });
  }

  /* --- METHOD: #validator --- */
  static #validator(delay, stepCallback, endCallback) {
    if (!Number.isInteger(delay)) {
      throw new ETypeError(`input is not an integer`, delay);
    }
    if (delay <= 0) {
      throw new ERangeError(`input is not positive`, delay);
    }
    if (typeof stepCallback !== "function") {
      throw new ETypeError(`callback is not a function`, stepCallback);
    }
    if (typeof endCallback !== "function") {
      throw new ETypeError(`callback is not a function`, endCallback);
    }
  }

  /* --- METHOD: pause --- */
  pause() {
    Scheduler.cancel(this.#jobId);
  }

  /* --- METHOD: resume --- */
  resume() {
    this.#jobId = Scheduler.after(this.#delay, () => {
      this.#stepWrapper();
    });
  }

  /* --- METHOD: cancel --- */
  cancel() {
    Scheduler.cancel(this.#jobId);
  }

  /* --- METHOD: #stepWrapper --- */
  #stepWrapper() {
    if (this.#stepCallback()) {
      this.#jobId = Scheduler.after(this.#delay, () => {
        this.#stepWrapper();
      });
    } else {
      this.#endCallback();
    }
  }
};
