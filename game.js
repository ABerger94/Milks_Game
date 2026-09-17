'use strict';
/* MILK RUN — Cosmic Delivery : game.js
   Pure physics core first (no DOM), then the full game. The pure section is
   imported by the node solver test, so keep it dependency-free. */

/* ================= PURE CORE (no DOM) ================= */
const WORLD_W = 1280, WORLD_H = 720;
const GRAV = 4000;         // gravitational constant
const SOFT = 1600;         // softening^2 (keeps forces finite near centers)
const SHIP_R = 14;
const MAXV = 720;          // max launch speed px/s
const MINV = 50;           // below this the launch is cancelled
const AIM_K = 2.2;         // drag px -> velocity px/s
const STEP = 1 / 120;      // flight physics timestep
const PREV_DT = 1 / 80;    // preview timestep
const PREV_STEPS = 240;    // ~3.0 s of preview
const BOUND = 90;          // out-of-bounds margin

function stationPos(level, t) {
  const s = level.station;
  if (s.orbit) {
    const o = s.orbit;
    return {
      x: o.cx + Math.cos(o.phase + t * o.speed) * o.radius,
      y: o.cy + Math.sin(o.phase + t * o.speed) * o.radius,
      r: s.r
    };
  }
  return { x: s.x, y: s.y, r: s.r };
}

function addWell(ax, ay, x, y, wx, wy, m) {
  const dx = wx - x, dy = wy - y;
  const d2 = dx * dx + dy * dy + SOFT;
  const d = Math.sqrt(d2);
  const f = GRAV * m / (d2 * d);
  return [ax + f * dx, ay + f * dy];
}

function accelAt(x, y, level) {
  let ax = 0, ay = 0, r;
  const ps = level.planets || [];
  for (let i = 0; i < ps.length; i++) { r = addWell(ax, ay, x, y, ps[i].x, ps[i].y, ps[i].m); ax = r[0]; ay = r[1]; }
  const bs = level.blackholes || [];
  for (let i = 0; i < bs.length; i++) { r = addWell(ax, ay, x, y, bs[i].x, bs[i].y, bs[i].m); ax = r[0]; ay = r[1]; }
  // wind zones: constant acceleration while the ship's center is inside the rect
  const ws = level.winds || [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) { ax += w.ax; ay += w.ay; }
  }
  return { ax, ay };
}

// Patrol comet position: pure function of time (no integration drift).
// Ping-pongs linearly between (x1,y1) and (x2,y2); period in seconds, phase 0..1.
function patrolPos(p, t) {
  const ph = (((t / p.period) + p.phase) % 1 + 1) % 1;
  const tri = ph < 0.5 ? 2 * ph : 2 - 2 * ph;
  return { x: p.x1 + (p.x2 - p.x1) * tri, y: p.y1 + (p.y2 - p.y1) * tri, r: p.r };
}

function newAttempt(level) {
  return {
    x: level.ship.x, y: level.ship.y, vx: 0, vy: 0,
    flying: false, t: 0, trail: [],
    comets: (level.comets || []).map(c => ({ x: c.x, y: c.y, r: c.r, vx: c.vx, vy: c.vy })),
    shardsGot: new Set(), depotsUsed: new Set(),
    whCooldown: 0, dead: false, deadWhy: null, won: false,
    stallT: 0,
    // transient event flags consumed by the presentation layer
    warped: false, depotHit: false, shardHit: -1,
    bounced: false, gateDenied: false, gateUnlocked: false, gateIn: false,
    gateOpen: !(level.station && level.station.gate > 0)
  };
}

function bounceComet(c) {
  if (c.x < c.r) { c.x = c.r; c.vx = Math.abs(c.vx); }
  if (c.x > WORLD_W - c.r) { c.x = WORLD_W - c.r; c.vx = -Math.abs(c.vx); }
  if (c.y < c.r) { c.y = c.r; c.vy = Math.abs(c.vy); }
  if (c.y > WORLD_H - c.r) { c.y = WORLD_H - c.r; c.vy = -Math.abs(c.vy); }
}

function stepAmbient(st, level, dt) {
  st.t += dt;
  for (const c of st.comets) { c.x += c.vx * dt; c.y += c.vy * dt; bounceComet(c); }
  if (st.whCooldown > 0) st.whCooldown -= dt;
}

// Returns null | 'win' | 'dead'. Mutates st.
function stepAttempt(st, level, dt) {
  stepAmbient(st, level, dt);
  if (!st.flying || st.won || st.dead) return null;

  const a = accelAt(st.x, st.y, level);
  st.vx += a.ax * dt;
  st.vy += a.ay * dt;
  st.x += st.vx * dt;
  st.y += st.vy * dt;
  st.trail.push(st.x, st.y);
  if (st.trail.length > 240) st.trail.splice(0, 2);

  const sp = Math.sqrt(st.vx * st.vx + st.vy * st.vy);
  if (sp < 12) st.stallT += dt; else st.stallT = 0;
  if (st.stallT > 5) { st.dead = true; st.deadWhy = 'stall'; return 'dead'; }

  // wormholes (preserve velocity vector)
  if (st.whCooldown <= 0) {
    const whs = level.wormholes || [];
    for (let i = 0; i < whs.length; i++) {
      const w = whs[i];
      const dx = st.x - w.x, dy = st.y - w.y;
      if (dx * dx + dy * dy < w.r * w.r) {
        const o = whs[w.link];
        st.x = o.x; st.y = o.y;
        st.whCooldown = 0.6;
        st.warped = true;
        break;
      }
    }
  }

  const hitR = (ox, oy, rr) => { const dx = st.x - ox, dy = st.y - oy; return dx * dx + dy * dy < rr * rr; };

  for (const p of (level.planets || []))
    if (hitR(p.x, p.y, p.r + SHIP_R - 2)) { st.dead = true; st.deadWhy = 'crash'; return 'dead'; }
  for (const b of (level.blackholes || []))
    if (hitR(b.x, b.y, b.r)) { st.dead = true; st.deadWhy = 'blackhole'; return 'dead'; }
  for (const at of (level.asteroids || []))
    if (hitR(at.x, at.y, at.r + SHIP_R - 2)) {
      if (at.bounce) {
        // trampoline rock: reflect velocity about the surface normal, damped
        const dx = st.x - at.x, dy = st.y - at.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / d, ny = dy / d;
        st.x = at.x + nx * (at.r + SHIP_R - 1);
        st.y = at.y + ny * (at.r + SHIP_R - 1);
        const vn = st.vx * nx + st.vy * ny;
        if (vn < 0) {
          st.vx -= 1.75 * vn * nx;   // restitution ~0.75
          st.vy -= 1.75 * vn * ny;
          st.bounced = true;
        }
      } else { st.dead = true; st.deadWhy = 'asteroid'; return 'dead'; }
    }
  for (const c of st.comets)
    if (hitR(c.x, c.y, c.r + SHIP_R - 2)) { st.dead = true; st.deadWhy = 'comet'; return 'dead'; }
  for (const pl of (level.patrols || [])) {
    const pp = patrolPos(pl, st.t);
    if (hitR(pp.x, pp.y, pl.r + SHIP_R - 2)) { st.dead = true; st.deadWhy = 'patrol'; return 'dead'; }
  }

  (level.depots || []).forEach((d, i) => {
    if (st.depotsUsed.has(i)) return;
    if (hitR(d.x, d.y, d.r + SHIP_R + 4)) { st.depotsUsed.add(i); st.depotHit = true; }
  });
  (level.shards || []).forEach((s, i) => {
    if (st.shardsGot.has(i)) return;
    if (hitR(s.x, s.y, 30)) { st.shardsGot.add(i); st.shardHit = i; }
  });
  // shard gate: station unlocks once enough shards are held (banked shards count)
  const gate = (level.station && level.station.gate) || 0;
  if (gate > 0 && !st.gateOpen && st.shardsGot.size >= gate) { st.gateOpen = true; st.gateUnlocked = true; }

  const sp2 = stationPos(level, st.t);
  if (hitR(sp2.x, sp2.y, sp2.r)) {
    if (st.gateOpen) { st.won = true; return 'win'; }
    // locked station: harmless pass-through, one denied event per entry
    if (!st.gateIn) { st.gateIn = true; st.gateDenied = true; }
  } else st.gateIn = false;

  if (st.x < -BOUND || st.x > WORLD_W + BOUND || st.y < -BOUND || st.y > WORLD_H + BOUND) {
    st.dead = true; st.deadWhy = 'lost'; return 'dead';
  }
  return null;
}

