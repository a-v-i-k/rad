/*
 * CLASS: Graph
 *****************************************************************************/
const Graph = class {
  // TODO: Use private members.
  // #n;
  // #adjlist;

  // TODO: Vertex class? Edge class?

  /* --- Graph: constructor --- */
  constructor(n) {
    // if (!Number.isInteger(n) || n <= 0) {
    //   throw TypeError(`number of vertices should be a positive integer`);
    if (!Number.isInteger(n) || n < 0) {
      throw TypeError(`number of vertices should be a nonnegative integer`);
    }
    this.n = n;
    this.adjlist = {};
  }

  /* --- Graph: hasEdge --- */
  hasEdge(u, v) {
    this.validateVertex(u);
    this.validateVertex(v);
    return u in this.adjlist && this.adjlist[u].has(v);
  }

  /* --- Graph: addDirectedEdge --- */
  addDirectedEdge(u, v) {
    if (this.hasEdge(u, v)) {
      throw new GraphValueError(`edge (${u},${v}) already exists`);
    }
    if (!(u in this.adjlist)) {
      this.adjlist[u] = new Set();
    }
    this.adjlist[u].add(v);
  }

  /* --- Graph: removeDirectedEdge --- */
  removeDirectedEdge(u, v) {
    if (!this.hasEdge(u, v)) {
      throw new GraphValueError(`edge (${u},${v}) doesn't exist`);
    }
    this.adjlist[u].delete(v);
  }

  /* --- Graph: addEdge --- */
  addEdge(u, v) {
    this.addDirectedEdge(u, v);
    this.addDirectedEdge(v, u);
  }

  /* --- Graph: removeEdge --- */
  removeEdge(u, v) {
    this.removeDirectedEdge(u, v);
    this.removeDirectedEdge(v, u);
  }

  /* --- Graph: size --- */
  size() {
    return this.n;
  }

  /* --- Graph: neighbors --- */
  neighbors(u) {
    this.validateVertex(u);
    return u in this.adjlist ? Array.from(this.adjlist[u]) : [];
  }

  /* --- Graph: V --- */
  V() {
    const vertices = [];
    for (let i = 0; i < this.size(); i++) {
      vertices.push(i);
    }
    return vertices;
  }

  /* --- Graph: E --- */
  E() {
    const edges = [];
    this.adjlist.forEach((u) => edges.concat(Object.keys(this.adjlist[u])));
    return edges;
  }

  /* --- Graph: validateVertex --- */
  validateVertex(obj) {
    if (!Number.isInteger(obj) || obj < 0 || obj > this.size()) {
      const message = `object ${JSON.stringify(obj)} is not a valid vertex`;
      throw TypeError(message);
    }
  }
};

/* --- Graph: toString --- */
Graph.prototype.toString = function graphToString() {
  const stringBuilder = [];
  stringBuilder.push(`[`);
  this.V().forEach((u) => {
    stringBuilder.push(`${u}: {`);
    if (this.adjlist[u].size > 0) {
      this.adjlist[u].forEach((v) => {
        stringBuilder.push(`${v}`);
        stringBuilder.push(`, `);
      });
      stringBuilder.pop(); // to remove the last ", "
    }
    stringBuilder.push(`}`);
    stringBuilder.push(`, `);
  });
  stringBuilder.pop(); // to remove the last ", "
  stringBuilder.push(`]`);

  return stringBuilder.join("");
};

export default Graph;

/*
 * EXCEPTIONS
 *****************************************************************************/

/* --- GraphValueError --- */
const GraphValueError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "GraphValueError";
  }
};
