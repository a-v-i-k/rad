/* --- IMPORTS --- */
import Random from "../library/random.js";
import Game from "../game/game.js";
import Location from "../game/location.js";
import Direction from "../game/direction.js";
import Displayer from "./displayer.js";
import Stopwatch from "./stopwatch.js";
import RandyManager from "./randy-manager.js";
import RandomPath from "./random-path.js";
import { ETypeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { GUI as default };

/* --- ENUM: GUIStatus --- */
const GUIStatus = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
  PATH: "PATH",
  PAUSE: "PAUSE",
  REWARD: "REWARD",
  // TODO: Merge TIMEUP and RANDYDONE statuss into one ANNOUNCEMENT status?
  TIMEUP: "TIMEUP",
  RANDYDONE: "RANDYDONE",
  QUIT: "QUIT",
};
Object.freeze(GUIStatus);

/* --- DEFAULTS --- */
const DEFAULT_UNDO = true;
const DEFAULT_CLOCK = true;
const DEFAULT_RANDY = true;
const DEFAULT_SOUND = true;

/* --- CONSTANTS --- */
const TITLE_HEADER_TEXT = "25 Rooms"; // "The RAD Game"; // "Memory Lane";

const CELL_WIDTH = 60;
const CELL_HEIGHT = 60;

const CLOCK_IDLE_FG = "gray";
const CLOCK_COUNT_FG = "lime";

const MAX_NUM_RANDYS = 10;

const PLAYER_DELAY = 200; // in milliseconds

/*
 * CLASS: GUI [UML]
 *****************************************************************************/
