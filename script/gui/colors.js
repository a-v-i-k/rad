/* --- IMPORTS --- */
import Random from "../library/random.js";
import WEBCOLORS from "../library/webcolors.js";

/* --- EXPORTS --- */
export { Colors as default };

/* --- CONSTANTS --- */
const COLORS47 = [
  "red",
  "green",
  "blue",
  "yellow",
  "magenta",
  "cyan",
  "gray",
  "orange",
  "pink",
  "lime",
  "royalblue",
  "chocolate",
  "azure",
  "olive",
  "cadetblue",
  "crimson",
  "coral",
  "darkgoldenrod",
  "khaki",
  "tomato",
  "teal",
  "violet",
  "purple",
  "tan",
  "snow",
  "thistle",
  "peru",
  "rebeccapurple",
  "sienna",
  "seagreen",
  "sandybrown",
  "limegreen",
  "mediumspringgreen",
  "lightskyblue",
  "maroon",
  "darkseagreen",
  "springgreen",
  "deepskyblue",
  "wheat",
  "turquoise",
  "palegreen",
  "rosybrown",
  "saddlebrown",
  "dimgray",
  "skyblue",
  "silver",
  "black",
];

// const COLORS = COLORS47;
const COLORS = WEBCOLORS;

/*
 * CLASS: Colors
 *****************************************************************************/
const Colors = class {
  #indices;
  #curr;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#indices = [];
    for (let i = 0; i < COLORS.length; i++) {
      this.#indices.push(i);
    }
    this.#curr = 0;
  }

  /* --- getNextColor --- */
  getNextColor() {
    if (this.#curr == 0) {
      Random.shuffleArray(this.#indices);
    }
    const color = COLORS[this.#indices[this.#curr]];
    this.#curr = (this.#curr + 1) % COLORS.length;
    return color;
  }
};
