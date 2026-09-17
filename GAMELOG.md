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

## v0.8 — 2026-09-16 — Sector 5: Maelstrom + Hard Mode

Alek beat all 36 levels and asked for both: a new sector AND hard-mode
remixes. Shipped both in one build. 48 normal levels, 12 hard variants.

### Sector 5: Maelstrom (levels 37–48) — two new mechanics

- **Wind zones** — `winds: [{x, y, w, h, ax, ay}]`. Constant acceleration
  (ax,ay) px/s² while the ship's center is inside the rect. Wired into
  `accelAt` in the pure core, so physics, aim preview, ghost, and the node
  solver all agree. Rendered as translucent cyan rects with animated streak
  lines drifting along (ax,ay); streak speed scales with strength.
- **Patrol comets** — `patrols: [{x1, y1, x2, y2, r, period, phase}]`. Killer
  comets ping-ponging linearly between endpoints; `patrolPos(p, t)` is a pure
  function of time (triangle wave, no integration drift), so aim-screen and
  flight patrols stay in sync. Kill radius follows the comet convention,
  `deadWhy = 'patrol'`. Rendered amber/orange: dashed gold path line between
  endpoints, short motion trail, glowing rocky body — distinct from red hazards.
- Pure-core additions (game.js, all before `/*__DOM__*/`): `patrolPos`, wind
  loop in `accelAt`, patrol kill-loop in `stepAttempt`, optional `t0` pre-roll
  param on `simulateLaunch(level, angle, speed, maxT, t0)` — backward compatible.
  Old levels guarded via `(level.winds||[])` / `(level.patrols||[])`.
- Levels 1–36 verified JSON-identical to origin/main after the merge.

The 12 levels: 37 First Breeze · 38 Updraft · 39 Cross Traffic · 40 Storm
Surge · 41 Against the Wind · 42 Sentry Line · 43 Trade Winds · 44 Downburst ·
45 Locked in the Storm · 46 Eye Wall · 47 Tempest Gate · 48 Maelstrom's Eye.

### Hard Mode — 12 Abyss remixes (levels 25–36)

- One toggle button on the LEVEL SELECT overlay only (never in the in-level
  HUD — the v0.5.x narrow-phone fixes are untouched). `G.hardMode` is session
  state, deliberately NOT persisted; toggling rebuilds the grid.
- Hard grid shows only the 12 variant nodes (amber/red styling) with their own
  hard stars; normal grid total fixed from stale `' / 72 ★'` to dynamic
  `LEVELS.length * 3` (now `144 ★`); hard total is `36 ★`.
- Unlock rule: beat the normal variant to open its hard variant
  (`save.stars[i] > 0` for i in 24..35).
- Progress lives under a separate key `milkrun_hard_v1` (`hardSave.stars[12]`);
  absent key = all zeros, values clamped 0–3. Normal save untouched.
- `activeLevel()` = `G.hardMode ? HARD_LEVELS[G.levelIndex+1] : LEVELS[G.levelIndex]`;
  all `LEVELS[G.levelIndex]` call sites (physics, preview, ghost, HUD, win,
  rumble, particles) route through it. `onWin` records hard stars and SKIPS
  ghost recording in hard mode (ghosts stay normal-geometry); `drawGhost()`
  early-returns in hard mode. Win-screen "next" needs no change.
- Intro card kicker gets a red HARD badge: `LEVEL 25 · ABYSS [HARD]`.
- The 12 variants (hard-levels.js, keyed 25–36) use only pre-existing mechanics:
  tighter geometry, stronger hazards, relocated shards, smaller targets —
  Trampoline, Boomerang, Locked Door, Toll Booth, Thread the Needle,
  Event Horizon, The Vault, Orbit Decay, Comet Crossfire, Gauntlet II,
  Wormhole Chain, Abyssal Heart.

### Verification (all on the merged tree, not the build branches)

