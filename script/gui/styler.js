/* --- IMPORTS --- */
import Random from "../library/random.js";
import { DoorStyle, CellStyle, RoomStyle, PlayerStyle } from "./style.js";

/* --- EXPORTS --- */
export { Styler as default };

/* --- CONSTANTS --- */
const DOOR_STYLE_ARGS = {
  outline: "black",
  // frontfill: "sienna",
  frontfill: null, // for random door colors
  windowfill: "white",
  handlefill: "lightgray",
};
const EXIT_DOOR_STYLE_ARGS = {
  outline: "black",
  frontfill: "goldenrod",
  windowfill: "gold",
  handlefill: "gold",
};
const CELL_STYLE_ARGS = {
  outline: "black",
  cascadeoutline: "lightgray",
  cascadeshape: "rectangle",
  mark: null,
};
const WELCOME_CELL_STYLE_ARGS = {
  outline: "black",
  cascadeoutline: "indigo",
  cascadeshape: "circle",
  mark: null,
};
const ROOM_STYLE_ARGS = { outline: "black", background: "aliceblue" };
const PLAYER_STYLE_ARGS = {
  scale: 0.5,
  outline: "black",
  fill: ["gold", "goldenrod"],
};
const RANDY_STYLE_ARGS = {
  scale: 0.5,
  outline: "black",
  fill: ["olive", "goldenrod"],
};

/*
 * CLASS: Styler
 *****************************************************************************/
const Styler = class {
  /* --- METHOD: getDoorStyle --- */
  static getDoorStyle() {
    const args = { ...DOOR_STYLE_ARGS };
    if (args.frontfill === null) {
      args.frontfill = Random.getRandomColor();
    }
    return new DoorStyle(
      args.outline,
      args.frontfill,
      args.windowfill,
      args.handlefill
    );
  }

  /* --- METHOD: getExitDoorStyle --- */
  static getExitDoorStyle() {
    const args = { ...EXIT_DOOR_STYLE_ARGS };
    return new DoorStyle(
      args.outline,
      args.frontfill,
      args.windowfill,
      args.handlefill
    );
  }

  /* --- METHOD: getCellStyle --- */
  static getCellStyle() {
    const args = { ...CELL_STYLE_ARGS };
    return new CellStyle(
      args.outline,
      args.cascadeoutline,
      args.cascadeshape,
      args.mark
    );
  }

  /* --- METHOD: getWelcomeCellStyle --- */
  static getWelcomeCellStyle() {
    const args = { ...WELCOME_CELL_STYLE_ARGS };
    return new CellStyle(
      args.outline,
      args.cascadeoutline,
      args.cascadeshape,
      args.mark
    );
  }

  /* --- METHOD: getRoomStyle --- */
  static getRoomStyle() {
    return new RoomStyle(ROOM_STYLE_ARGS.outline, ROOM_STYLE_ARGS.background);
  }

  /* --- METHOD: getPlayerStyle --- */
  static getPlayerStyle() {
    const args = { ...PLAYER_STYLE_ARGS };
    return new PlayerStyle(args.scale, args.outline, args.fill);
  }

  /* --- METHOD: getRandyStyle --- */
  static getRandyStyle() {
    const args = { ...RANDY_STYLE_ARGS };
    return new PlayerStyle(args.scale, args.outline, args.fill);
  }

  /* --- METHOD: getRandyRandomStyle --- */
  static getRandyRandomStyle() {
    const args = { ...RANDY_STYLE_ARGS };
    // args.fill = [Random.getRandomColor(), Random.getRandomColor()];
    args.fill = [Random.getRandomColor(), null];
    return new PlayerStyle(args.scale, args.outline, args.fill);
  }
};
