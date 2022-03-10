/* --- IMPORTS --- */
import Location from "../game/location.js";
import Door from "../game/door.js";
import Stone from "../game/stone.js";
import Game from "../game/game.js";
import BoundingBox from "./bounding-box.js";
import Polyline from "./polyline.js";
import Drawer from "./drawer.js";
import Random from "../library/random.js";
import Colors from "./colors.js";
import QUOTES from "../library/quotes.js";
import { ETypeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Displayer as default };

/* --- ENUM: DisplayerStatus --- */
const DisplayerStatus = {
  NONE: "NONE",
  IDLE: "IDLE",
  PLAY: "PLAY",
  PAUSE: "PAUSE",
  QUOTE: "QUOTE",
  ANNOUNCEMENT: "ANNOUNCEMENT",
};
Object.freeze(DisplayerStatus);

/* --- CONSTANTS --- */
const DOOR_SHAPES = true;

// const IDLE_BG = "powderblue";
const DEFAULT_CANVAS_BG = "#f0f0f0";
const PAUSE_FILL_STYLE = "red";
const PAUSE_FONT_PX_PER_CELL = 9;
const QUOTE_PADDING = 10;
const QUOTE_FONT_PR_PER_CELL = 24;
const ANNOUNCEMENT_BG = "honeydew";
const ANNOUNCEMENT_FILL_STYLE = "indigo";
const ANNOUNCEMENT_FONT_PX_PER_CELL = 7;

const ROOM_OUTLINE = "black";
const ROOM_BACKGROUND = "#f0f0f0"; //"aliceblue";

const CELL_OUTLINE = "black";
const CELL_CASCADE_OUTLINE = "lightgray";
const CELL_CASCADE_SHAPE = "rectangle";
const WELCOME_CELL_CASCADE_OUTLINE = "indigo";
const WELCOME_CELL_CASCADE_SHAPE = "circle";

const DOOR_OUTLINE = "black";
const DOOR_WINDOW_FILL = "white";
const DOOR_HANDLE_FILL = "silver";
const EXIT_DOOR_FRONT_FILL = "goldenrod";
const EXIT_DOOR_WINDOW_FILL = "gold";
const EXIT_DOOR_HANDLE_FILL = "gold";

const PLAYER_SCALE = 0.5;
const PLAYER_OUTLINE = "black";
const PLAYER_FILL = ["gold", "goldenrod"];
const RANDY_FILL = ["olive", "goldenrod"];

const STONE_OUTLINE = "goldenrod";
const STONE_ALPHA = 0.7;
const STONE_RUBY_COLOR = `hsla(337, 86%, 47%, ${STONE_ALPHA})`;
const STONE_EMERALD_COLOR = `hsla(140, 52%, 55%, ${STONE_ALPHA})`;
const STONE_TOPAZ_COLOR = `hsla(35, 100%, 74%, ${STONE_ALPHA})`;
const STONE_GARNET_COLOR = `hsla(1, 37%, 33%, ${STONE_ALPHA})`;
const STONE_SAPPHIRE_COLOR = `hsla(216, 85%, 39%, ${STONE_ALPHA})`;
const STONE_DIAMOND_COLOR = `hsla(191, 100%, 86%, ${STONE_ALPHA})`;
const STONE_OPAL_COLOR = `hsla(164, 18%, 71%, ${STONE_ALPHA})`;
const STONE_AGATE_COLOR = `hsla(37, 11%, 77%, ${STONE_ALPHA})`;
const STONE_AMETHYST_COLOR = `hsla(270, 50%, 60%, ${STONE_ALPHA})`;
const STONE_AQUAMARINE_COLOR = `hsla(160, 100%, 75%, ${STONE_ALPHA})`;
const STONE_ONYX_COLOR = `hsla(195, 4%, 22%, ${STONE_ALPHA})`;
const STONE_JASPER_COLOR = `hsla(359, 66%, 54%, ${STONE_ALPHA})`;

/*
 * CLASS: Displayer [UML]
 *****************************************************************************/
