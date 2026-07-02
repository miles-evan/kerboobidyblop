# Kerboobidyblop Server

Authoritative multiplayer server. Runs the full game simulation (a headless port of the
client's `Board`/`Spell` rules) and treats clients as input devices: clients only send
cast requests, the server validates them and broadcasts the resulting state.

## Running

```sh
cd server
npm install
npm run dev     # dev with auto-reload (port 8787, override with PORT=...)
```

Then in another terminal run the client (`cd client && npm run dev`). Open two browser
windows, click **Create online game** in one, and enter the room code in the other.
By default the client connects to `ws://<page hostname>:8787`; set `VITE_SERVER_URL`
to point elsewhere.

## Architecture

- `src/index.ts` — WebSocket server (`ws`), message parsing/validation, heartbeat
  (pings every 15s, terminates dead connections).
- `src/RoomManager.ts` — room codes (4 chars, no ambiguous letters), create/join.
- `src/GameRoom.ts` — one match: two sockets, the simulation loop, snapshot broadcast,
  per-player cast rate limiting.
- `src/sim/` — the headless game simulation, a statement-for-statement port of
  `client/src/game/main` (`Board.ts` + `Spell.ts`). If you change game rules, change
  both (`src/constants.ts` documents which values are mirrored).
- `src/protocol.ts` — wire protocol types, mirrored at
  `client/src/game/main/net/protocol.ts`.

## Netcode

- **Authoritative state**: all game logic runs here. Casts are validated server-side
  (shape, flux cost, spawn-tile occupancy) so clients can't cheat by sending raw state.
  Unlike the client's local game, flux is only deducted if the cast actually spawns.
- **Fixed timestep**: 30 simulation ticks/sec driven by an accumulator, so the sim stays
  aligned with wall clock even when `setInterval` drifts; a stall cap prevents the
  spiral of death.
- **Snapshots**: full state at 15/sec (`tick`, sim `time`, all spells, player flux/health).
  The client buffers these and renders ~100ms in the past, interpolating positions
  between snapshots (`client/src/game/main/net/SnapshotBuffer.ts`).
- **Input acks**: each cast carries a client `seq` and gets a `castResult` back with an
  acceptance flag and reason.
- **Rate limiting**: max 10 casts/sec per connection.
- **Liveness**: ping/pong heartbeat; when a player disconnects the opponent gets
  `opponentLeft` and the room is torn down.

## Game end

A spell that exits the far side of the screen deals `5 * tier` damage to the player
there (a spell exiting its owner's own side, e.g. a fleeing retreater, deals nothing).
When a player's health hits 0 the server broadcasts `gameOver` (winner, or 0 for a
draw on a simultaneous kill) and tears the room down. The local practice game applies
the same rules client-side.

## Not implemented (yet)

- Reconnection to an in-progress game.
- Client-side prediction of casts (the client only predicts the flux check to avoid
  pointless sends; spells appear after a server round trip + interpolation delay).
