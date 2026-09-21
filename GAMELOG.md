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

## v0.11 — 2026-09-18 — Hard Mode gets ghosts
- **The gap:** best-trajectory ghosts (v0.5) only recorded normal-mode wins —
  v0.8 deliberately skipped hard mode, so the 12 hardest levels had no hint
  layer at all. Hard ghosts are now recorded per hard variant, stored under
  the existing `milkrun_hard_v1` key as `ghosts[12]` alongside stars (old
  keys with stars-only migrate to 12 null ghosts; corrupt entries sanitize
  to null, same as the normal table).
- **Correctness:** a hard ghost is recorded against hard geometry and drawn
  over the hard variant via `activeLevel()` — the normal table's ghost is
  never replayed over hard geometry (the v0.8 concern that caused the skip).
  Same replace-protection as normal ghosts: a lower-star win never
  overwrites a better ghost. The aim-screen label reads
  "HARD GHOST — your best shot" to distinguish it.
- **Also:** README was stale since v0.7 (still said "24 levels across
  3 sectors" and omitted `hard-levels.js`) — now describes 48 levels across
  5 sectors + the 12 Hard Mode remixes.
- Verified headlessly with a DOM-shim harness loading the real game.js
  (20/20): hard ghost recorded on hard win (normal save untouched),
  2-star win doesn't overwrite a 3-star ghost / 3-star does, write/load
  round-trip persists ghosts + stars, old stars-only key migrates cleanly,
  corrupt entries sanitize, drawGhost routes to the hard ghost with the HARD
  label in hard mode / stays silent with none / keeps the plain GHOST label
  in normal mode, normal win still records normal ghosts, and a full
  render() on a hard aim screen with a ghost throws nothing.
  `node --check` clean. No physics or level-geometry changes — the v0.9
  solver's 60/60 verification still holds, so the solver was not re-run.
- Not headless-testable: whether the HARD GHOST label/opacity reads well on
  a real phone screen — for Alek's live play-test.

---

## v0.12 — 2026-09-19 — patrol timing telegraph
- **The gap:** patrol comets are the one mover the 3-second trajectory preview
  can't fully telegraph — the dashed gold path line shows *where* a patrol
  goes but not *when* it will be there, so timing shots on the 8 patrol
  levels (39, 40, 43, 44, 45, 46, 47, 48) meant eyeballing a moving body
  against its path. v0.10 added the audio proximity warning for this; this is
  its visual counterpart.
- **What:** on the aim screen, each patrol comet now paints its future
  positions over the next ~3.5 s (14 dots × 0.25 s, just past the preview
  window) as fading amber dots along its path — alpha 0.55 → 0.08, radius
  shrinking. The dots advance live with the level clock, so they stay in sync
  with launch-time physics: what you see is where the patrol will actually be.
- Aim-screen only — flying keeps the v0.10 audio telegraph, intro/pause stay
  clean. Pure render layer (`patrolPos` was already pure): no physics,
  level-geometry, save, or localStorage changes, so the v0.9 solver's 60/60
  verification still holds and the solver was not re-run.
- Verified headlessly with a DOM-shim harness (22/22): telegraph fires once
  per patrol on all 8 patrol levels, silent on flying/paused/intro screens
  and on patrol-less levels, 14 dots with strictly decreasing alpha/radius
  lying on the patrol path and tracking `att.t`; 60/60 aim renders (48 normal
  + 12 hard) throw nothing. `node --check` clean on all JS.
- Not headless-testable: whether the dot density/alpha reads well on a real
  phone screen — for Alek's live play-test.

---

## v0.14 — 2026-09-21 — black-hole capture-zone rings
- **The gap:** the 3-second trajectory preview shows *where* a black hole bends
  your flight, but the hole's visual (38 px event horizon + glow) says nothing
  about *how far the danger reaches* — the black-hole levels (9, 13, 15, 20,
  the Abyss 25–36 and the hard remixes) are the ones v0.1 flagged as having
  the narrowest win windows, and grazing them was pure feel.
- **What:** on the aim screen, each black hole now paints a dashed red ring at
  its escape-velocity capture radius — the distance where escape speed equals
  full launch power (r = 2·G·m/MAXV²). Inside it, no straight shot can climb
  back out: the practical point of no return, telegraphed visually the same
  way v0.12 telegraphed patrol *timing*. The ring is skipped for weak wells
  whose radius falls inside the event horizon itself (e.g. the m=2000 holes),
  where it would teach nothing. Aim-screen only — the v0.4 black-hole rumble
  stays the in-flight telegraph, mirroring the audio/visual split of the
  patrol pair.
- **Teaching:** level 9's tip ("Wide Berth") now names the ring explicitly;
  README Rules documents it.
- Zero physics, level-geometry, save, or localStorage changes — a pure
  `captureRadius(b)` in the physics core plus render layer — so the v0.9
  solver's 60/60 verification still holds and the solver was not re-run.
  (The levels.js change is a tip string only, no geometry.)
- Verified headlessly with a DOM-shim harness loading the real game.js
  (14/14): captureRadius matches the formula exactly; one dashed red ring at
  rcap per qualifying hole (~231 px for L9's hole vs its 38 px body); no ring
  for the sub-horizon well; spy confirms the ring fires on aim and stays
  silent on flying/paused/intro; a real aim render paints each qualifying
  hole's ring at the computed radius; 60/60 aim renders (48 normal + 12 hard)
  throw nothing. `node --check` clean on all JS.
- Not headless-testable: whether the ring reads as "do not cross" rather than
  decoration on a real phone screen — for Alek's live play-test.

---

## v0.13 — 2026-09-20 — haptic feedback (mobile vibration)

- **The gap:** every key game moment had sound and visuals but no feel — on
  the phone (the primary platform) launches, crashes, and deliveries were
  silent to the hand. Two nights of audio telegraphs (v0.4/v0.10) and the
  v0.12 patrol telegraph all assumed ears and eyes; this is the tactile
  counterpart, and the whole game already assumed touch input.
- **What:** `buzz(pattern)` helper in game.js wrapping `navigator.vibrate`,
  fired exactly where the matching sfx fires — so it stays in sync by
  construction:
  - launch: short kick (25 ms) on release
  - delivery: celebratory double-thump `[20,60,20,60,45]`
  - death: heavy thud (90 ms)
  - bounce rock: 35 ms; wormhole warp `[12,30,12]`; fuel depot `[15,45,15]`;
    shard pickup 12 ms; gate unlock `[20,50,20]`; gate denied `[50,40,50]`
  - Muting cancels any in-flight vibration (`vibrate(0)`) and silences all
    future buzzing — the mute button is the quiet button.
  - No-op where `navigator.vibrate` doesn't exist (desktop, iOS): guarded by
    `typeof navigator !== 'undefined'` + a try/catch, so the pure core stays
    import-safe and iOS players see no behavior change.
- Zero physics, level-geometry, save, or localStorage changes — purely
  additive event hooks — so the v0.9 solver's 60/60 verification still holds
  and the solver was not re-run. README Controls updated (mute line, Haptics
  bullet). `node --check` clean on all JS.
- Verified headlessly with a DOM-shim harness loading the real game.js
  (20/20): exact vibration pattern at all 9 event sites driven through the
  real `doLaunch` / `onWin` / `onFail` / `handleAttemptEvents` paths, mute
  silences and cancels, no-throw with `navigator` undefined or `vibrate`
  absent, and a 60/60 aim-render sweep (48 normal + 12 hard) throws nothing.
- Not headless-testable: whether the patterns feel right on a real phone —
  vibration motor strength varies by device, and iOS gets nothing at all —
  for Alek's live play-test.

---

## v0.15 — 2026-09-21 — Wheyward Passage: second galaxy, 60 new levels

- **The ask:** Alek beat all 60 levels and wanted a new pack in a different
  galaxy — "a new setting, a different galaxy or something completely different."
- **What:** **Wheyward Passage** — "the last milkman's second run" — a full
  second pack: 48 normal levels + 12 hard variants = 60 playable, in a warm
  amber/burgundy galaxy (bg `#160a14`/`#241019`/`#3a1220`, amber starfield).
  - Sectors: Homestead (1–8) · Culture (9–16) · Churn (17–24) · Curdle (25–36) ·
    Rind (37–48). New mechanics introduced per sector; finale "The Last Drop"
    forces fold → slingshot → comet thread through a rock wall.
  - Hard variants remix Curdle levels 25–36 (tighter rocks, hungrier maws,
    faster comets, fewer launches), keyed the same way as the originals.
- **Pack selector:** title screen has a galaxy picker (Cosmic Delivery /
  Wheyward Passage); subtitle, tagline, blurb, backdrop gradient, star colors,
  and UI accents all follow the active pack. Pack choice persists in
  `milkrun_pack_v1`.
- **Separation:** each pack keeps its own stars, ghosts, sector progression,
  and hard state — `milkrun_save_v2` / `milkrun_hard_v2` for Wheyward; the
  original `milkrun_save_v1` / `milkrun_hard_v1` are untouched.
- **Pack abstraction in game.js:** `PACKS` table with
  `activePack()` / `activeLevels()` / `activeSectors()` / `activeHard()`;
  every direct `LEVELS` / `SECTORS` / `HARD_LEVELS` / save-key reference
  routed through it. No physics, capture-ring, or haptics changes.
- **Verification:** automated solver (same 120 Hz integrator as flight)
  confirms a 3-star path (delivery + all shards, one launch) for every level:
  Wheyward 48/48 normal, 12/12 hard; regression re-run on the original pack
  holds 48/48 + 12/12. `node --check` clean on all six JS files.
- Capture-zone rings unchanged (still dashed red on both packs, v0.14).
- Not headless-testable: whether the Wheyward palette reads as a distinct
  galaxy (vs decoration) on a real phone screen — for Alek's live play-test.

## v0.16 — 2026-09-21 — Wheyward Passage difficulty retune: harder than the original finale

- **The ask:** Alek: "Make the new levels in the new pack for milks run harder. Like harder than the last level on first pack." Standing spec: the easiest Wheyward level should hit harder than the original pack's finale (L48 "The Last Delivery").
- **Calibration (120 Hz `simulateLaunch` integrator):** Original L48 solves at 6°, speed 400, with a 2° winning angle window and 60 speed window (2 launches, 3 shards). Original hard L36 ("Heart of the Abyss") has a 1° angle window. Wheyward's bar: normal windows ≤2°.
- **What changed (`levels2.js`):** Retuned all 48 Wheyward normal levels — smaller stations (down to r14), heavier maws (up to m24,000), faster comets/patrols, tighter bounce geometry. Five stubborn levels got surgical passes: L13 Comet Pasture (maw repositioned, 2.5°→2°), L23 Toll Gate (station r16→r14), L32 Moving Curd (station tightened, orbit accelerated), L37 Slingshot (station r18→r16, 2.5°→2°), L40 Comet Blizzard (station r18→r16).
- **What changed (`hard-levels2.js`):** Regenerated all 12 hard remixes from the retuned normals via `work/make_hard.js` — minimal deltas (station shrinks, maw bumps, comet speed-ups) that preserve the normal's solution path. H36 gets a 5th shard on the solution trajectory instead of geometry changes (the level was at the solvability ceiling).
- **Verification:** Automated solver (same integrator as flight) confirms a win with all shards in one launch for every level: Wheyward normal 48/48 (windows: min 0°, median 1.5°, avg 1.23°, max 2.5°; 45/48 at ≤2°, L23/L32/L40 at 2.5° — the tightener's solvability limit), Wheyward hard 12/12 (windows: min 0°, median 0.5°, max 2°; every hard ≤ its normal). Regression: original pack holds 48/48 + 12/12. `node --check` clean on all five JS files. Original-pack files (`levels.js`, `hard-levels.js`, `game.js`, `index.html`) untouched — `git diff` shows only `levels2.js` and `hard-levels2.js`.
- **Not headless-testable:** whether the retuned difficulty feels fair vs. punishing on a real phone — for Alek's live play-test.
