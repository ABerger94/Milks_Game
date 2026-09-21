# MILK RUN — Cosmic Delivery

You are the last milkman in the galaxy. Slingshot your delivery ship around
planets, thread black holes, ride wormholes — and deliver the milk.

## Play

Open `index.html` in any modern browser (works from `file://`, no server or
build step needed). No external assets or fonts — everything is drawn on
canvas, all sound is synthesized with WebAudio.

## Controls

- **Aim:** touch anywhere and drag back, then release. The drag is measured
  from where your finger lands (thumbstick-style), so you never have to drag
  to the screen edge. A dotted trajectory preview simulates ~3 seconds of
  flight live, bending around gravity wells.
- **Launch:** release. Pull further = more speed.
- **Restart level:** R key or the ↻ button.
- **Mute:** M key or the ♪ button (also silences vibration).
- **Pause:** Esc / P or the ❚❚ button.
- **Haptics:** launch, delivery, crash, bounce, wormhole warps, depot and
  shard pickups, and gate open/deny all buzz on phones that support vibration.
- Mobile: full touch support, `touch-action: none`, portrait + landscape.

## Rules

- Touch the glowing station ring to deliver. Die if you hit a planet, fall
  into a black hole, clip an asteroid/comet, drift off-screen, or run out
  of launches.
- On the aim screen, black holes show a red dashed **capture-zone ring**:
  inside it, even a full-power launch can't escape — plan grazes outside it.
- Launches per level are limited (milk-bottle icons, top-left).
- Green **fuel depots** grant +1 launch. **Star shards** add score.
- **Wormhole pairs** teleport you, keeping your velocity vector.

## Stars & progress

48 levels across 5 sectors (Drift / Rogue / Void / Abyss / Maelstrom). Each level awards up to
3 stars: 1 for delivery, +1 for finishing within par launches, +1 for
collecting every shard. Progress and stars persist in `localStorage`.

**Hard Mode:** beating an Abyss level (25–36) unlocks its harder remix via the
toggle on the level-select screen. Hard variants keep their own stars and
their own best-shot ghosts.

## Tech

- `index.html` + `style.css` + `game.js` + `levels.js` + `hard-levels.js`. Zero dependencies.
- Fixed-timestep physics (120 Hz); the aim preview uses the exact same
  integrator as flight (240 steps ≈ 3 s).
- Newtonian gravity from planets and black holes (F = G·m/r², softened).
- Parallax 3-layer starfield, particle thruster trail, delivery bursts,
  screen shake, synthesized SFX + ambient pad, mute toggle.
