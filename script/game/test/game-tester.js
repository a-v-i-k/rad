/* --- IMPORTS --- */
import Game from "../game.js";
import RandomWalker from "./random-walker.js";

/* --- EXPORTS --- */
export { GameTester as default };

/* --- CONSTANTS --- */
const NUM_ROWS = 5;
const NUM_COLUMNS = 5;
const NUM_PLAYERS = 100;

/*
 * CLASS: GameTester
 *****************************************************************************/
const GameTester = class {
  /* --- METHOD: test --- */
  static test() {
    // start playing
    const game = new Game(NUM_ROWS, NUM_COLUMNS);
    game.play(NUM_PLAYERS);

    // initialize (random) walkers
    const walkers = [];
    for (let i = 0; i < NUM_PLAYERS; i++) {
      const walker = new RandomWalker();
      walker.start();
      walkers.push(walker);
    }

    // play until someone wins, count steps
    let numSteps = 0;
    test: while (true) {
      numSteps++;
      for (let i = 0; i < NUM_PLAYERS; i++) {
        // step
        const walker = walkers[i];
        const state = game.getState(i); // TODO [ID]
        const walkerStatus = walker.getStatus();
        if (walkerStatus === RandomWalker.Status.CHOOSING) {
          walker.choose(state); // TODO [ID]
        } else if (walkerStatus === RandomWalker.Status.WALKING) {
          const direction = walker.walk(state); // TODO [ID]
          if (direction !== null) {
            game.playerMove(i, direction);
          }
        } else if (walkerStatus === RandomWalker.Status.INSPECTING) {
          if (game.playerInspect(i)) {
            console.log(
              `Walker ${i} has emerged as the winner after ${numSteps} steps.`
            );
            break test;
          }
          walker.next(state); // TODO [ID]
        } else {
          console.assert(false); // sanity check
        }
      }
    }

    // dismiss walkers
    for (let i = 0; i < NUM_PLAYERS; i++) {
      walkers[i].halt();
    }
  }
};

GameTester.test();