- **Solver** (pure core + levels.js + hard-levels.js, STEP=1/120, 60 s cap,
  360 angles × speeds 200–700; t0 ∈ {0,0.25,…,maxPeriod} on patrol levels):
  all 12 Maelstrom levels AND all 12 hard variants have a **single-launch,
  all-shards win**. Canonical: L37 0°/200 · L38 341°/700 · L39 0°/300 ·
  L40 356°/200 · L41 0°/500 · L42 0°/200 · L43 346°/600 · L44 0°/400 ·
  L45 0°/200 · L46 0°/300 · L47 0°/200 · L48 0°/600 (all t0=0, wide windows,
  no frame-perfect timing). H25 338°/400 · H26 0°/200 · H27 5°/700 ·
  H28 56°/700 · H29 354°/200 · H30 69°/700 · H31 61°/200 · H32 340°/700 ·
  H33 0°/200 · H34 112°/500 · H35 317°/200 · H36 238°/300.
- **Render sweep** (full game.js in node vm with DOM shims, levels.js +
  hard-levels.js loaded as index.html does): all **48 normal + 12 hard**
  variants, aim + flying states — **ALL PASS, zero exceptions.** Instrumented
  counters prove real execution: drawWind 2728 calls, drawPatrol 2728 calls.
- **Hard functional**: toggle on/off, hard grid, HARD badge intro, solver
  winning launches executed in-vm (several variants won live in the sweep),
  hard stars persisted under `milkrun_hard_v1`, normal save untouched, hard-off
  restores the normal level — ALL PASS.
- **Narrow phone** (390×844 viewport): select overlay, hard toggle, hard
  intro, aim HUD, pause, Sector 5 aim, wind flight — ALL PASS.

### Integration notes

- `index.html` script order: `levels.js`, then `hard-levels.js`, then `game.js`.
- Added the one-line FAIL_TEXT entry the patrol mechanic needed:
  `patrol: 'Clipped by a patrol comet.'`
- **Caught by the merged render sweep**: after the merge, `drawBounceHalo` was
  nested inside `drawRock` again — the exact v0.7.1 scoping-crash pattern,
  reintroduced as an edit artifact during integration (the worker branches were
  clean; the corruption appeared in the final tree). 8 levels failed render.
  Repaired the brace, re-ran the full sweep: ALL PASS. This is why the merged
  sweep exists — real render execution caught what `node --check` cannot.

## v0.8.1 — 2026-09-16 — level-select scroll fix
- **Bug (reported by Alek, on phone):** in the level selector, level 9 was the
  highest reachable — levels 1–8 were cut off above the scrollable area and
  could never be scrolled to.
- **Root cause:** `.overlay` used `display:flex; align-items:center` together
  with `overflow-y:auto`. When the panel (48 levels + 5 sector headers + hard
  toggle) grew taller than the viewport, flex centering pushed its top above
  the scroll origin — unreachable, and invisible to `scrollHeight` (it only
  counts overflow below the origin). Reproduced in headless Chromium at
  390×844: at scrollTop=0 the level-1 button sat at y=-337px.
- **Fix (`style.css`):** dropped `align-items:center` from `.overlay`; the
  panel now centers via `margin:auto`, which centers short content identically
  but keeps tall content's top at the scroll origin (fully reachable). Also
  added `-webkit-overflow-scrolling:touch` for iOS momentum scrolling.
- **Fix (`game.js`):** `toSelect()` now resets `overlay-levels.scrollTop = 0`
  so the selector always opens at the top after a grid rebuild.
- **Verified in real headless-Chrome layout (390×844):** level 1 visible at
  y=+167px at scrollTop=0; level 48 + hard-toggle button fully visible at max
  scroll; 12-level hard grid still perfectly vertically centered
  (panelTop=45px in a 701px viewport); title screen centering unchanged.
  `node --check` clean on all JS. No physics/geometry touched — solver rerun
  not needed.