// TODO: Split into smaller classes.
const GUI = class {
  #status;
  #master;
  #slave;
  #cfgn;
  #game;
  #displayer;
  #stopwatch;
  #randy;
  #html;
  #callbacks;
  #rpath;
  #backup;

  /* --- INNER: Status --- */
  static Status = GUIStatus;

  /* --- C'TOR: constructor --- */
  constructor(
    master,
    undo = DEFAULT_UNDO,
    clock = DEFAULT_CLOCK,
    randy = DEFAULT_RANDY,
    sound = DEFAULT_SOUND
  ) {
    GUI.#validator(master, undo, clock, randy, sound);
    this.#master = master; // slave to be set later...

    // configuration
    this.#cfgn = {
      undo: undo,
      clock: clock,
      randy: randy,
      sound: sound,
    };

    this.#game = new Game(); // game
    this.#stopwatch = null;
    this.#randy = null;

    // setting
    this.#setStatus(GUI.Status.IDLE); // status
    // TODO: HTMLManager class?
    this.#setHTML(); // HTML elements
    this.#setWidgets(); // GUI widgets
    this.#setDisplay(); // display

    this.#callbacks = {};
    this.#bindEvents(); // events

    this.#rpath = null;

    this.#displayer.displayIdle();

    this.#backup = {}; // look at me, I'm so ugly
  }

  /* --- D'TOR: #destroctur --- */
  #destroctur() {
    console.assert(this.getStatus() === GUI.Status.QUIT); // sanity check
    this.#unbindEvents();
    this.#unsetWidgets();
    this.#html = null;
  }

  /// VALIDATION

  /* --- METHOD: #validator --- */
  static #validator(master, undo, clock, randy, sound) {
    if (!(master instanceof HTMLElement)) {
      throw new ETypeError(`master is not an HTML element`, master);
    }
    if (typeof undo !== "boolean") {
      throw new ETypeError(`input is not a boolean`, undo);
    }
    if (typeof clock !== "boolean") {
      throw new ETypeError(`input is not a boolean`, clock);
    }
    if (typeof randy !== "boolean") {
      throw new ETypeError(`input is not a boolean`, randy);
    }
    if (typeof sound !== "boolean") {
      throw new ETypeError(`input is not a boolean`, sound);
    }
  }

  /* --- METHOD: #refresh --- */
  #refresh() {
    this.#displayer.displayPlay();
  }

  /// GETTERS

  /* --- METHOD: getStatus --- */
  getStatus() {
    return this.#status;
  }

  /* --- METHOD: #setStatus --- */
  #setStatus(status) {
    console.assert(status in GUI.Status); // sanity check
    this.#status = status;
  }

  /* --- METHOD: #CFGN --- */
  #CFGN() {
    return this.#cfgn;
  }

  /* --- METHOD: #HTML --- */
  #HTML() {
    return this.#html;
  }

  /* --- METHOD: #getNumRandys --- */
  #getNumRandys() {
    const value = this.#HTML().randy.control.value;
    if (value === "None") {
      return 0;
    } else {
      return parseInt(value);
    }
  }

  /// SETTING

  /* --- METHOD: #setHTML --- */
  #setHTML() {
    this.#html = {
      // top
      top: { frame: document.querySelector("#top-frame") },

      // title
      title: {
        frame: document.querySelector("#title-frame"),
        header: document.querySelector("#title-header"),
      },

      // panel
      panel: {
        frame: document.querySelector("#panel-frame"),
        play: document.querySelector("#play"),
        pause: document.querySelector("#pause"),
        reset: document.querySelector("#reset"),
        stop: document.querySelector("#stop"),
      },

      // display
      display: {
        frame: document.querySelector("#display-frame"),
      },

      // clock
      clock: {
        frame: document.querySelector("#clock-frame"),
        watch: document.querySelector("#clock-watch"),
      },

      // randy
      randy: {
        frame: document.querySelector("#randy-frame"),
        control: document.querySelector("#randy-control"),
      },

      // sound
      sound: {
        start: document.querySelector("#start"),
        enter: document.querySelector("#enter"),
        pause: document.querySelector("#pause-sound"),
        randydone: document.querySelector("#randy-done"),
        triumph: document.querySelector("#triumph"),
      },
    };
    this.#slave = this.#HTML().top.frame; // slave
  }

  /* --- METHOD: #setWidgets --- */
  #setWidgets() {
    this.#setTop(); // top
    this.#setTitle(); // title
    this.#setPanel(); // panel
    this.#setStopwatch(); // clock
    this.#setRandyControl(); // randy
  }

  /* --- METHOD: #unsetWidgets --- */
  #unsetWidgets() {
    // simply remove top frame's HTML element from DOM (can be restored!)
    // TODO: Maybe display something when quitting?
    this.#master.removeChild(this.#slave);
    // this.#master.appendChild(this.#slave); // to restore
  }

  /* --- METHOD: #setTop --- */
  #setTop() {
    // nothing to do here...
  }

  /* --- METHOD: #setTitle --- */
  #setTitle() {
    // TODO: Separate titles.
    document.querySelector("title").innerText = TITLE_HEADER_TEXT; // page title
    this.#HTML().title.header.innerText = TITLE_HEADER_TEXT;
  }

  /* --- METHOD: #setPanel --- */
  #setPanel() {
    // nothing to do here...
  }

  /* --- METHOD: #setStopwatch --- */
  #setStopwatch() {
    if (this.#CFGN().clock) {
      // create new stopwatch object
      this.#stopwatch = new Stopwatch();

      // html stuff
      this.#HTML().clock.watch.style.color = CLOCK_IDLE_FG;
    } else {
      this.#HTML().top.frame.removeChild(this.#HTML().clock.frame);
      // this.#HTML().panel.frame.style.gridRow = "2 / 5"; [AK]
      // this.#HTML().display.frame.style.gridRow = "2 / 5"; [AK]
    }
  }

  /* --- METHOD: #setRandyControl --- */
  #setRandyControl() {
    if (this.#CFGN().randy) {
      // create new Randy object
      this.#randy = new RandyManager(
        this.#game,
        () => this.#refresh(),
        (index) => {
          this.#unset();
          this.#randyIsDone(index);
        }
      );

      // html stuff
      for (let i = 1; i <= MAX_NUM_RANDYS; i++) {
        let option = document.createElement("option");
        option.setAttribute("value", `${i}`);
        option.innerText = `${i}`;
        if (i == 1) {
          option.setAttribute("selected", true);
        }
        this.#HTML().randy.control.appendChild(option);
      }
    } else {
      this.#HTML().top.frame.removeChild(this.#HTML().randy.frame);
    }
  }

  /* --- METHOD: #setDisplay --- */
  #setDisplay() {
    // displayer
    this.#displayer = new Displayer(
      this.#HTML().display.frame,
      this.#game,
      CELL_WIDTH,
      CELL_HEIGHT
    );
  }

  /* --- METHOD: #setClock --- */
  #setClock() {
    if (!this.#CFGN().clock) return;
    this.#stopwatchStart();
  }

  /* --- METHOD: #unsetClock --- */
  #unsetClock() {
    if (!this.#CFGN().clock) return;
    this.#stopwatchStop();
  }

  /* --- METHOD: #setRandy --- */
  #setRandy() {
    if (!this.#CFGN().randy) return;
    this.#HTML().randy.control.disabled = true;
    this.#randyStart();
  }

  /* --- METHOD: #unsetRandy --- */
  #unsetRandy() {
    if (!this.#CFGN().randy) return;
    this.#HTML().randy.control.disabled = false;
    this.#randyStop();
  }

  /* --- METHOD: #set --- */
  #set() {
    let numPlayers;
    if (this.#CFGN().randy) {
      numPlayers = 1 + this.#getNumRandys();
    } else {
      numPlayers = 1;
    }
    this.#game.play(numPlayers);

    this.#setClock();
    this.#setRandy();

    this.#displayer.displayPlay();

    this.#playSound(this.#HTML().sound.start);
  }

  /* --- METHOD: #unset --- */
  #unset() {
    this.#unsetRandy();
    this.#unsetClock();
    if (this.getStatus() === GUI.Status.PATH && this.#rpath !== null) {
      this.#rpath.cancel();
    }
    if (this.#game.getStatus() === Game.Status.PLAYING) {
      this.#game.stop();
    }
    // this.#displayer.clearStyles(); TODO: Needed?
  }

  /// EVENTS
  // TODO: Move to EventManager class...

  /* --- METHOD: #bindEvents --- */
  #bindEvents() {
    // window
    this.#callbacks.keydown = (event) => {
      if (this.getStatus() === GUI.Status.PAUSE) return;

      switch (event.key) {
        // game events
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "ArrowDown":
          this.#playerMove(event);
          break;

        case "Enter":
          this.#playerInspect();
          break;

        case "Backspace":
          if (this.#CFGN().undo) {
            this.#playerUndo();
          } else {
            console.log("Undo is off.");
          }
          break;

        // keyboard shortcuts
        case "p":
          this.#play();
          break;
        case " ":
          this.#pause();
          break;
        case "r":
          this.#reset();
          break;
        case "s":
          this.#stop();
          break;
        case "q":
          this.#quit();
          break;

        case "c":
          const state = this.#game.getState(0);
          console.log(state.doors);
          this.#playerGoTo(Random.getRandomChoice(state.doors).loc);
          break;

        default:
        // nothing to do here...
      }
    };
    window.addEventListener("keydown", this.#callbacks.keydown);

    // play button
    this.#callbacks.play = () => {
      // this.#HTML().panel.play.blur(); // take back focus
      if (this.getStatus() === GUI.Status.PAUSE) {
        this.#resume();
      } else {
        this.#play();
      }
    };
    this.#HTML().panel.play.addEventListener("click", this.#callbacks.play);

    // pause button
    this.#callbacks.pause = () => {
      // this.#HTML().panel.pause.blur(); // take back focus
      if (this.getStatus() !== GUI.Status.PAUSE) {
        this.#pause();
      }
    };
    this.#HTML().panel.pause.addEventListener("click", this.#callbacks.pause);

    // reset button
    this.#callbacks.reset = () => {
      // this.#HTML().panel.reset.blur(); // take back focus
      if (this.getStatus() === GUI.Status.PAUSE) {
        this.#resume();
      }
      this.#reset();
    };
    this.#HTML().panel.reset.addEventListener("click", this.#callbacks.reset);

    // stop button
    this.#callbacks.stop = () => {
      // this.#HTML().panel.stop.blur(); // take back focus
      if (this.getStatus() === GUI.Status.PAUSE) {
        this.#resume();
      }
      this.#stop();
    };
    this.#HTML().panel.stop.addEventListener("click", this.#callbacks.stop);

    // (mouse) click
    this.#HTML().display.frame.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        if (this.getStatus() === GUI.Status.PAUSE) {
          this.#resume();
        } else if (this.getStatus() === GUI.Status.REWARD) {
          this.#displayer.displayRandomQuote();
          return;
        } else if (this.getStatus() !== GUI.Status.PLAYING) {
          return;
        }
        this.#clientGoTo(event.clientX, event.clientY);
      },
      false
    );

    // touch
    var lastMove = null;
    this.#HTML().display.frame.addEventListener(
      "touchstart",
      (event) => {
        event.preventDefault();
        lastMove = event;
      },
      false
    );
    this.#HTML().display.frame.addEventListener(
      "touchmove",
      (event) => {
        event.preventDefault();
        lastMove = event;
      },
      false
    );
    this.#HTML().display.frame.addEventListener(
      "touchend",
      (event) => {
        event.preventDefault();
        if (this.getStatus() === GUI.Status.PAUSE) {
          this.#resume();
        } else if (this.getStatus() === GUI.Status.REWARD) {
          this.#displayer.displayRandomQuote();
          return;
        } else if (this.getStatus() !== GUI.Status.PLAYING) {
          return;
        }
        this.#clientGoTo(
          lastMove.targetTouches[0].clientX,
          lastMove.targetTouches[0].clientY
        );
      },
      false
    );
  }

  /* --- METHOD: #clientGoTo --- */
  #clientGoTo(clientX, clientY) {
    const rect = this.#HTML().display.frame.getBoundingClientRect();

    let posX = clientX - rect.left;
    let posY = clientY - rect.top;

    // refine touches
    const width = this.#displayer.getWidth(),
      height = this.#displayer.getHeight();
    if (posX < 0 || posX >= width) return;
    if (posY < 0 || posY >= height) return;
    posX = Math.round(posX);
    posY = Math.round(posY);

    let locX = Math.floor(posX / CELL_WIDTH),
      locY = Math.floor(posY / CELL_HEIGHT);
    this.#playerGoTo(new Location(locX, locY));
  }

  /* --- METHOD: #unbindEvents --- */
  #unbindEvents() {
    // window
    window.removeEventListener("keydown", this.#callbacks.keydown);

    // PRSQ
    this.#HTML().panel.play.removeEventListener("click", this.#callbacks.play);
    this.#HTML().panel.pause.removeEventListener(
      "click",
      this.#callbacks.pause
    );
    this.#HTML().panel.reset.removeEventListener(
      "click",
      this.#callbacks.reset
    );
    this.#HTML().panel.stop.removeEventListener("click", this.#callbacks.stop);
  }

  /// PRSQ = Play, Reset, Stop, Quit

  /* --- METHOD: #play --- */
  #play() {
    const status = this.getStatus();
    if (status === GUI.Status.PLAYING || status === GUI.Status.PATH) return;

    this.#set();
    this.#setStatus(GUI.Status.PLAYING);
  }

  /* --- METHOD: #pause --- */
  #pause() {
    const status = this.getStatus();
    if (!(status === GUI.Status.PLAYING || status === GUI.Status.PATH)) return;

    // clock
    if (this.#CFGN().clock) {
      this.#stopwatch.pause();
      this.#backup.stopwatchForeground = this.#HTML().clock.watch.style.color;
      this.#HTML().clock.watch.style.color = CLOCK_IDLE_FG;
    }

    // randy
    if (this.#CFGN().randy) {
      this.#randy.pause();
    }

    // events
    this.#callbacks.space = (event) => {
      if (event.key == " " || event.key == "p") {
        this.#resume();
      } else if (event.key == "r") {
        this.#resume();
        this.#reset();
      } else if (event.key == "s") {
        this.#resume();
        this.#stop();
      } else if (event.key == "q") {
        this.#resume();
        this.#quit();
      }
    };
    window.addEventListener("keydown", this.#callbacks.space);

    this.#displayer.displayPause(); // pause message

    this.#playSound(this.#HTML().sound.pause);

    this.#setStatus(GUI.Status.PAUSE);
  }

  /* --- METHOD: #resume --- */
  #resume() {
    console.assert(this.getStatus() === GUI.Status.PAUSE); // sanity check

    if (this.#CFGN().sound) {
      // stop pause sound
      const pauseSound = this.#HTML().sound.pause;
      const temp = pauseSound.src;
      pauseSound.src = "";
      pauseSound.src = temp;
    }

    // events
    window.removeEventListener("keydown", this.#callbacks.space);
    // this.#bindEvents();

    // clock
    if (this.#CFGN().clock) {
      this.#HTML().clock.watch.style.color = this.#backup.stopwatchForeground;
      this.#stopwatch.resume();
    }

    // randy
    if (this.#CFGN().randy) {
      this.#randy.resume();
    }

    this.#refresh();
    this.#setStatus(GUI.Status.PLAYING);
  }

  /* --- METHOD: #reset --- */
  #reset() {
    if (this.getStatus() === GUI.Status.IDLE) return;
    this.#unset();
    this.#set();
    this.#setStatus(GUI.Status.PLAYING);
  }

  /* --- METHOD: #stop --- */
  #stop() {
    if (this.getStatus() === GUI.Status.IDLE) return;
    this.#unset();
    this.#displayer.displayIdle();
    this.#setStatus(GUI.Status.IDLE);
  }

  /* --- METHOD: #quit --- */
  #quit() {
    const status = this.getStatus();
    if (status === GUI.Status.PLAYING || status === GUI.Status.PATH) {
      this.#unset();
    }
    this.#setStatus(GUI.Status.QUIT);
    this.#destroctur();
  }

  /// PLAYER

  /* --- METHOD: #playerMove --- */
  #playerMove(event) {
    if (this.getStatus() !== GUI.Status.PLAYING) return;

    let direction;
    switch (event.key) {
      case "ArrowLeft":
        direction = Direction.LEFT;
        break;
      case "ArrowRight":
        direction = Direction.RIGHT;
        break;
      case "ArrowUp":
        direction = Direction.UP;
        break;
      case "ArrowDown":
        direction = Direction.DOWN;
        break;
      default:
        console.assert(false); // sanity check
    }

    this.#game.playerMove(0, direction);
    this.#refresh();
  }

  /* --- METHOD: #playerInspect --- */
  #playerInspect() {
    if (this.getStatus() !== GUI.Status.PLAYING) return;

    const prevRoomId = this.#game.getState(0).room.id;
    if (this.#game.playerInspect(0)) {
      this.#unset();
      this.#playerWon();
    } else {
      if (this.#game.getState(0).room.id !== prevRoomId) {
        this.#playSound(this.#HTML().sound.enter);
      }
      this.#refresh();
    }
  }

  /* --- METHOD: #playerUndo --- */
  #playerUndo() {
    if (this.getStatus() !== GUI.Status.PLAYING) return;

    this.#game.playerBacktrack(0);
    this.#playSound(this.#HTML().sound.enter);
    this.#refresh();
  }

  /* --- METHOD: #playerWon --- */
  #playerWon() {
    this.#playSound(this.#HTML().sound.triumph);
    this.#rewardPlayer();
  }

  /* --- METHOD: #rewardPlayer --- */
  #rewardPlayer() {
    this.#displayer.displayRandomQuote();
    this.#setStatus(GUI.Status.REWARD);
  }

  /* --- METHOD: #playerGoTo --- */
  #playerGoTo(dst) {
    console.assert(dst instanceof Location); // sanity check
    this.#setStatus(GUI.Status.PATH);
    const src = this.#game.getState(0).player.loc;
    this.#rpath = new RandomPath(
      PLAYER_DELAY,
      src,
      dst,
      (direction) => {
        this.#game.playerMove(0, direction);
        this.#refresh();
      },
      () => {
        this.#setStatus(GUI.Status.PLAYING);
        this.#playerInspect();
      }
    );
  }

  /// CLOCK

  /* --- METHOD: #stopwatchStart --- */
  #stopwatchStart() {
    const stopwatchStr = GUI.#getWatchTimeString(0);
    const clockWatch = this.#HTML().clock.watch;
    clockWatch.innerText = stopwatchStr;
    clockWatch.style.color = CLOCK_COUNT_FG;
    this.#stopwatch.start(
      1000, // 1 second
      (time) => {
        this.#HTML().clock.watch.innerText = GUI.#getWatchTimeString(time);
      }
    );
  }

  /* --- METHOD: #stopwatchStop --- */
  #stopwatchStop() {
    this.#stopwatch.stop();
    const clockWatch = this.#HTML().clock.watch;
    clockWatch.innerText = "00:00"; // [AK]
    clockWatch.style.color = CLOCK_IDLE_FG;
  }

  /* --- METHOD: #getWatchTimeString --- */
  static #getWatchTimeString(milliseconds) {
    const date = new Date(0, 0, 0, 0, 0, 0, milliseconds);
    const MM = Number(date.getMinutes()).toString().padStart(2, "0");
    const SS = Number(date.getSeconds()).toString().padStart(2, "0");
    return MM + ":" + SS;
  }

  /// RANDY

  /* --- METHOD: #randyStart --- */
  #randyStart() {
    const numRandys = this.#getNumRandys();
    if (numRandys > 0) {
      this.#randy.start(numRandys);
    }
  }

  /* --- METHOD: #randyStop --- */
  #randyStop() {
    if (this.#getNumRandys() > 0) {
      this.#randy.halt();
    }
  }

  /* --- METHOD: #randyIsDone --- */
  #randyIsDone(index) {
    // TODO: do something with index?
    this.#playSound(this.#HTML().sound.randydone);
    this.#displayer.announce("Randy is done :()");
    this.#setStatus(GUI.Status.RANDYDONE);
  }

  /// SOUND
  #playSound(audio) {
    console.assert(audio instanceof HTMLElement && audio.tagName === "AUDIO"); // sanity check
    if (this.#CFGN().sound) {
      audio.play(); // sound
    }
  }
};
