/* --- IMPORTS --- */
import Random from "../library/random.js";
// import Graph from "../library/graph.js";
import GraphUtils from "../library/graphutils.js";
import Door from "./door.js";
import Stone from "./stone.js";
import Cell from "./cell.js";
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
const DEFAULT_NUM_ROWS = 4;
const DEFAULT_NUM_COLUMNS = 4;
const DEFAULT_NUM_ROOMS = 100;
const DEFAULT_NUM_PLAYERS = 1;
const DEFAULT_BACKTRACK = true;

/*
 * CLASS: Game [UML]
 *****************************************************************************/
const Game = class {
  #status;
  #players;
  #rows;
  #columns;
  #numRooms;
  #backtrack;
  #rooms;
  #startRoom;

  /* --- INNER: Status --- */
  static Status = GameStatus;

  /* --- INNER: State --- */
  static State = class {
    // TODO: A lot of information here doesn't change, so maybe we can compute
    // such information once and store it for later use.
    constructor(player) {
      console.assert(player instanceof Player); // sanity check

      // room
      const room = player.getRoom();
      this.room = {
        id: room.getId(),
        dims: room.getDimensions(),
        wloc: room.getWelcomeLocation(),
      };

      // doors
      this.doors = [];
      for (const loc of room.getDoorLocations()) {
        const door = room.getCell(loc).getElement();
        console.assert(door !== null); // sanity check
        this.doors.push({
          id: door.getId(),
          type: door.getType(),
          ownerId: door.open().getId(),
          loc: loc,
        });
      }

      // stones
      this.stones = [];
      for (const loc of room.getStoneLocations()) {
        const stone = room.getCell(loc).getElement();
        console.assert(stone !== null); // sanity check
        this.stones.push({
          id: stone.getId(),
          type: stone.getType(),
          loc: loc,
        });
      }

      // player
      this.player = { id: player.getId(), loc: player.getLocation() };
    }
  };

  /* --- C'TOR: constructor --- */
  constructor(
    rows = DEFAULT_NUM_ROWS,
    columns = DEFAULT_NUM_COLUMNS,
    numRooms = DEFAULT_NUM_ROOMS,
    backtrack = DEFAULT_BACKTRACK
  ) {
    Game.#validator(rows, columns, numRooms, backtrack);
    this.#rows = rows;
    this.#columns = columns;
    this.#numRooms = numRooms;
    this.#backtrack = backtrack;

    this.#setStatus(Game.Status.IDLE);
    this.#rooms = null;
    this.#players = [];
  }

  /* --- METHOD: #validator --- */
  static #validator(rows, columns, numRooms, backtrack) {
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

    if (!Number.isInteger(numRooms)) {
      throw new ETypeError(`input is not an integer`, numRooms);
    }
    if (numRooms <= 1) {
      throw new ERangeError(`number of rooms must be at least 2`, numRooms);
    }

    if (typeof backtrack !== "boolean") {
      throw new ETypeError(`input is not a boolean`, backtrack);
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
      this.#players[i].enter(this.#startRoom); // let player in
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
    const cell = player.inspect();

    let finished = false;
    switch (cell.getType()) {
      case Cell.Type.PLAIN: // plain cell
        const element = cell.getElement();
        if (element === null) {
          console.log("Nothing to inspect...");
          break;
        } else if (element instanceof Door) {
          if (this.#playerInspectDoor(player, element)) {
            console.log(`Player ${index} has won the game!`);
            this.stop();
            finished = true;
          }
        } else if (element instanceof Stone) {
          this.#playerInspectStone(player, element);
        }
        break;

      case Cell.Type.WELCOME: // welcome cell
        if (this.#backtrack) {
          this.playerBacktrack(index); // go back to previous room
        }
        break;

      default:
        console.assert(false); // sanity check
    }
    return finished;
  }

  /* --- #playerInspectDoor --- */
  #playerInspectDoor(player, door) {
    console.assert(player instanceof Player); // sanity check
    console.assert(door instanceof Door); // sanity check

    switch (door.getType()) {
      case Door.Type.PLAIN: // plain door
        player.enter(door.open());
        break;
      case Door.Type.EXIT: // exit door
        return true;
      default:
        console.assert(false); // sanity check
    }
    return false;
  }

  /* --- #playerInspectStone --- */
  #playerInspectStone(player, stone) {
    console.assert(player instanceof Player); // sanity check
    console.assert(stone instanceof Stone); // sanity check

    // remove stone
    player.getRoom().removeStone(player.getLocation());
  }

  /* --- METHOD: playerBacktrack --- */
  playerBacktrack(index) {
    this.#validateStatus(Game.Status.PLAYING);
    this.#validatePlayerIndex(index);
    if (this.#backtrack) {
      this.#players[index].backtrack();
    } else {
      console.log("Player backtrack is off.");
    }
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
    if (!Number.isInteger(index)) {
      throw new ETypeError(`input is not an integer`, index);
    }
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
    // DEBUG: Shows room full of doors.
    // const n = this.getNumRooms();
    // const graph = new Graph(n);
    // for (let i = 1; i < n; i++) {
    //   graph.addEdge(0, i);
    // }

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
          const type = v === target ? Door.Type.EXIT : Door.Type.PLAIN;
          const door = new Door(type, this.#rooms[v]);
          this.#rooms[u].addDoor(door);
        });
      }
    });

    // create and add stones to rooms
    const numStones = Object.keys(Stone.Type).length;
    const U = graph.V();
    U.splice(U.indexOf(source), 1); // no stone in source room
    U.splice(U.indexOf(target), 1); // no stone in target room
    // const S = Random.getRandomChoices(U, numStones, false); // without replacement
    const S = Random.getRandomChoices(U, numStones, true); // with replacement
    for (const stoneType in Stone.Type) {
      const stone = new Stone(stoneType);
      let u = S.pop();
      this.#rooms[u].addStone(stone);
    }

    // set start room
    this.#startRoom = this.#rooms[source];
  }

  /* --- METHOD: #destroyNetwork --- */
  #destroyNetwork() {
    console.assert(this.getStatus() === Game.Status.PLAYING); // sanity check

    // clear rooms (door detachments prevent circular references)
    for (const u in this.#rooms) {
      this.#rooms[u].clear();
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