// Trajectory preview: identical integrator, 240 small steps. Returns points + outcome.
function previewPath(level, x, y, vx, vy, t0) {
  const st = newAttempt(level);
  // pre-roll ambient (comets, clock) to the current level time
  let pre = t0;
  while (pre > 0) { const dt = Math.min(PREV_DT, pre); stepAmbient(st, level, dt); pre -= dt; }
  st.x = x; st.y = y; st.vx = vx; st.vy = vy; st.flying = true;
  const pts = [];
  for (let i = 0; i < PREV_STEPS; i++) {
    const ev = stepAttempt(st, level, PREV_DT);
    if (i % 4 === 0) pts.push(st.x, st.y);
    if (ev) return { pts, end: ev, why: st.deadWhy, ex: st.x, ey: st.y };
  }
  return { pts, end: null, why: null, ex: st.x, ey: st.y };
}

// Solver helper: fire one launch, simulate up to maxT seconds. Returns 'win' | 'dead' + detail.
// t0 (optional, default 0) pre-rolls ambient time before the launch — lets the
// solver model the player waiting for patrols / orbiting stations before firing.
function simulateLaunch(level, angle, speed, maxT, t0) {
  const st = newAttempt(level);
  let pre = t0 || 0;
  while (pre > 0) { const dt = Math.min(PREV_DT, pre); stepAmbient(st, level, dt); pre -= dt; }
  st.vx = Math.cos(angle) * speed;
  st.vy = Math.sin(angle) * speed;
  st.flying = true;
  let t = 0;
  while (t < maxT) {
    const ev = stepAttempt(st, level, STEP);
    if (ev === 'win') return { result: 'win', shards: st.shardsGot.size, t };
    if (ev === 'dead') return { result: 'dead', why: st.deadWhy, shards: st.shardsGot.size };
    t += STEP;
  }
  return { result: 'timeout', shards: st.shardsGot.size };
}

/*__DOM__*/
/* ================= SAVE ================= */
const SAVE_KEY = 'milkrun_save_v1';
let save = { stars: [], ghosts: [], muted: false };
// Sized to the level list; old saves of any length are padded, never wiped.
function sizeSaveArrays() {
  while (save.stars.length < LEVELS.length) save.stars.push(0);
  while (save.ghosts.length < LEVELS.length) save.ghosts.push(null);
  save.stars.length = LEVELS.length;
  save.ghosts.length = LEVELS.length;
}
sizeSaveArrays();
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (Array.isArray(s.stars)) save.stars = s.stars.map(n => Math.max(0, Math.min(3, n | 0)));
      // ghost: best winning launch vector per level {vx,vy,stars} | null
      if (Array.isArray(s.ghosts))
        save.ghosts = s.ghosts.map(g => (g && isFinite(g.vx) && isFinite(g.vy)) ? { vx: +g.vx, vy: +g.vy, stars: g.stars | 0 } : null);
      save.muted = !!s.muted;
      sizeSaveArrays();
    }
  } catch (e) { /* storage unavailable: play session-only */ }
}
function writeSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
}
function levelUnlocked(i) { return i === 0 || save.stars[i - 1] > 0; }
function totalStars() { return save.stars.reduce((a, b) => a + b, 0); }

/* ================= HARD MODE SAVE ================= */
// Hard variants cover levels 25-36 (HARD_LEVELS keyed by level NUMBER).
// hardSave.stars[k] holds stars for level number HARD_FIRST+1+k.
const HARD_SAVE_KEY = 'milkrun_hard_v1';
const HARD_FIRST = 24;      // 0-based index of level 25
const HARD_COUNT = 12;
let hardSave = { stars: [] };
function sizeHardSave() {
  while (hardSave.stars.length < HARD_COUNT) hardSave.stars.push(0);
  hardSave.stars.length = HARD_COUNT;
}
sizeHardSave();
function loadHardSave() {
  try {
    const raw = localStorage.getItem(HARD_SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (Array.isArray(s.stars)) hardSave.stars = s.stars.map(n => Math.max(0, Math.min(3, n | 0)));
      sizeHardSave();
    }
  } catch (e) { /* storage unavailable: play session-only */ }
}
function writeHardSave() {
  try { localStorage.setItem(HARD_SAVE_KEY, JSON.stringify(hardSave)); } catch (e) {}
}
// A hard variant unlocks once its normal counterpart is beaten.
function hardUnlocked(i) { return i >= HARD_FIRST && i < HARD_FIRST + HARD_COUNT && save.stars[i] > 0; }
function totalHardStars() { return hardSave.stars.reduce((a, b) => a + b, 0); }
loadHardSave();

/* Active level: the normal table, or the hard variant when hard mode is on.
   G.levelIndex stays the 0-based normal index in both modes; hard variants
   are keyed by level NUMBER (25-36). G.hardMode is session state —
   undefined/falsy means off, so normal boot needs no migration. */
function activeLevel() {
  return G.hardMode ? HARD_LEVELS[G.levelIndex + 1] : LEVELS[G.levelIndex];
}

/* ================= AUDIO (all synthesized) ================= */
const AudioSys = {
  ctx: null, master: null, ambNodes: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = save.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
    } catch (e) {}
  },
  setMuted(m) {
    save.muted = m; writeSave();
    if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.02);
    const b = document.getElementById('btn-mute');
    if (b) b.textContent = m ? '✕' : '♪';
  },
  tone(freq, dur, type, vol, slideTo, delay) {
    if (!this.ctx || save.muted) return;
    const t0 = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  },
  noise(dur, vol, cutoff, delay) {
    if (!this.ctx || save.muted) return;
    const t0 = this.ctx.currentTime + (delay || 0);
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff || 1200;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol || 0.3, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t0);
  },
  startAmbient() {
    if (!this.ctx || this.ambNodes) return;
    try {
      const g = this.ctx.createGain(); g.gain.value = 0.035; g.connect(this.master);
      const o1 = this.ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
      const o2 = this.ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 82.5;
      const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lg = this.ctx.createGain(); lg.gain.value = 0.018;
      lfo.connect(lg); lg.connect(g.gain);
      o1.connect(g); o2.connect(g); o1.start(); o2.start(); lfo.start();
      this.ambNodes = { g, o1, o2, lfo };
    } catch (e) {}
  }
};
const sClick    = () => AudioSys.tone(660, 0.06, 'square', 0.08);
const sLaunch   = () => {
  AudioSys.tone(220, 0.4, 'sawtooth', 0.16, 60);       // engine roar down
  AudioSys.tone(70, 0.5, 'sine', 0.18, 34);            // sub-bass thump
  AudioSys.tone(280, 0.35, 'sine', 0.07, 1500);        // whistle climbing up
  AudioSys.noise(0.3, 0.12, 900);                      // air rush
};
// Pentatonic ladder: each shard pickup climbs one note — collecting a run sings.
const SHARD_SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];
const sPickup   = (n) => {
  const f = SHARD_SCALE[Math.min(Math.max(0, n | 0), SHARD_SCALE.length - 1)];
  AudioSys.tone(f, 0.18, 'triangle', 0.18);
  AudioSys.tone(f * 2, 0.14, 'sine', 0.08, null, 0.03);
};
const sDelivery = () => {
  [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => AudioSys.tone(f, 0.25, 'sine', 0.18, null, i * 0.08));
  AudioSys.tone(2093, 0.5, 'sine', 0.05, null, 0.5);   // high shimmer after the arpeggio
};
const sExplode  = () => { AudioSys.noise(0.6, 0.4, 700); AudioSys.tone(90, 0.5, 'sine', 0.3, 30); };
const sWormhole = () => {
  AudioSys.tone(300, 0.35, 'sine', 0.16, 1200);
  AudioSys.tone(1800, 0.3, 'sine', 0.06, 350, 0.05);   // sparkle sweep down
};
const sDepot    = () => { [392, 523, 659].forEach((f, i) => AudioSys.tone(f, 0.14, 'triangle', 0.16, null, i * 0.07)); };
const sDenied   = () => AudioSys.tone(160, 0.15, 'square', 0.1, 110);
const sBounce   = () => { AudioSys.tone(320, 0.16, 'sine', 0.2, 95); AudioSys.noise(0.08, 0.12, 1400); };
const sGateDeny = () => { AudioSys.tone(150, 0.18, 'square', 0.12, 85); AudioSys.noise(0.1, 0.1, 500); };
const sGateOpen = () => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => AudioSys.tone(f, 0.2, 'triangle', 0.15, null, i * 0.09)); };
// Black-hole proximity rumble: low growl while flying near one, throttled.
function maybeRumble(dt) {
  if (G.screen !== 'flying' || !G.att || G.att.dead) { G.rumbleT = 0; return; }
  const a = G.att;
  let near = false;
  for (const b of (activeLevel().blackholes || [])) {
    const dx = a.x - b.x, dy = a.y - b.y;
    if (dx * dx + dy * dy < 280 * 280) { near = true; break; }
  }
  if (!near) { G.rumbleT = 0; return; }
  G.rumbleT -= dt;
  if (G.rumbleT <= 0) {
    AudioSys.tone(48, 0.3, 'sawtooth', 0.1, 32);
    G.rumbleT = 0.4;
  }
}

