/* --- IMPORTS --- */
import Random from "../library/random.js";
import Location from "../game/location.js";
import Direction from "../game/direction.js";
import Door from "../game/door.js";
import Stone from "../game/stone.js";
import Game from "../game/game.js";
import Displayer from "./displayer.js";
import Stopwatch from "./stopwatch.js";
import RandyManager from "./randy-manager.js";
import RandomPath from "./random-path.js";
import TIterator from "./timed-iterator.js";
import { ETypeError } from "../library/errors.js";

/* --- EXPORTS --- */
export { GUI as default };

/* --- ENUM: GUIStatus --- */
const GUIStatus = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
  PAUSE: "PAUSE",
  REWARD: "REWARD",
  RANDYDONE: "RANDYDONE",
  QUIT: "QUIT",
};
Object.freeze(GUIStatus);

/* --- DEFAULTS --- */
const DEFAULT_UNDO = true;
const DEFAULT_CLOCK = true;
const DEFAULT_RANDY = true;
const DEFAULT_STONES = true;
const DEFAULT_SOUND = true;

/* --- CONSTANTS --- */
const CELL_WIDTH = 75;
const CELL_HEIGHT = 75;

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
  #stoneCount;
  #html;
  #callbacks;
  #rpath;
  #auto;
  #lastRoomId;
  #backup;

  /* --- INNER: Status --- */
  static Status = GUIStatus;

  /* --- C'TOR: constructor --- */
  constructor(
    master,
    undo = DEFAULT_UNDO,
    clock = DEFAULT_CLOCK,
    randy = DEFAULT_RANDY,
    stones = DEFAULT_STONES,
    sound = DEFAULT_SOUND
  ) {
    GUI.#validator(master, undo, clock, randy, stones, sound);
    this.#master = master; // slave to be set later...

    // configuration
    this.#cfgn = {
      undo: undo,
      clock: clock,
      randy: randy,
      stones: stones,
      sound: sound,
    };

    this.#game = new Game(); // game
    this.#stopwatch = null;
    this.#randy = null;
    this.#stoneCount = 0;

    // setting
    this.#setStatus(GUI.Status.IDLE); // status
    // TODO: HTMLManager class?
    this.#setHTML(); // HTML elements
    this.#setWidgets(); // GUI widgets
    this.#setDisplay(); // display

    this.#callbacks = {};
    this.#bindEvents(); // events

    this.#rpath = null;
    this.#auto = null;
    this.#lastRoomId = null;

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
  static #validator(master, undo, clock, randy, stones, sound) {
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
    if (typeof stones !== "boolean") {
      throw new ETypeError(`input is not a boolean`, stones);
    }
    if (typeof sound !== "boolean") {
      throw new ETypeError(`input is not a boolean`, sound);
    }
  }

  /* --- METHOD: #refresh --- */
  #refresh() {
    this.#display();
  }

  /* --- METHOD: #display --- */
  #display() {
    this.#displayer.displayPlay(this.#CFGN().stones);
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

      // stones
      stones: {
        frame: document.querySelector("#plate-frame"),
      },

      // sound
      sound: {
        start: document.querySelector("#start"),
        enter: document.querySelector("#enter"),
        stonecollect: document.querySelector("#stone-collect"),
        whoareyou: document.querySelector("#who-are-you"),
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
    this.#setStonePlate(); // stones
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
    const pageTitle = this.#HTML().title.header.innerText;
    document.querySelector("title").innerText = pageTitle;
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

  /* --- METHOD: #setStonePlate --- */
  #setStonePlate() {
    if (!this.#CFGN().stones) {
      this.#HTML().top.frame.removeChild(this.#HTML().stones.frame);
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
    if (this.#getNumRandys() > 0) {
      // create new Randy object
      this.#randy = new RandyManager(
        this.#game,
        () => this.#refresh(),
        (index) => {
          this.#setStatus(GUI.Status.RANDYDONE);
          this.#unset();
          this.#randyIsDone(index);
        }
      );
      this.#randyStart();
    }
  }

  /* --- METHOD: #unsetRandy --- */
  #unsetRandy() {
    if (!this.#CFGN().randy) return;
    if (this.#getNumRandys() > 0) {
      this.#randyStop();
    }
    this.#randy = null;
    this.#HTML().randy.control.disabled = false;
  }

  /* --- METHOD: #setStopwatch --- */
  #setStones() {
    if (!this.#CFGN().stones) return;
    this.#clearPlate();
  }

  /* --- METHOD: #unsetStones --- */
  #unsetStones() {
    if (!this.#CFGN().stones) return;
    if (this.getStatus() === GUI.Status.IDLE) {
      this.#clearPlate();
    }
  }

  /* --- METHOD: #clearPlate --- */
  #clearPlate() {
    if (this.#stoneCount === 0) return;
    for (const stoneType in Stone.Type) {
      const stoneName = stoneType.toLowerCase();
      const placeholder = document.querySelector("#" + stoneName);
      if (placeholder === null) continue;
      placeholder.setAttribute("id", "plate-" + stoneName);
      placeholder.style.borderStyle = "inset";
    }
    this.#stoneCount = 0;
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
    this.#setStones();

    this.#display();

    this.#playSound(this.#HTML().sound.start);
  }

  /* --- METHOD: #unset --- */
  #unset() {
    if (this.#auto !== null) {
      this.#auto.cancel();
      this.#auto = null;
    }
    if (this.#activeRandomPath()) {
      this.#rpath.cancel();
      this.#rpath = null;
    }
    this.#lastRoomId = null;
    this.#unsetStones();
    this.#unsetRandy();
    this.#unsetClock();

    if (this.#game.getStatus() === Game.Status.PLAYING) {
      this.#game.stop();
    }
  }

  /// EVENTS
  // TODO: Move to EventManager class...

  /* --- METHOD: #activeRandomPath --- */
  #activeRandomPath() {
    return this.#rpath !== null && this.#rpath.isActive();
  }

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
          if (!this.#activeRandomPath() && this.#auto === null) {
            this.#playerMove(event);
          }
          break;

        case "Enter":
          if (!this.#activeRandomPath() && this.#auto === null) {
            this.#playerInspect();
          }
          break;

        case "Backspace":
          if (!this.#activeRandomPath() && this.#auto === null) {
            if (this.#CFGN().undo) {
              this.#playerUndo();
            } else {
              console.log("Undo is off.");
            }
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

        case "a":
          if (this.#auto === null) {
            this.#auto = new TIterator(
              PLAYER_DELAY,
              () => {
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "c" })
                );
                return true;
              },
              () => {}
            );
          } else {
            this.#auto.cancel();
            this.#auto = null;
            if (this.#activeRandomPath()) {
              this.#rpath.cancel();
              this.#rpath = null;
            }
          }
          break;

        case "c":
          if (!this.#activeRandomPath()) {
            this.#simulatePseudoRandomPlayerMove();
          }
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
        this.#processTickEvent(event.clientX, event.clientY);
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
        this.#processTickEvent(
          lastMove.targetTouches[0].clientX,
          lastMove.targetTouches[0].clientY
        );
      },
      false
    );
  }

  /* --- METHOD: #simulatePseudoRandomPlayerMove --- */
  #simulatePseudoRandomPlayerMove() {
    const state = this.#game.getState(0);
    const player = state.player;
    const stones = state.stones;
    if (stones.length > 0) {
      const dist = function (loc1, loc2) {
        return Math.abs(loc1.x - loc2.x) + Math.abs(loc1.y - loc2.y);
      };

      // go for the nearest stone (Manhattan distance)
      let nearest = stones[0].loc;
      for (let i = 1; i < stones.length; i++) {
        if (dist(player.loc, stones[i].loc) < dist(player.loc, nearest)) {
          nearest = stones[i].loc;
        }
      }
      this.#playerGoTo(nearest);
    } else {
      const doors = state.doors;
      let choices = [];
      for (const door of doors) {
        if (door.type === Door.Type.EXIT) {
          // exit door appears? go for it, but not before collecting all stones
          if (this.#stoneCount === Object.keys(Stone.Type).length) {
            choices = [door];
            break;
          }
        } else {
          choices.push(door);
        }

        // don't go back right away to the room you came from (if possible)
        if (choices.length > 1) {
          for (let i = 0; i < choices.length; i++) {
            if (choices[i].ownerId === this.#lastRoomId) {
              choices.splice(i, 1);
              break;
            }
          }
        }
      }
      this.#playerGoTo(Random.getRandomChoice(choices).loc);
    }
  }

  /* --- METHOD: #processTickEvent --- */
  #processTickEvent(clientX, clientY) {
    switch (this.getStatus()) {
      case GUI.Status.REWARD:
        this.#displayer.displayRandomQuote();
        break;
      case GUI.Status.PAUSE:
        this.#resume();
      case GUI.Status.PLAYING:
        if (!this.#activeRandomPath() && this.#auto === null) {
          this.#clientGoTo(clientX, clientY);
        }
        break;
      default:
        // nothing to do here...
        break;
    }
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
    if (status === GUI.Status.PLAYING) return;

    this.#set();
    this.#setStatus(GUI.Status.PLAYING);
  }

  /* --- METHOD: #pause --- */
  #pause() {
    const status = this.getStatus();
    if (status !== GUI.Status.PLAYING) return;

    // random path
    if (this.#activeRandomPath()) {
      this.#rpath.pause();
    }

    // clock
    if (this.#CFGN().clock) {
      this.#stopwatch.pause();
      this.#backup.stopwatchForeground = this.#HTML().clock.watch.style.color;
      this.#HTML().clock.watch.style.color = CLOCK_IDLE_FG;
    }

    // randy
    if (this.#CFGN().randy && this.#randy !== null) {
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
    if (this.#CFGN().randy && this.#randy !== null) {
      this.#randy.resume();
    }

    // random path
    if (this.#activeRandomPath()) {
      this.#rpath.resume();
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
    this.#setStatus(GUI.Status.IDLE);
    this.#unset();
    this.#displayer.displayIdle();
  }

  /* --- METHOD: #quit --- */
  #quit() {
    const status = this.getStatus();
    if (status === GUI.Status.PLAYING) {
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

    const state = this.#game.getState(0);
    this.#lastRoomId = state.room.id;
    const result = this.#game.playerInspect(0);
    if (result === Door.Type.EXIT) {
      this.#setStatus(GUI.Status.REWARD);
      this.#unset();
      this.#playerWon();
    } else {
      const newState = this.#game.getState(0);
      if (newState.room.id !== this.#lastRoomId) {
        // player entered a new room
        this.#playSound(this.#HTML().sound.enter);
      } else if (this.#CFGN().stones && result in Stone.Type) {
        // player collected a stone
        const stoneName = result.toLowerCase();
        const placeholder = document.querySelector("#plate-" + stoneName);
        placeholder.setAttribute("id", stoneName);
        placeholder.style.borderStyle = "outset";

        this.#stoneCount++;
        this.#playSound(this.#HTML().sound.stonecollect);
        if (this.#stoneCount == Object.keys(Stone.Type).length) {
          this.#playSound(this.#HTML().sound.whoareyou);
        }
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

  /// REWARD

  /* --- METHOD: #playerWon --- */
  #playerWon() {
    this.#playSound(this.#HTML().sound.triumph);
    this.#rewardPlayer();
  }

  /* --- METHOD: #rewardPlayer --- */
  #rewardPlayer() {
    this.#displayer.displayRandomQuote();
  }

  /* --- METHOD: #playerGoTo --- */
  #playerGoTo(dst) {
    console.assert(dst instanceof Location); // sanity check
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
    if (this.getStatus() === GUI.Status.IDLE) {
      clockWatch.innerText = "00:00";
    }
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
    if (this.#getNumRandys() > 0 && this.#randy.isActive()) {
      this.#randy.halt();
    }
  }

  /* --- METHOD: #randyIsDone --- */
  #randyIsDone(index) {
    // TODO: do something with index?
    this.#playSound(this.#HTML().sound.randydone);
    this.#displayer.announce("Randy is done :()");
  }

  /// SOUND
  #playSound(audio) {
    console.assert(audio instanceof HTMLElement && audio.tagName === "AUDIO"); // sanity check
    if (this.#CFGN().sound) {
      audio.play();
    }
  }
};
