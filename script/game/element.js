/* --- EXPORTS --- */
export { Element as default };

/*
 * CLASS: Element
 *****************************************************************************/
const Element = class {
  static #idCounter = 1;
  #id;

  /* --- C'TOR: constructor --- */
  constructor() {
    this.#id = Element.#idCounter++;
  }

  /* --- METHOD: getId --- */
  getId() {
    return this.#id;
  }
};
