/* --- IMPORTS --- */
import Graph from "../library/graph.js";
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Topology as default };

/*
 * CLASS: Topology [UML]
 *****************************************************************************/
const Topology = class {
  /* --- C'TOR: constructor --- */
  constructor(graph, entry, exit) {
    Topology.#validator(graph, entry, exit);
    this.graph = graph;
    this.entry = entry;
    this.exit = exit;
  }

  /* --- METHOD: #validator --- */
  static #validator(graph, entry, exit) {
    if (!(graph instanceof Graph)) {
      throw new ETypeError(`input is not of type Graph`, graph);
    }

    if (!Number.isInteger(entry)) {
      throw new ETypeError(`input is not an integer`, entry);
    }
    if (entry < 0 || entry >= graph.size()) {
      throw new ERangeError(
        `input is not in the range [${0}, ${graph.size() - 1}]`,
        entry
      );
    }

    if (!Number.isInteger(exit)) {
      throw new ETypeError(`input is not an integer`, exit);
    }
    if (exit < 0 || exit >= graph.size()) {
      throw new ERangeError(
        `input is not in the range [${0}, ${graph.size() - 1}]`,
        exit
      );
    }
  }
};