## v0.9 — 2026-09-17 — True difficulty curve (full rebalance)
- **Why (Alek's verdict after clearing everything):** "the new levels were
  easy as fuck." He asked for all levels redone, ordered easy → hardest.
  The old set's solution windows confirmed it: e.g. old L45 had a wider
  window (10.5°) than old L8 (8°) — the curve was flat-to-inverted.
- **All 48 normal levels redesigned** as one roughly-monotonic difficulty
  ramp, measured by solver solution-window width (angle tolerance at the
  reference speed). Curve now runs 11° (L1) → 1–2.5° (L41–48):
  - Sector 1 Drift (1–8): 11°→8°, gentle tutorial — planets, asteroids,
    depots, slingshots only. Tips on 1, 2, 3, 4, 6.
  - Sector 2 Rogue (9–16): 5–6.5° — black holes, orbiting stations (taught
    on 11), comets, depots. Tips on 9–12.
  - Sector 3 Void (17–24): 7°→3° — wormholes (taught 17), shard gates
    (taught 19), tight budgets. Tips on 17, 19, 20.
  - Sector 4 Abyss (25–36): 4°→1.5° — bounce rocks (taught 25), dense
    combos of everything so far. No wind/patrols.
  - Sector 5 Maelstrom (37–48): 4°→1–2° — wind (taught 37), patrol comets
    (taught 39); finale levels combine headwind + wormhole + black hole +
    patrol + gate 3. Send-off tip on 48.
- **Difficulty philosophy:** every mechanic is taught gently before being
  demanded; new-mechanic intros (17, 25, 37, 39) are deliberate breather
  dips. "Harder" = tighter corridors, riskier shard lines, denser/moving
  hazards, speed gates, patrol/wormhole timing — never blind or unfair.
  The live trajectory preview remains the equalizer for the tightest shots.
- **12 hard variants re-derived** from the new 25–36. Every hard version is
  strictly tighter than its normal counterpart (e.g. 25: 4°→2°, 29: 2°→1°,
  36: 1.5°→1°); all use only Sector-4 mechanics.
- **Verification:** solver (same integrator as flight) finds a single-launch
  all-shard win on all 48 normal + all 12 hard — 60/60, no 0° windows, all
  speeds ≤ 560, no shard inside a kill radius. Headless-Chromium render sweep
  across all 60 levels (aim + flying states): zero JS errors, wind/patrol/
  wormhole/bounce drawing confirmed, 390×844 level-select scroll check passes
  (levels 1–48 + hard toggle all reachable).
- **Known wobbles (accepted):** the ramp is roughly — not strictly — monotonic.
  Local ±1° wobbles remain (e.g. 13→14, 43→47); angle window is one proxy and
  patrol-timing / comet-timing / speed-gate levels (16, 22, 30, 38, 40, 45)
  carry difficulty the proxy misses. Levels 41 & 45 have thin speed slop at
  the reference angle but real 2D (angle×speed) solution regions, verified by
  hand; the trajectory preview makes them findable, not pixel-perfect.
- No code changes: same zero-dependency, no-build-step, file://-compatible
  game. Same localStorage keys (`milkrun_hard_v1` untouched). Only
  `levels.js` and `hard-levels.js` changed.

## v0.10 — 2026-09-17 — Sector 5 gets ears: wind whoosh + patrol warning
- The v0.4 sound pass predated Sector 5, so wind zones (12 levels) and
  patrol comets had no audio identity at all. Two new ambient cues, both
  mirroring the v0.4 black-hole proximity rumble pattern:
  - **Wind whoosh** (`maybeWindWhoosh`): while the ship flies inside a wind
    rect, a soft filtered-noise whoosh pulses every 0.45 s; volume scales
    with wind strength (0.05 + strength/200 × 0.09, shipped zones are
    50–200 px/s²). Silent outside zones.
  - **Patrol warning** (`maybePatrolWarn`): a ticking blip that accelerates
    as the nearest patrol comet closes in — silent beyond 220 units from
    the kill edge, ticking every 0.5 s at range down to 0.12 s at contact,
    pitch fixed, volume rising slightly. Gives timing levels an audio
    telegraph for movers the 3-second preview can't fully cover.
- Both are throttled, flying-only, silent when muted/paused/dead, and
  no-throw without an AudioContext (AudioSys guards) — zero physics or
  level-geometry changes, so the v0.9 solver's 60/60 verification still
  holds and the solver was not re-run. `node --check` clean.
- Verified headlessly with a DOM-shim harness (23/23): whoosh fires once
  in-zone with strength-scaled volume, throttles, re-fires after the
  window, stays silent outside zones / muted / paused / aiming / dead /
  on windless levels; warning stays silent beyond 220, fires a short
  square blip near a patrol, ticks faster closer in, throttles, and stays
  silent paused/muted; all three ambient fns no-throw with no AudioContext;
  20 raw frame() ticks + a full render() on real level 37 (wind) in
  flying state — zero exceptions.
- Not headless-testable: actual mix balance of whoosh/warning against the
  rumble and the ambient pad on phone speakers — for Alek's live play-test.
