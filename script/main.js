/*
 * VERSION: v1.0
 */

/*
 ******************************************************************************
 * TODO:
 * - Testing. Unit Testing, Test Automation, Logging.
 * - Stats; e.g., count steps.
 * - GitHub
 * - README.md
 ******************************************************************************
 * TODOC:
 * - Need documentation throughout the entire code.
 ******************************************************************************
 * WEB:
 * - Smooth page loading.
 * - Touch.
 * - Responsive web design.
 * - Cross-Browser Testing (BrowserStack: https://www.browserstack.com/)
 ******************************************************************************
 * ACA: (academy)
 * - Every game can be "reduced" to this game.
 * - What is the "hardest" tree for a random walker?
 * - Are there any bounds on the degree/diameter/leaves of a random MST?
 * - Only rooms and doors is a bit borring and too general; adding stones makes
 * it more interesting but somewhat specific. What is the most general game we
 * can come up with that is still interesting? What is the "essence" of gaming?
 ******************************************************************************
 * ACK:
 * - Thanks David Naori for the following ideas: coloring doors; clock.
 ******************************************************************************
 */

// ============================================================================
// Directory Hierarchy:
// ============================================================================
// rad
// ├── Backup.bat [v1.0-p]
// ├── index.html
// ├── README.md
// ├── css
// │   └── styles.css
// ├── design
// │   ├── game.bmp
// │   ├── game.gaphor
// │   └── gui.gaphor
// ├── images
// │   └── favicon.ico
// ├── quotes
// │   ├── JakubPetriska.zip
// │   ├── quotes.csv
// │   └── quotes.py
// ├── script
// │   ├── main.js
// │   ├── game
// │   |   ├── cell.js
// │   |   ├── direction.js [v1.0-p]
// │   |   ├── door.js
// │   |   ├── element.js [v1.0-p]
// │   |   ├── game.js
// │   |   ├── location.js
// │   |   ├── player.js
// │   |   ├── room.js
// │   |   ├── stone.js
// │   |   └── test
// │   |       ├── game-tester.js
// │   |       └── random-walker.js
// │   ├── gui
// │   |   ├── bounding-box.js
// │   |   ├── colors.js
// │   |   ├── displayer.js
// │   |   ├── doors.js
// │   |   ├── drawer.js
// │   |   ├── gui.js
// │   |   ├── polyline.js
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
// │       ├── unionfind.js
// │       ├── validation.js
// │       └── webcolors.js
// └── sound
//     ├── complete.mp3
//     ├── enter.mp3
//     ├── enter-at-your-own-risk.mp3
//     ├── pause-sound.mp3
//     ├── pause-sound-old.mp3
//     ├── randy-done.mp3
//     ├── stone-collect.mp3
//     ├── triumph.mp3
//     ├── triumph-2.mp3
//     ├── welcome.mp3
//     ├── wow-who-are-you.mp3
//     └── where-are-them-stones.mp3
// ============================================================================

import GUI from "./gui/gui.js";

const master = document.querySelector("main");
const gui = new GUI(master);
// TODO: gui.launch()?
