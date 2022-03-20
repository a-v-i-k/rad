/* --- IMPORTS --- */
import BoundingBox from "./bounding-box.js";
import Polyline from "./polyline.js";
import { ETypeError, ValueError, ERangeError } from "../library/errors.js";

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
  }

  /* --- METHOD: drawLine --- */
  // FIXME: lineWidth is not validated! Fix in all methods.
  drawLine(pt1, pt2, strokeStyle, lineWidth = 1) {
    this.#validatePoint(pt1);
    this.#validatePoint(pt2);
    Drawer.validateColor(strokeStyle);

    const context = this.#getContext();
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;

    context.beginPath();
    context.moveTo(pt1[0], pt1[1]);
    context.lineTo(pt2[0], pt2[1]);
    context.closePath();
    context.stroke();
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
    context.fillRect(bbox.x0, bbox.y0, bbox.width, bbox.height);
    context.closePath();
  }

  /* --- METHOD: drawCircle --- */
  drawCircle(bbox, strokeStyle, fillStyle = null, lineWidth = 1) {
    this.#validateBoundingBox(bbox);

    const r = Math.floor(Math.min(bbox.width, bbox.height) / 2) - 1;
    const x = bbox.x0 + r + 1,
      y = bbox.y0 + r + 1;
    this.drawArc(x, y, r, 0, 2 * Math.PI, strokeStyle, fillStyle, lineWidth);
  }

  /* --- METHOD: drawArc --- */
  drawArc(
    x,
    y,
    r,
    sAngle,
    eAngle,
    strokeStyle,
    fillStyle = null,
    lineWidth = 1
  ) {
    this.#validatePoint([x, y]);
    if (!Number.isInteger(r)) {
      throw new ETypeError(`radius is not an integer`, r);
    }
    if (r < 0) {
      throw new ERangeError(`radius is negative`, r);
    }
    this.#validateAngle(sAngle);
    this.#validateAngle(eAngle);
    Drawer.validateColor(strokeStyle);
    if (fillStyle !== null) {
      Drawer.validateColor(fillStyle);
    }

    const context = this.#getContext();
    context.beginPath();
    context.arc(x, y, r, sAngle, eAngle);
    if (fillStyle !== null) {
      context.fillStyle = fillStyle;
      context.fill();
    }
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.stroke();
    context.closePath();
  }

  /* --- METHOD: drawPolygon --- */
  drawPolygon(polyline, strokeStyle, fillStyle = null, lineWidth = 1) {
    this.#validatePolyline(polyline);
    Drawer.validateColor(strokeStyle);
    if (fillStyle !== null) {
      Drawer.validateColor(fillStyle);
    }

    const context = this.#getContext();
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;

    context.beginPath();
    context.moveTo(polyline.points[0], polyline.points[1]);
    for (let i = polyline.points.length - 1; i >= 0; i--) {
      context.lineTo(polyline.points[i][0], polyline.points[i][1]);
    }
    context.closePath();

    context.stroke();
    if (fillStyle !== null) {
      context.fillStyle = fillStyle;
      context.fill();
    }
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
    context.font = `bold ${fontSize}px verdana`;
    context.textAlign = "center";
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

  /* --- METHOD: #validatePoint --- */
  #validatePoint(point) {
    if (!Array.isArray(point) || point.length != 2) {
      throw new ETypeError(`given point is not an array of length 2`, point);
    }
    if (!Number.isInteger(point[0]) || !Number.isInteger(point[1])) {
      throw new ValueError(`given point has non-integer coordinates`, point);
    }
    const width = this.#canvas.width,
      height = this.#canvas.height;
    if (
      point[0] < 0 ||
      point[0] > width - 1 ||
      point[1] < 0 ||
      point[1] > height - 1
    ) {
      throw new ERangeError(
        `point is not contained in [0, ${width - 1}] x [0, ${height - 1}]`,
        point
      );
    }
  }

  /* --- METHOD: #validatePolyline --- */
  #validateAngle(angle) {
    if (typeof angle !== "number") {
      throw new ETypeError(`angle is not a number`, angle);
    }
    // if (angle < 0 || angle > 2 * Math.PI) {
    //   throw new ERangeError(`angle is not contained in [0, 2*PI]`, angle);
    // }
  }

  /* --- METHOD: #validatePolyline --- */
  #validatePolyline(polyline) {
    if (!(polyline instanceof Polyline)) {
      throw new ETypeError(`input is not of type Polyline`, polyline);
    }
    if (polyline.points.length < 2) {
      throw new ValueError(`polyline contains less than 2 points`);
    }
    for (const point of polyline.points) {
      this.#validatePoint(point);
    }
  }

  /* --- METHOD: #getContext --- */
  #getContext() {
    return this.#canvas.getContext("2d");
  }
};
