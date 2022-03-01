/* --- IMPORTS --- */
// import Graph from "../library/graph.js";
import GraphUtils from "../library/graphutils.js";
import Door, { ExitDoor } from "./door.js";
import Room from "./room.js";
import Player from "./player.js";
import Direction from "./direction.js";
import { ETypeError, ERangeError, StatusError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Game as default };

/* --- ENUM: GameStatus --- */
const GameStatus = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
};
Object.freeze(GameStatus);

/* --- DEFAULTS --- */
const DEFAULT_NUM_ROWS = 5;
const DEFAULT_NUM_COLUMNS = 5;
const DEFAULT_NUM_PLAYERS = 1;

/*
 * CLASS: Game [UML]
 *****************************************************************************/
const Game = class {
  #status;
  #players;
  #rows;
  #columns;
  #numRooms;
  #rooms;
  #entryRoom;
  #exitRoom;

  /* --- INNER: Status --- */
  static Status = GameStatus;

  /* --- INNER: State --- */
  static State = class {
    constructor(player) {
      console.assert(player instanceof Player); // sanity check

      this.room = player.getRoom();
      this.loc = player.getLocation();

      this.room;

      // TODO [ID]
      // room.id: room.getId()
      // room.welcomeLoc: room.getWelcomeLocation()
      // room.doors: undefined
      // loc: loc
    }
  };

  /* --- C'TOR: constructor --- */
  constructor(rows = DEFAULT_NUM_ROWS, columns = DEFAULT_NUM_COLUMNS) {
    Game.#validator(rows, columns);
    this.#rows = rows;
    this.#columns = columns;
    this.#numRooms = rows * columns;

    this.#setStatus(Game.Status.IDLE);
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

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
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
    this.#validateStatus(Game.Status.PLAYING);
    return this.#players.length;
  }

  /* --- METHOD: getState --- */
  getState(index) {
    this.#validateStatus(Game.Status.PLAYING);
    this.#validatePlayerIndex(index);
    return new Game.State(this.#players[index]);
  }

  /* --- METHOD: play --- */
  play(numPlayers = DEFAULT_NUM_PLAYERS) {
    if (this.getStatus() === Game.Status.PLAYING) {
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

    this.#setStatus(Game.Status.PLAYING);
    return true;
  }

  /* --- METHOD: reset --- */
  reset() {
    const status = this.getStatus();
    if (status === Game.Status.IDLE) {
      console.log("Reset what?");
      return false;
    }
    if (status === Game.Status.PLAYING) {
      if (!this.stop()) {
        return false;
      }
    }
    return this.play();
  }

  /* --- METHOD: stop --- */
  stop() {
    if (this.getStatus() === Game.Status.IDLE) {
      console.log("What are you trying to stop?");
      return false;
    }

    for (let i = 0; i < this.getNumPlayers(); i++) {
      this.#players[i].exit(); // let player out
      this.#players[i].stop();
    }
    this.#players = [];
    this.#destroyNetwork();
    this.#setStatus(Game.Status.IDLE);
    return true;
  }

  /* --- METHOD: playerMove --- */
  playerMove(index, direction) {
    this.#validateStatus(Game.Status.PLAYING);
    this.#validatePlayerIndex(index);
    if (!(direction in Direction)) {
      throw new ETypeError(`input is not of type Direction`, direction);
    }
    this.#players[index].move(direction);
  }

  /* --- METHOD: playerInspect --- */
  playerInspect(index) {
    this.#validateStatus(Game.Status.PLAYING);
    this.#validatePlayerIndex(index);

    const player = this.#players[index];
    player.inspect();
    if (player.getRoom() === this.#exitRoom) {
      console.log(`Player ${index} has won the game!`);
      this.stop();
      return true;
    }
    return false;
  }

  /* --- METHOD: playerUndo --- */
  playerUndo(index) {
    this.#validateStatus(Game.Status.PLAYING);
    this.#validatePlayerIndex(index);
    this.#players[index].backtrack();
  }

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in Game.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: #validateStatus --- */
  #validateStatus(expected) {
    console.assert(expected in Game.Status); // sanity check
    const status = this.getStatus();
    if (status !== expected) {
      throw new StatusError(`game status is not ${expected}`, status);
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
    console.assert(this.getStatus() === Game.Status.IDLE); // sanity check

    // create underlying graph
    const graph = this.#getGraph(this.getNumRooms());
    const [source, target] = this.#getEndpoints(graph); // source, target

    // create rooms
    const [rows, columns] = this.getDimensions();
    this.#rooms = {};
    graph.V().forEach((u) => {
      this.#rooms[u] = new Room(rows, columns);
    });

    // create and add doors to rooms
    graph.V().forEach((u) => {
      // no doors in exit room
      if (u !== target) {
        graph.neighbors(u).forEach((v) => {
          let DoorType;
          if (v === target) {
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
    this.#entryRoom = this.#rooms[source];
    this.#exitRoom = this.#rooms[target];
  }

  /* --- METHOD: #destroyNetwork --- */
  #destroyNetwork() {
    console.assert(this.getStatus() === Game.Status.PLAYING); // sanity check

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