// Wind-zone whoosh: a soft air rush while the ship flies through a wind
// zone, volume scaled with wind strength (shipped levels use 50–200 px/s²).
// Throttled pulses; silent when muted/paused, no-throw without AudioContext.
function maybeWindWhoosh(dt) {
  if (G.screen !== 'flying' || !G.att || G.att.dead) { G.windT = 0; return; }
  const a = G.att, lv = activeLevel();
  let str = 0;
  for (const w of (lv.winds || [])) {
    if (a.x >= w.x && a.x <= w.x + w.w && a.y >= w.y && a.y <= w.y + w.h)
      str = Math.max(str, Math.sqrt(w.ax * w.ax + w.ay * w.ay));
  }
  if (!str) { G.windT = 0; return; }
  G.windT -= dt;
  if (G.windT <= 0) {
    AudioSys.noise(0.4, 0.05 + Math.min(str, 200) / 200 * 0.09, 900);
    G.windT = 0.45;
  }
}

// Patrol-comet proximity warning: a ticking blip whose rate accelerates as
// the nearest patrol comet closes in (silent beyond 220 units, fastest at
// kill range). Throttled; silent when muted/paused.
function maybePatrolWarn(dt) {
  if (G.screen !== 'flying' || !G.att || G.att.dead) { G.patrolT = 0; return; }
  const a = G.att, lv = activeLevel();
  const patrols = lv.patrols || [];
  if (!patrols.length) { G.patrolT = 0; return; }
  let nearest = Infinity;
  for (const p of patrols) {
    const pp = patrolPos(p, a.t);
    const dx = a.x - pp.x, dy = a.y - pp.y;
    const d = Math.sqrt(dx * dx + dy * dy) - (p.r + SHIP_R);
    if (d < nearest) nearest = d;
  }
  if (nearest > 220) { G.patrolT = 0; return; }
  G.patrolT -= dt;
  if (G.patrolT <= 0) {
    const k = 1 - Math.max(0, nearest) / 220;  // 0 at range edge → 1 at contact
    AudioSys.tone(1180, 0.05, 'square', 0.04 + k * 0.05);
    G.patrolT = 0.5 - k * 0.38;                // 0.5 s far → 0.12 s close
  }
}

/* ================= CANVAS / VIEW ================= */
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let CW = 0, CH = 0, DPR = 1;
const view = { scale: 1, ox: 0, oy: 0 };
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  CW = window.innerWidth; CH = window.innerHeight;
  canvas.width = Math.round(CW * DPR); canvas.height = Math.round(CH * DPR);
  canvas.style.width = CW + 'px'; canvas.style.height = CH + 'px';
  view.scale = Math.min(CW / WORLD_W, CH / WORLD_H);
  view.ox = (CW - WORLD_W * view.scale) / 2;
  view.oy = (CH - WORLD_H * view.scale) / 2;
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
function toWorld(px, py) { return [(px - view.ox) / view.scale, (py - view.oy) / view.scale]; }

/* ================= GAME STATE ================= */
const G = {
  screen: 'title',       // title | select | intro | aim | flying | paused | win | fail
  pauseFrom: 'aim',
  levelIndex: 0,
  att: null,             // attempt state (pure core)
  launchesLeft: 0,
  launchesUsed: 0,
  levelShards: null,     // shard indices banked across attempts this level
  levelDepots: null,     // depot indices used up across attempts this level
  aiming: false,
  aimStart: { x: 0, y: 0 },   // touch-down point: drag is relative, thumbstick-style
  aimCur: { x: 0, y: 0 },
  lastLaunch: null,        // launch vector of the current attempt's shot (for ghost recording)
  particles: [],
  rings: [],              // expanding shockwave rings (visual juice)
  shake: 0,
  rumbleT: 0,             // black-hole proximity rumble throttle
  windT: 0,               // wind-zone whoosh throttle
  patrolT: 0,            // patrol-comet proximity warning throttle
  time: 0,
  idleT: 0,              // title-screen animation clock
  stars: [],             // starfield layers
  winStars: 0,
  failWhy: '',
  overlayMsg: ''
};

const FAIL_TEXT = {
  crash: 'Crashed into a planet.',
  blackhole: 'Swallowed by the black hole.',
  asteroid: 'Shredded by an asteroid.',
  comet: 'Clipped by a comet.',
  patrol: 'Clipped by a patrol comet.',
  lost: 'Drifted off into the void.',
  stall: 'Lost in the drift.',
  nolaunch: 'Out of launches.'
};

/* starfield: 3 parallax layers */
function initStars() {
  G.stars = [];
  const counts = [110, 70, 40], speeds = [6, 16, 34], sizes = [1, 1.6, 2.4];
  for (let l = 0; l < 3; l++) {
    const arr = [];
    for (let i = 0; i < counts[l]; i++) {
      arr.push({ bx: Math.random(), by: Math.random(), s: sizes[l] * (0.6 + Math.random() * 0.8),
                 tw: Math.random() * 6.28, sp: speeds[l] * (0.7 + Math.random() * 0.6) });
    }
    G.stars.push(arr);
  }
}

/* ================= UI / SCREENS ================= */
const $ = id => document.getElementById(id);
function showOnly(id) {
  ['overlay-title', 'overlay-levels', 'overlay-intro', 'overlay-pause', 'overlay-win', 'overlay-fail'].forEach(o => {
    $(o).classList.toggle('hidden', o !== id);
  });
  $('hud').classList.toggle('hidden', !(id === null && (G.screen === 'aim' || G.screen === 'flying' || G.screen === 'paused')));
}
function refreshMuteBtn() { $('btn-mute').textContent = save.muted ? '✕' : '♪'; }

function toTitle() {
  G.screen = 'title'; G.aiming = false;
  showOnly('overlay-title');
}
function toSelect() {
  G.screen = 'select';
  buildLevelGrid();
  showOnly('overlay-levels');
  // Always open at the top — a stale scroll position could strand the
  // first rows out of reach after the grid rebuilds at a new height.
  $('overlay-levels').scrollTop = 0;
}
function buildLevelGrid() {
  const wrap = $('level-grid'); wrap.innerHTML = '';
  if (G.hardMode) { buildHardGrid(wrap); return; }
  let s = -1;
  LEVELS.forEach((lv, i) => {
    if (lv.sector !== s) {
      s = lv.sector;
      const h = document.createElement('div');
      h.className = 'sector-head';
      h.textContent = SECTORS[s].name + ' — ' + SECTORS[s].tag;
      wrap.appendChild(h);
    }
    const b = document.createElement('button');
    b.className = 'lvl' + (levelUnlocked(i) ? '' : ' locked');
    const st = save.stars[i];
    b.innerHTML = '<span class="lvl-n">' + (i + 1) + '</span>' +
      '<span class="lvl-s">' + '★'.repeat(st) + '<span class="dim">' + '★'.repeat(3 - st) + '</span></span>';
    b.title = lv.name;
    if (levelUnlocked(i)) b.addEventListener('click', () => { sClick(); startLevel(i, true); });
    else b.addEventListener('click', () => sDenied());
    wrap.appendChild(b);
  });
  const ts = $('total-stars');
  ts.textContent = totalStars() + ' / ' + (LEVELS.length * 3) + ' ★';
  ts.classList.remove('hard-total');
}

