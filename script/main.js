/*
 ******************************************************************************
 * TODO:
 * - Testing. Unit Testing, Test Automation, Logging.
 * - Add version number. What about a package?
 * - Stats; e.g., count steps.
 ******************************************************************************
 * TODOC:
 * - Need documentation throughout the entire code.
 ******************************************************************************
 * WEB:
 * - Smooth page loading.
 * - Touch.
 * - Responsive web design.
 ******************************************************************************
 * RFE:
 * - Multiplayer. [David Naori]
 * - Legend.
 * - Pickup 12 foundation stones.
 * - Scores. (high scores)
 * - Allow to configure number of rows/columns via GUI?
 ******************************************************************************
 * ACK:
 * - Thanks David Naori for the following ideas: coloring doors; timer.
 ******************************************************************************
 */

// ============================================================================
// Directory Hierarchy:
// ============================================================================
// 25rooms
// ├── Backup.bat
// ├── index.html
// ├── css
// │   └── styles.css
// ├── design
// │   ├── game.bmp
// │   ├── game.gaphor
// │   └── gui.gaphor
// ├── quotes
// │   ├── ...
// │   └── ...
// ├── script
// │   ├── main.js
// │   ├── game
// │   |   ├── cell.js
// │   |   ├── direction.js
// │   |   ├── door.js
// │   |   ├── element.js
// │   |   ├── game.js
// │   |   ├── grid.js
// │   |   ├── location.js
// │   |   ├── network.js
// │   |   ├── player.js
// │   |   ├── position.js
// │   |   ├── room.js
// │   |   ├── topology.js
// │   |   └── test
// │   |       ├── game-tester.js
// │   |       └── random-walker.js
// │   ├── gui
// │   |   ├── bounding-box.js
// │   |   ├── displayer.js
// │   |   ├── drawer.js
// │   |   ├── gui.js
// │   |   ├── random-path.js
// │   |   ├── randy.js
// │   |   ├── randy-manager.js
// │   |   ├── scheduler.js
// │   |   ├── style.js
// │   |   ├── styler.js
// │   |   ├── timed-iterator.js
// │   |   └── timer.js
// │   └── library
// │       ├── errors.js
// │       ├── graph.js
// │       ├── graphutils.js
// │       ├── linkedlist.js
// │       ├── quotes.js
// │       ├── random.js
// │       └── unionfind.js
// └── sound
//     ├── ...
//     └── ...
// ============================================================================

import GUI from "./gui/gui.js";

const master = document.querySelector("main");
const gui = new GUI(master);
// TODO: gui.launch()?