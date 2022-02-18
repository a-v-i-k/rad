/* --- IMPORTS --- */
// import Graph from "../library/graph.js";
import Topology from "./topology.js";
import Door, { ExitDoor } from "./door.js";
import Room from "./room.js";
import Player from "./player.js";
import { ETypeError, RuntimeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Network as default };

/* --- ENUM: NetworkState --- */
const NetworkState = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
};
Object.freeze(NetworkState);

/*
 * CLASS: Network [UML]
 *****************************************************************************/
const Network = class {
  #state;
  #rooms;
  #entryRoom;
  #exitRoom;
  #visitors;

  /* --- INNER: State --- */
  static State = NetworkState;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#setState(Network.State.DISABLED);
    this.#rooms = null; // network rooms
    this.#visitors = null; // visitor registry
  }

  /* --- METHOD: getState --- */
  getState() {
    return this.#state;
  }

  /* --- METHOD: getVisitors --- */
  getVisitors() {
    return Object.keys(this.#visitors);
  }

  /* --- METHOD: build --- */
  build(topology, rows, columns) {
    this.#validateState(Network.State.DISABLED);

    // argument validation
    if (!(topology instanceof Topology)) {
      throw new ETypeError(`input is not of type Topology`, topology);
    }
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

    // create rooms
    this.#rooms = {};
    topology.graph.V().forEach((u) => {
      this.#rooms[u] = new Room(rows, columns);
    });

    // add doors to rooms
    topology.graph.V().forEach((u) => {
      if (u !== topology.exit) {
        // no doors in exit room
        topology.graph.neighbors(u).forEach((v) => {
          let DoorType;
          if (v === topology.exit) {
            DoorType = ExitDoor;
          } else {
            DoorType = Door;
          }
          const door = new DoorType(this.#rooms[v]);
          this.#rooms[u].addDoor(door);
        });
      }
    });

    // entry and exit rooms
    this.#entryRoom = this.#rooms[topology.entry];
    this.#exitRoom = this.#rooms[topology.exit];

    // initialize visitors
    this.#visitors = {};

    this.#setState(Network.State.ACTIVE); // activate network
  }

  /* --- METHOD: register --- */
  register(visitor) {
    this.#validateState(Network.State.ACTIVE);
    if (!(visitor instanceof Player)) {
      throw new ETypeError(`input is not of type Player`, visitor);
    }
    if (this.registered(visitor)) {
      throw new RuntimeError(`visitor is alrady registered`);
    }

    this.#visitors[visitor.getId()] = visitor; // register visitor
    visitor.enter(this.#entryRoom); // let visitor in
  }

  /* --- METHOD: registered --- */
  registered(visitor) {
    this.#validateState(Network.State.ACTIVE);
    if (!(visitor instanceof Player)) {
      throw new ETypeError(`input is not of type Player`, visitor);
    }
    return visitor.getId() in this.#visitors;
  }

  /* --- METHOD: deregister --- */
  deregister(visitor) {
    this.#validateState(Network.State.ACTIVE);
    if (!(visitor instanceof Player)) {
      throw new ETypeError(`input is not of type Player`, visitor);
    }
    if (!this.registered(visitor)) {
      throw new RuntimeError(`visitor is not registered`);
    }

    visitor.exit(); // let visitor out
    delete this.#visitors[visitor.getId()]; // unregister visitor
  }

  /* --- METHOD: finished --- */
  finished(visitor) {
    console.assert(this.getState() === Network.State.ACTIVE);
    console.assert(visitor instanceof Player);
    return visitor.getPosition().room === this.#exitRoom;
  }

  /* --- METHOD: destroy --- */
  destroy() {
    this.#validateState(Network.State.ACTIVE);

    this.#setState(Network.State.DISABLED); // disable network

    this.#visitors = null;

    // clear rooms (door detachments prevent circular references)
    for (const id in this.#rooms) {
      this.#rooms[id].clear();
    }
    this.#rooms = null;
  }

  /* --- METHOD: #setState --- */
  #setState(state) {
    console.assert(state in Network.State); // sanity check
    this.#state = state;
  }

  /* --- METHOD: #validateState --- */
  #validateState(expected) {
    console.assert(expected in Network.State); // sanity check
    const state = this.getState();
    if (state !== expected) {
      throw new StateError(`network state is not ${expected}`, state);
    }
  }
};