// Hard-mode level select: only the 12 Abyss variants, each unlocked by
// beating its normal counterpart. Stars render in amber hard styling.
function buildHardGrid(wrap) {
  const h = document.createElement('div');
  h.className = 'sector-head hard-head';
  h.textContent = 'Abyss — hard mode · beat the normal level to unlock its variant';
  wrap.appendChild(h);
  for (let i = HARD_FIRST; i < HARD_FIRST + HARD_COUNT; i++) {
    const b = document.createElement('button');
    const unlocked = hardUnlocked(i);
    b.className = 'lvl hard' + (unlocked ? '' : ' locked');
    const st = hardSave.stars[i - HARD_FIRST];
    b.innerHTML = '<span class="lvl-n">' + (i + 1) + '</span>' +
      '<span class="lvl-s">' + '★'.repeat(st) + '<span class="dim">' + '★'.repeat(3 - st) + '</span></span>';
    b.title = HARD_LEVELS[i + 1].name;
    if (unlocked) b.addEventListener('click', () => { sClick(); startLevel(i, true); });
    else b.addEventListener('click', () => sDenied());
    wrap.appendChild(b);
  }
  const ts = $('total-stars');
  ts.textContent = totalHardStars() + ' / ' + (HARD_COUNT * 3) + ' ★';
  ts.classList.add('hard-total');
}

// Hard-mode toggle: lives on the level-select overlay only, never in the
// in-level HUD. G.hardMode is session state (not persisted to storage).
function toggleHardMode() {
  G.hardMode = !G.hardMode;
  const b = $('btn-hard-toggle');
  b.textContent = G.hardMode ? 'HARD MODE: ON' : 'HARD MODE: OFF';
  b.classList.toggle('on', !!G.hardMode);
  buildLevelGrid();
}
$('btn-hard-toggle').addEventListener('click', () => { sClick(); toggleHardMode(); });

function startLevel(i, withIntro) {
  G.levelIndex = i;
  const lv = activeLevel();
  G.att = newAttempt(lv);
  G.launchesLeft = lv.launches;
  G.launchesUsed = 0;
  G.levelShards = new Set();
  G.levelDepots = new Set();
  G.particles = [];
  G.rings = [];
  G.shake = 0;
  G.aiming = false;
  if (withIntro) { showIntroCard(lv, i); return; }
  G.screen = 'aim';
  showOnly(null);
}

// Level intro card: name, sector, budgets, and the level's tip (if any).
// Shown when entering from level select or the win screen — never on retry,
// so a failed run doesn't make you tap through it again.
function showIntroCard(lv, i) {
  const kick = 'LEVEL ' + (i + 1) + ' · ' + SECTORS[lv.sector].name.toUpperCase();
  $('intro-kicker').innerHTML = G.hardMode ? kick + ' <span class="hard-badge">HARD</span>' : kick;
  $('intro-name').textContent = lv.name;
  let stats = lv.launches + ' launches · par ' + lv.par + ' · ' + lv.shards.length + ' shards';
  if (lv.station.gate) stats += ' · station locked: ' + lv.station.gate + '◆';
  $('intro-stats').textContent = stats;
  const tip = $('intro-tip');
  tip.textContent = lv.tip || '';
  tip.style.display = lv.tip ? '' : 'none';
  G.screen = 'intro';
  showOnly('overlay-intro');
}

function dismissIntro() {
  if (G.screen !== 'intro') return;
  sClick();
  G.screen = 'aim';
  showOnly(null);
}

function restartLevel() { sClick(); startLevel(G.levelIndex); }

function togglePause(force) {
  if (G.screen === 'paused') {
    G.screen = G.pauseFrom; showOnly(null); sClick();
  } else if ((G.screen === 'aim' || G.screen === 'flying') && force !== false) {
    G.pauseFrom = G.screen; G.screen = 'paused'; G.aiming = false;
    showOnly('overlay-pause'); sClick();
  }
}

function onWin() {
  const lv = activeLevel();
  const att = G.att;
  let stars = 1;
  if (G.launchesUsed <= lv.par) stars++;
  if (att.shardsGot.size >= (lv.shards || []).length) stars++;
  G.winStars = stars;
  if (G.hardMode) {
    // Hard-mode stars live in their own table (hardSave). Ghost recording is
    // skipped in hard mode: ghosts are normal-geometry best trajectories, and
    // replaying one over hard geometry would be nonsense.
    const k = G.levelIndex - HARD_FIRST;
    if (stars > hardSave.stars[k]) { hardSave.stars[k] = stars; writeHardSave(); }
  } else {
    if (stars > save.stars[G.levelIndex]) { save.stars[G.levelIndex] = stars; writeSave(); }
    // Record the winning shot as this level's ghost (only if it's at least as
    // good as the stored one, so a 1-star win never overwrites a 3-star ghost).
    const gh = save.ghosts[G.levelIndex];
    if (G.lastLaunch && (!gh || stars >= gh.stars)) {
      save.ghosts[G.levelIndex] = { vx: G.lastLaunch.vx, vy: G.lastLaunch.vy, stars };
      writeSave();
    }
  }
  G.screen = 'win';
  sDelivery();
  const stp = stationPos(lv, att.t);
  burst(stp.x, stp.y, 70, ['#ffffff', '#ffe27f', '#7fe2ff']);
  shockwave(stp.x, stp.y, 175, '127,226,255');
  shockwave(stp.x, stp.y, 110, '255,226,127');
  const wstars = $('win-stars');
  wstars.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const sp = document.createElement('span');
    sp.textContent = '★'; sp.className = 'wstar' + (i < stars ? ' on' : '');
    sp.style.animationDelay = (0.25 + i * 0.3) + 's';
    wstars.appendChild(sp);
  }
  $('win-sub').textContent = lv.name + ' delivered · ' + G.launchesUsed + ' launch' + (G.launchesUsed === 1 ? '' : 'es');
  const hasNext = G.levelIndex < LEVELS.length - 1 && levelUnlocked(G.levelIndex + 1);
  $('btn-next').classList.toggle('hidden', !hasNext);
  setTimeout(() => showOnly('overlay-win'), 650);
}

function onFail(why) {
  G.failWhy = why;
  G.screen = 'fail';
  G.shake = 0.55;
  sExplode();
  const att = G.att;
  if (why !== 'nolaunch' && why !== 'stall') burst(att.x, att.y, 50, ['#ffffff', '#ffb27f', '#ff7f7f']);
  $('fail-sub').textContent = FAIL_TEXT[why] || 'Delivery failed.';
  setTimeout(() => showOnly('overlay-fail'), 700);
}

