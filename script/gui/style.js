/* --- IMPORTS --- */
import { ETypeError, ERangeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { Style as default };
export { DoorStyle, CellStyle, RoomStyle, PlayerStyle };

/*
 * CLASS: Style
 *****************************************************************************/
// TODO: Is this class really needed?
const Style = class {
  /* --- METHOD: validateColor --- */
  static validateColor(color) {
    // validate CSS color
    var s = new Option().style;
    s.color = color;
    // if (s.color == "") {
    //   console.log(color);
    // }
    if (s.color === "") {
      throw new ETypeError("input is not a valid color", color);
    }
  }

  /* --- METHOD: validateShape --- */
  static validateShape(shape) {
    if (shape !== "rectangle" && shape != "circle") {
      throw new ETypeError("input is not a valid shape", shape);
    }
  }
};

/*
 * CLASS: DoorStyle
 *****************************************************************************/
const DoorStyle = class extends Style {
  /* --- C'TOR: constructor --- */
  constructor(outline, frontfill, windowfill, handlefill) {
    Style.validateColor(outline);
    Style.validateColor(frontfill);
    Style.validateColor(windowfill);
    Style.validateColor(handlefill);

    super();
    this.outline = outline;
    this.frontfill = frontfill;
    this.windowfill = windowfill;
    this.handlefill = handlefill;
  }
};

/*
 * CLASS: CellStyle
 *****************************************************************************/
const CellStyle = class extends Style {
  /* --- C'TOR: constructor --- */
  constructor(outline, cascadeoutline, cascadeshape, mark) {
    Style.validateColor(outline);
    Style.validateColor(cascadeoutline);
    Style.validateShape(cascadeshape);
    if (mark !== null) {
      Style.validateColor(mark);
    }

    super();
    this.outline = outline;
    this.cascadeoutline = cascadeoutline;
    this.cascadeshape = cascadeshape;
    this.mark = mark;
  }
};

/*
 * CLASS: RoomStyle
 *****************************************************************************/
const RoomStyle = class extends Style {
  /* --- C'TOR: constructor --- */
  constructor(outline, background) {
    Style.validateColor(outline);
    Style.validateColor(background);

    super();
    this.outline = outline;
    this.background = background;
  }
};

/*
 * CLASS: PlayerStyle
 *****************************************************************************/
const PlayerStyle = class extends Style {
  /* --- C'TOR: constructor --- */
  constructor(scale, outline, fill) {
    if (typeof scale !== "number") {
      throw new ETypeError(`input is not a number`, scale);
    }
    if (scale <= 0.0 || scale > 1.0) {
      throw new ERangeError(
        `scale is not in the range (${0.0}, ${1.0}]`,
        scale
      );
    }
    Style.validateColor(outline);
    if (!Array.isArray(fill) || fill.length !== 2) {
      throw new ETypeError(`fill is not an array of length 2`, fill);
    }
    Style.validateColor(fill[0]);
    if (fill[1] !== null) {
      Style.validateColor(fill[1]);
    }

    super();
    this.scale = scale;
    this.outline = outline;
    this.fill = fill;
  }
};
