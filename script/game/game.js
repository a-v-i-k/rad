/* --- IMPORTS --- */
// import Graph from "../library/graph.js";
import GraphUtils from "../library/graphutils.js";
import Door, { ExitDoor } from "./door.js";
import Room from "./room.js";
import Player from "./player.js";
import Direction from "./direction.js";
import { ETypeError, ERangeError, StateError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Game as default };

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
  #players;
  #rows;
  #columns;
  #numRooms;
  #rooms;
  #entryRoom;
  #exitRoom;

  /* --- INNER: State --- */
  static State = GameState;

  /* --- C'TOR: constructor --- */
  constructor(rows = DEFAULT_NUM_ROWS, columns = DEFAULT_NUM_COLUMNS) {
    Game.#validator(rows, columns);
    this.#rows = rows;
    this.#columns = columns;
    this.#numRooms = rows * columns;

    this.#setState(Game.State.IDLE);
    this.#rooms = null;
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
      this.#players[i].enter(this.#entryRoom); // let player in
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
      this.#players[i].exit(); // let player out
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
    if (player.getPosition().room === this.#exitRoom) {
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
    console.assert(this.getState() === Game.State.IDLE); // sanity check

    // create underlying graph
    const graph = this.#getGraph(this.getNumRooms());
    const endpoints = this.#getEndpoints(graph); // source, target

    // create rooms
    this.#rooms = {};
    graph.V().forEach((u) => {
      this.#rooms[u] = new Room(this.#rows, this.#columns);
    });

    // create and add doors to rooms
    graph.V().forEach((u) => {
      // no doors in exit room
      if (u !== endpoints[1]) {
        graph.neighbors(u).forEach((v) => {
          let DoorType;
          if (v === endpoints[1]) {
            DoorType = ExitDoor;
          } else {
            DoorType = Door;
          }
          const door = new DoorType(this.#rooms[v]);
          this.#rooms[u].addDoor(door);
        });
      }
    });

    // set entry and exit rooms
    this.#entryRoom = this.#rooms[endpoints[0]];
    this.#exitRoom = this.#rooms[endpoints[1]];
  }

  /* --- METHOD: #destroyNetwork --- */
  #destroyNetwork() {
    console.assert(this.getState() === Game.State.PLAYING); // sanity check

    // clear rooms (door detachments prevent circular references)
    for (const id in this.#rooms) {
      this.#rooms[id].clear();
    }
    this.#rooms = null;
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
