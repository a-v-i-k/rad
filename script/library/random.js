/*
 * CLASS: Random
 *****************************************************************************/
const Random = class {
  /* --- Random: getRandomUniform --- */
  static getRandomUniform(min, max) {
    validateRange(min, max);
    return Math.random() * (max - min) + min;
  }

  /* --- Random: getRandomInteger [maximum is exclusive] --- */
  static getRandomInteger(min, max) {
    validateRange(min, max);
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  /* --- Random: getRandomChoice --- */
  static getRandomChoice(array) {
    validateArray(array);
    const randomIndex = Random.getRandomInteger(0, array.length);
    return array[randomIndex];
  }

  /* --- Random: getRandomChoices --- */
  static getRandomChoices(array, size) {
    validateArray(array);
    if (!Number.isInteger(size)) {
      throw TypeError(`sample size must be an integer`);
    }
    if (size < 0 || size > array.length) {
      const message = `sample size cannot be negative or larger than population`;
      throw RangeError(message);
    }

    const temp = [];
    for (const item of array) {
      temp.push(item);
    }
    Random.shuffleArray(temp);
    return temp.slice(0, size);
  }

  /* --- Random: shuffleArray --- */
  static shuffleArray(array) {
    validateArray(array);

    // Knuth shuffle
    for (let i = 0; i < array.length - 1; i++) {
      swap(array, i, i + Random.getRandomInteger(0, array.length - i));
    }
  }

  /* --- Random: getRandomHex --- */
  static getRandomHex() {
    return Random.getRandomInteger(0, 16).toString(16);
  }

  /* --- Random: getRandomColor --- */
  // static getRandomColor = () =>
  //   "#" + Math.floor(Math.random() * 16777215).toString(16);
  static getRandomColor() {
    const gRH = Random.getRandomHex;
    return "#" + gRH() + gRH() + gRH() + gRH() + gRH() + gRH();
  }
};

export default Random;

/*
 * AUXILIARY
 *****************************************************************************/

/* --- validateRange --- */
function validateRange(min, max) {
  if (typeof min != "number" || typeof max != "number") {
    throw TypeError(`min and max should be numbers`);
  }
  if (min > max) {
    throw RangeError(`min cannot exceed than max`);
  }
}

/* --- validateArray --- */
const validateArray = function (obj) {
  if (!Array.isArray(obj)) {
    const message = `input ${JSON.stringify(obj)} is not an Array object`;
    throw TypeError(message);
  }
};

/* --- swap --- */
const swap = function (array, i, j) {
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
};
