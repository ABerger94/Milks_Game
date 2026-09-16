# MILK RUN — Game Log

## v0.1 — 2026-09-16 — launch
- Initial release: **Milk Run — Cosmic Delivery**.
- 24 levels across 3 sectors: Drift (1–8), Rogue (9–16), Void (17–24).
- Core loop: drag-to-aim slingshot launching with live trajectory preview
  (same integrator as flight, 240 steps ≈ 3 s), Newtonian gravity,
  station-ring deliveries.
- Hazards & toys: planets, asteroids, black holes, orbiting stations, fuel
  depots (+1 launch), star shards, wormhole pairs, moving comets.
- 3-star scoring per level (delivery / par / all shards), level select with
  stars, progress in localStorage.
- Shards and used fuel depots persist across failed attempts within a level
  (no shard loss on crash, no depot re-farming); both reset on full restart.
  Retry with no launches left restarts the level instead of looping the
  out-of-launches screen.
- Juice: 3-layer parallax starfield, thruster particles, delivery bursts,
  screen shake, synthesized WebAudio SFX + ambient pad, mute toggle.
- Screens: animated title, level select, HUD, pause, win, fail overlays.
- Mobile-first touch + desktop mouse/keyboard (R restart, M mute, Esc/P pause).
- Balance: automated solver verified every level has a 3-star path (delivery
  + all shards in one launch, moderate speed, on-screen trajectory); black
  hole masses tuned so wins don't require max-speed grazes.

## Verification notes (v0.1)
- Pure physics core (`game.js` above `/*__DOM__*/`) is dependency-free and
  doubles as the solver harness: identical integrator for preview and flight.
- Solver grid: 360 angles × 6 speeds, 120 Hz fixed timestep, 60 s cap.
- All 24 levels: 3-star solution found (e.g. L24 "Last Delivery" @ 5°/520 with
  all 6 shards). No shard sits off-screen or inside an obstacle.
- L24 station is static at (1150,360) — no accidental instant win.
- Known design intent: black-hole levels (9, 13, 15, 20) have narrow win
  windows (~4–12°); the live trajectory preview is the intended equalizer.

## v0.1.1 — 2026-09-16 — relative (thumbstick) aiming
- First human playtest feedback (Alek): aiming required dragging the thumb to
  the screen edge whenever the ship sat near one — steering felt bad.
- Aiming is now relative: touch down anywhere and the drag vector is measured
  from the touch-down point, not from the ship. Same slingshot feel (pull
  back, release, ship flies the opposite way), same AIM_K, same preview and
  flight integrator — the ship and the trajectory stay visible under the
  thumb, and full power needs only ~26% of screen width of thumb travel.
- Elastic band visual redrawn along the pull direction from the ship;
  max-power ring unchanged (still reads as "pull this far for full power").
- Title hint updated: "touch anywhere · drag back · release to launch".
