/*
 * CLASS: LinkedList
 *****************************************************************************/
const LinkedList = class {  

  /* --- INNER-CLASS: Node --- */
  static Node = class {
    constructor(data, next = null, prev = null) {
      this.data = data;
      this.next = next;
      this.prev = prev;
    }
  }

  /* --- LinkedList: constructor --- */
  constructor() {
    this.clear();
  }

  /* --- LinkedList: clear --- */
  clear() {
    this.head = this.tail = null;
    this.size = 0;
  }

  /* --- LinkedList: isEmpty --- */
  isEmpty() {
    return this.size == 0;
  }

  /* --- LinkedList: pushFront --- */
  pushFront(data) {
    const newNode = new LinkedList.Node(data, this.head, null);
    if (this.isEmpty()) {
      this.head = this.tail = newNode;
    } else {
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
  }

  /* --- LinkedList: pushBack --- */
  pushBack(data) {
    const newNode = new LinkedList.Node(data, null, this.head);
    if (this.isEmpty()) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
  }

  /* --- LinkedList: peekFront --- */
  peekFront() {
    if (this.isEmpty()) {
      throw new LinkedListEmptyError(`trying to access an empty list`);
    }
    return this.head.data;
  }

  /* --- LinkedList: peekBack --- */
  peekBack() {
    if (this.isEmpty()) {
      throw new LinkedListEmptyError(`trying to access an empty list`);
    }
    return this.tail.data;
  }

  /* --- LinkedList: popFront --- */
  popFront() {
    if (this.isEmpty()) {
      throw new LinkedListEmptyError(`cannot pop an empty list`)
    }
    const data = this.head.data;
    this.head = this.head.next;
    if (this.head == null) {
      this.tail = null;
    } else {
      this.head.prev = null;
    }
    this.size--;
    return data;
  }

  /* --- LinkedList: popBack --- */
  popBack() {
    if (this.isEmpty()) {
      throw new LinkedListEmptyError(`cannot pop an empty list`)
    }
    const data = this.tail.data;
    this.tail = this.tail.prev;
    if (this.tail == null) {
      this.head = null;
    } else {
      this.tail.next = null;
    }
    this.size--;
    return data;
  }
};

export default LinkedList;


/*
 * EXCEPTIONS
 *****************************************************************************/

/* --- LinkedListEmptyError --- */
const LinkedListEmptyError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "LinkedListEmptyError";
  }
};
