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

## v0.4 — 2026-09-16 — richer sound
- Launch: layered whoosh — engine roar down, sub-bass thump, whistle climbing
  up, air rush (was just roar + noise).
- Delivery: 4-note arpeggio extended to 6 notes with a high shimmer after it.
- Shards: pentatonic ladder — each pickup in a run plays the next note up the
  scale, so collecting a shard run sings.
- Wormhole: added a sparkle sweep descending under the existing rise.
- New black-hole proximity rumble: a low growl pulses while the ship flies
  within 280 units of a black hole (throttled to one pulse per 0.4 s, silent
  when muted or paused).
- All still synthesized WebAudio, zero assets. `node --check` clean.
- Not headless-testable: actual mix balance on phone speakers — for Alek's
  live play-test.

## v0.5 — 2026-09-16 — best-trajectory ghost
- Your best winning shot per level is now recorded (launch vector + star count)
  in localStorage and drawn as a faint gold "GHOST" path on the aim screen,
  under your own live preview — a built-in hint for levels you beat ugly.
- Only winning shots are recorded, and a lower-star win never overwrites a
  better ghost. Old saves migrate cleanly (ghosts start null); corrupt entries
  are sanitized on load.
- Uses the existing preview integrator, so the ghost matches real flight —
  purely additive, no physics or level-geometry changes; the v0.1 solver's
  3-star verification still holds, so the solver was not re-run.
- Verified headlessly with a DOM-shim harness (19/19: ghost init/record/
  persist/replace-protection, preview path non-empty, ring lifecycle, all sfx
  no-throw without an AudioContext, rumble throttle near/far, render() clean
  on title/aim/aiming/flying/paused, old-save migration, corrupt-entry
  sanitize), plus a draw-path sweep hitting wormhole swirl, accretion disk,
  comet glow, and rings.
- Not headless-testable: whether the ghost label/opacity reads well on a real
  phone screen — for Alek's live play-test.

## v0.5.1 — 2026-09-16 — HUD overlap fix (narrow phones)
- Playtest catch from Alek's screenshot: on narrow portrait phones the level
  title ran underneath the top-right HTML buttons, and the level tip text
  (drawn at y=58) collided with the launch bottles / shard counter.
- drawHUD is now width-aware: below 700px the title + sector/par line center
  in the space left of the buttons instead of the full canvas width, with
  ellipsis truncation (fitText helper) as a backstop; the tip moved to y=92,
  below the bottles/shard row, and truncates to fit the screen. Desktop and
  landscape layouts are unchanged.
- Verified with a headless layout simulation at 390/844/1280px widths — no
  title/button overlap at any width. No physics or level changes.

## v0.5.2 — 2026-09-16 — HUD title zone fix, round 2
- Follow-up to v0.5.1: the shifted title now overlapped the milk bottles on
  the left (Alek's screenshot feedback).
- The title + sector/par lines now center in the actual gap between the milk
  bottles' right edge and the top-right buttons on narrow (<700px) screens,
  with ellipsis truncation as a backstop. Wide screens unchanged.

## v0.6 — 2026-09-16 — New mechanics: bounce asteroids + shard-gated stations
- Two new mechanics (Alek: "make them harder, add new things"):
  - **Bounce asteroids** (`bounce: true`): teal halo, reflect the ship with
    0.75 restitution instead of killing it. Dedicated bounce sfx, particles,
    screen shake. Key physics finding: a rightward ship always reverses off
    a rock — bounce levels are designed as there-and-back shots, not banks.
  - **Shard-gated stations** (`station.gate: N`): amber locked station with
    rotating dashed ring + shard pips; opens only when N shards are banked.
    Denied/unlock sfx, intro-card shows the requirement.
- Save migration: arrays sized to LEVELS.length; old 24-entry saves padded,
  never wiped. Ghost/star data sanitized.
- Verified: 7 headless mechanics tests (gate deny/threshold/banked-unlock,
  bounce reflect, deadly rocks still lethal).

## v0.6.1 — 2026-09-16 — Gate state bugfixes
- Banked shards injected into a fresh attempt did not recalculate `gateOpen`
  — the gate stayed locked until another shard was grabbed. Fixed: gate state
  recalculated after banked shards are injected in retryAttempt().
- renderWorld double-counted banked shards in the gate pip display
  (`att.shardsGot` already includes them). Fixed: use att.shardsGot.size.

## v0.7 — 2026-09-16 — Sector 4: Abyss (levels 25–36)
- New sector "Abyss — the hard stuff", unlocked after level 24. 12 levels:
  25 Trampoline (bounce reversal + gate intro), 26 Boomerang (bounce
  there-and-back), 27 Locked Door (gate intro), 28 Toll Booth (BH slingshot
  + gate:3), 29 Thread the Needle (diagonal asteroid thread), 30 Event
  Horizon (BH slingshot + bounce backstop), 31 The Vault (wormhole bypass
  + gate:2), 32 Orbit Decay (orbiting station + comet), 33 Comet Crossfire,
  34 Gauntlet II (BH slalom), 35 Wormhole Chain (2 WH pairs + gate:2),
  36 Abyssal Heart (finale: BHs + comet + orbiting gate:3 station).
- Existing 24 levels untouched (geometry/physics frozen).
- Solver verification: 35/36 levels have single-launch 3-star paths
  (verified headlessly, all shards + win). L16 Rogue's End 3-stars via
  2 launches (shard-bank run + win run, 2 <= par 3) — verified multi-launch.

## 2026-09-16 — v0.7.1 hotfix: bounce-level render crash

- **Bug:** every level with a bounce asteroid (25 Trampoline, 26, 30)
  rendered only the rock, then threw `ReferenceError: drawBounceHalo is not
  defined` every frame — no comet/shards/station/ship/HUD. Alek caught it
  on L25 from a phone screenshot.
- **Cause:** a missing closing brace left `drawBounceHalo` nested inside
  `drawRock`, so it was invisible at the renderWorld call site.
  Syntactically valid (node --check passed); the headless render sweep
  never exercised a bounce level, so it shipped.
- **Fix:** closed `drawRock` properly; `drawBounceHalo` is top-level again.
- **Regression test:** headless harness now renders all 36 levels on both
  aim and flying screens — all clean. This sweep should run on every
  future push that touches game.js or levels.js.
