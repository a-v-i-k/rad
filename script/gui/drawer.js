/* --- IMPORTS --- */
import BoundingBox from "./bounding-box.js";
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Drawer as default };

/*
 * CLASS: Drawer
 *****************************************************************************/
const Drawer = class {
  #canvas;
  #background;

  /* --- C'TOR: constructor --- */
  constructor(canvas, background) {
    Drawer.#validator(canvas, background);
    this.#canvas = canvas;
    this.setBackground(background);
  }

  /* --- METHOD: #validator --- */
  static #validator(canvas, background) {
    if (!(canvas instanceof HTMLElement) || canvas.tagName !== "CANVAS") {
      throw new ETypeError(`canvas is not an HTML canvas element`, canvas);
    }
    Drawer.validateColor(background);
  }

  /* --- METHOD: validateColor --- */
  static validateColor(color) {
    // validate CSS color
    var s = new Option().style;
    s.color = color;
    // if (s.color == "") {
    //   console.log(color);
    // }
    if (s.color === "") {
      throw new ETypeError(`input ${color} is not a valid color`, color);
    }
  }

  /* --- METHOD: getWidth --- */
  getWidth() {
    return this.#canvas.width;
  }

  /* --- METHOD: getHeight --- */
  getHeight() {
    return this.#canvas.height;
  }

  /* --- METHOD: getBackground --- */
  getBackground() {
    return this.#background;
  }

  /* --- METHOD: setBackground --- */
  setBackground(background) {
    Drawer.validateColor(background);
    this.#background = background;
  }

  /* --- METHOD: clearDisplay --- */
  clearDisplay() {
    this.fillRectangle(
      new BoundingBox(0, 0, this.#canvas.width, this.#canvas.height),
      this.#background
    );
    // TODO: Consider the following.
    // this.#getContext().clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }

  /* --- METHOD: drawRectangle --- */
  drawRectangle(bbox, strokeStyle, fillStyle = null, lineWidth = 1) {
    this.#validateBoundingBox(bbox);
    Drawer.validateColor(strokeStyle);
    if (fillStyle !== null) {
      Drawer.validateColor(fillStyle);
    }
    const context = this.#getContext();

    context.beginPath();
    if (fillStyle !== null) {
      context.fillStyle = fillStyle;
      context.fillRect(bbox.x0, bbox.y0, bbox.width, bbox.height);
    }
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.strokeRect(bbox.x0, bbox.y0, bbox.width, bbox.height);
    context.closePath();
  }

  /* --- METHOD: fillRectangle --- */
  fillRectangle(bbox, fillStyle) {
    this.#validateBoundingBox(bbox);
    Drawer.validateColor(fillStyle);

    const context = this.#getContext();
    context.beginPath();
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, bbox.width, bbox.height);
    context.closePath();
  }

  /* --- METHOD: drawCircle --- */
  drawCircle(bbox, strokeStyle, fillStyle = null, lineWidth = 1) {
    this.#validateBoundingBox(bbox);
    Drawer.validateColor(strokeStyle);
    if (fillStyle !== null) {
      Drawer.validateColor(fillStyle);
    }
    const context = this.#getContext();

    context.beginPath();
    const radius = Math.floor(Math.min(bbox.width, bbox.height) / 2) - 1;
    const x = bbox.x0 + radius + 1,
      y = bbox.y0 + radius + 1;
    context.arc(x, y, radius, 0, 2 * Math.PI);
    if (fillStyle !== null) {
      context.fillStyle = fillStyle;
      context.fill();
    }
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.stroke();
    context.closePath();
  }

  /* --- METHOD: injectText --- */
  injectText(text, x, y, fillStyle, fontSize) {
    // validate text
    if (typeof text !== "string") {
      throw new ETypeError(`text is not a string`, text);
    }

    // validate position
    if (!Number.isInteger(x)) {
      throw new ETypeError(`input is not an integer`, x);
    }
    if (x < 0) {
      throw new ERangeError(`input is negative`, x);
    }
    if (!Number.isInteger(y)) {
      throw new ETypeError(`input is not an integer`, y);
    }
    if (y < 0) {
      throw new ERangeError(`input is negative`, y);
    }

    // validate fill style
    Drawer.validateColor(fillStyle);

    // validate font size
    if (!Number.isInteger(fontSize)) {
      throw new ETypeError(`input is not an integer`, fontSize);
    }
    if (fontSize <= 0) {
      throw new ERangeError(`input is not positive`, fontSize);
    }

    const context = this.#getContext();
    context.beginPath();
    context.fillStyle = fillStyle;
    context.font = `bold ${fontSize}px verdana`; // TODO: Make configurable?
    context.textAlign = "center"; // TODO: Make configurable?
    context.fillText(text, x, y);
    context.closePath();
  }

  /* --- METHOD: #validateBoundingBox --- */
  #validateBoundingBox(bbox) {
    if (!(bbox instanceof BoundingBox)) {
      throw new ETypeError(`input is not of type BoundingBox`, bbox);
    }
    const width = this.#canvas.width,
      height = this.#canvas.height;
    if (
      bbox.x0 < 0 ||
      bbox.x0 + bbox.width > width ||
      bbox.y0 < 0 ||
      bbox.y0 + bbox.height > height
    ) {
      throw new ERangeError(
        `bounding box is not contained in [${0}, ${width}] x [${0}, ${height}]`,
        bbox
      );
    }
  }

  /* --- METHOD: #getContext --- */
  #getContext() {
    return this.#canvas.getContext("2d");
  }
};