/*__PART3__*/
/* ================= PARTICLES ================= */
function spawnP(x, y, vx, vy, life, size, color, drag) {
  if (G.particles.length > 500) G.particles.shift();
  G.particles.push({ x, y, vx, vy, life, maxLife: life, size, color, drag: drag || 0 });
}
function burst(x, y, n, colors) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, sp = 40 + Math.random() * 260;
    spawnP(x, y, Math.cos(a) * sp, Math.sin(a) * sp,
      0.5 + Math.random() * 0.7, 2 + Math.random() * 3.5,
      colors[i % colors.length], 2.5);
  }
}
/* Expanding shockwave rings (deliveries, warps, depots). */
function shockwave(x, y, maxR, color) {
  if (G.rings.length > 24) G.rings.shift();
  G.rings.push({ x, y, r: 6, maxR: maxR || 120, life: 0.55, maxLife: 0.55, color: color || '255,255,255' });
}
function updateFx(dt) {
  for (let i = G.rings.length - 1; i >= 0; i--) {
    const g = G.rings[i];
    g.life -= dt;
    if (g.life <= 0) { G.rings.splice(i, 1); continue; }
    const f = 1 - g.life / g.maxLife;
    g.r = 6 + (g.maxR - 6) * (1 - Math.pow(1 - f, 2.2));   // fast start, soft landing
  }
}
function drawRings() {
  for (const g of G.rings) {
    const a = g.life / g.maxLife;
    ctx.save();
    ctx.globalAlpha = a * 0.85;
    ctx.strokeStyle = 'rgba(' + g.color + ',1)';
    ctx.lineWidth = 2 + 5 * a;
    ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, 6.283); ctx.stroke();
    ctx.restore();
  }
}
function updateParticles(dt) {
  const ps = G.particles;
  for (let i = ps.length - 1; i >= 0; i--) {
    const p = ps[i];
    p.life -= dt;
    if (p.life <= 0) { ps.splice(i, 1); continue; }
    const dr = 1 - Math.min(0.9, p.drag * dt);
    p.vx *= dr; p.vy *= dr;
    p.x += p.vx * dt; p.y += p.vy * dt;
  }
  // thruster trail + comet tails while playing
  if (G.screen === 'flying' && G.att && !G.att.dead) {
    const a = G.att, sp = Math.hypot(a.vx, a.vy);
    if (sp > 30) {
      const bx = a.x - a.vx / sp * 16, by = a.y - a.vy / sp * 16;
      for (let k = 0; k < 2; k++)
        spawnP(bx + (Math.random() - .5) * 6, by + (Math.random() - .5) * 6,
          -a.vx * 0.15 + (Math.random() - .5) * 60, -a.vy * 0.15 + (Math.random() - .5) * 60,
          0.35 + Math.random() * 0.25, 2 + Math.random() * 2.5,
          Math.random() < .5 ? '#bfe9ff' : '#ffffff', 1.5);
    }
  }
  if ((G.screen === 'aim' || G.screen === 'flying') && G.att) {
    for (const c of G.att.comets) {
      if (Math.random() < 0.5) {
        const sp = Math.hypot(c.vx, c.vy) || 1;
        spawnP(c.x - c.vx / sp * c.r, c.y - c.vy / sp * c.r,
          -c.vx * 0.1 + (Math.random() - .5) * 30, -c.vy * 0.1 + (Math.random() - .5) * 30,
          0.5, 2.5, '#ffd9a0', 1);
      }
    }
    // ambient juice: black-hole inflow sparks + shard twinkles / magnet streaks
    const lv = activeLevel(), a = G.att;
    for (const b of (lv.blackholes || [])) {
      if (Math.random() < 0.35) {
        const ang = Math.random() * 6.283, rad = b.r * (1.6 + Math.random() * 1.2);
        spawnP(b.x + Math.cos(ang) * rad, b.y + Math.sin(ang) * rad,
          -Math.sin(ang) * 130 - Math.cos(ang) * 50, Math.cos(ang) * 130 - Math.sin(ang) * 50,
          0.5, 2.2, Math.random() < .5 ? '#c99fff' : '#ffffff', 0.4);
      }
    }
    (lv.shards || []).forEach((s, i) => {
      if (a.shardsGot.has(i)) return;
      if (Math.random() < 0.08)
        spawnP(s.x + (Math.random() - .5) * 20, s.y + (Math.random() - .5) * 20, 0, -14, 0.45, 1.8, '#e8fbff', 0);
      if (a.flying && !a.dead) {
        const dx = a.x - s.x, dy = a.y - s.y, d = Math.hypot(dx, dy);
        if (d < 150 && d > 4 && Math.random() < 0.5)
          spawnP(s.x, s.y, dx / d * 220, dy / d * 220, 0.35, 2, '#aef4ff', 0);
      }
    });
  }
}

/* ================= INPUT ================= */
function canvasPos(e) {
  if (e.touches && e.touches.length) return [e.touches[0].clientX, e.touches[0].clientY];
  return [e.clientX, e.clientY];
}
function aimVelocity() {
  // Relative (thumbstick) aiming: the pull vector is measured from the
  // touch-down point, so the thumb never has to travel to the screen edge.
  // Slingshot feel is preserved: pull back, the ship launches the opposite way.
  let vx = (G.aimStart.x - G.aimCur.x) * AIM_K, vy = (G.aimStart.y - G.aimCur.y) * AIM_K;
  const sp = Math.hypot(vx, vy);
  if (sp > MAXV) { vx = vx / sp * MAXV; vy = vy / sp * MAXV; }
  return { vx, vy, sp: Math.min(sp, MAXV) };
}
function doLaunch() {
  const v = aimVelocity();
  if (v.sp < MINV) { G.aiming = false; return; }
  const a = G.att;
  a.vx = v.vx; a.vy = v.vy; a.flying = true;
  G.lastLaunch = { vx: v.vx, vy: v.vy };
  G.launchesLeft--; G.launchesUsed++;
  G.aiming = false;
  G.screen = 'flying';
  sLaunch();
  for (let i = 0; i < 12; i++)
    spawnP(a.x, a.y, -v.vx * 0.1 + (Math.random() - .5) * 120, -v.vy * 0.1 + (Math.random() - .5) * 120,
      0.4, 3, '#dff4ff', 2);
}
canvas.addEventListener('pointerdown', e => {
  AudioSys.init(); AudioSys.startAmbient();
  if (G.screen !== 'aim') return;
  e.preventDefault();
  const [px, py] = [e.clientX, e.clientY];
  const [wx, wy] = toWorld(px, py);
  G.aiming = true;
  G.aimStart.x = wx; G.aimStart.y = wy;
  G.aimCur.x = wx; G.aimCur.y = wy;
});
window.addEventListener('pointermove', e => {
  if (!G.aiming || G.screen !== 'aim') return;
  const [wx, wy] = toWorld(e.clientX, e.clientY);
  G.aimCur.x = wx; G.aimCur.y = wy;
});
window.addEventListener('pointerup', () => {
  if (G.aiming && G.screen === 'aim') doLaunch();
  G.aiming = false;
});
window.addEventListener('pointercancel', () => { G.aiming = false; });
canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
window.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'm' || k === 'M') { AudioSys.init(); AudioSys.setMuted(!save.muted); }
  else if (k === 'Escape' || k === 'p' || k === 'P') togglePause();
  else if ((k === 'r' || k === 'R') && (G.screen === 'aim' || G.screen === 'flying' || G.screen === 'paused')) restartLevel();
  else if ((k === 'Enter' || k === ' ') && G.screen === 'title') { AudioSys.init(); sClick(); toSelect(); }
  else if ((k === 'Enter' || k === ' ') && G.screen === 'intro') dismissIntro();
  else if ((k === 'Enter' || k === ' ') && G.screen === 'win' && !$('btn-next').classList.contains('hidden')) $('btn-next').click();
  else if ((k === 'Enter' || k === ' ') && G.screen === 'fail') $('btn-retry').click();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (G.screen === 'aim' || G.screen === 'flying')) togglePause(true);
});

/* HUD / overlay buttons */
$('btn-restart').addEventListener('click', () => { if (G.screen === 'aim' || G.screen === 'flying' || G.screen === 'paused') restartLevel(); });
$('btn-mute').addEventListener('click', () => { AudioSys.init(); AudioSys.setMuted(!save.muted); });
$('btn-pause').addEventListener('click', () => togglePause());
$('btn-play').addEventListener('click', () => { AudioSys.init(); AudioSys.startAmbient(); sClick(); toSelect(); });
$('btn-fly').addEventListener('click', dismissIntro);
$('btn-levels-title').addEventListener('click', () => { sClick(); toSelect(); });
$('btn-back-title').addEventListener('click', () => { sClick(); toTitle(); });
$('btn-resume').addEventListener('click', () => togglePause());
$('btn-restart2').addEventListener('click', restartLevel);
$('btn-quit').addEventListener('click', () => { sClick(); toSelect(); });
$('btn-next').addEventListener('click', () => { sClick(); startLevel(G.levelIndex + 1, true); });
$('btn-replay').addEventListener('click', restartLevel);
$('btn-levels-win').addEventListener('click', () => { sClick(); toSelect(); });
$('btn-retry').addEventListener('click', () => { sClick(); retryAttempt(); });
$('btn-levels-fail').addEventListener('click', () => { sClick(); toSelect(); });

function retryAttempt() {
  // Out of launches: retry becomes a full level restart (fresh budgets + banks).
  if (G.launchesLeft <= 0) { startLevel(G.levelIndex); return; }
  G.att = newAttempt(activeLevel());
  // Banked progress carries into the fresh attempt: shards stay collected,
  // used depots stay used (no refarming).
  for (const i of G.levelShards) G.att.shardsGot.add(i);
  for (const i of G.levelDepots) G.att.depotsUsed.add(i);
  // Banked shards may already satisfy the gate — recalculate.
  const _gate = (activeLevel().station && activeLevel().station.gate) || 0;
  if (_gate > 0 && G.att.shardsGot.size >= _gate) G.att.gateOpen = true;
  G.aiming = false;
  G.particles = [];
  G.rings = [];
  G.screen = 'aim';
  showOnly(null);
}

