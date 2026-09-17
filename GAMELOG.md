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

## v0.2 — 2026-09-16 — level intro cards
- New pre-level intro card (builder suggestion #2, onboarding): entering a
  level from level select or the win screen now shows a card with the level
  number + sector ("LEVEL 9 · ROGUE"), the level name, launch/par/shard
  budgets, and the level's tip when one exists (12 of 24 levels have tips;
  the tip line hides when a level has none). Dismiss with "TAP TO FLY" or
  Enter/Space; the level renders behind the card.
- Retry and restart skip the card — a failed run goes straight back to
  aiming, so the card never becomes a tap-through annoyance.
- Level 1 tip text fixed: it still said "drag back from the ship", left over
  from before v0.1.1's drag-anywhere aiming. README Controls section updated
  to match (thumbstick-style drag, never drag to the screen edge).
- No physics or level-geometry changes (tip strings only); the v0.1 solver's
  3-star verification for all 24 levels still holds, so the solver was not
  re-run. Verified headlessly with a DOM-shim test harness
  (13/13: card content for all 24 levels, dismiss flow, retry/restart skip,
  dismissIntro no-op outside intro, HUD hidden during card).
- Not headless-testable: actual tap feel / card timing on a real phone —
  Alek is play-testing live, so this will get a human read tonight.

## v0.3 — 2026-09-16 — juice overhaul
- Expanding shockwave rings: deliveries fire two staggered rings (cyan + gold),
  wormhole warps and fuel-depot pickups each fire one. New `G.rings` array with
  ease-out expansion, capped at 24, drawn above the world.
- Wormhole redraw: 3 spiral arms winding inward and rotating with time, plus a
  counter-rotating dashed shimmer ring and a pulsing core.
- Black holes: bright accretion-disk clumps orbiting just outside the event
  horizon, plus ambient purple/white inflow sparks that spiral in while you
  aim or fly.
- Shards: idle twinkle sparkles, and "magnet streaks" — when the flying ship
  passes within 150 units of an uncollected shard, sparkles stream from the
  shard toward the ship.
- Comets: warm head-glow behind each comet (existing dust trail kept).
- No physics or level-geometry changes; the v0.1 solver's 3-star verification
  still holds, so the solver was not re-run. `node --check` clean.
- Not headless-testable: subjective feel of the new effects (timing, density,
  whether the magnet streaks read clearly) — for Alek's live play-test.
