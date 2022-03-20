/* --- IMPORTS --- */
import Validator from "../library/validation.js";
import BoundingBox from "./bounding-box.js";
import Polyline from "./polyline.js";
import Drawer from "./drawer.js";

/* --- EXPORTS --- */
export { Doors as default };

/*
 * CLASS: Doors
 *****************************************************************************/
const Doors = class {
  #drawer;

  /* --- C'TOR: constructor --- */
  constructor(drawer) {
    Validator.instanceOf(drawer, Drawer);
    this.#drawer = drawer;
  }

  /// PLAIN DOOR

  /* --- METHOS: drawPlainDoor --- */
  drawPlainDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // NOTE: Color validation is delegated to the Drawer class.
    // draw front
    let x0 = bbox.x0 + Math.round(bbox.width / 5);
    let y0 = bbox.y0 + Math.round(bbox.height / 15);
    let width = bbox.width - 2 * Math.round(bbox.width / 5);
    let height = bbox.height - 2 * Math.round(bbox.height / 15);
    const frontBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(frontBBox, outline, frontFill, 2);

    // draw window
    x0 += Math.round(bbox.width / 12);
    y0 += Math.round(bbox.height / 12);
    width -= 2 * Math.round(bbox.width / 12);
    height = Math.round(bbox.height / 3);
    const windowBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(windowBBox, outline, windowFill, 2);

    // draw handle
    // x0 doesn't change
    width = Math.round(bbox.width / 7);
    y0 += Math.round(bbox.height / 3) + Math.round(bbox.height / 12);
    height = Math.round(bbox.height / 7);
    const handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /// PARABOLIC DOOR

  /* --- METHOS: drawParabolicDoor --- */
  drawParabolicDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // draw front
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

    // draw window
    polyline = new Polyline();
    for (let i = 23; i < bbox.width - 22; i++) {
      const d = (i * delta) / bbox.width;
      const x = Math.round(d * bbox.width);
      const y =
        Math.round(bbox.height * Math.abs(Math.pow(3.5 * (d - 0.5), 3))) + 15;
      polyline.addPoint(bbox.x0 + x, bbox.y0 + y);
    }
    this.#drawer.drawPolygon(polyline, outline, windowFill, 4);

    // draw handle
    x0 += 5;
    width = Math.round(bbox.width / 7);
    y0 += 8 + Math.round(bbox.height / 3) + Math.round(bbox.height / 12);
    height = Math.round(bbox.height / 7);
    const handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /// ROUND DOOR

  /* --- METHOS: drawRoundDoor --- */
  drawRoundDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // draw front
    let x0 = bbox.x0 + Math.round(bbox.width / 15);
    let y0 = bbox.y0 + Math.round(bbox.height / 15);
    let width = bbox.width - 2 * Math.round(bbox.width / 15);
    let height = bbox.height - 2 * Math.round(bbox.height / 15);
    const frontBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(frontBBox, outline, frontFill, 2);

    // draw window
    x0 = bbox.x0 + Math.round(bbox.width * (4 / 15));
    y0 = bbox.y0 + Math.round(bbox.height * (4 / 15)) - 10;
    width = Math.round(bbox.width / 2.2);
    height = Math.round(bbox.height / 2.2);
    const windowBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(windowBBox, outline, windowFill, 2);

    // draw handle
    x0 = bbox.x0 + Math.round(bbox.width / 5);
    width = Math.round(bbox.width / 7);
    y0 = bbox.y0 + Math.round(bbox.height * (4 / 7));
    height = Math.round(bbox.height / 7);
    const handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /// TRAPEZOID DOOR

  /* --- METHOS: drawTrapezoidDoor --- */
  drawTrapezoidDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // draw front
    const frontPolyline = new Polyline();
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height / 16)
    );
    frontPolyline.addPoint(
      bbox.x0 + bbox.width - 1 - Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height / 16)
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (11 / 16)),
      bbox.y0 + bbox.height - 1 - Math.round(bbox.height / 16)
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (5 / 16)),
      bbox.y0 + bbox.height - 1 - Math.round(bbox.height / 16)
    );
    this.#drawer.drawPolygon(frontPolyline, outline, frontFill, 4);

    // draw window
    const windowPolyline = new Polyline();
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width / 4),
      bbox.y0 + Math.round(bbox.height / 8)
    );
    windowPolyline.addPoint(
      bbox.x0 + bbox.width - 1 - Math.round(bbox.width / 4),
      bbox.y0 + Math.round(bbox.height / 8)
    );
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (11 / 16)),
      bbox.y0 + Math.round(bbox.height / 2) - 1
    );
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (5 / 16)),
      bbox.y0 + Math.round(bbox.height / 2) - 1
    );
    this.#drawer.drawPolygon(windowPolyline, outline, windowFill, 4);

    // draw handle
    const handleBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (5 / 16)),
      bbox.y0 + Math.round(bbox.height * (9 / 16)),
      Math.round(bbox.width / 8),
      Math.round(bbox.height / 8)
    );
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /// TWO-WINDOW DOOR

  /* --- METHOS: drawTwoWindowDoor --- */
  drawTwoWindowDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // draw front
    let x0 = bbox.x0 + Math.round(bbox.width * (1 / 8));
    let y0 = bbox.y0 + Math.round(bbox.height * (1 / 8));
    let width = bbox.width - 2 * Math.round(bbox.width * (1 / 8)) + 1;
    let height = bbox.height - 2 * Math.round(bbox.height * (1 / 8));
    let frontBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawRectangle(frontBBox, outline, frontFill, 2);

    // draw gap between doors
    const point1 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height * (1 / 8)),
    ];
    const point2 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + bbox.height - 1 - Math.round(bbox.height * (1 / 8)),
    ];
    this.#drawer.drawLine(point1, point2, outline, 2);

    // draw windows
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

    // draw handles
    x0 = bbox.x0 + Math.round(bbox.width * (1 / 4));
    width = Math.round(bbox.width / 10);
    y0 = bbox.y0 + Math.round(bbox.height * (5 / 8));
    height = Math.round(bbox.height / 8);
    let handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
    // only x0 changes in the second handle
    x0 += Math.round(bbox.width * (3 / 8)) + 2;
    handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /// ARCHED-WINDOWS DOOR

  /* --- METHOS: drawArchedWindowsDoor --- */
  drawArchedWindowsDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // draw front
    let x0 = bbox.x0 + Math.round(bbox.width / 16);
    let y0 = bbox.y0 + Math.round(bbox.height / 16);
    let width = bbox.width - 2 * Math.round(bbox.width / 16);
    let height = bbox.height - 2 * Math.round(bbox.height / 16);
    const frontBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(frontBBox, outline, frontFill, 2);

    // draw gap between doors
    const point1 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height / 16) + 1,
    ];
    const point2 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height * (7 / 8)),
    ];
    this.#drawer.drawLine(point1, point2, outline, 2);

    // draw left window
    this.#drawer.drawArc(
      bbox.x0 + Math.round(bbox.width * (7 / 16)),
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
      Math.round(Math.min(bbox.width, bbox.height) * (3 / 16)),
      Math.PI / 2,
      Math.PI * (3 / 2),
      outline,
      windowFill,
      2
    );
    let pt1 = [
      bbox.x0 + Math.round(bbox.width * (7 / 16)),
      bbox.y0 + Math.round(bbox.height * (3 / 16)),
    ];
    let pt2 = [
      bbox.x0 + Math.round(bbox.width * (7 / 16)),
      bbox.y0 + Math.round(bbox.height * (9 / 16)),
    ];
    this.#drawer.drawLine(pt1, pt2, outline);

    // draw right window
    this.#drawer.drawArc(
      bbox.x0 + Math.round(bbox.width * (9 / 16)),
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
      Math.round(Math.min(bbox.width, bbox.height) * (3 / 16)),
      -Math.PI / 2,
      Math.PI / 2,
      outline,
      windowFill,
      2
    );
    pt1 = [
      bbox.x0 + Math.round(bbox.width * (9 / 16)),
      bbox.y0 + Math.round(bbox.height * (3 / 16)),
    ];
    pt2 = [
      bbox.x0 + Math.round(bbox.width * (9 / 16)),
      bbox.y0 + Math.round(bbox.height * (9 / 16)),
    ];
    this.#drawer.drawLine(pt1, pt2, outline);

    // draw handles
    x0 = bbox.x0 + Math.round(bbox.width * (3 / 8)) - 1;
    width = Math.round(bbox.width / 10);
    y0 = bbox.y0 + Math.round(bbox.height * (10 / 16));
    height = Math.round(bbox.height / 8);
    let handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
    x0 += Math.round(bbox.width * (3 / 16));
    handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /// STYLISH DOOR

  /* --- METHOS: drawStylishDoor --- */
  drawStylishDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // draw front
    const frontBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height / 16),
      Math.round(bbox.width * (10 / 16)),
      Math.round(bbox.height * (14 / 16))
    );
    this.#drawer.drawRectangle(frontBBox, outline, frontFill, 2);

    // draw top window
    let windowPolyline = new Polyline();
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (4 / 16)),
      bbox.y0 + Math.round(bbox.height * (2 / 16)) + 1
    );
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (12 / 16)),
      bbox.y0 + Math.round(bbox.height * (2 / 16)) + 1
    );
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (12 / 16)),
      bbox.y0 + Math.round(bbox.height * (4 / 16))
    );
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (4 / 16)),
      bbox.y0 + Math.round(bbox.height * (7 / 16))
    );
    this.#drawer.drawPolygon(windowPolyline, outline, windowFill, 3);

    // draw bottom window
    windowPolyline = new Polyline();
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (8 / 16)),
      bbox.y0 + Math.round(bbox.height * (7 / 16)) + 1
    );
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (12 / 16)),
      bbox.y0 + Math.round(bbox.height * (6 / 16)) - 1
    );
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (12 / 16)),
      bbox.y0 + Math.round(bbox.height * (12 / 16))
    );
    windowPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (8 / 16)),
      bbox.y0 + Math.round(bbox.height * (12 / 16))
    );
    this.#drawer.drawPolygon(windowPolyline, outline, windowFill, 3);

    // draw handle
    const handleBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (5 / 16)) - 1,
      bbox.y0 + Math.round(bbox.height * (9 / 16)) - 1,
      Math.round(bbox.width / 8),
      Math.round(bbox.height / 8)
    );
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /// ARCHED DOOR

  /* --- METHOD: drawArchedDoor --- */
  drawArchedDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // this.drawFancyDoor(bbox, outline, frontFill, windowFill, handleFill);

    // draw top arc
    this.#drawer.drawArc(
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
      Math.round(Math.min(bbox.width, bbox.height) * (5 / 16)),
      Math.PI,
      0,
      outline,
      frontFill,
      2
    );

    // draw rest of front
    const frontBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
      Math.round(bbox.width * (10 / 16)),
      Math.round(bbox.width * (9 / 16))
    );
    this.#drawer.fillRectangle(frontBBox, frontFill);
    let point1 = [
      bbox.x0 + Math.round(bbox.width * (3 / 16)) + 1,
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
    ];
    let point2 = [
      bbox.x0 + Math.round(bbox.width * (3 / 16)) + 1,
      bbox.y0 + Math.round(bbox.height * (15 / 16)),
    ];
    let point3 = [
      bbox.x0 + Math.round(bbox.width * (13 / 16)),
      bbox.y0 + Math.round(bbox.height * (15 / 16)),
    ];
    let point4 = [
      bbox.x0 + Math.round(bbox.width * (13 / 16)),
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
    ];
    this.#drawer.drawLine(point1, point2, outline, 2);
    this.#drawer.drawLine(point2, point3, outline, 2);
    this.#drawer.drawLine(point3, point4, outline, 2);

    // draw arched window
    this.#drawer.drawArc(
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
      Math.round(Math.min(bbox.width, bbox.height) * (3 / 16)),
      Math.PI,
      0,
      outline,
      windowFill,
      2
    );
    point1 = [
      bbox.x0 + Math.round(bbox.width * (5 / 16)),
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
    ];
    point2 = [
      bbox.x0 + Math.round(bbox.width * (11 / 16)),
      bbox.y0 + Math.round(bbox.height * (6 / 16)),
    ];
    this.#drawer.drawLine(point1, point2, outline, 2);

    // draw rest of windows
    let windowBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (5 / 16)) + 1,
      bbox.y0 + Math.round(bbox.height * (7 / 16)),
      Math.round(bbox.width * (6 / 16)),
      Math.round(bbox.height * (3 / 16))
    );
    this.#drawer.drawRectangle(windowBBox, outline, windowFill, 2);

    // draw handle
    const handleBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (5 / 16)),
      bbox.y0 + Math.round(bbox.height * (11 / 16)),
      Math.round(bbox.width / 8),
      Math.round(bbox.height / 8)
    );
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }

  /// GRID DOOR

  /* --- METHOS: drawGridDoor --- */
  drawGridDoor(bbox, outline, barsOutline, frontFill, windowFill, handleFill) {
    // draw front
    const frontBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width / 4),
      bbox.y0 + Math.round(bbox.height / 16),
      Math.round(bbox.width / 2),
      Math.round(bbox.height * (7 / 8))
    );
    this.#drawer.drawRectangle(frontBBox, outline, frontFill, 2);

    // draw window
    const windowBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (5 / 16)) + 1,
      bbox.y0 + Math.round(bbox.height / 8),
      Math.round(bbox.width * (3 / 8)),
      Math.round(bbox.height * (6 / 16))
    );
    this.#drawer.drawRectangle(windowBBox, outline, windowFill, 2);

    // draw handle
    const handleBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (5 / 16)),
      bbox.y0 + Math.round(bbox.height * (9 / 16)),
      Math.round(bbox.width / 8),
      Math.round(bbox.height / 8)
    );
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);

    // draw bars
    for (let i = 6; i <= 10; i++) {
      // vertical bars
      const point1 = [
        bbox.x0 + Math.round(bbox.width * (i / 16)),
        bbox.y0 + Math.round(bbox.height / 8),
      ];
      const point2 = [
        bbox.x0 + Math.round(bbox.width * (i / 16)),
        bbox.y0 + Math.round(bbox.height / 2) - 1,
      ];
      this.#drawer.drawLine(point1, point2, barsOutline, 2);
    }
    for (let i = 3; i <= 7; i++) {
      // horizontal bars
      const point1 = [
        bbox.x0 + Math.round(bbox.width * (5 / 16)) + 1,
        bbox.y0 + Math.round(bbox.height * (i / 16)),
      ];
      const point2 = [
        bbox.x0 + Math.round(bbox.width * (11 / 16)),
        bbox.y0 + Math.round(bbox.height * (i / 16)),
      ];
      this.#drawer.drawLine(point1, point2, barsOutline, 2);
    }
  }

  /// BARS DOOR

  /* --- METHOS: drawBarsDoor --- */
  drawBarsDoor(bbox, outline, barsOutline, frontFill, handleFill) {
    // draw front
    const frontPolyline = new Polyline();
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width / 8),
      bbox.y0 + Math.round(bbox.height / 16)
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (7 / 8)),
      bbox.y0 + Math.round(bbox.height / 16)
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (7 / 8)),
      bbox.y0 + Math.round(bbox.height * (15 / 16))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (1 / 8)),
      bbox.y0 + Math.round(bbox.height * (15 / 16))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width / 8),
      bbox.y0 + Math.round(bbox.height / 16)
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height / 8)
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height * (7 / 8))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (13 / 16)),
      bbox.y0 + Math.round(bbox.height * (7 / 8))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (13 / 16)),
      bbox.y0 + Math.round(bbox.height / 8)
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height / 8)
    );
    this.#drawer.drawPolygon(frontPolyline, frontFill, frontFill, 2);

    // front outer outline
    const frontOuterOutlineBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width / 8) - 1,
      bbox.y0 + Math.round(bbox.height / 16) - 1,
      Math.round(bbox.width * (3 / 4)) + 2,
      Math.round(bbox.height * (14 / 16)) + 2
    );
    this.#drawer.drawRectangle(frontOuterOutlineBBox, outline, null, 2);

    // front inner outline
    const frontInnerOutlineBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (3 / 16)) + 1,
      bbox.y0 + Math.round(bbox.height / 8) + 1,
      Math.round(bbox.width * (10 / 16)) - 2,
      Math.round(bbox.height * (6 / 8)) - 2
    );
    this.#drawer.drawRectangle(frontInnerOutlineBBox, outline, null, 2);

    // draw bars
    for (let i = 5; i <= 11; i += 2) {
      // vertical bars
      const point1 = [
        bbox.x0 + Math.round(bbox.width * (i / 16)),
        bbox.y0 + Math.round(bbox.height / 8) + 1,
      ];
      const point2 = [
        bbox.x0 + Math.round(bbox.width * (i / 16)),
        bbox.y0 + Math.round(bbox.height * (7 / 8)) - 2,
      ];
      this.#drawer.drawLine(point1, point2, barsOutline, 2);
    }

    // draw handle
    const handleBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width / 8) + 3,
      bbox.y0 + Math.round(bbox.height / 2) - 1,
      Math.round(bbox.width / 8) - 3,
      3
    );
    this.#drawer.drawRectangle(handleBBox, outline, handleFill, 2);
  }

  /// FRAME DOOR

  /* --- METHOS: drawFrameDoor --- */
  drawFrameDoor(bbox, outline, frontFill, insideFill) {
    // draw inside
    const insideBBox = new BoundingBox(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height * (2 / 16)) + 1,
      Math.round(bbox.width * (10 / 16)),
      Math.round(bbox.width * (12 / 16)) + 1
    );
    this.#drawer.fillRectangle(insideBBox, insideFill);

    // draw front
    const frontPolyline = new Polyline();
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height * (2 / 16))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (13 / 16)),
      bbox.y0 + Math.round(bbox.height * (2 / 16))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (13 / 16)),
      bbox.y0 + Math.round(bbox.height * (14 / 16))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (12 / 16)) - 1,
      bbox.y0 + Math.round(bbox.height * (14 / 16))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (12 / 16)) - 1,
      bbox.y0 + Math.round(bbox.height * (3 / 16)) + 1
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (4 / 16)) + 1,
      bbox.y0 + Math.round(bbox.height * (3 / 16)) + 1
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (4 / 16)) + 1,
      bbox.y0 + Math.round(bbox.height * (14 / 16))
    );
    frontPolyline.addPoint(
      bbox.x0 + Math.round(bbox.width * (3 / 16)),
      bbox.y0 + Math.round(bbox.height * (14 / 16))
    );
    this.#drawer.drawPolygon(frontPolyline, outline, frontFill, 2);
  }

  /// TERMINAL DOOR

  /* --- METHOS: drawFancyDoor --- */
  drawTerminalDoor(bbox, outline, frontFill, windowFill, handleFill) {
    this.drawPlainDoor(bbox, outline, frontFill, windowFill, handleFill);
  }

  /// FANCY DOOR

  /* --- METHOS: drawFancyDoor --- */
  drawFancyDoor(bbox, outline, frontFill, windowFill, handleFill) {
    // draw front
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

    // draw gap between doors
    const point1 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + Math.round(bbox.height / 8),
    ];
    const point2 = [
      bbox.x0 + Math.round(bbox.width / 2),
      bbox.y0 + bbox.height - 1 - Math.round(bbox.height / 10),
    ];
    this.#drawer.drawLine(point1, point2, outline, 2);

    // draw windows
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

    // draw handles
    x0 = bbox.x0 + Math.round(bbox.width * (5 / 16));
    width = Math.round(bbox.width / 10);
    y0 = bbox.y0 + Math.round(bbox.height * (5 / 8));
    height = Math.round(bbox.height / 8);
    let handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
    // only x0 changes in the second handle
    x0 += Math.round(bbox.width / 4) + 2;
    handleBBox = new BoundingBox(x0, y0, width, height);
    this.#drawer.drawCircle(handleBBox, outline, handleFill, 2);
  }
};
