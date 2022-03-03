/*
 ******************************************************************************
 * TODO:
 * - Testing. Unit Testing, Test Automation, Logging.
 * - Add version number. What about a package?
 * - Stats; e.g., count steps.
 * - GitHub
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
 * - Thanks David Naori for the following ideas: coloring doors; clock.
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
// │   |   ├── location.js
// │   |   ├── player.js
// │   |   ├── room.js
// │   |   └── test
// │   |       ├── game-tester.js
// │   |       └── random-walker.js
// │   ├── gui
// │   |   ├── bounding-box.js
// │   |   ├── colors.js
// │   |   ├── displayer.js
// │   |   ├── drawer.js
// │   |   ├── gui.js
// │   |   ├── random-path.js
// │   |   ├── randy.js
// │   |   ├── randy-manager.js
// │   |   ├── scheduler.js
// │   |   ├── stopwatch.js
// │   |   └── timed-iterator.js
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
