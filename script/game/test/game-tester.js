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
        const position = game.getPlayerPosition(i);
        const walkerState = walker.getState();
        if (walkerState === RandomWalker.State.CHOOSING) {
          walker.choose(position);
        } else if (walkerState === RandomWalker.State.WALKING) {
          const direction = walker.walk(position);
          if (direction !== null) {
            game.playerMove(i, direction);
          }
        } else if (walkerState === RandomWalker.State.INSPECTING) {
          if (game.playerInspect(i)) {
            console.log(
              `Walker ${i} has emerged as the winner after ${numSteps} steps.`
            );
            break test;
          }
          walker.next(position);
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
