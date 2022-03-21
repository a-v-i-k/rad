/* --- IMPORTS --- */
import Validator from "../library/validation.js";

/* --- EXPORTS --- */
export { Scheduler as default };

/*
 * CLASS: Scheduler
 *****************************************************************************/
const Scheduler = class {
  static #idCounter = 1;
  static #jobs = [];

  /* --- METHOD: after --- */
  static after(milliseconds, callback) {
    // argument validation
    Validator.positiveInteger(milliseconds);
    Validator.function(callback);

    const jobId = Scheduler.#generateJobId();
    this.#jobs[jobId] = window.setTimeout(callback, milliseconds);
    return jobId;
  }

  /* --- METHOD: cancel --- */
  static cancel(jobId) {
    if (!(jobId in this.#jobs)) {
      console.warn(`Given job ID ${jobId} to cancel does not exist.`);
    }
    window.clearTimeout(this.#jobs[jobId]);
    delete this.#jobs[jobId];
  }

  /* --- METHOD: generateId --- */
  static #generateJobId() {
    const id = Scheduler.#idCounter;
    Scheduler.#idCounter += 1;
    return id;
  }
};
