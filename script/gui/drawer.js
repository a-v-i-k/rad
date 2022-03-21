/* --- IMPORTS --- */
import { ETypeError, ValueError } from "../library/errors.js";
import Validator from "../library/validation.js";
import BoundingBox from "./bounding-box.js";
import Polyline from "./polyline.js";

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
    Validator.color(background);
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
    Validator.color(background);
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
    Validator.color(strokeStyle);

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
    Validator.color(strokeStyle);
    if (fillStyle !== null) {
      Validator.color(fillStyle);
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
    Validator.color(fillStyle);

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
    Validator.positiveInteger(r);
    this.#validateAngle(sAngle);
    this.#validateAngle(eAngle);
    Validator.color(strokeStyle);
    if (fillStyle !== null) {
      Validator.color(fillStyle);
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
    Validator.color(strokeStyle);
    if (fillStyle !== null) {
      Validator.color(fillStyle);
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
    Validator.string(text);

    // validate position
    Validator.nonnegativeInteger(x);
    Validator.nonnegativeInteger(y);

    // validate fill style
    Validator.color(fillStyle);

    // validate font size
    Validator.positiveInteger(fontSize);

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
    Validator.instanceOf(bbox, BoundingBox);
    Validator.range(bbox.x0, 0, this.#canvas.width - bbox.width);
    Validator.range(bbox.y0, 0, this.#canvas.height - bbox.height);
  }

  /* --- METHOD: #validatePoint --- */
  #validatePoint(point) {
    if (!Array.isArray(point) || point.length != 2) {
      throw new ETypeError(`given point is not an array of length 2`, point);
    }
    if (!Number.isInteger(point[0]) || !Number.isInteger(point[1])) {
      throw new ValueError(`given point has non-integer coordinates`, point);
    }
    Validator.range(point[0], 0, this.#canvas.width - 1);
    Validator.range(point[1], 0, this.#canvas.height - 1);
  }

  /* --- METHOD: #validateAngle --- */
  #validateAngle(angle) {
    Validator.number(angle);
    // Validator.range(angle, 0, 2 * Math.PI);
  }

  /* --- METHOD: #validatePolyline --- */
  #validatePolyline(polyline) {
    Validator.instanceOf(polyline, Polyline);
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