// TODO: Split into smaller classes.
const Displayer = class {
  #status;
  #displayFrame;
  #game;
  #cellwidth;
  #cellheight;
  #width;
  #height;
  #html;
  #drawer;
  #colors;

  /* --- INNER: Status --- */
  static Status = DisplayerStatus;

  /* --- C'TOR: constructor --- */
  constructor(displayFrame, game, cellwidth, cellheight) {
    Displayer.#validator(displayFrame, game, cellwidth, cellheight);
    this.#displayFrame = displayFrame;
    this.#game = game;

    this.#cellwidth = cellwidth;
    this.#cellheight = cellheight;
    const dims = this.#game.getDimensions();
    this.#width = dims[1] * this.#cellwidth;
    this.#height = dims[0] * this.#cellheight;

    this.#createHTMLElements();

    this.#drawer = new Drawer(this.#HTML().canvas, DEFAULT_CANVAS_BG);
    this.#colors = {
      plain: { map: {}, gen: new Colors() },
      arched: { map: {}, gen: new Colors() },
      round: { map: {}, gen: new Colors() },
      twowindow: { map: {}, gen: new Colors() },
      randys: { map: {}, gen: new Colors() },
    };

    this.#setStatus(Displayer.Status.NONE);
  }

  /* --- METHOD: #validator --- */
  static #validator(dispFrame, game, cellwidth, cellheight) {
    if (!(dispFrame instanceof HTMLElement) || dispFrame.tagName !== "DIV") {
      throw new ETypeError(
        `display frame is not an HTML div element`,
        dispFrame
      );
    }

    if (!(game instanceof Game)) {
      throw new ETypeError(`input is not of type Game`, game);
    }

    if (!Number.isInteger(cellwidth)) {
      throw new ETypeError(`input is not an integer`, cellwidth);
    }
    if (cellwidth < 0) {
      throw new ERangeError(`input is negative`, cellwidth);
    }
    if (!Number.isInteger(cellheight)) {
      throw new ETypeError(`input is not an integer`, cellheight);
    }
    if (cellheight < 0) {
      throw new ERangeError(`input is negative`, cellheight);
    }
  }

  /// GETTERS

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in Displayer.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: getWidth --- */
  getWidth() {
    return this.#width;
  }

  /* --- METHOD: getHeight --- */
  getHeight() {
    return this.#height;
  }

  /* --- METHOD: #HTML --- */
  #HTML() {
    return this.#html;
  }

  /// HTML ELEMENTS CREATION

  /* --- METHOD: #createHTMLElements --- */
  #createHTMLElements() {
    this.#html = {
      loading: document.querySelector("#loading"), // no need to create this one
      idle: this.#createIdleElement(),
      quote: this.#createQuoteElement(),
      canvas: this.#createCanvasElement(),
    };
  }

  /* --- METHOD: #createIdleElement --- */
  #createIdleElement() {
    return this.#createLogoElement();
  }

  /* --- METHOD: #createLogoElement --- */
  #createLogoElement() {
    const logo = document.createElement("div");
    logo.setAttribute("id", "stones-logo");
    logo.classList.add("stones-grid");
    logo.setAttribute("title", "Priestly Breastplate");
    logo.classList.add("widget", "logo");

    logo.innerHTML = `
          <div id="ruby" class="stone" title="Ruby"></div>
          <div id="emerald" class="stone" title="Emerald"></div>
          <div id="topaz" class="stone" title="Topaz"></div>
          <div id="garnet" class="stone" title="Garnet"></div>
          <div id="sapphire" class="stone" title="Sapphire"></div>
          <div id="diamond" class="stone" title="Diamond"></div>
          <div id="opal" class="stone" title="Opal"></div>
          <div id="agate" class="stone" title="Agate"></div>
          <div id="amethyst" class="stone" title="Amethyst"></div>
          <div id="aquamarine" class="stone" title="Aquamarine"></div>
          <div id="onyx" class="stone" title="Onyx"></div>
          <div id="jasper" class="stone" title="Jasper"></div>
    `;
    const width = this.getWidth();
    const height = this.getHeight();
    logo.style.width = width.toString() + "px";
    logo.style.height = height.toString() + "px";

    return logo;
  }

  #createCanvasElement() {
    // create canvas element
    const canvas = document.createElement("canvas");
    canvas.setAttribute("id", "display-canvas");
    canvas.classList.add("widget", "canvas");

    // canvas width & height
    canvas.width = this.getWidth();
    canvas.height = this.getHeight();

    return canvas;
  }

  /* --- METHOD: #createQuoteElement --- */
  #createQuoteElement() {
    const quote = document.createElement("div"); // quote element
    quote.setAttribute("id", "quote");
    quote.innerHTML = `<q></q>`;
    quote.style.padding = QUOTE_PADDING.toString() + "px";
    quote.style.textAlign = "center";
    return quote;
  }

  /// IDLE

  /* --- METHOD: displayIdle --- */
  displayIdle() {
    const status = this.getStatus();
    console.assert(status !== Displayer.Status.IDLE); // sanity check

    // // display big exit door
    // this.#HTML().idle = this.#HTML().canvas;
    // this.#setBackground(ROOM_BACKGROUND);
    // this.#clearDisplay();
    // const width = this.getWidth(),
    //   height = this.getHeight();
    // const bbox = new BoundingBox(0, 0, width, height);
    // this.#drawCell(
    //   bbox,
    //   CELL_OUTLINE,
    //   CELL_CASCADE_OUTLINE,
    //   CELL_CASCADE_SHAPE
    // );
    // this.#drawExitDoor(
    //   bbox,
    //   DOOR_OUTLINE,
    //   EXIT_DOOR_FRONT_FILL,
    //   EXIT_DOOR_WINDOW_FILL,
    //   EXIT_DOOR_HANDLE_FILL
    // );

    let child = this.#HTML().canvas;
    if (status === Displayer.Status.NONE) {
      child = this.#HTML().loading;
    } else if (status === Displayer.Status.QUOTE) {
      child = this.#HTML().quote;
    }
    this.#displayFrame.replaceChild(this.#HTML().idle, child);

    this.#setStatus(Displayer.Status.IDLE);
  }

  /* --- METHOD: #clearIdle --- */
  #clearIdle() {
    const idleElem = this.#HTML().idle;
    this.#displayFrame.replaceChild(this.#HTML().canvas, idleElem);
  }

  /// PLAYING

  /* --- METHOD: displayPlay --- */
  displayPlay(stones) {
    if (typeof stones !== "boolean") {
      throw new ETypeError(`input is not a boolean`, stones);
    }
    if (this.getStatus() === Displayer.Status.IDLE) {
      this.#clearIdle();
    } else if (this.getStatus() === Displayer.Status.QUOTE) {
      this.#clearQuote();
    }
    this.#clearDisplay();

    // display everything from the perspective of the primary player (index 0),
    // and give it priority over randys (front display)
    this.#displayRoom(); // room
    this.#displayCells(); // cells
    this.#displayDoors(); // doors
    if (stones) this.#displayStones(); // stones
    this.#displayRandys(); // randys
    this.#displayPrimaryPlayer(); // primary player

    this.#setStatus(Displayer.Status.PLAY);
  }

  /* --- METHOD: displayPause --- */
  displayPause() {
    console.assert(this.getStatus() === Displayer.Status.PLAY); // sanity check

    const dims = this.#game.getDimensions();
    const fontSize = Math.min(dims[0], dims[1]) * PAUSE_FONT_PX_PER_CELL;
    this.#drawer.injectText(
      "Pause",
      this.getWidth() / 2,
      this.getHeight() / 2 + 15,
      PAUSE_FILL_STYLE,
      fontSize
    );

    this.#setStatus(Displayer.Status.PAUSE);
  }

  /// QUOTE

  /* --- METHOD: #getRandomQuote --- */
  // TODO: Move to Random class?
  static #getRandomQuote = () => Random.getRandomChoice(QUOTES);

  /* --- METHOD: displayRandomQuote --- */
  // TODO: Use a proper HTML <blockquote> element?
  displayRandomQuote() {
    const status = this.getStatus();
    console.assert(
      status === Displayer.Status.PLAY || status === Displayer.Status.QUOTE
    ); // sanity check

    let randQuote = Displayer.#getRandomQuote();
    let author = randQuote[0],
      text = randQuote[1];

    // EM DASH: U+2014 —
    // HORIZONTAL BAR: U+2015 ―
    author = "\u2015 " + author;

    // text = '"' + text + '"' ;
    // LEFT DOUBLE QUOTATION MARK: U+201C “
    // RIGHT DOUBLE QUOTATION MARK: U+201D ”
    // text = "\u201c" + text + "\u201d";

    // let quote = `${text} <br> <center> ${author} </center>`;
    const quote = this.#HTML().quote;
    quote.innerHTML = `<p> <q>${text}</q> <br> <center>${author}<center> </p>`;
    if (status !== Displayer.Status.QUOTE) {
      this.#displayFrame.replaceChild(quote, this.#HTML().canvas);
    }

    // width and height of the qoute element
    const width = this.getWidth() - 2 * QUOTE_PADDING;
    const height = this.getHeight() - 2 * QUOTE_PADDING;
    quote.style.width = width.toString() + "px";
    quote.style.height = height.toString() + "px";

    // fonrt size of the qoute element
    const dims = this.#game.getDimensions();
    const fontSize = Math.min(dims[0], dims[1]) * QUOTE_FONT_PR_PER_CELL;
    quote.style.fontSize = fontSize.toString() + "%";

    this.#setStatus(Displayer.Status.QUOTE);
  }

  /* --- METHOD: #clearQuote --- */
  #clearQuote() {
    const quote = this.#HTML().quote;
    quote.querySelector("p").innerHTML = ``;
    this.#displayFrame.replaceChild(this.#HTML().canvas, quote);
  }

  /// ANNOUNCEMNT

  /* --- METHOD: announce --- */
  announce(message) {
    console.assert(this.getStatus() === Displayer.Status.PLAY); // sanity check

    this.#setBackground(ANNOUNCEMENT_BG);
    this.#clearDisplay();

    const dims = this.#game.getDimensions();
    const fontSize = Math.min(dims[0], dims[1]) * ANNOUNCEMENT_FONT_PX_PER_CELL;
    this.#drawer.injectText(
      message,
      this.getWidth() / 2,
      this.getHeight() / 2,
      ANNOUNCEMENT_FILL_STYLE,
      fontSize
    );

    this.#setStatus(Displayer.Status.ANNOUNCEMENT);
  }

  /// CANVAS

  /* --- METHOD: #setBackground --- */
  #setBackground(color) {
    this.#drawer.setBackground(color);
  }

  /* --- METHOD: #clearDisplay --- */
  #clearDisplay() {
    this.#drawer.clearDisplay();
  }

  /* --- METHOD: #getRoomColor --- */
  #getRoomColor(id, slaveType) {
    switch (slaveType) {
      case "plain":
      case "arched":
      case "round":
      case "twowindow":
        break;
      default:
        console.assert(false); // sanity check
    }
    const colmap = this.#colors[slaveType].map;
    if (!(id in this.#colors[slaveType].map)) {
      // colmap[id] = Random.getRandomColor();
      colmap[id] = this.#colors[slaveType].gen.getNextColor();
    }
    return colmap[id];
  }

  /* --- METHOD: #getRandyFill --- */
  #getRandyFill(id) {
    const colmap = this.#colors.randys.map;
    if (!(id in colmap)) {
      if (this.#game.getNumPlayers() > 2) {
        // colmap[id] = [Random.getRandomColor(), null];
        colmap[id] = [this.#colors.randys.gen.getNextColor(), null];
      } else {
        colmap[id] = RANDY_FILL;
      }
    }
    return colmap[id];
  }

  /* --- METHOD: #displayRoomBackground --- */
  #displayRoom() {
    const state = this.#game.getState(0);

    // room bounding box
    const canvasWidth = this.getWidth(),
      canvasHeight = this.getHeight();
    const bbox = new BoundingBox(0, 0, canvasWidth, canvasHeight);

    // display room
    this.#drawer.drawRectangle(bbox, ROOM_OUTLINE, ROOM_BACKGROUND);
  }

  /* --- METHOD: #displayCells --- */
  #displayCells() {
    const state = this.#game.getState(0);

    // display cells
    for (let x = 0; x < state.room.dims[1]; x++) {
      for (let y = 0; y < state.room.dims[0]; y++) {
        // cell bounding box
        const x0 = x * this.#cellwidth,
          y0 = y * this.#cellheight;
        const bbox = new BoundingBox(x0, y0, this.#cellwidth, this.#cellheight);

        // display cell
        const loc = new Location(x, y);
        if (loc.isEqualTo(state.room.wloc)) {
          // welcome cell
          this.#drawCell(
            bbox,
            CELL_OUTLINE,
            WELCOME_CELL_CASCADE_OUTLINE,
            WELCOME_CELL_CASCADE_SHAPE
          );
        } else {
          // plain cell
          this.#drawCell(
            bbox,
            CELL_OUTLINE,
            CELL_CASCADE_OUTLINE,
            CELL_CASCADE_SHAPE
          );
        }
      }
    }
  }

  /* --- METHOD: #drawCell --- */
  #drawCell(bbox, outline, cascadeOutline, cascadeShape) {
    // draw cell outline
    this.#drawer.drawRectangle(bbox, outline);

    // draw cascading appearance
    const low = 2,
      high = Math.round(Math.min(bbox.width, bbox.height) / 2) - 1;
    for (let i = low; i <= high; i += 4) {
      const cx0 = bbox.x0 + i,
        cy0 = bbox.y0 + i,
        cwidth = bbox.width - 2 * i,
        cheight = bbox.height - 2 * i;
      const cbbox = new BoundingBox(cx0, cy0, cwidth, cheight);
      if (cascadeShape === "rectangle") {
        this.#drawer.drawRectangle(cbbox, cascadeOutline);
      } else if (cascadeShape === "circle") {
        this.#drawer.drawCircle(cbbox, cascadeOutline);
      } else {
        console.assert(false); // sanity check
      }
    }
  }

  /* --- METHOD: #displayDoors --- */
  #displayDoors() {
    const state = this.#game.getState(0);

    // display doors
    for (const door of state.doors) {
      // door bounding box
      const x0 = door.loc.x * this.#cellwidth,
        y0 = door.loc.y * this.#cellheight;
      const bbox = new BoundingBox(x0, y0, this.#cellwidth, this.#cellheight);

      // display door
      if (door.type === Door.Type.EXIT) {
        // exit door
        if (state.stonesRequired) {
          this.#drawExitDoor(bbox, DOOR_OUTLINE, "black", "black", "black");
        } else {
          this.#drawExitDoor(
            bbox,
            DOOR_OUTLINE,
            EXIT_DOOR_FRONT_FILL,
            EXIT_DOOR_WINDOW_FILL,
            EXIT_DOOR_HANDLE_FILL
          );
        }
      } else {
        const outline = DOOR_OUTLINE;
        const windowFill = DOOR_WINDOW_FILL;
        const handleFill = DOOR_HANDLE_FILL;

        if (!DOOR_SHAPES || door.level == 1) {
          // door assumes its owner's color (front fill)
          const frontFill = this.#getRoomColor(door.ownerId, "plain");
          this.#drawPlainDoor(bbox, outline, frontFill, windowFill, handleFill);
        } else if (door.level == 2) {
          const frontFill = this.#getRoomColor(door.ownerId, "arched");
          this.#drawArchedDoor(
            bbox,
            outline,
            frontFill,
            windowFill,
            handleFill
          );
        } else if (door.level == 3) {
          const frontFill = this.#getRoomColor(door.ownerId, "round");
          this.#drawRoundDoor(bbox, outline, frontFill, windowFill, handleFill);
        } else {
          // door.level > 3
          const frontFill = this.#getRoomColor(door.ownerId, "twowindow");
          this.#drawTwoWindowDoor(
            bbox,
            outline,
            frontFill,
            windowFill,
            handleFill
          );
        }
      }
    }
  }

  /* --- METHOD: #drawExitDoor --- */
  #drawExitDoor(bbox, outline, frontFill, windowFill, handleFill) {
    if (DOOR_SHAPES) {
      this.#drawFancyDoor(bbox, outline, frontFill, windowFill, handleFill);
    } else {
      this.#drawPlainDoor(bbox, outline, frontFill, windowFill, handleFill);
    }
  }

  /* --- METHOD: #drawPlainDoor --- */
  #drawPlainDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // display front
    let x0 = bbox.x0 + Math.round(bbox.width / 5);
    let y0 = bbox.y0 + Math.round(bbox.height / 15);
    let width = bbox.width - 2 * Math.round(bbox.width / 5);
    let height = bbox.height - 2 * Math.round(bbox.height / 15);
    const frontBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(frontBBox, outline, frontFill, 2);

    // display window
    x0 += Math.round(bbox.width / 12);
    y0 += Math.round(bbox.height / 12);
    width -= 2 * Math.round(bbox.width / 12);
    height = Math.round(bbox.height / 3);
    const windowBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(windowBBox, outline, windowFill, 2);

    // display handle
    // x0 doesn't change
    width = Math.round(bbox.width / 7);
    y0 += Math.round(bbox.height / 3) + Math.round(bbox.height / 12);
    height = Math.round(bbox.height / 7);
    const handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /* --- METHOD: #drawArchedDoor --- */
  #drawArchedDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // display front
    let x0 = bbox.x0 + Math.round(bbox.width / 5);
    let y0 = bbox.y0 + Math.round(bbox.height / 15);
    let width = bbox.width - 2 * Math.round(bbox.width / 5);
    let height = bbox.height - 2 * Math.round(bbox.height / 15);
    let polyline = new Polyline();
    let delta = 1;
    for (let i = 10; i < bbox.width - 9; i++) {
      const d = (i * delta) / bbox.width;
      const x = Math.round(d * bbox.width);
      const y =
        Math.round(bbox.width * Math.abs(Math.pow(2.5 * (d - 0.5), 3))) + 8;
      polyline.addPoint(bbox.x0 + x, bbox.y0 + y);
    }
    this.#drawer.drawPolygon(polyline, outline, frontFill, 4);

    // display window
    polyline = new Polyline();
    for (let i = 23; i < bbox.width - 22; i++) {
      const d = (i * delta) / bbox.width;
      const x = Math.round(d * bbox.width);
      const y =
        Math.round(bbox.width * Math.abs(Math.pow(3.5 * (d - 0.5), 3))) + 15;
      polyline.addPoint(bbox.x0 + x, bbox.y0 + y);
    }
    this.#drawer.drawPolygon(polyline, outline, windowFill, 4);

    // display handle
    x0 += 5;
    width = Math.round(bbox.width / 7);
    y0 += 8 + Math.round(bbox.height / 3) + Math.round(bbox.height / 12);
    height = Math.round(bbox.height / 7);
    const handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /* --- METHOD: #drawRoundDoor --- */
  #drawRoundDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // display front
    let x0 = bbox.x0 + Math.round(bbox.width / 15);
    let y0 = bbox.y0 + Math.round(bbox.height / 15);
    let width = bbox.width - 2 * Math.round(bbox.width / 15);
    let height = bbox.height - 2 * Math.round(bbox.height / 15);
    const frontBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(frontBBox, outline, frontFill, 2);

    // display window
    x0 = bbox.x0 + Math.round(bbox.width * (4 / 15));
    y0 = bbox.y0 + Math.round(bbox.height * (4 / 15)) - 10;
    width = Math.round(bbox.width / 2.2);
    height = Math.round(bbox.height / 2.2);
    const windowBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(windowBBox, outline, windowFill, 2);

    // display handle
    x0 = bbox.x0 + Math.round(bbox.width / 5);
    width = Math.round(bbox.width / 7);
    y0 = bbox.y0 + Math.round(bbox.width * (4 / 7));
    height = Math.round(bbox.height / 7);
    const handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /* --- METHOD: #drawTwoWindowDoor --- */
  #drawTwoWindowDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // display front
    let x0 = bbox.x0 + Math.round(bbox.width * (1 / 8));
    let y0 = bbox.y0 + Math.round(bbox.height * (1 / 8));
    let width = bbox.width - 2 * Math.round(bbox.width * (1 / 8)) + 1;
    let height = bbox.height - 2 * Math.round(bbox.height * (1 / 8));
    let frontBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(frontBBox, outline, frontFill, 2);

    // display gap between doors
    const point1 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height * (1 / 8)),
    ];
    const point2 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + bbox.height - 1 - Math.round(bbox.height * (1 / 8)),
    ];
    this.#drawer.drawLine(point1, point2, outline, 2);

    // display windows
    x0 = bbox.x0 + Math.round((3 / 16) * bbox.width);
    y0 = bbox.y0 + Math.round((1 / 4) * bbox.height);
    width = Math.round(bbox.width / 4);
    height = Math.round(bbox.height / 3);
    let windowBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(windowBBox, outline, windowFill, 2);
    // only x0 changes in the second window
    x0 += Math.round(bbox.width * (3 / 8)) + 1;
    windowBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(windowBBox, outline, windowFill, 2);

    // display handles
    x0 = bbox.x0 + Math.round(bbox.width * (1 / 4));
    width = Math.round(bbox.width / 10);
    y0 = bbox.y0 + Math.round(bbox.width * (5 / 8));
    height = Math.round(bbox.height / 8);
    let handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
    // only x0 changes in the second handle
    x0 += Math.round(bbox.width * (3 / 8)) + 2;
    handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /* --- METHOD: #drawFancyDoor --- */
  #drawFancyDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // display front
    const polyline = new Polyline();
    polyline.addPoint(
      bbox.x0 + Math.round(bbox.width / 6),
      bbox.y0 + bbox.height - 1 - Math.round(bbox.height / 10)
    );
    polyline.addPoint(
      bbox.x0 + Math.round(bbox.width / 4),
      bbox.y0 + Math.round(bbox.height / 4)
    );
    polyline.addPoint(
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height / 8)
    );
    polyline.addPoint(
      bbox.x0 + bbox.width - Math.round(bbox.width / 4),
      bbox.y0 + Math.round(bbox.height / 4)
    );
    polyline.addPoint(
      bbox.x0 + bbox.width - 1 - Math.round(bbox.width / 6),
      bbox.y0 + bbox.height - 1 - Math.round(bbox.height / 10)
    );
    this.#drawer.drawPolygon(polyline, outline, frontFill, 4);

    // display gap between doors
    const point1 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height / 8),
    ];
    const point2 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + bbox.height - 1 - Math.round(bbox.height / 10),
    ];
    this.#drawer.drawLine(point1, point2, outline, 2);

    // display windows
    let x0 = bbox.x0 + Math.round((5 / 16) * bbox.width);
    let y0 = bbox.y0 + Math.round((5 / 16) * bbox.height);
    let width = Math.round(bbox.width / 8);
    let height = Math.round(bbox.height / 4);
    let windowBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(windowBBox, outline, windowFill, 2);
    // only x0 changes in the second window
    x0 += Math.round(bbox.width / 4) + 1;
    windowBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(windowBBox, outline, windowFill, 2);

    // display handles
    x0 = bbox.x0 + Math.round(bbox.width * (5 / 16));
    width = Math.round(bbox.width / 10);
    y0 = bbox.y0 + Math.round(bbox.width * (5 / 8));
    height = Math.round(bbox.height / 8);
    let handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
    // only x0 changes in the second handle
    x0 += Math.round(bbox.width / 4) + 2;
    handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /* --- METHOD: #displayStones --- */
  #displayStones() {
    const state = this.#game.getState(0);

    // display stones
    for (const stone of state.stones) {
      // stone bounding box
      const x0 = stone.loc.x * this.#cellwidth,
        y0 = stone.loc.y * this.#cellheight;
      const bbox = new BoundingBox(x0, y0, this.#cellwidth, this.#cellheight);

      // display stone
      let color;
      switch (stone.type) {
        case Stone.Type.RUBY:
          color = STONE_RUBY_COLOR;
          break;
        case Stone.Type.EMERALD:
          color = STONE_EMERALD_COLOR;
          break;
        case Stone.Type.TOPAZ:
          color = STONE_TOPAZ_COLOR;
          break;
        case Stone.Type.GARNET:
          color = STONE_GARNET_COLOR;
          break;
        case Stone.Type.SAPPHIRE:
          color = STONE_SAPPHIRE_COLOR;
          break;
        case Stone.Type.DIAMOND:
          color = STONE_DIAMOND_COLOR;
          break;
        case Stone.Type.OPAL:
          color = STONE_OPAL_COLOR;
          break;
        case Stone.Type.AGATE:
          color = STONE_AGATE_COLOR;
          break;
        case Stone.Type.AMETHYST:
          color = STONE_AMETHYST_COLOR;
          break;
        case Stone.Type.AQUAMARINE:
          color = STONE_AQUAMARINE_COLOR;
          break;
        case Stone.Type.ONYX:
          color = STONE_ONYX_COLOR;
          break;
        case Stone.Type.JASPER:
          color = STONE_JASPER_COLOR;
          break;
        default:
          console.assert(false); // sanity check
      }

      this.#drawStone(bbox, STONE_OUTLINE, color);
    }
  }

  /* --- METHOD: #drawStone --- */
  #drawStone(bbox, outline, hsla) {
    // draw stone
    const x0 = bbox.x0 + Math.round((5 / 16) * bbox.width);
    const y0 = bbox.y0 + Math.round((3 / 8) * bbox.height);
    const width = Math.round(((4 / 3) * bbox.width) / 4);
    const height = Math.round(bbox.height / 4);
    const stoneBBox = new BoundingBox(x0, y0, width, height);
    // this.#drawer.drawRectangle(stoneBBox, outline, hsla, 2);
    this.#drawer.fillRectangle(stoneBBox, hsla);

    // draw outset
    const polyline = new Polyline();
    polyline.addPoint(x0 + width - 1, y0 + 1);
    polyline.addPoint(x0 + width - 1, y0 + height - 1);
    polyline.addPoint(x0 + 1, y0 + height - 1);
    polyline.addPoint(x0 + 4, y0 + height - 4);
    polyline.addPoint(x0 + width - 4, y0 + height - 4);
    polyline.addPoint(x0 + width - 4, y0 + 4);

    let [hue, saturation, lightness, alpha] = hsla.split(", ");
    lightness = Math.floor(
      parseInt(lightness.slice(0, lightness.length - 1)) * (2 / 3)
    ).toString();
    saturation = Math.floor(
      parseInt(saturation.slice(0, saturation.length - 1)) * (1 / 3)
    ).toString();
    const shadow = hue + ", " + saturation + "%, " + lightness + "%)";

    this.#drawer.drawPolygon(polyline, shadow, shadow);
  }

  /* --- METHOD: #displayRandys --- */
  #displayRandys() {
    // group Randys (which are inside primary's player room) by location
    const displayRoomId = this.#game.getState(0).room.id;
    const states = {};
    for (let i = this.#game.getNumPlayers() - 1; i >= 1; i--) {
      const state = this.#game.getState(i);
      if (state.room.id !== displayRoomId) {
        // display only if inside primary player's room
        continue;
      }

      const [x, y] = [state.player.loc.x, state.player.loc.y];
      if (!(x in states)) {
        states[x] = {};
      }
      if (!(y in states[x])) {
        states[x][y] = [];
      }
      states[x][y].push(state);
    }

    // display randys
    for (const x in states) {
      for (const y in states[x]) {
        // randys' bounding box
        const x0 = x * this.#cellwidth,
          y0 = y * this.#cellheight;
        const bbox = new BoundingBox(x0, y0, this.#cellwidth, this.#cellheight);

        const pploc = this.#game.getState(0).player.loc; // pp = primary player
        if (
          states[x][y].length > 1 ||
          states[x][y][0].player.loc.isEqualTo(pploc)
        ) {
          this.#displayRandyCrowd(states[x][y], bbox);
        } else {
          this.#displayRandy(states[x][y][0], bbox);
        }
      }
    }
  }

  /* --- METHOD: #displayPrimaryPlayer --- */
  #displayPrimaryPlayer() {
    const state = this.#game.getState(0);

    // primary player's bounding box
    const x0 = state.player.loc.x * this.#cellwidth,
      y0 = state.player.loc.y * this.#cellheight;
    const bbox = new BoundingBox(x0, y0, this.#cellwidth, this.#cellheight);

    this.#displayPlayer(
      bbox,
      PLAYER_SCALE,
      PLAYER_OUTLINE,
      PLAYER_FILL,
      [0, 0]
    );
  }

  /* --- METHOD: #displayRandy --- */
  #displayRandy(state, bbox, offset = [0, 0]) {
    const fill = this.#getRandyFill(state.player.id);
    this.#displayPlayer(bbox, PLAYER_SCALE, PLAYER_OUTLINE, fill, offset);
  }

  /* --- METHOD: #displayRandyCrowd --- */
  #displayRandyCrowd(states, bbox) {
    // console.assert(states.length > 1); // sanity check
    for (let j = 0; j < states.length; j++) {
      let offset = [
        Random.getRandomInteger(-5, 6),
        Random.getRandomInteger(-5, 6),
      ];
      this.#displayRandy(states[j], bbox, offset);
    }
  }

  /* --- METHOD: #displayPlayer --- */
  #displayPlayer(bbox, scale, outline, fill, offset) {
    // this.#displayPlayer1(bbox, scale, outline, fill, offset);
    this.#displayPlayer2(bbox, scale, outline, fill, offset);
  }

  /* --- METHOD: #displayPlayer1 --- */
  #displayPlayer1(bbox, scale, outline, fill, offset) {
    this.#drawPlayer(bbox, scale, outline, fill[0], offset);
  }

  /* --- METHOD: #displayPlayer2 --- */
  #displayPlayer2(bbox, scale, outline, fill, offset) {
    // draw walker with primary color first
    this.#displayPlayer1(bbox, scale, outline, fill, offset);

    if (fill[1] === null) {
      return;
    }

    // draw mixture of primary and secondary colors
    const N = 4;
    const delta = scale / N;
    for (let i = 1; i < N; i++) {
      const figureScale = i * delta;
      this.#drawPlayer(bbox, figureScale, fill[1], null, offset);
    }
  }

  /* --- METHOD: #drawPlayer --- */
  #drawPlayer(bbox, scale, outline, fill, offset) {
    const walkerWidth = Math.round(scale * bbox.width),
      walkerHeight = Math.round(scale * bbox.height);
    let widthDiff = bbox.width - walkerWidth,
      heightDiff = bbox.height - walkerHeight;
    let x0 = bbox.x0 + Math.round(widthDiff / 2) + offset[0],
      y0 = bbox.y0 + Math.round(heightDiff / 2) + offset[1];
    const scaledBBox = new BoundingBox(x0, y0, walkerWidth, walkerHeight);
    this.#drawer.drawCircle(scaledBBox, outline, fill, 2);
  }
};
