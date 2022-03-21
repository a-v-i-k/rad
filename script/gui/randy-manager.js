/* --- IMPORTS --- */
import { RuntimeError } from "../library/errors.js";
import Validator from "../library/validation.js";
import Random from "../library/random.js";
import Game from "../game/game.js";
import Scheduler from "./scheduler.js";
import Randy from "./randy.js";

/* --- EXPORTS --- */
export { RandyManager as default };

/* --- CONSTANTS --- */
const RANDY_DELAY = 400; // in milliseconds

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
    Validator.instanceOf(game, Game);
    Validator.function(refreshCallback);
    Validator.function(doneCallback);
    this.#game = game;
    this.#refreshCallback = refreshCallback;
    this.#doneCallback = doneCallback;
    this.#randys = {};
    this.#active = false;
  }

  /* --- isActive() --- */
  isActive() {
    return this.#active;
  }

  /* --- METHOD: start --- */
  start(numRandys) {
    Validator.positiveInteger(numRandys);

    if (this.isActive()) {
      throw new RuntimeError(`trying to start an active manager`);
    }
    this.#active = true;

    for (let index = 1; index <= numRandys; index++) {
      const walker = new Randy();
      walker.start();

      let delay;
      if (index === 1) {
        delay = RANDY_DELAY;
      } else {
        // index > 1
        delay = Random.getRandomInteger(RANDY_DELAY - 200, RANDY_DELAY + 201);
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
      const winStatus = this.#game.playerInspect(index)[1];
      if (winStatus) {
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
