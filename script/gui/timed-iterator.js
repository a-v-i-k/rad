/* --- IMPORTS --- */
import Validator from "../library/validation.js";
import Scheduler from "./scheduler.js";

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
    Validator.positiveInteger(delay);
    Validator.function(stepCallback);
    Validator.function(endCallback);
    this.#delay = delay;
    this.#stepCallback = stepCallback;
    this.#endCallback = endCallback;

    this.#jobId = Scheduler.after(delay, () => {
      this.#stepWrapper();
    });
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
