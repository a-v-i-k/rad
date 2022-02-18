/* --- EXPORTS --- */
export { ETypeError, ERangeError, RuntimeError, StateError };

/*
 * ERROR: ETypeError
 *****************************************************************************/
// NOTE: prefix E = Extended
const ETypeError = class extends TypeError {
  /* --- C'TOR: constructor --- */
  constructor(message, input, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this.input = input;
  }
};

/*
 * ERROR: ERangeError
 *****************************************************************************/
// NOTE: prefix E = Extended
const ERangeError = class extends RangeError {
  /* --- C'TOR: constructor --- */
  constructor(message, input, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this.input = input;
  }
};

/*
 * ERROR: RuntimeError
 *****************************************************************************/
const RuntimeError = class extends Error {
  /* --- C'TOR: constructor --- */
  constructor(message, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this.name = "RuntimeError";
  }
};

/*
 * ERROR: StateError
 *****************************************************************************/
const StateError = class extends Error {
  /* --- C'TOR: constructor --- */
  constructor(message, state, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this.name = "StateError";
    this.state = state;
  }
};
