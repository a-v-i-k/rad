/* --- IMPORTS --- */
import Random from "../library/random.js";
import Game from "../game/game.js";
import Scheduler from "./scheduler.js";
import Randy from "./randy.js";
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { RandyManager as default };

/* --- CONSTANTS --- */
const RANDY_DELAY = 500; // in milliseconds

/*
 * CLASS: RandyManager
 *****************************************************************************/
const RandyManager = class {
  #game;
  #refreshCallback;
  #doneCallback;
  #randys;

  /* --- C'TOR: constructor --- */
  constructor(game, refreshCallback, doneCallback) {
    RandyManager.#validator(game, refreshCallback, doneCallback);
    this.#game = game;
    this.#refreshCallback = refreshCallback;
    this.#doneCallback = doneCallback;
    this.#randys = {};
  }

  /* --- METHOD: #validator --- */
  static #validator(game, refreshCallback, doneCallback) {
    if (!(game instanceof Game)) {
      throw new ETypeError(`input is not of type Game`, game);
    }
    if (typeof refreshCallback !== "function") {
      throw new ETypeError(`callback is not a function`, refreshCallback);
    }
    if (typeof doneCallback !== "function") {
      throw new ETypeError(`callback is not a function`, doneCallback);
    }
  }

  /* --- METHOD: start --- */
  start(numRandys) {
    if (!Number.isInteger(numRandys)) {
      throw new ETypeError(`input is not an integer`, numRandys);
    }
    if (numRandys <= 0) {
      throw new ERangeError(`input is not positive`, numRandys);
    }

    for (let index = 1; index <= numRandys; index++) {
      const walker = new Randy();
      walker.start();

      // TODO: Think about the delay formula...
      let delay;
      if (index === 1) {
        delay = RANDY_DELAY;
      } else {
        // index > 1
        delay = Random.getRandomInteger(RANDY_DELAY, 2 * RANDY_DELAY);
      }

      const jobId = Scheduler.after(delay, () => {
        this.#step(index);
      });
      this.#randys[index] = { walker: walker, delay: delay, jobId: jobId };
    }
  }

  /* --- METHOD: pause --- */
  pause() {
    for (const index in this.#randys) {
      Scheduler.cancel(this.#randys[index].jobId);
      this.#randys[index].jobId = null;
    }
  }

  /* --- METHOD: resume --- */
  resume() {
    for (const index in this.#randys) {
      this.#randys[index].jobId = Scheduler.after(
        this.#randys[index].delay,
        () => {
          this.#step(index);
        }
      );
    }
  }

  /* --- METHOD: halt --- */
  halt() {
    for (const index in this.#randys) {
      Scheduler.cancel(this.#randys[index].jobId);
      this.#randys[index].walker.halt();
    }
    this.#randys = {};
  }

  /* --- METHOD: #step --- */
  #step(index) {
    const randy = this.#randys[index];
    const state = this.#game.getState(index); // TODO [ID]
    const prevRoom = state.room; // TODO [ID]

    const randyStatus = randy.walker.getStatus();
    if (randyStatus === Randy.Status.CHOOSING) {
      randy.walker.choose(state); // TODO [ID]
    } else if (randyStatus === Randy.Status.WALKING) {
      const direction = randy.walker.walk(state); // TODO [ID]
      if (direction !== null) {
        this.#game.playerMove(index, direction);
      }
    } else if (randyStatus === Randy.Status.INSPECTING) {
      if (this.#game.playerInspect(index)) {
        this.#doneCallback(index);
        return;
      }
      randy.walker.next(state); // TODO [ID]
    } else {
      console.assert(false); // sanity check
    }

    // refresh?
    const playerRoom = this.#game.getState(0).room, // TODO [ID]
      nextRoom = this.#game.getState(index).room; // TODO [ID]
    if (nextRoom === playerRoom || prevRoom === playerRoom) {
      this.#refreshCallback();
    }

    // continue...
    randy.jobId = Scheduler.after(randy.delay, () => {
      this.#step(index);
    });
  }
};
