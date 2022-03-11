/* --- IMPORTS --- */
import Random from "../library/random.js";
import Graph from "../library/graph.js";
import GraphUtils from "../library/graphutils.js";
import Door from "./door.js";
import Stone from "./stone.js";
import Cell from "./cell.js";
import Room from "./room.js";
import Player from "./player.js";
import Direction from "./direction.js";
import {
  ETypeError,
  ERangeError,
  StatusError,
  ValueError,
} from "../library/errors.js";

/* --- EXPORTS --- */
export { Game as default };
export { BACKTRACK, STONES_REQUIRED };

/* --- ENUM: GameStatus --- */
const GameStatus = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
};
Object.freeze(GameStatus);

/* --- DEFAULTS --- */
const DEFAULT_NUM_ROWS = 4;
const DEFAULT_NUM_COLUMNS = 4;
const DEFAULT_NUM_LEVELS = 5;
const DEFAULT_ROOMS_PER_LEVEL = 30;
const DEFAULT_NUM_PLAYERS = 1;

/* --- CONSTANTS --- */
const BACKTRACK = true;
const STONES_REQUIRED = true;

/*
 * CLASS: Game [UML]
 *****************************************************************************/
const Game = class {
  #status;
  #players;
  #rows;
  #columns;
  #numLevels;
  #roomsPerLevel;
  #numRooms;
  #roomsInfo;
  #numStones;
  #missingStones;

  /* --- INNER: Status --- */
  static Status = GameStatus;

  /* --- INNER: State --- */
  static State = class {
    // TODO: A lot of information here doesn't change, so maybe we can compute
    // such information once and store it for later use.
    constructor(game, player) {
      console.assert(player instanceof Player); // sanity check
      console.assert(player instanceof Player); // sanity check

      // player
      this.player = { id: player.getId(), loc: player.getLocation() };

      // room
      const room = player.getRoom();
      const roomId = room.getId();
      this.room = {
        id: roomId,
        dims: room.getDimensions(),
        wloc: room.getWelcomeLocation(),
        level: game.getRoomLevel(roomId),
      };

      // doors
      this.doors = [];
      for (const loc of room.getDoorLocations()) {
        const door = room.getCell(loc).getElement();
        const ownerId = door.open().getId();
        console.assert(door !== null); // sanity check
        this.doors.push({
          id: door.getId(),
          type: door.getType(),
          ownerId: ownerId,
          loc: loc,
          level: game.getRoomLevel(ownerId),
        });
      }

      // stones
      this.stonesRequired = game.stonesRequired();
      this.missingStones = game.getMissingStones();
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
    }
  };

  /* --- C'TOR: constructor --- */
  constructor(
    rows = DEFAULT_NUM_ROWS,
    columns = DEFAULT_NUM_COLUMNS,
    numLevels = DEFAULT_NUM_LEVELS,
    roomsPerLevel = DEFAULT_ROOMS_PER_LEVEL
  ) {
    Game.#validator(rows, columns, numLevels, roomsPerLevel);
    this.#rows = rows;
    this.#columns = columns;
    this.#numLevels = numLevels;
    this.#roomsPerLevel = roomsPerLevel;

    this.#setStatus(Game.Status.IDLE);
    this.#players = [];
    this.#roomsInfo = null;
    this.#numStones = Object.keys(Stone.Type).length;
    this.#missingStones = {};
  }

  /* --- METHOD: #validator --- */
  static #validator(rows, columns, numLevels, roomsPerLevel) {
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

    if (!Number.isInteger(numLevels)) {
      throw new ETypeError(`input is not an integer`, numLevels);
    }
    if (numLevels < 1) {
      throw new ERangeError(`number of levels must be at least 1`, numLevels);
    }
    if (!Number.isInteger(roomsPerLevel)) {
      throw new ETypeError(`input is not an integer`, roomsPerLevel);
    }
    if (roomsPerLevel < 2) {
      throw new ERangeError(
        `rooms per level must be at least 2`,
        roomsPerLevel
      );
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

  /* --- METHOD: getNumLevels --- */
  getNumLevels() {
    return this.#numLevels;
  }

  /* --- METHOD: getRoomsPerLevel --- */
  getRoomsPerLevel() {
    return this.#roomsPerLevel;
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
    return new Game.State(this, this.#players[index]);
  }

  /* --- METHOD: getRoomLevel --- */
  getRoomLevel(roomId) {
    if (!(roomId in this.#roomsInfo.levels)) {
      throw new ValueError(`illegal room ID ${roomId}`);
    }
    return this.#roomsInfo.levels[roomId];
  }

  /* --- METHOD: getNumStones --- */
  getNumStones() {
    return this.#numStones;
  }

  /* --- METHOD: stonesRequired --- */
  stonesRequired() {
    return STONES_REQUIRED && Object.keys(this.#missingStones).length > 0;
  }

  /* --- METHOD: getMissingStones --- */
  getMissingStones() {
    const missingStones = {};
    for (const level in this.#missingStones) {
      missingStones[level] = this.#missingStones[level].map((x) => x);
    }
    return missingStones;
  }

  /// PLAYING

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
      this.#players[i].enter(this.#roomsInfo.startRoom); // let player in
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
    this.#missingStones = {};
    this.#destroyNetwork();
    this.#players = [];
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

    let [elementType, winStatus] = [null, false];
    switch (cell.getType()) {
      case Cell.Type.PLAIN: // plain cell
        const element = cell.getElement();
        if (element === null) {
          console.log("Nothing to inspect...");
        } else if (element instanceof Door) {
          const doorType = element.getType();
          if (doorType === Door.Type.PLAIN) {
            player.enter(element.open());
          } else if (doorType === Door.Type.EXIT) {
            // NOTE: If stones are required, they are only required for the
            // primary player.
            if (index > 0) {
              winStatus = true;
            } else {
              if (this.stonesRequired()) {
                console.log(`Where are them stones?`);
              } else {
                winStatus = true;
              }
            }
            if (winStatus) {
              console.log(`Player ${index} has won the game!`);
              this.stop();
            }
          } else {
            console.assert(false); // sanity check
          }
          elementType = doorType;
        } else if (element instanceof Stone) {
          const room = player.getRoom();
          const level = this.getRoomLevel(room.getId());
          const missing = this.#missingStones[level];
          elementType = element.getType();
          missing.splice(missing.indexOf(elementType), 1);
          if (missing.length == 0) {
            delete this.#missingStones[level];
          }
          room.removeStone(player.getLocation());
        }
        break;

      case Cell.Type.WELCOME: // welcome cell
        if (BACKTRACK) {
          this.playerBacktrack(index); // go back to previous room
        }
        break;

      default:
        console.assert(false); // sanity check
    }
    return [elementType, winStatus];
  }

  /* --- METHOD: playerBacktrack --- */
  playerBacktrack(index) {
    this.#validateStatus(Game.Status.PLAYING);
    this.#validatePlayerIndex(index);
    if (BACKTRACK) {
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

  /// NETWORK

  /* --- METHOD: #createNetwork --- */
  #createNetwork() {
    console.assert(this.getStatus() === Game.Status.IDLE); // sanity check

    // set number of rooms
    const [numLevels, roomsPerLevel] = [
      this.getNumLevels(),
      this.getRoomsPerLevel(),
    ];
    this.#numRooms = numLevels * roomsPerLevel;

    // create underlying graphs
    const graphs = [];
    const endpoints = [];
    for (let i = 0; i < numLevels; i++) {
      graphs[i] = this.#getGraph(roomsPerLevel);
      endpoints[i] = this.#getEndpoints(graphs[i]);
    }

    // merge graphs (and set levels)
    const network = new Graph(this.#numRooms);
    const levels = {};
    for (let i = 0; i < numLevels; i++) {
      // embed graph in network
      graphs[i].V().forEach((u) => {
        // NOTE: Assumes vertices are integers.
        const nu = i * roomsPerLevel + u; // nu stands for network u
        graphs[i].neighbors(u).forEach((v) => {
          const nv = i * roomsPerLevel + v;
          if (u < v) {
            // undirected graph
            network.addEdge(nu, nv);
          }
        });
        levels[nu] = i + 1;
      });

      // connect endpoints
      if (i > 0) {
        const ep1 = (i - 1) * roomsPerLevel + endpoints[i - 1][1];
        const ep2 = i * roomsPerLevel + endpoints[i][0];
        network.addEdge(ep1, ep2);
      }
    }
    const source = endpoints[0][0];
    const target =
      (numLevels - 1) * roomsPerLevel + endpoints[numLevels - 1][1];

    // create rooms
    const [rows, columns] = this.getDimensions();
    const rooms = {};
    network.V().forEach((nu) => {
      rooms[nu] = new Room(rows, columns);
    });

    // create and add doors to rooms
    network.V().forEach((nu) => {
      // no doors in exit room
      if (nu !== target) {
        network.neighbors(nu).forEach((nv) => {
          const type = nv === target ? Door.Type.EXIT : Door.Type.PLAIN;
          const door = new Door(type, rooms[nv]);
          rooms[nu].addDoor(door);
        });
      }
    });

    // create and add stones to rooms
    // NOTE: Stones are scattered evenly (as much as possible) between levels.
    const buckets = {};
    network.V().forEach((nu) => {
      // NOTE: No stones in source and target room.
      if (nu !== source && nu !== target) {
        const level = levels[nu];
        if (!(level in buckets)) {
          buckets[level] = [];
        }
        buckets[level].push(nu);
      }
    });

    // NOTE: The stones are arranged so that the order they appear in levels
    // corrsponds with the order they appear in the plate. This is all assuming
    // exactly 5 levels.
    const stoneTypes = [
      Stone.Type.RUBY,
      Stone.Type.GARNET,
      Stone.Type.OPAL,
      Stone.Type.AGATE,
      Stone.Type.AMETHYST,
      Stone.Type.EMERALD,
      Stone.Type.SAPPHIRE,
      Stone.Type.AQUAMARINE,
      Stone.Type.ONYX,
      Stone.Type.JASPER,
      Stone.Type.TOPAZ,
      Stone.Type.DIAMOND,
    ];
    // const stoneTypes = Object.keys(Stone.Type);
    // Random.shuffleArray(stoneTypes);

    let level = 1;
    for (const stoneType of stoneTypes) {
      const stone = new Stone(stoneType);

      const bucket = buckets[level];
      const nu = Random.getRandomChoice(bucket);
      if (DEFAULT_ROOMS_PER_LEVEL > 3) {
        bucket.splice(bucket.indexOf(nu), 1); // without replacement
      }

      rooms[nu].addStone(stone);
      if (!(level in this.#missingStones)) {
        this.#missingStones[level] = [];
      }
      this.#missingStones[level].push(stoneType);
      level = (level % numLevels) + 1;
    }

    // store information about rooms (switch from vertices to room IDs)
    this.#roomsInfo = { startRoom: rooms[source], rooms: {}, levels: {} };
    network.V().forEach((nu) => {
      const roomId = rooms[nu].getId();
      this.#roomsInfo.rooms[roomId] = rooms[nu];
      this.#roomsInfo.levels[roomId] = levels[nu];
    });
  }

  /* --- METHOD: #destroyNetwork --- */
  #destroyNetwork() {
    console.assert(this.getStatus() === Game.Status.PLAYING); // sanity check

    // clear rooms (door detachments prevent circular references)
    for (const roomId in this.#roomsInfo.rooms) {
      this.#roomsInfo.rooms[roomId].clear();
    }
    this.#roomsInfo = null;
  }

  /* --- METHOD: #createPlayers --- */
  #createPlayers(numPlayers) {
    console.assert(numPlayers > 0); // sanity check
    for (let i = 0; i < numPlayers; i++) {
      this.#players.push(new Player());
    }
  }

  /// GRAPH

  /* --- METHOD: #getGraph --- */
  #getGraph(n) {
    return GraphUtils.getRandomTree(n);
  }

  /* --- METHOD: #getEndpoints --- */
  #getEndpoints(graph) {
    return GraphUtils.findTreeDiameterEndpoints(graph)[0];
  }
};
