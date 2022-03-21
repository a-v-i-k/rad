/* --- IMPORTS --- */
import Door from "./door.js";
import Stone from "./stone.js";
// import Room from "./room.js";
import Player from "./player.js";
import Game from "./game.js";

/* --- EXPORTS --- */
export { GameState as default };

/*
 * CLASS: GameState
 *****************************************************************************/
const GameState = class {
  constructor(game, player) {
    console.assert(game instanceof Game); // sanity check
    console.assert(player instanceof Player); // sanity check

    // player
    this.player = { id: player.getId(), loc: player.getLocation() };

    // room
    const room = player.getRoom();
    const roomId = room.getId();
    this.room = {
      id: roomId,
      dims: room.getDimensions(),
      wloc: room.getWelcomeLocation(),
      level: game.getRoomLevel(roomId),
    };

    // doors
    this.doors = [];
    for (const loc of room.getElementLocations(Door)) {
      const door = room.getElement(loc);
      console.assert(door instanceof Door); // sanity check
      const ownerId = door.open().getId();
      console.assert(door !== null); // sanity check
      this.doors.push({
        id: door.getId(),
        type: door.getType(),
        ownerId: ownerId,
        loc: loc,
        level: game.getRoomLevel(ownerId),
      });
    }

    // stones
    this.stonesRequired = game.stonesRequired();
    this.missingStones = game.getMissingStones();
    this.stones = [];
    for (const loc of room.getElementLocations(Stone)) {
      const stone = room.getElement(loc);
      console.assert(stone instanceof Stone); // sanity check
      console.assert(stone !== null); // sanity check
      this.stones.push({
        id: stone.getId(),
        type: stone.getType(),
        loc: loc,
      });
    }
  }
};
