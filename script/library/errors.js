/* --- EXPORTS --- */
export { ETypeError, ValueError, ERangeError, RuntimeError, StatusError };

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
 * ERROR: ValueError
 *****************************************************************************/
const ValueError = class extends Error {
  /* --- C'TOR: constructor --- */
  constructor(message, value, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this.name = "ValueError";
    this.value = value;
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
 * ERROR: StatusError
 *****************************************************************************/
const StatusError = class extends Error {
  /* --- C'TOR: constructor --- */
  constructor(message, status, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this.name = "StatusError";
    this.status = status;
  }
};
