/*
 * CLASS: GraphUtils
 *****************************************************************************/
import Random from "./random.js";
import LinkedList from "./linkedlist.js";
import WQUPC from "./unionfind.js";
import Graph from "./graph.js";

const GraphUtils = class {
  /* --- GraphUtils: getRandomGraph [directed/undirected] --- */
  static getRandomGraph(n, p = 0.5, directed = false) {
    validateProbability(p);

    const G = new Graph(n); // empty graph
    if (p == 0.0) {
      return G;
    } // nothing to do

    // add random edges
    const addRandomEdge = function (u, v) {
      if (directed) {
        if (Random.getRandomUniform(0, 1) <= p) G.addDirectedEdge(u, v);
      } else {
        if (u < v && Random.getRandomUniform(0, 1) <= p) G.addEdge(u, v);
      }
    };
    G.V().forEach((u) => G.V().forEach((v) => addRandomEdge(u, v)));

    return G;
  }

  /* --- GraphUtils: getRandomTree [undirected] --- */
  static getRandomTree(n) {
    /*
     * Kruskal's Algorithm: (from Wikipedia)
     *********************************************************************
     * algorithm Kruskal(G) is
     * 	  F:= ∅
     * 		for each v ∈ G.V do
     *		  MAKE-SET(v)
     * 		for each (u, v) in G.E ordered by weight(u, v), increasing do
     * 			if FIND-SET(u) ≠ FIND-SET(v) then
     * 				F:= F ∪ {(u, v)} ∪ {(v, u)}
     * 				UNION(FIND-SET(u), FIND-SET(v))
     * 		return F
     *********************************************************************/
    const mst = new Graph(n);
    const vertices = new WQUPC(n);

    const edges = [];
    mst.V().forEach((u) =>
      mst.V().forEach((v) => {
        if (u < v) edges.push([u, v]);
      })
    );
    Random.shuffleArray(edges);

    edges.forEach((e) => {
      const u = e[0],
        v = e[1];
      if (vertices.find(u) != vertices.find(v)) {
        mst.addEdge(u, v);
        vertices.union(u, v);
      }
    });

    return mst;
  }

  /* --- GraphUtils: getRandomConnectedGraph [undirected] --- */
  static getRandomConnectedGraph(n, p = 0.5) {
    validateProbability(p);

    const G = GraphUtils.getRandomTree(n);
    if (p == 0.0) {
      return G;
    } // nothing to do

    G.V().forEach((u) =>
      G.V().forEach((v) => {
        if (u < v && !G.hasEdge(u, v) && Random.getRandomUniform(0, 1) <= p) {
          G.addEdge(u, v);
        }
      })
    );

    return G;
  }

  /* --- GraphUtils: DFS [directed/undirected] --- */
  static DFS(G, s, ondiscovery = (w, v) => {}) {
    validateGraph(G);
    G.validateVertex(s);
    if (typeof ondiscovery != "function") {
      throw TypeError(`DFS discovery callback is not a function`);
    }

    const discovered = new Set().add(s);
    ondiscovery(s, null);
    const stack = [s];
    while (stack.length > 0) {
      const v = stack.pop();
      G.neighbors(v).forEach((w) => {
        if (!discovered.has(w)) {
          discovered.add(w);
          ondiscovery(w, v); // e.g., record discoverd->parent relation
          stack.push(w);
        }
      });
    }
  }

  /* --- GraphUtils: BFS [directed/undirected] --- */
  static BFS(G, s, ondiscovery = (w, v) => {}) {
    validateGraph(G);
    G.validateVertex(s);
    if (typeof ondiscovery != "function") {
      throw TypeError(`BFS discovery callback is not a function`);
    }

    const discovered = new Set().add(s);
    ondiscovery(s, null);
    const queue = new LinkedList();
    queue.pushBack(s);
    while (!queue.isEmpty()) {
      const v = queue.popFront();
      G.neighbors(v).forEach((w) => {
        if (!discovered.has(w)) {
          discovered.add(w);
          ondiscovery(w, v);
          queue.pushBack(w);
        }
      });
    }
  }

  /* --- GraphUtils: BFSShortestPaths [directed/undirected] --- */
  static BFSShortestPaths(G, s) {
    validateGraph(G);
    G.validateVertex(s);

    const n = G.size();
    const T = new Graph(n); // shortest-paths tree (w.r.t s)
    const dists = new Array(n); // map vertext v to dist(s, v)

    // BFS discovery callback
    const ondiscovery = function (w, v) {
      if (w == s) {
        dists[s] = 0;
      } else {
        T.addEdge(w, v);
        dists[w] = dists[v] + 1;
      }
    };

    GraphUtils.BFS(G, s, ondiscovery);
    return [T, dists];
  }

  /* --- GraphUtils: ShortestPaths [directed/undirected] --- */
  static shortestPaths = function (G, s) {
    return GraphUtils.BFSShortestPaths(G, s);
  };

  /* --- GraphUtils: findFarthestVertex [directed/undirected] --- */
  static findFarthestVertex(G, s) {
    validateGraph(G);
    G.validateVertex(s);

    const dists = GraphUtils.shortestPaths(G, s)[1];
    let farthest = [s];
    G.V().forEach((u) => {
      if (dists[u] == dists[farthest[0]]) {
        farthest.push(u);
      } else if (dists[u] > dists[farthest[0]]) {
        farthest = [u];
      }
    });
    return [farthest, dists[farthest[0]]];
  }

  /* --- GraphUtils: findGraphDiameterEndpoints [directed/undirected] --- */
  static findGraphDiameterEndpoints(G) {
    validateGraph(G);

    const V = G.V();
    Random.shuffleArray(V);
    let diameter = null;
    let endpoints = undefined;
    V.forEach((w) => {
      const farthestInfo = GraphUtils.findFarthestVertex(G, w); // BFS
      const u = farthestInfo[0][0];
      const dist = farthestInfo[1];
      if (dist == diameter) {
        endpoints.push([w, u]);
      } else if (dist > diameter) {
        diameter = dist;
        endpoints = [[w, u]];
      }
    });
    return [Random.getRandomChoice(endpoints), diameter];
  }

  /* --- GraphUtils: findTreeDiameterEndpoints [directed/undirected] --- */
  static findTreeDiameterEndpoints(T) {
    validateGraph(T);

    // with two BFSs
    const w = Random.getRandomInteger(0, T.size());
    let farthestInfo = GraphUtils.findFarthestVertex(T, w); // BFS 1
    const u = Random.getRandomChoice(farthestInfo[0]);

    farthestInfo = GraphUtils.findFarthestVertex(T, u); // BFS 2
    const v = Random.getRandomChoice(farthestInfo[0]);
    const dist = farthestInfo[1];
    return [[u, v], dist];
  }

  /* --- GraphUtils: randomWalk --- */
  static randomWalk(G, s, t) {
    validateGraph(G);
    G.validateVertex(s);
    G.validateVertex(t);

    let w = s;
    let numSteps = 0;
    while (w != t) {
      numSteps++;
      // choose a neighbor uniformly at random
      w = Random.getRandomChoice(G.neighbors(w));
    }
    return numSteps;
  }
};

export default GraphUtils;

/*
 * AUXILIARY
 *****************************************************************************/

/* --- validateProbability --- */
const validateProbability = function (p) {
  if (typeof p != "number" || p < 0.0 || p > 1.0) {
    const message = `probability should be a float value in the range [0, 1]`;
    throw TypeError(message);
  }
};

/* --- validateGraph --- */
const validateGraph = function (G) {
  if (!(G instanceof Graph)) {
    const message = `input ${JSON.stringify(obj)} is not a Graph object`;
    throw TypeError(message);
  }
};
