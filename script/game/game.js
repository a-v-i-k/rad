/* --- IMPORTS --- */
// import Graph from "../library/graph.js";
import GraphUtils from "../library/graphutils.js";
import Topology from "./topology.js";
import Network from "./network.js";
import Player from "./player.js";
import Direction from "./direction.js";
import { ETypeError, ERangeError, StateError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Game as default };
export { DEFAULT_NUM_ROWS, DEFAULT_NUM_COLUMNS, DEFAULT_NUM_PLAYERS };

/* --- ENUM: GameState --- */
const GameState = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
};
Object.freeze(GameState);

/* --- DEFAULTS --- */
const DEFAULT_NUM_ROWS = 5;
const DEFAULT_NUM_COLUMNS = 5;
const DEFAULT_NUM_PLAYERS = 1;

/*
 * CLASS: Game [UML]
 *****************************************************************************/
const Game = class {
  #state;
  #network;
  #players;
  #rows;
  #columns;
  #numRooms;

  /* --- INNER: State --- */
  static State = GameState;

  /* --- C'TOR: constructor --- */
  constructor(rows = DEFAULT_NUM_ROWS, columns = DEFAULT_NUM_COLUMNS) {
    Game.#validator(rows, columns);
    this.#rows = rows;
    this.#columns = columns;
    this.#numRooms = rows * columns;

    this.#setState(Game.State.IDLE);
    this.#network = new Network();
    this.#players = [];
  }

  /* --- METHOD: #validator --- */
  static #validator(rows, columns) {
    if (!Number.isInteger(rows)) {
      throw new ETypeError(`input is not an integer`, rows);
    }
    if (rows < 0) {
      throw new ERangeError(`input is negative`, rows);
    }

    if (!Number.isInteger(columns)) {
      throw new ETypeError(`input is not an integer`, columns);
    }
    if (columns < 0) {
      throw new ERangeError(`input is negative`, columns);
    }
  }

  /* --- METHOD: getState --- */
  getState() {
    return this.#state;
  }

  /* --- METHOD: getDimensions --- */
  getDimensions() {
    return [this.#rows, this.#columns];
  }

  /* --- METHOD: getNumRooms --- */
  getNumRooms() {
    return this.#numRooms;
  }

  /* --- METHOD: getNumPlayers --- */
  getNumPlayers() {
    this.#validateState(Game.State.PLAYING);
    return this.#players.length;
  }

  /* --- METHOD: getPlayerPosition --- */
  getPlayerPosition(index) {
    this.#validateState(Game.State.PLAYING);
    this.#validatePlayerIndex(index);
    return this.#players[index].getPosition();
  }

  /* --- METHOD: play --- */
  play(numPlayers = DEFAULT_NUM_PLAYERS) {
    if (this.getState() === Game.State.PLAYING) {
      console.log("You are already playing my dude.");
      return false;
    }
    if (numPlayers <= 0) {
      throw new ERangeError(`number of players is not positive`, numPlayers);
    }

    // create network and players
    this.#createNetwork();
    this.#createPlayers(numPlayers);
    for (let i = 0; i < numPlayers; i++) {
      this.#players[i].play(); // start playing
      this.#network.register(this.#players[i]); // register player in network
    }

    this.#setState(Game.State.PLAYING);
    return true;
  }

  /* --- METHOD: reset --- */
  reset() {
    const state = this.getState();
    if (state === Game.State.IDLE) {
      console.log("Reset what?");
      return false;
    }
    if (state === Game.State.PLAYING) {
      if (!this.stop()) {
        return false;
      }
    }
    return this.play();
  }

  /* --- METHOD: stop --- */
  stop() {
    if (this.getState() === Game.State.IDLE) {
      console.log("What are you trying to stop?");
      return false;
    }

    for (let i = 0; i < this.getNumPlayers(); i++) {
      this.#network.deregister(this.#players[i]);
      this.#players[i].stop();
    }
    this.#players = [];
    this.#destroyNetwork();
    this.#setState(Game.State.IDLE);
    return true;
  }

  /* --- METHOD: playerMove --- */
  playerMove(index, direction) {
    this.#validateState(Game.State.PLAYING);
    this.#validatePlayerIndex(index);
    if (!(direction in Direction)) {
      throw new ETypeError(`input is not of type Direction`, direction);
    }
    this.#players[index].move(direction);
  }

  /* --- METHOD: playerInspect --- */
  playerInspect(index) {
    this.#validateState(Game.State.PLAYING);
    this.#validatePlayerIndex(index);

    const player = this.#players[index];
    player.inspect();
    if (this.#network.finished(player)) {
      console.log(`Player ${index} has won the game!`);
      this.stop();
      return true;
    }
    return false;
  }

  /* --- METHOD: playerUndo --- */
  playerUndo(index) {
    this.#validateState(Game.State.PLAYING);
    this.#validatePlayerIndex(index);
    this.#players[index].backtrack();
  }

  /* --- METHOD: playerToggleMark --- */
  playerToggleMark(index) {
    this.#validateState(Game.State.PLAYING);
    this.#validatePlayerIndex(index);
    this.#players[index].toggleMark();
  }

  /* --- METHOD: #setState --- */
  #setState(state) {
    console.assert(state in Game.State); // sanity check
    this.#state = state;
  }

  /* --- METHOD: #validateState --- */
  #validateState(expected) {
    console.assert(expected in Game.State); // sanity check
    const state = this.getState();
    if (state !== expected) {
      throw new StateError(`game state is not ${expected}`, state);
    }
  }

  /* --- #validatePlayerIndex --- */
  #validatePlayerIndex(index) {
    const numPlayers = this.getNumPlayers();
    if (index < 0 || index >= numPlayers) {
      throw new ERangeError(
        `input is not in the range [${0}, ${numPlayers - 1}]`,
        index
      );
    }
  }

  /* --- METHOD: #createNetwork --- */
  #createNetwork() {
    const graph = this.#getGraph(this.getNumRooms());
    const endpoints = this.#getEndpoints(graph); // source, target
    const dimensions = this.getDimensions(); // rows, columns
    const topology = new Topology(graph, endpoints[0], endpoints[1]);
    this.#network.build(topology, dimensions[0], dimensions[1]);
  }

  /* --- METHOD: #destroyNetwork --- */
  #destroyNetwork() {
    this.#network.destroy();
  }

  /* --- METHOD: #createPlayers --- */
  #createPlayers(numPlayers) {
    console.assert(numPlayers > 0); // sanity check
    for (let i = 0; i < numPlayers; i++) {
      this.#players.push(new Player());
    }
  }

  /* --- METHOD: #getGraph --- */
  #getGraph(n) {
    return GraphUtils.getRandomTree(n);
  }

  /* --- METHOD: #getEndpoints --- */
  #getEndpoints(graph) {
    return GraphUtils.findTreeDiameterEndpoints(graph)[0];
  }
};
