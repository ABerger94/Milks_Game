# MILK RUN — Cosmic Delivery

You are the last milkman in the galaxy. Slingshot your delivery ship around
planets, thread black holes, ride wormholes — and deliver the milk.

## Play

Open `index.html` in any modern browser (works from `file://`, no server or
build step needed). No external assets or fonts — everything is drawn on
canvas, all sound is synthesized with WebAudio.

## Controls

- **Aim:** press/touch and drag anywhere, starting near the ship. A dotted
  trajectory preview simulates ~3 seconds of flight live, bending around
  gravity wells.
- **Launch:** release. Pull further = more speed.
- **Restart level:** R key or the ↻ button.
- **Mute:** M key or the ♪ button.
- **Pause:** Esc / P or the ❚❚ button.
- Mobile: full touch support, `touch-action: none`, portrait + landscape.

## Rules

- Touch the glowing station ring to deliver. Die if you hit a planet, fall
  into a black hole, clip an asteroid/comet, drift off-screen, or run out
  of launches.
- Launches per level are limited (milk-bottle icons, top-left).
- Green **fuel depots** grant +1 launch. **Star shards** add score.
- **Wormhole pairs** teleport you, keeping your velocity vector.

## Stars & progress

24 levels across 3 sectors (Drift / Rogue / Void). Each level awards up to
3 stars: 1 for delivery, +1 for finishing within par launches, +1 for
collecting every shard. Progress and stars persist in `localStorage`.

## Tech

- `index.html` + `style.css` + `game.js` + `levels.js`. Zero dependencies.
- Fixed-timestep physics (120 Hz); the aim preview uses the exact same
  integrator as flight (240 steps ≈ 3 s).
- Newtonian gravity from planets and black holes (F = G·m/r², softened).
- Parallax 3-layer starfield, particle thruster trail, delivery bursts,
  screen shake, synthesized SFX + ambient pad, mute toggle.
