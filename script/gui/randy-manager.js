/* --- IMPORTS --- */
import Random from "../library/random.js";
import Door from "../game/door.js";
import Game from "../game/game.js";
import Scheduler from "./scheduler.js";
import Randy from "./randy.js";
import { ETypeError, ERangeError, RuntimeError } from "../library/errors.js";

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
  #active;

  /* --- C'TOR: constructor --- */
  constructor(game, refreshCallback, doneCallback) {
    RandyManager.#validator(game, refreshCallback, doneCallback);
    this.#game = game;
    this.#refreshCallback = refreshCallback;
    this.#doneCallback = doneCallback;
    this.#randys = {};
    this.#active = false;
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

  /* --- isActive() --- */
  isActive() {
    return this.#active;
  }

  /* --- METHOD: start --- */
  start(numRandys) {
    if (!Number.isInteger(numRandys)) {
      throw new ETypeError(`input is not an integer`, numRandys);
    }
    if (numRandys <= 0) {
      throw new ERangeError(`input is not positive`, numRandys);
    }

    if (this.isActive()) {
      throw new RuntimeError(`trying to start an active manager`);
    }
    this.#active = true;

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
    if (!this.isActive()) {
      throw new RuntimeError(`trying to pause an inactive manager`);
    }

    for (const index in this.#randys) {
      Scheduler.cancel(this.#randys[index].jobId);
      this.#randys[index].jobId = null;
    }
    this.#active = false;
  }

  /* --- METHOD: resume --- */
  resume() {
    if (this.isActive()) {
      throw new RuntimeError(`trying to resume an active manager`);
    }
    this.#active = true;

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
    if (!this.isActive()) {
      throw new RuntimeError(`trying to halt an inactive manager`);
    }

    for (const index in this.#randys) {
      Scheduler.cancel(this.#randys[index].jobId);
      this.#randys[index].walker.halt();
    }
    this.#randys = {};
    this.#active = false;
  }

  /* --- METHOD: #step --- */
  #step(index) {
    index = parseInt(index); // FIXME?
    const randy = this.#randys[index];
    const state = this.#game.getState(index);
    const prevRoomId = state.room.id;

    const randyStatus = randy.walker.getStatus();
    if (randyStatus === Randy.Status.CHOOSING) {
      randy.walker.choose(state);
    } else if (randyStatus === Randy.Status.WALKING) {
      const direction = randy.walker.walk(state);
      if (direction !== null) {
        this.#game.playerMove(index, direction);
      }
    } else if (randyStatus === Randy.Status.INSPECTING) {
      const result = this.#game.playerInspect(index);
      if (result === Door.Type.EXIT) {
        this.#doneCallback(index);
        return;
      }
      randy.walker.next(state);
    } else {
      console.assert(false); // sanity check
    }

    // refresh?
    const playerRoomId = this.#game.getState(0).room.id,
      nextRoomId = this.#game.getState(index).room.id;
    if (nextRoomId === playerRoomId || prevRoomId === playerRoomId) {
      this.#refreshCallback();
    }

    // continue...
    randy.jobId = Scheduler.after(randy.delay, () => {
      this.#step(index);
    });
  }
};
