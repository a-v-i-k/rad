/* --- IMPORTS --- */
import Game from "../game/game.js";
import Location from "../game/location.js";
import Door, { ExitDoor } from "../game/door.js";
import Cell from "../game/cell.js";
import Styler from "./styler.js";
import BoundingBox from "./bounding-box.js";
import Drawer from "./drawer.js";
import Random from "../library/random.js";
import QUOTES from "../library/quotes.js";

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
// const IDLE_BG = "powderblue";
const DEFAULT_CANVAS_BG = "#f0f0f0";
const QUOTE_PADDING = 10;
const PAUSE_FILL_STYLE = "red";
const ANNOUNCEMENT_BG = "honeydew";
const ANNOUNCEMENT_FILL_STYLE = "indigo";
const MARKER_COLOR = "lime";
const FONT_PR_PER_CELL = 24;
const FONT_PX_PER_CELL = 5;

/*
 * CLASS: Displayer [UML]
 *****************************************************************************/
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
  #styles;

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
    this.clearStyles();

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
    logo.setAttribute("id", "stones-grid");
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
    return quote;
  }

  /// IDLE

  /* --- METHOD: displayIdle --- */
  displayIdle() {
    const status = this.getStatus();
    console.assert(status !== Displayer.Status.IDLE); // sanity check

    let child = this.#HTML().canvas;
    if (status === Displayer.Status.NONE) {
      child = this.#HTML().loading;
    } else if (status === Displayer.Status.QUOTE) {
      child = this.#HTML().quote;
    }
    this.#displayFrame.replaceChild(this.#HTML().idle, child);

    // TODO: Check me
    // // display big exit door
    // this.#setBackground(IDLE_BG);
    // this.#clearDisplay();
    // const width = this.getWidth(),
    //   height = this.getHeight();
    // const bbox = new BoundingBox(0, 0, width, height);
    // const cellStyle = Styler.getCellStyle();
    // cellStyle.cascadeoutline = MARKER_COLOR;
    // this.#drawCell(bbox, cellStyle);
    // const doorStyle = Styler.getExitDoorStyle();
    // this.#drawDoor(bbox, doorStyle);

    this.#setStatus(Displayer.Status.IDLE);
  }

  /* --- METHOD: #clearIdle --- */
  #clearIdle() {
    const idleElem = this.#HTML().idle;
    this.#displayFrame.replaceChild(this.#HTML().canvas, idleElem);
  }

  /// PLAYING

  /* --- METHOD: clearStyles --- */
  clearStyles() {
    // NOTE: Element ID is unique.
    this.#styles = { rooms: {}, doors: {}, cells: {}, players: {} };
  }

  /* --- METHOD: displayPlay --- */
  displayPlay() {
    if (this.getStatus() === Displayer.Status.IDLE) {
      this.#clearIdle();
    } else if (this.getStatus() === Displayer.Status.QUOTE) {
      this.#clearQuote();
    }
    this.#clearDisplay();

    // display everything from the 0/main/primary/user player's perspective
    const room = this.#game.getState(0).room; // TODO [ID]
    this.#displayRoom(room);
    this.#displayPlayers(room);

    this.#setStatus(Displayer.Status.PLAY);
  }

  /* --- METHOD: displayPause --- */
  displayPause() {
    console.assert(this.getStatus() === Displayer.Status.PLAY); // sanity check

    const dims = this.#game.getDimensions();
    const fontSize = Math.min(dims[0], dims[1]) * FONT_PX_PER_CELL;
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
    const fontSize = Math.min(dims[0], dims[1]) * FONT_PR_PER_CELL;
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
    const fontSize = Math.min(dims[0], dims[1]) * FONT_PX_PER_CELL;
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

  /* --- METHOD: #displayRoom --- */
  #displayRoom(room) {
    this.#displayRoomBackground(room); // room background
    this.#displayCellsAndDoors(room); // cells and doors
  }

  /* --- METHOD: #displayRoomBackground --- */
  #displayRoomBackground(room) {
    // room bounding box
    const canvasWidth = this.getWidth(),
      canvasHeight = this.getHeight();
    const bbox = new BoundingBox(0, 0, canvasWidth, canvasHeight);

    // room style
    const roomId = room.getId();
    if (!(roomId in this.#styles.rooms)) {
      this.#styles.rooms[roomId] = Styler.getRoomStyle();
    }
    const style = this.#styles.rooms[roomId];

    // display room
    this.#drawer.drawRectangle(bbox, style.outline, style.background);
  }

  /* --- METHOD: #displayCellsAndDoors --- */
  #displayCellsAndDoors(room) {
    const dims = room.getDimensions();
    for (let x = 0; x < dims[1]; x++) {
      for (let y = 0; y < dims[0]; y++) {
        // cell/door bounding box
        const x0 = x * this.#cellwidth,
          y0 = y * this.#cellheight;
        const bbox = new BoundingBox(x0, y0, this.#cellwidth, this.#cellheight);

        // display cell
        const cell = room.getCell(new Location(x, y));
        this.#displayCell(cell, bbox);

        // display door
        const door = cell.getDoor();
        if (door !== null) {
          this.#displayDoor(door, bbox);
        }
      }
    }
  }

  /* --- METHOD: #displayCell --- */
  #displayCell(cell, bbox) {
    // cell style
    const cellId = cell.getId();
    if (!(cellId in this.#styles.cells)) {
      if (cell.getType() === Cell.Type.WELCOME) {
        this.#styles.cells[cellId] = Styler.getWelcomeCellStyle();
      } else if (cell.getType() === Cell.Type.PLAIN) {
        this.#styles.cells[cellId] = Styler.getCellStyle();
      } else {
        console.assert(false); // sanity check
      }
    }
    const style = this.#styles.cells[cellId];

    // draw cell
    this.#drawCell(bbox, style);
  }

  /* --- METHOD: #drawCell --- */
  #drawCell(bbox, style) {
    // draw cell outline
    this.#drawer.drawRectangle(bbox, style.outline);

    // draw cascading appearance
    if (style.cascadeoutline !== null) {
      const low = 2,
        high = Math.floor(Math.min(bbox.width, bbox.height) / 2) - 1;
      for (let i = low; i <= high; i += 4) {
        const cx0 = bbox.x0 + i,
          cy0 = bbox.y0 + i,
          cwidth = bbox.width - 2 * i,
          cheight = bbox.height - 2 * i;
        const cbbox = new BoundingBox(cx0, cy0, cwidth, cheight);
        const outline = style.cascadeoutline;
        if (style.cascadeshape === "rectangle") {
          this.#drawer.drawRectangle(cbbox, outline);
        } else if (style.cascadeshape === "circle") {
          this.#drawer.drawCircle(cbbox, outline);
        } else {
          console.assert(false); // sanity check
        }
      }
    }
  }

  /* --- METHOD: #displayDoor --- */
  #displayDoor(door, bbox) {
    // door style
    const doorId = door.getId();
    if (!(doorId in this.#styles.doors)) {
      if (door instanceof ExitDoor) {
        this.#styles.doors[doorId] = Styler.getExitDoorStyle();
      } else if (door instanceof Door) {
        this.#styles.doors[doorId] = Styler.getDoorStyle();
      } else {
        console.assert(false); // sanity check
      }
    }
    const style = this.#styles.doors[doorId];

    // draw door
    this.#drawDoor(bbox, style);
  }

  /* --- METHOD: #drawDoor --- */
  #drawDoor(bbox, style) {
    // TODO: Differet outlines for different door parts?
    const outline = style.outline;

    // display front
    let x0 = bbox.x0 + Math.floor(bbox.width / 5);
    let y0 = bbox.y0 + Math.floor(bbox.height / 20);
    let width = bbox.width - 2 * Math.floor(bbox.width / 5);
    let height = bbox.height - 2 * Math.floor(bbox.height / 20);
    const frontBbox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(frontBbox, outline, style.frontfill, 2);

    // display window
    x0 += Math.floor(bbox.width / 12);
    y0 += Math.floor(bbox.height / 12);
    width -= 2 * Math.floor(bbox.width / 12);
    height = Math.floor(bbox.height / 3);
    const windowBbox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(windowBbox, outline, style.windowfill, 2);

    // display handle
    // x0 doesn't change
    width = Math.floor(bbox.width / 7);
    y0 += Math.floor(bbox.height / 3) + Math.floor(bbox.height / 12);
    height = Math.floor(bbox.height / 7);
    const handleBbox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBbox, outline, style.handlefill, 2);
  }

  /* --- METHOD: #displayPlayers --- */
  #displayPlayers(room) {
    // group players (that are inside room) by location
    // give prmary player (player 0) priority over randys (front display)
    const players = {};
    for (let i = this.#game.getNumPlayers() - 1; i >= 0; i--) {
      // TODO [ID]
      const state = this.#game.getState(i);
      if (state.room !== room) continue; // display if inside input room

      const x = state.loc.x,
        y = state.loc.y;
      if (!(x in players)) {
        players[x] = {};
      }
      if (!(y in players[x])) {
        players[x][y] = [];
      }
      players[x][y].push(i);
    }

    // display players
    for (const x in players) {
      for (const y in players[x]) {
        // players' bounding box
        const x0 = x * this.#cellwidth,
          y0 = y * this.#cellheight;
        const bbox = new BoundingBox(x0, y0, this.#cellwidth, this.#cellheight);

        if (players[x][y].length > 1) {
          this.#displayCrowdByIndex(players[x][y], bbox);
        } else {
          this.#displayPlayerByIndex(players[x][y][0], bbox);
        }
      }
    }
  }

  /* --- METHOD: #displayPlayerByIndex --- */
  #displayPlayerByIndex(index, bbox, offset = [0, 0]) {
    // player style
    // NOTE: Not using player ID here.
    const numPlayers = this.#game.getNumPlayers();
    if (!(index in this.#styles.players)) {
      if (index == 0) {
        this.#styles.players[index] = Styler.getPlayerStyle();
      } else if (0 < index && index < numPlayers) {
        if (numPlayers > 2) {
          // more than 1 randy => random colors
          this.#styles.players[index] = Styler.getRandyRandomStyle();
        } else {
          this.#styles.players[index] = Styler.getRandyStyle();
        }
      } else {
        console.assert(false); // sanity check
      }
    }
    const style = this.#styles.players[index];

    this.#displayPlayer(bbox, style, offset);
  }

  /* --- METHOD: #displayPlayer --- */
  #displayPlayer(bbox, style, offset) {
    // this.#displayPlayer1(bbox, style, offset);
    this.#displayPlayer2(bbox, style, offset);
  }

  /* --- METHOD: #displayPlayer1 --- */
  #displayPlayer1(bbox, style, offset) {
    this.#drawPlayer(bbox, style.scale, style.outline, style.fill[0], offset);
  }

  /* --- METHOD: #displayPlayer2 --- */
  #displayPlayer2(bbox, style, offset) {
    // draw walker with primary color first
    this.#displayPlayer1(bbox, style, offset);

    if (style.fill[1] === null) {
      return;
    }

    // draw mixture of primary and secondary colors
    const N = 5;
    let scale = style.scale;
    let delta = scale / N;
    for (let i = 1; i < N; i++) {
      scale = i * delta;
      let color = style.fill[i % 2]; // TODO: What is this?
      this.#drawPlayer(bbox, scale, "goldenrod", null, offset);
    }
  }

  /* --- METHOD: #drawPlayer --- */
  #drawPlayer(bbox, scale, outline, fill, offset) {
    const walkerWidth = Math.round(scale * bbox.width),
      walkerHeight = Math.round(scale * bbox.height);
    let widthDiff = bbox.width - walkerWidth,
      heightDiff = bbox.height - walkerHeight;
    let x0 = bbox.x0 + widthDiff / 2 + offset[0],
      y0 = bbox.y0 + heightDiff / 2 + offset[1];
    const scaledBbox = new BoundingBox(x0, y0, walkerWidth, walkerHeight);
    this.#drawer.drawCircle(scaledBbox, outline, fill, 2);
  }

  /* --- METHOD: #displayCrowdByIndex --- */
  #displayCrowdByIndex(indices, bbox) {
    console.assert(indices.length > 1); // sanity check
    for (let j = 0; j < indices.length - 1; j++) {
      let offset = [
        Random.getRandomInteger(-5, 6),
        Random.getRandomInteger(-5, 6),
      ];
      this.#displayPlayerByIndex(indices[j], bbox, offset);
    }
    this.#displayPlayerByIndex(indices[indices.length - 1], bbox, [0, 0]);
  }
};