/* per-frame transient event handling (sfx / particles / launch refunds) */
function handleAttemptEvents() {
  const a = G.att;
  if (!a) return null;
  // Bank pickups at level scope so they survive failed attempts.
  for (const i of a.shardsGot) G.levelShards.add(i);
  for (const i of a.depotsUsed) G.levelDepots.add(i);
  if (a.warped) {
    a.warped = false; sWormhole();
    burst(a.x, a.y, 24, ['#7fffe2', '#ff7fe2', '#ffffff']);
    shockwave(a.x, a.y, 95, '127,255,226');
  }
  if (a.depotHit) {
    a.depotHit = false;
    G.launchesLeft = Math.min(9, G.launchesLeft + 1);
    sDepot();
    const d = activeLevel().depots[[...a.depotsUsed].pop()];
    if (d) { burst(d.x, d.y, 20, ['#9fff9f', '#ffffff']); shockwave(d.x, d.y, 80, '159,255,159'); }
  }
  if (a.shardHit >= 0) {
    const s = activeLevel().shards[a.shardHit];
    a.shardHit = -1;
    sPickup(a.shardsGot.size - 1);
    if (s) burst(s.x, s.y, 14, ['#aef4ff', '#ffffff']);
  }
  if (a.bounced) {
    a.bounced = false; sBounce(); G.shake = Math.max(G.shake, 0.25);
    burst(a.x, a.y, 16, ['#7fffe2', '#ffffff']);
  }
  if (a.gateDenied) {
    a.gateDenied = false; sGateDeny(); G.shake = Math.max(G.shake, 0.35);
  }
  if (a.gateUnlocked) {
    a.gateUnlocked = false; sGateOpen();
    const sp = stationPos(activeLevel(), a.t);
    shockwave(sp.x, sp.y, 120, '255,210,120');
    burst(sp.x, sp.y, 26, ['#ffd778', '#ffffff']);
  }
  return null;
}

/* ================= MAIN LOOP ================= */
let lastT = performance.now(), acc = 0;
function frame(now) {
  requestAnimationFrame(frame);
  let dt = (now - lastT) / 1000; lastT = now;
  if (dt > 0.1) dt = 0.1;
  G.time += dt;
  if (G.screen === 'title' || G.screen === 'select') G.idleT += dt;

  if (G.screen === 'aim' || G.screen === 'flying') {
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 10) {
      const ev = stepAttempt(G.att, activeLevel(), STEP);
      acc -= STEP; n++;
      handleAttemptEvents();
      if (ev === 'win') { acc = 0; onWin(); break; }
      if (ev === 'dead') { acc = 0; onFail(G.att.deadWhy); break; }
    }
    if (n === 10) acc = 0;
    if (G.screen === 'aim' && G.launchesLeft <= 0 && !G.att.flying && !G.att.dead) onFail('nolaunch');
    maybeRumble(dt);
    maybeWindWhoosh(dt);
    maybePatrolWarn(dt);
  }
  updateParticles(dt);
  updateFx(dt);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 1.5);
  render();
}

/* ================= RENDER ================= */
const PLANET_COLORS = ['#8fd8ff', '#ffb3d9', '#b8f27f', '#ffd27f', '#d9b3ff', '#9ff2e2'];
const WH_COLORS = ['#7fffe2', '#ff7fe2', '#a0b4ff', '#ffe27f'];

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, CH);
  g.addColorStop(0, '#070b22'); g.addColorStop(0.55, '#0a1030'); g.addColorStop(1, '#120a2e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
  const shx = G.shake > 0 ? (Math.random() - .5) * 14 * G.shake : 0;
  const shy = G.shake > 0 ? (Math.random() - .5) * 14 * G.shake : 0;
  for (let l = 0; l < 3; l++) {
    const layer = G.stars[l], par = (l + 1) * 0.35;
    for (const s of layer) {
      let x = ((s.bx * (CW + 120) - G.time * s.sp) % (CW + 120) + CW + 120) % (CW + 120) - 60;
      let y = (s.by * CH + shx * 0 + shy * par * 0.2) % CH;
      x += shx * par;
      const a = 0.35 + 0.4 * Math.abs(Math.sin(G.time * 1.5 + s.tw));
      ctx.globalAlpha = a * (0.5 + l * 0.25);
      ctx.fillStyle = l === 2 ? '#eaf6ff' : '#b9c8ff';
      ctx.fillRect(x, y, s.s, s.s);
    }
  }
  ctx.globalAlpha = 1;
}

function drawPlanet(p, idx) {
  const c = PLANET_COLORS[idx % PLANET_COLORS.length];
  const g = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1, p.x, p.y, p.r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, c); g.addColorStop(1, 'rgba(10,10,40,0.9)');
  ctx.save();
  ctx.shadowColor = c; ctx.shadowBlur = 30;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 6, 0, 6.283); ctx.stroke();
}

function drawBlackHole(b) {
  ctx.save();
  ctx.shadowColor = '#b04dff'; ctx.shadowBlur = 34;
  const g = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r * 1.7);
  g.addColorStop(0, '#000000'); g.addColorStop(0.55, '#1a0b2e');
  g.addColorStop(0.8, 'rgba(176,77,255,0.55)'); g.addColorStop(1, 'rgba(176,77,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 1.7, 0, 6.283); ctx.fill();
  ctx.restore();
  // accretion disk: bright orbiting clumps just outside the event horizon
  ctx.save();
  ctx.strokeStyle = 'rgba(255,214,150,0.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  const t2 = G.time * 3.4;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 1.22, t2 + i * 1.571, t2 + i * 1.571 + 0.7);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = '#ffb27f'; ctx.lineWidth = 3;
  const t = G.time * 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 1.35, t + i * 2.1, t + i * 2.1 + 1.4);
    ctx.stroke();
  }
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill();
}

let rockSeeds = {};
function rockVerts(r, seed) {
  const key = r + ':' + seed;
  if (!rockSeeds[key]) {
    const v = [], n = 9;
    let s = seed * 9301 + 49297;
    const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) v.push(0.75 + rnd() * 0.45);
    rockSeeds[key] = v;
  }
  return rockSeeds[key];
}
function drawRock(x, y, r, seed, rot) {
  const v = rockVerts(r, seed);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < v.length; i++) {
    const a = i / v.length * 6.283, rad = r * v[i];
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r * 1.2);
  g.addColorStop(0, '#9a8f85'); g.addColorStop(1, '#4a423c');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

