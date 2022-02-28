/* --- IMPORTS --- */
import Random from "../library/random.js";
import Game from "../game/game.js";
import Location from "../game/location.js";
import Direction from "../game/direction.js";
import Displayer from "./displayer.js";
import Timer from "./timer.js";
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
const DEFAULT_BACKTRACK = true; // undo
const DEFAULT_MARK = true;
const DEFAULT_TIMER = true;
const DEFAULT_RANDY = true;
const DEFAULT_SOUND = true;

/* --- CONSTANTS --- */
const TITLE_HEADER_TEXT = "25 Rooms"; // "The RAD Game"; // "Memory Lane";

const CELL_WIDTH = 60;
const CELL_HEIGHT = 60;

const TIMER_IDLE_FG = "gray";
const TIMER_START_TIME = 90; // in seconds
const TIMER_ALERT_TIME = 5; // in seconds
const TIMER_COUNT_FG = "lime";
const TIMER_ALERT_FG = "red";

const MAX_NUM_RANDYS = 10;

const PLAYER_DELAY = 200; // in milliseconds

/*
 * CLASS: GUI [UML]
 *****************************************************************************/
const GUI = class {
  #status;
  #master;
  #slave;
  #cfgn;
  #game;
  #displayer;
  #timer;
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
    backtrack = DEFAULT_BACKTRACK,
    mark = DEFAULT_MARK,
    timer = DEFAULT_TIMER,
    randy = DEFAULT_RANDY,
    sound = DEFAULT_SOUND
  ) {
    GUI.#validator(master, backtrack, mark, timer, randy, sound);
    this.#master = master; // slave to be set later...

    // configuration
    this.#cfgn = {
      backtrack: backtrack,
      mark: mark,
      timer: timer,
      randy: randy,
      sound: sound,
    };

    this.#game = new Game(); // game
    this.#timer = null;
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
  static #validator(master, backtrack, mark, timer, randy, sound) {
    if (!(master instanceof HTMLElement)) {
      throw new ETypeError(`master is not an HTML element`, master);
    }
    if (typeof backtrack !== "boolean") {
      throw new ETypeError(`input is not a boolean`, backtrack);
    }
    if (typeof mark !== "boolean") {
      throw new ETypeError(`input is not a boolean`, mark);
    }
    if (typeof timer !== "boolean") {
      throw new ETypeError(`input is not a boolean`, timer);
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

      // timer
      timer: {
        frame: document.querySelector("#timer-frame"),
        watch: document.querySelector("#timer-watch"),
        checkbox: document.querySelector("#timer-checkbox"),
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
        timeup: document.querySelector("#time-is-up"),
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
    this.#setTimerWatch(); // timer
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

  /* --- METHOD: #setTimerWatch --- */
  #setTimerWatch() {
    if (this.#CFGN().timer) {
      // create new timer object
      this.#timer = new Timer();

      // html stuff
      if (this.#HTML().timer.checkbox.checked) {
        this.#HTML().timer.watch.style.color = TIMER_IDLE_FG;
      }
    } else {
      this.#HTML().top.frame.removeChild(this.#HTML().timer.frame);
      // this.#HTML().panel.frame.style.gridRow = "2 / 5";
      // this.#HTML().display.frame.style.gridRow = "2 / 5";
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

  /* --- METHOD: #setTimer --- */
  #setTimer() {
    if (!this.#CFGN().timer) return;
    this.#HTML().timer.checkbox.disabled = true;
    if (this.#HTML().timer.checkbox.checked) {
      this.#timerStart();
    }
  }

  /* --- METHOD: #unsetTimer --- */
  #unsetTimer() {
    if (!this.#CFGN().timer) return;
    this.#HTML().timer.checkbox.disabled = false;
    if (this.#HTML().timer.checkbox.checked) {
      this.#timerStop();
    }
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

    this.#setTimer();
    this.#setRandy();

    this.#displayer.displayPlay();

    if (this.#CFGN().sound) {
      this.#HTML().sound.start.play(); // sound
    }
  }

  /* --- METHOD: #unset --- */
  #unset() {
    this.#unsetRandy();
    this.#unsetTimer();
    if (this.getStatus() === GUI.Status.PATH && this.#rpath !== null) {
      this.#rpath.cancel();
    }
    if (this.#game.getStatus() === Game.Status.PLAYING) {
      this.#game.stop();
    }
    this.#displayer.clearStyles();
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
          if (this.#CFGN().backtrack) {
            this.#playerUndo();
          }
          break;

        case "m":
          if (this.#CFGN().mark) {
            this.#playerToggleMark();
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
          const playerRoom = this.#game.getPlayerPosition(0).room;
          const occupiedLocs = playerRoom.getOccupiedLocations();
          this.#playerGoTo(Random.getRandomChoice(occupiedLocs));
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

    // timer checkbox
    this.#HTML().timer.checkbox.addEventListener("change", () => {
      const timerWatch = this.#HTML().timer.watch;
      if (this.#HTML().timer.checkbox.checked) {
        timerWatch.style.color = TIMER_IDLE_FG;
      } else {
        timerWatch.style.color = timerWatch.style.background;
      }
    });

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

    // timer
    if (this.#CFGN().timer && this.#HTML().timer.checkbox.checked) {
      this.#timer.pause();
      this.#backup.timerForeground = this.#HTML().timer.watch.style.color;
      this.#HTML().timer.watch.style.color = TIMER_IDLE_FG;
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

    if (this.#CFGN().sound) {
      this.#HTML().sound.pause.play(); // sound
    }

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

    // timer
    if (this.#CFGN().timer && this.#HTML().timer.checkbox.checked) {
      this.#HTML().timer.watch.style.color = this.#backup.timerForeground;
      this.#timer.resume();
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

    const room = this.#game.getPlayerPosition(0).room;
    if (this.#game.playerInspect(0)) {
      this.#unset();
      this.#playerWon();
    } else {
      if (this.#game.getPlayerPosition(0).room !== room) {
        if (this.#CFGN().sound) {
          this.#HTML().sound.enter.play(); // sound
        }
      }
      this.#refresh();
    }
  }

  /* --- METHOD: #playerUndo --- */
  #playerUndo() {
    if (this.getStatus() !== GUI.Status.PLAYING) return;

    this.#game.playerUndo(0);
    if (this.#CFGN().sound) {
      this.#HTML().sound.enter.play(); // sound
    }
    this.#refresh();
  }

  /* --- METHOD: #playerToggleMark --- */
  #playerToggleMark() {
    if (this.getStatus() !== GUI.Status.PLAYING) return;

    this.#game.playerToggleMark(0);
    this.#refresh();
  }

  /* --- METHOD: #playerWon --- */
  #playerWon() {
    if (this.#CFGN().sound) {
      this.#HTML().sound.triumph.play();
    }
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
    const src = this.#game.getPlayerPosition(0).loc;
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

  /// TIMER

  /* --- METHOD: #timerStart --- */
  #timerStart() {
    const timeStr = GUI.#getWatchTimeString(TIMER_START_TIME * 1000);
    const timerWatch = this.#HTML().timer.watch;
    timerWatch.innerText = timeStr;
    timerWatch.style.color =
      TIMER_START_TIME <= TIMER_ALERT_TIME ? TIMER_ALERT_FG : TIMER_COUNT_FG;
    this.#timer.start(
      TIMER_START_TIME * 1000,
      1000, // 1 second
      (timeLeft) => {
        const watchColor =
          timeLeft <= TIMER_ALERT_TIME * 1000 ? TIMER_ALERT_FG : TIMER_COUNT_FG;
        const timerWatch = this.#HTML().timer.watch;
        timerWatch.innerText = GUI.#getWatchTimeString(timeLeft);
        timerWatch.style.color = watchColor;
      },
      () => {
        this.#unset();
        this.#timeIsUp();
      }
    );
  }

  /* --- METHOD: #timerStop --- */
  #timerStop() {
    this.#timer.stop();
    const timerWatch = this.#HTML().timer.watch;
    timerWatch.innerText = "00:00";
    timerWatch.style.color = TIMER_IDLE_FG;
  }

  /* --- METHOD: #timeIsUp --- */
  #timeIsUp() {
    if (this.#CFGN().sound) {
      this.#HTML().sound.timeup.play(); // sound
    }
    this.#displayer.announce("Time's Up!");
    this.#setStatus(GUI.Status.TIMEUP);
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
    if (this.#CFGN().sound) {
      this.#HTML().sound.randydone.play(); // sound
    }
    this.#displayer.announce("Randy is done :()");
    this.#setStatus(GUI.Status.RANDYDONE);
  }
};
