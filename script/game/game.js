/* --- IMPORTS --- */
import Validator from "../library/validation.js";
import { StatusError, ValueError } from "../library/errors.js";
import Random from "../library/random.js";
import Graph from "../library/graph.js";
import GraphUtils from "../library/graphutils.js";
import Direction from "./direction.js";
// import Location from "./location";
import Door from "./door.js";
import Stone from "./stone.js";
import Room from "./room.js";
import Player from "./player.js";
import GameState from "./game-state.js";

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
const DEFAULT_NUM_LEVELS = 12;
const DEFAULT_ROOMS_PER_LEVEL = 15;
const DEFAULT_NUM_PLAYERS = 1;

/* --- CONSTANTS --- */
const BACKTRACK = true;
const STONES_REQUIRED = true;

/*
 * CLASS: Game
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

  /* --- C'TOR: constructor --- */
  constructor(
    rows = DEFAULT_NUM_ROWS,
    columns = DEFAULT_NUM_COLUMNS,
    numLevels = DEFAULT_NUM_LEVELS,
    roomsPerLevel = DEFAULT_ROOMS_PER_LEVEL
  ) {
    Validator.positiveInteger(rows);
    Validator.positiveInteger(columns);
    Validator.integerAtLeast(numLevels, 1);
    Validator.integerAtLeast(roomsPerLevel, 3);
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
    return new GameState(this, this.#players[index]);
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
    Validator.positiveInteger(numPlayers);
    if (this.getStatus() === Game.Status.PLAYING) {
      console.log("You are already playing my dude.");
      return false;
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
    Validator.enumMember(direction, Direction);
    this.#players[index].move(direction);
  }

  /* --- METHOD: playerInspect --- */
  playerInspect(index) {
    this.#validateStatus(Game.Status.PLAYING);
    this.#validatePlayerIndex(index);

    const player = this.#players[index];
    const loc = player.getLocation();
    const room = player.getRoom();

    let [elementType, winStatus] = [null, false];
    if (room.isWelcomeLocation(loc)) {
      if (BACKTRACK) {
        this.playerBacktrack(index); // go back to previous room
      }
    } else {
      const element = room.getElement(loc);
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
        const level = this.getRoomLevel(room.getId());
        const missing = this.#missingStones[level];
        elementType = element.getType();
        missing.splice(missing.indexOf(elementType), 1);
        if (missing.length == 0) {
          delete this.#missingStones[level];
        }
        room.removeElement(player.getLocation());
      }
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
    Validator.integer(index);
    Validator.range(index, 0, this.getNumPlayers() - 1);
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
          rooms[nu].addElement(door);
        });
      }
    });

    // create and add stones to rooms
    // NOTE: Stones are scattered evenly (as much as possible) between levels.
    const buckets = {};
    network.V().forEach((nu) => {
      const level = levels[nu];
      if (!(level in buckets)) {
        buckets[level] = [];
      }
      buckets[level].push(nu);
    });
    // NOTE: No stones in endpoints.
    for (let i = 0; i < endpoints.length; i++) {
      for (let j = 0; j < 2; j++) {
        const nu = i * roomsPerLevel + endpoints[i][j];
        const level = levels[nu];
        buckets[level].splice(buckets[level].indexOf(nu), 1);
      }
    }

    const stoneTypes = this.#getStoneTypes();
    let level = 1;
    for (const stoneType of stoneTypes) {
      const stone = new Stone(stoneType);

      const bucket = buckets[level];
      const nu = Random.getRandomChoice(bucket);

      rooms[nu].addElement(stone);
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

  /* --- #getStoneTypes --- */
  #getStoneTypes() {
    // NOTE: The stones are arranged so that the order they appear in levels
    // corrsponds with the order they appear in the plate.
    let stoneTypes;
    switch (this.getNumLevels()) {
      case 1:
        // doesn't really matter how we return the stone types
        stoneTypes = Object.keys(Stone.Type);
        break;

      case 2:
        stoneTypes = [
          Stone.Type.RUBY,
          Stone.Type.OPAL,
          Stone.Type.EMERALD,
          Stone.Type.AGATE,
          Stone.Type.TOPAZ,
          Stone.Type.AMETHYST,
          Stone.Type.GARNET,
          Stone.Type.AQUAMARINE,
          Stone.Type.SAPPHIRE,
          Stone.Type.ONYX,
          Stone.Type.DIAMOND,
          Stone.Type.JASPER,
        ];
        break;

      case 3:
        // same as case 12
        stoneTypes = [
          Stone.Type.RUBY,
          Stone.Type.EMERALD,
          Stone.Type.TOPAZ,
          Stone.Type.GARNET,
          Stone.Type.SAPPHIRE,
          Stone.Type.DIAMOND,
          Stone.Type.OPAL,
          Stone.Type.AGATE,
          Stone.Type.AMETHYST,
          Stone.Type.AQUAMARINE,
          Stone.Type.ONYX,
          Stone.Type.JASPER,
        ];
        break;

      case 4:
        stoneTypes = [
          // column 1
          Stone.Type.RUBY,
          Stone.Type.GARNET,
          Stone.Type.OPAL,
          Stone.Type.AQUAMARINE,
          // column 2
          Stone.Type.EMERALD,
          Stone.Type.SAPPHIRE,
          Stone.Type.AGATE,
          Stone.Type.ONYX,
          // column 3
          Stone.Type.TOPAZ,
          Stone.Type.DIAMOND,
          Stone.Type.AMETHYST,
          Stone.Type.JASPER,
        ];
        break;

      // NOTE: Don't bother if number of levels doesn't divide 12.
      // case 5:
      //   stoneTypes = [
      //     Stone.Type.RUBY,
      //     Stone.Type.GARNET,
      //     Stone.Type.OPAL,
      //     Stone.Type.AGATE,
      //     Stone.Type.AMETHYST,
      //     Stone.Type.EMERALD,
      //     Stone.Type.SAPPHIRE,
      //     Stone.Type.AQUAMARINE,
      //     Stone.Type.ONYX,
      //     Stone.Type.JASPER,
      //     Stone.Type.TOPAZ,
      //     Stone.Type.DIAMOND,
      //   ];
      //   break;

      case 6:
        stoneTypes = [
          Stone.Type.RUBY,
          Stone.Type.EMERALD,
          Stone.Type.TOPAZ,
          Stone.Type.OPAL,
          Stone.Type.AGATE,
          Stone.Type.AMETHYST,
          Stone.Type.GARNET,
          Stone.Type.SAPPHIRE,
          Stone.Type.DIAMOND,
          Stone.Type.AQUAMARINE,
          Stone.Type.ONYX,
          Stone.Type.JASPER,
        ];
        break;

      case 12:
        stoneTypes = [
          Stone.Type.RUBY,
          Stone.Type.EMERALD,
          Stone.Type.TOPAZ,
          Stone.Type.GARNET,
          Stone.Type.SAPPHIRE,
          Stone.Type.DIAMOND,
          Stone.Type.OPAL,
          Stone.Type.AGATE,
          Stone.Type.AMETHYST,
          Stone.Type.AQUAMARINE,
          Stone.Type.ONYX,
          Stone.Type.JASPER,
        ];
        break;

      default:
        // random order
        stoneTypes = Object.keys(Stone.Type);
        Random.shuffleArray(stoneTypes);
    }

    return stoneTypes;
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