// trampoline rock: teal glow ring + chevrons so it reads as bouncy, not deadly
function drawBounceHalo(a, t) {
  ctx.save();
  ctx.shadowColor = '#7fffe2'; ctx.shadowBlur = 18;
  ctx.strokeStyle = 'rgba(127,255,226,0.85)'; ctx.lineWidth = 3;
  const wob = 1 + 0.06 * Math.sin(t * 4 + a.x);
  ctx.beginPath(); ctx.arc(a.x, a.y, (a.r + 7) * wob, 0, 6.283); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(127,255,226,0.5)'; ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    const ang = t * 1.5 + k * 2.094;
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r + 7, ang, ang + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWormhole(w, idx) {
  const c = WH_COLORS[idx % WH_COLORS.length];
  const t = G.time;
  ctx.save();
  ctx.lineCap = 'round';
  // swirl: 3 spiral arms winding inward, rotating with time
  ctx.strokeStyle = c;
  for (let arm = 0; arm < 3; arm++) {
    const a0 = t * 3.2 + arm * 2.094;
    ctx.globalAlpha = 0.85; ctx.lineWidth = 4;
    ctx.beginPath();
    for (let s = 0; s <= 20; s++) {
      const f = s / 20;
      const ang = a0 + f * 4.2;
      const rad = w.r * (1 - f * 0.72);
      const px = w.x + Math.cos(ang) * rad, py = w.y + Math.sin(ang) * rad;
      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  // counter-rotating shimmer ring
  ctx.globalAlpha = 0.35; ctx.lineWidth = 2;
  ctx.setLineDash([10, 14]);
  ctx.beginPath(); ctx.arc(w.x, w.y, w.r * 1.12, -t * 1.4, -t * 1.4 + 6.283); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  // pulsing core
  const pulse = 0.65 + 0.35 * Math.sin(t * 5 + idx);
  const g = ctx.createRadialGradient(w.x, w.y, 1, w.x, w.y, w.r * 0.6);
  g.addColorStop(0, 'rgba(255,255,255,' + (0.7 * pulse + 0.25) + ')');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(w.x, w.y, w.r * 0.6, 0, 6.283); ctx.fill();
}

function drawDepot(d, used) {
  ctx.save();
  ctx.globalAlpha = used ? 0.25 : 1;
  if (!used) { ctx.shadowColor = '#7fff9f'; ctx.shadowBlur = 18; }
  ctx.fillStyle = used ? '#3a4a3a' : '#17351f';
  rr(d.x - 16, d.y - 20, 32, 40, 7); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = used ? '#5a6a5a' : '#c9ffd9';
  ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('+', d.x, d.y - 2);
  ctx.font = '10px sans-serif';
  ctx.fillText('FUEL', d.x, d.y + 12);
  ctx.restore();
}

function drawShard(s, t) {
  const bob = Math.sin(t * 3 + s.x) * 4;
  ctx.save();
  ctx.translate(s.x, s.y + bob);
  ctx.rotate(Math.PI / 4 + Math.sin(t * 2 + s.y) * 0.25);
  ctx.shadowColor = '#aef4ff'; ctx.shadowBlur = 14;
  const g = ctx.createLinearGradient(-8, -8, 8, 8);
  g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#54d8ff');
  ctx.fillStyle = g;
  ctx.fillRect(-8, -8, 16, 16);
  ctx.restore();
}

function drawStation(sp, t, lock) {
  // lock: null | { remaining } — a shard-gated station shows an amber locked
  // ring plus diamond pips for the shards still needed.
  const locked = !!(lock && lock.remaining > 0);
  ctx.save();
  ctx.shadowColor = locked ? '#ffb347' : '#7fe2ff'; ctx.shadowBlur = 26;
  ctx.strokeStyle = locked ? '#ffcf7f' : '#d8f6ff'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, 6.283); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = locked ? 'rgba(255,180,80,0.7)' : 'rgba(127,226,255,0.75)'; ctx.lineWidth = 3;
  const off = t * 1.2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r - 11, off + i * 1.57, off + i * 1.57 + 0.9); ctx.stroke();
  }
  if (locked) {
    ctx.strokeStyle = 'rgba(255,180,80,0.9)'; ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r + 12, 0, 6.283); ctx.stroke();
    ctx.setLineDash([]);
    const n = lock.remaining;
    ctx.fillStyle = '#ffd778'; ctx.font = '700 15px -apple-system, "Segoe UI", sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('◆'.repeat(Math.min(6, n)) + (n > 6 ? '+' : ''), sp.x, sp.y - sp.r - 26);
  }
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  ctx.fillStyle = locked ? 'rgba(255,207,127,' + (0.3 + pulse * 0.3) + ')'
                         : 'rgba(216,246,255,' + (0.35 + pulse * 0.4) + ')';
  ctx.beginPath(); ctx.arc(sp.x, sp.y, 7 + pulse * 3, 0, 6.283); ctx.fill();
  ctx.restore();
}

function drawShip(x, y, vx, vy, flying, t) {
  const sp = Math.hypot(vx, vy);
  const ang = (flying && sp > 20) ? Math.atan2(vy, vx) : 0;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(ang);
  ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 16;
  // engine flame
  if (flying && sp > 30) {
    const fl = 14 + Math.random() * 10;
    const g = ctx.createLinearGradient(-12, 0, -12 - fl, 0);
    g.addColorStop(0, 'rgba(160,220,255,0.95)'); g.addColorStop(1, 'rgba(160,220,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(-12 - fl, 0); ctx.lineTo(-12, 6); ctx.closePath(); ctx.fill();
  }
  // hull: little milk-carton rocket
  ctx.fillStyle = '#f4f9ff';
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(2, -9); ctx.lineTo(-12, -9);
  ctx.lineTo(-12, 9); ctx.lineTo(2, 9); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#57b6ff';
  ctx.fillRect(-12, -9, 5, 18);           // blue cap band
  ctx.fillStyle = '#0b1e3a';
  ctx.beginPath(); ctx.arc(4, 0, 4.2, 0, 6.283); ctx.fill();  // window
  ctx.fillStyle = '#bfe9ff';
  ctx.beginPath(); ctx.arc(4, 0, 2.4, 0, 6.283); ctx.fill();
  ctx.fillStyle = '#ff8fa3';
  ctx.beginPath(); ctx.moveTo(-12, -9); ctx.lineTo(-19, -14); ctx.lineTo(-12, -4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-12, 9); ctx.lineTo(-19, 14); ctx.lineTo(-12, 4); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawTrail(att) {
  const tr = att.trail;
  if (tr.length < 4) return;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 2; i < tr.length; i += 2) {
    const f = i / tr.length;
    ctx.strokeStyle = 'rgba(190,235,255,' + (f * 0.55) + ')';
    ctx.lineWidth = 1 + f * 5;
    ctx.beginPath(); ctx.moveTo(tr[i - 2], tr[i - 1]); ctx.lineTo(tr[i], tr[i + 1]); ctx.stroke();
  }
  ctx.restore();
}

function drawGhost() {
  // Best-trajectory ghost: faint gold replay of your best winning shot,
  // drawn under your own aim preview. Pure hint layer — no physics changes.
  // Skipped in hard mode: ghosts are normal-geometry best shots.
  if (G.hardMode) return;
  const g = save.ghosts[G.levelIndex];
  if (!g) return;
  const lv = activeLevel(), a = G.att;
  const pv = previewPath(lv, a.x, a.y, g.vx, g.vy, a.t);
  ctx.save();
  for (let i = 0; i < pv.pts.length; i += 6) {
    const f = i / pv.pts.length;
    ctx.fillStyle = 'rgba(255,226,127,' + (0.10 + f * 0.16) + ')';
    ctx.beginPath(); ctx.arc(pv.pts[i], pv.pts[i + 1], 2.5, 0, 6.283); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,226,127,0.5)';
  ctx.font = '11px -apple-system, "Segoe UI", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('GHOST — your best shot', a.x + 22, a.y - 34);
  ctx.restore();
}

function drawAim() {
  const a = G.att, lv = activeLevel();
  const v = aimVelocity();
  const sx = a.x, sy = a.y;
  // elastic: drawn along the pull direction from the ship
  const pullX = G.aimCur.x - G.aimStart.x, pullY = G.aimCur.y - G.aimStart.y;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + pullX, sy + pullY); ctx.stroke();
  ctx.setLineDash([]);
  // max-power ring
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.arc(sx, sy, MAXV / AIM_K, 0, 6.283); ctx.stroke();
  ctx.restore();
  if (v.sp < MINV) return;
  const pv = previewPath(lv, sx, sy, v.vx, v.vy, a.t);
  const col = pv.end === 'win' ? '127,255,170' : pv.end === 'dead' ? '255,120,120' : '190,235,255';
  ctx.save();
  for (let i = 0; i < pv.pts.length; i += 2) {
    const f = i / pv.pts.length;
    ctx.fillStyle = 'rgba(' + col + ',' + (0.25 + f * 0.65) + ')';
    ctx.beginPath(); ctx.arc(pv.pts[i], pv.pts[i + 1], 2 + f * 3, 0, 6.283); ctx.fill();
  }
  if (pv.end === 'dead') {
    ctx.strokeStyle = 'rgba(255,120,120,0.95)'; ctx.lineWidth = 4;
    const ex = pv.ex, ey = pv.ey, s = 10;
    ctx.beginPath();
    ctx.moveTo(ex - s, ey - s); ctx.lineTo(ex + s, ey + s);
    ctx.moveTo(ex + s, ey - s); ctx.lineTo(ex - s, ey + s);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBottle(x, y, full) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = full ? 'rgba(244,249,255,0.95)' : 'rgba(244,249,255,0.14)';
  rr(-6, -4, 12, 20, 3); ctx.fill();
  ctx.fillRect(-3, -10, 6, 7);
  ctx.fillStyle = full ? '#57b6ff' : 'rgba(87,182,255,0.25)';
  ctx.fillRect(-4, -14, 8, 5);
  ctx.restore();
}

function drawHUD() {
  const lv = activeLevel();
  ctx.save();
  ctx.textBaseline = 'top';
  // launches as bottles
  const n = Math.min(9, G.launchesLeft), cap = Math.min(9, Math.max(lv.launches, G.launchesLeft));
  for (let i = 0; i < cap; i++) drawBottle(24 + i * 24, 44, i < n);
  // shards
  const got = G.att ? G.att.shardsGot.size : 0, total = (lv.shards || []).length;
  ctx.fillStyle = '#aef4ff'; ctx.font = '600 17px -apple-system, "Segoe UI", sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('◆ ' + got + '/' + total, 20, 70);
  // level name — on narrow phone screens, center the title in the gap between
  // the milk bottles (left) and the HTML buttons (top-right) so it overlaps
  // neither. Wide screens keep the classic full-width centering.
  const btnW = 175;
  const bottlesRight = 24 + (cap - 1) * 24 + 12;
  let tcx = CW / 2, tmaxW = CW - 32;
  if (CW < 700) {
    const zoneL = bottlesRight + 12, zoneR = CW - btnW;
    if (zoneR - zoneL > 60) { tcx = (zoneL + zoneR) / 2; tmaxW = zoneR - zoneL - 12; }
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(234,246,255,0.95)'; ctx.font = '700 18px -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(fitText((G.levelIndex + 1) + ' · ' + lv.name.toUpperCase(), tmaxW), tcx, 14);
  ctx.fillStyle = 'rgba(160,180,220,0.7)'; ctx.font = '12px -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(fitText(SECTORS[lv.sector].name.toUpperCase() + ' SECTOR · PAR ' + lv.par, tmaxW), tcx, 38);
  if (lv.tip && G.launchesUsed === 0 && G.screen === 'aim') {
    // tip sits below the bottles/shard row so long tips never overlap them
    ctx.fillStyle = 'rgba(255,226,127,0.9)'; ctx.font = '13px -apple-system, "Segoe UI", sans-serif';
    ctx.fillText(fitText(lv.tip, CW - 40), CW / 2, 92);
  }
  ctx.restore();
}

// Truncate a string with an ellipsis so it fits maxW px in the current font.
function fitText(s, maxW) {
  if (ctx.measureText(s).width <= maxW) return s;
  let lo = 0, hi = s.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ctx.measureText(s.slice(0, mid) + '…').width <= maxW) lo = mid + 1;
    else hi = mid;
  }
  return s.slice(0, Math.max(0, lo - 1)) + '…';
}

function drawParticles() {
  for (const p of G.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Wind zone: translucent cyan rect with streak lines drifting along the (ax,ay)
// direction. Cyan/white palette — visually distinct from red hazards.
function drawWind(w, t) {
  const m = Math.hypot(w.ax, w.ay) || 1;
  const dx = w.ax / m, dy = w.ay / m;
  ctx.save();
  ctx.fillStyle = 'rgba(110,210,255,0.06)';
  ctx.fillRect(w.x, w.y, w.w, w.h);
  ctx.strokeStyle = 'rgba(140,225,255,0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.strokeRect(w.x, w.y, w.w, w.h);
  ctx.setLineDash([]);
  // clip the animated streaks to the zone rect
  ctx.beginPath();
  ctx.rect(w.x, w.y, w.w, w.h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(200,245,255,0.5)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const spacing = 72, len = 30;
  const sp = 110 + m * 0.45;   // streak speed scales with wind strength
  const rows = Math.ceil(w.h / spacing), cols = Math.ceil(w.w / spacing);
  for (let rI = 0; rI <= rows; rI++) {
    for (let cI = 0; cI <= cols; cI++) {
      const bx = w.x + cI * spacing, by = w.y + rI * spacing;
      const off = (((t * sp) % (spacing * 2)) + spacing * 2) % (spacing * 2) - spacing;
      const px = bx + dx * off, py = by + dy * off;
      ctx.beginPath();
      ctx.moveTo(px - dx * len / 2, py - dy * len / 2);
      ctx.lineTo(px + dx * len / 2, py + dy * len / 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Patrol comet: amber/orange comet-like body at its pure time position, with a
// dashed gold path line between its endpoints and a short motion trail.
function drawPatrol(p, t) {
  const att = G.att;
  const ct = att ? att.t : t;
  const pp = patrolPos(p, ct);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,190,90,0.55)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(p.x1, p.y1);
  ctx.lineTo(p.x2, p.y2);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let k = 5; k >= 1; k--) {
    const q = patrolPos(p, ct - k * 0.12);
    ctx.fillStyle = 'rgba(255,170,60,' + (0.06 * (6 - k)).toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(q.x, q.y, Math.max(1, q.r * (1 - k * 0.12)), 0, 6.283);
    ctx.fill();
  }
  const g = ctx.createRadialGradient(pp.x, pp.y, 1, pp.x, pp.y, pp.r * 2.2);
  g.addColorStop(0, 'rgba(255,180,70,0.55)');
  g.addColorStop(1, 'rgba(255,180,70,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(pp.x, pp.y, pp.r * 2.2, 0, 6.283);
  ctx.fill();
  ctx.restore();
  drawRock(pp.x, pp.y, pp.r, 90, t * 0.8);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,200,100,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pp.x, pp.y, pp.r + 5, 0, 6.283);
  ctx.stroke();
  ctx.restore();
}

function renderWorld(lv, att, t) {
  (lv.winds || []).forEach(w => drawWind(w, t));
  (lv.wormholes || []).forEach((w, i) => drawWormhole(w, i));
  (lv.planets || []).forEach((p, i) => drawPlanet(p, i));
  (lv.blackholes || []).forEach(drawBlackHole);
  (lv.asteroids || []).forEach((a, i) => {
    drawRock(a.x, a.y, a.r, i + 1, t * 0.15 * (i % 2 ? 1 : -1));
    if (a.bounce) drawBounceHalo(a, t);
  });
  (att ? att.comets : (lv.comets || [])).forEach((c, i) => {
    const cg = ctx.createRadialGradient(c.x, c.y, 1, c.x, c.y, c.r * 2.4);
    cg.addColorStop(0, 'rgba(255,190,120,0.5)'); cg.addColorStop(1, 'rgba(255,190,120,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(c.x, c.y, c.r * 2.4, 0, 6.283); ctx.fill();
    drawRock(c.x, c.y, c.r, 40 + i, t * 0.8);
  });
  (lv.patrols || []).forEach(p => drawPatrol(p, t));
  (lv.depots || []).forEach((d, i) => drawDepot(d, att ? att.depotsUsed.has(i) : false));
  (lv.shards || []).forEach((s, i) => { if (!(att && att.shardsGot.has(i))) drawShard(s, t); });
  const gateN = (lv.station && lv.station.gate) || 0;
  const gotN = att ? att.shardsGot.size : 0;
  drawStation(stationPos(lv, att ? att.t : t), t,
              gateN ? { remaining: Math.max(0, gateN - gotN) } : null);
  if (att && !att.dead) {
    drawTrail(att);
    drawShip(att.x, att.y, att.vx, att.vy, att.flying, t);
  }
  drawParticles();
  drawRings();
}

function renderIdle(t) {
  // decorative scene behind title / level select
  const fake = { planets: [{ x: 900, y: 480, r: 120, m: 0 }], station: { x: 300, y: 220, r: 40 },
                 shards: [{ x: 500, y: 200 }, { x: 700, y: 600 }, { x: 200, y: 550 }] };
  drawPlanet(fake.planets[0], 2);
  drawStation(fake.station, t);
  fake.shards.forEach(s => drawShard(s, t));
  const a = t * 0.5;
  const sx = 900 + Math.cos(a) * 220, sy = 480 + Math.sin(a) * 160;
  drawShip(sx, sy, -Math.sin(a), Math.cos(a) * 0.7, true, t);
  drawParticles();
}

function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawBackground();
  const shx = G.shake > 0 ? (Math.random() - .5) * 16 * G.shake : 0;
  const shy = G.shake > 0 ? (Math.random() - .5) * 16 * G.shake : 0;
  ctx.save();
  ctx.translate(view.ox + shx, view.oy + shy);
  ctx.scale(view.scale, view.scale);

  if (G.screen === 'title' || G.screen === 'select') {
    renderIdle(G.idleT);
  } else {
    const lv = activeLevel();
    renderWorld(lv, G.att, G.time);
    if (G.screen === 'aim') { drawGhost(); if (G.aiming) drawAim(); }
  }
  ctx.restore();

  if (G.screen === 'aim' || G.screen === 'flying' || G.screen === 'paused') drawHUD();
}

/* ================= BOOT ================= */
loadSave();
refreshMuteBtn();
initStars();
resize();
toTitle();
requestAnimationFrame(frame);
