'use strict';
/* MILK RUN — Wheyward Passage : HARD MODE level definitions.
   Pure, zero dependencies, same schema as levels2.js. Keyed by Wheyward level
   NUMBER (25-36, Sector 4 "Curdle"). Each variant keeps its original's concept
   but is meaner: tighter corridors, extra or moved hazards, relocated shards,
   reduced par/launches. Uses only pre-existing mechanics (planets, asteroids
   incl. bounce rocks, blackholes, depots, wormholes, comets, shard gates,
   orbiting stations). World is 1280 x 720 units, G = 4000 (see game.js).
   Shard sentinel: shards: 'AUTO2' / 'AUTO3' is filled by the solver's
   place_shards.js (hard2 mode); do not ship with a sentinel in place. */

const HARD_LEVELS2 = {
  // ---- 25 · First Pogo (Hard) — smaller rock, tighter cup, shards ride closer to the rock ----
  25: { name: 'First Pogo (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The pogo rock shrank and the cup is tighter. Kiss the upper-right cheek — both shards ride closer to the rock now.',
    ship: { x: 1080, y: 220 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 830, y: 340, r: 60, bounce: true } ],
    shards: [{ x: 965, y: 257 }, { x: 878, y: 284 }],
    station: { x: 860, y: 139, r: 36 } },

  // ---- 26 · Rebound (Hard) — smaller rock, tighter station ----
  26: { name: 'Rebound (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Same bank, smaller rock, tighter station. One shard on the way in, one on the rebound.',
    ship: { x: 180, y: 540 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 480, y: 340, r: 50, bounce: true } ],
    shards: [{ x: 194, y: 406 }, { x: 204, y: 313 }],
    station: { x: 250, y: 180, r: 36 } },

  // ---- 27 · Bank Job (Hard) — smaller rock, tighter vault ----
  27: { name: 'Bank Job (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The vault still wants both shards before it opens — and the rock is smaller now. Kiss the crown clean.',
    ship: { x: 700, y: 600 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 640, y: 360, r: 55, bounce: true } ],
    shards: [{ x: 700, y: 399 }, { x: 787, y: 308 }],
    station: { x: 900, y: 150, r: 36, gate: 2 } },

  // ---- 28 · Backboard (Hard) — smaller rock, tighter cup ----
  28: { name: 'Backboard (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Fire down-left into the smaller rock\u2019s cheek and let it throw you back up-right. The cup shrank.',
    ship: { x: 1140, y: 360 },
    planets: [], blackholes: [],
    depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 780, y: 500, r: 60, bounce: true } ],
    shards: [{ x: 972, y: 408 }, { x: 857, y: 441 }],
    station: { x: 838, y: 265, r: 40 } },

  // ---- 29 · Slalom (Hard) — fatter towers, smaller rock ----
  29: { name: 'Slalom (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The towers grew teeth and the rock shrank. Thread upward, kiss the lower cheek, dive through the gate.',
    ship: { x: 220, y: 470 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 380, y: 320, r: 46 }, { x: 380, y: 560, r: 46 },
                 { x: 620, y: 440, r: 65, bounce: true },
                 { x: 480, y: 180, r: 46 }, { x: 760, y: 180, r: 46 } ],
    shards: [{ x: 415, y: 421 }, { x: 545, y: 389 }],
    station: { x: 610, y: 200, r: 42 } },

  // ---- 30 · Crossfire (Hard) — faster comets, smaller rock ----
  30: { name: 'Crossfire (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The strafers are faster and the rock is smaller. Wait for your moment, bank the shoulder, ride it down.',
    ship: { x: 500, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [], winds: [], patrols: [],
    comets: [ { x: 650, y: 620, r: 18, vx: 0, vy: -190 },
              { x: 835, y: 100, r: 18, vx: 0, vy: 200 },
              { x: 700, y: 480, r: 18, vx: -150, vy: 0 } ],
    asteroids: [ { x: 900, y: 360, r: 55, bounce: true } ],
    shards: [{ x: 674, y: 378 }, { x: 793, y: 391 }],
    station: { x: 836, y: 549, r: 38 } },

  // ---- 31 · Folded Curd (Hard) — tighter folds, smaller rock ----
  31: { name: 'Folded Curd (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The folds are narrower and the rock is smaller. Fold straight, bounce up-left, both shards for the vault.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [], depots: [], winds: [], patrols: [], comets: [],
    wormholes: [ { x: 420, y: 360, r: 26, link: 1 }, { x: 1000, y: 570, r: 26, link: 0 } ],
    asteroids: [ { x: 1160, y: 610, r: 50, bounce: true } ],
    shards: [{ x: 368, y: 368 }, { x: 1103, y: 544 }],
    station: { x: 1029, y: 299, r: 32, gate: 2 } },

  // ---- 32 · Moving Curd (Hard) — smaller rock, faster station ----
  32: { name: 'Moving Curd (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The station orbits faster and the rock is smaller. Bank it and time your launch to meet the station on the rebound.',
    ship: { x: 1080, y: 320 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 830, y: 320, r: 60, bounce: true } ],
    shards: [{ x: 1064, y: 386 }, { x: 1047, y: 451 }],
    station: { x: 0, y: 0, r: 32, orbit: { cx: 1046, cy: 495, radius: 40, speed: 0.5, phase: 3.1416 } } },

  // ---- 33 · Needle Curd (Hard) — more comets, faster, tighter vault ----
  33: { name: 'Needle Curd (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Eight strafers now, and faster. Wait for your gap; the shards sit just off the safe line. The vault wants all three.',
    ship: { x: 1140, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [], winds: [], patrols: [],
    asteroids: [],
    comets: [ { x: 300, y: 80, r: 18, vx: 0, vy: 140 },
              { x: 420, y: 640, r: 18, vx: 0, vy: -150 },
              { x: 540, y: 80, r: 18, vx: 0, vy: 135 },
              { x: 660, y: 640, r: 18, vx: 0, vy: -145 },
              { x: 780, y: 80, r: 18, vx: 0, vy: 150 },
              { x: 900, y: 640, r: 18, vx: 0, vy: -140 },
              { x: 1020, y: 80, r: 18, vx: 0, vy: 145 },
              { x: 240, y: 640, r: 18, vx: 0, vy: -135 } ],
    shards: [{ x: 832, y: 371 }, { x: 646, y: 377 }, { x: 459, y: 384 }],
    station: { x: 140, y: 360, r: 42, gate: 3 } },

  // ---- 34 · Teeth of the Rind (Hard) — hungrier maws, smaller rock ----
  34: { name: 'Teeth of the Rind (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The maws pull harder and the rock shrank. Thread the bounce clean — all three shards for the vault.',
    ship: { x: 1080, y: 220 },
    planets: [], blackholes: [ { x: 480, y: 570, r: 26, m: 5000 },
                               { x: 280, y: 120, r: 26, m: 5000 },
                               { x: 130, y: 470, r: 26, m: 5000 } ],
    depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 830, y: 340, r: 60, bounce: true } ],
    shards: [{ x: 562, y: 719 }, { x: 164, y: 573 }, { x: 138, y: 156 }],
    station: { x: 747, y: 143, r: 42, gate: 3 } },

  // ---- 35 · Chain Churn (Hard) — tighter folds, faster strafers ----
  35: { name: 'Chain Churn (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Narrower folds, faster strafers, tighter vault. Two folds, three shards — fold in straight and time it.',
    ship: { x: 1140, y: 120 },
    planets: [], blackholes: [],
    depots: [], winds: [], patrols: [],
    wormholes: [ { x: 791, y: 141, r: 22, link: 1 }, { x: 980, y: 570, r: 22, link: 0 },
                 { x: 130, y: 620, r: 22, link: 3 }, { x: 140, y: 120, r: 24, link: 2 } ],
    comets: [ { x: 555, y: 640, r: 16, vx: 0, vy: -190 },
              { x: 330, y: 80, r: 16, vx: 0, vy: 200 } ],
    asteroids: [],
    shards: [{ x: 818, y: 284 }, { x: 628, y: 381 }, { x: 438, y: 478 }],
    station: { x: 70, y: 124, r: 32, gate: 3 } },

  // ---- 36 · Heart of the Curdle (Hard) — hungrier maw, faster everything ----
  36: { name: 'Heart of the Curdle (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The maw is hungrier, the strafers faster, the rock smaller. Fold, bank, thread — all three shards for the vault.',
    ship: { x: 1140, y: 120 },
    planets: [], blackholes: [ { x: 1080, y: 570, r: 26, m: 6000 } ],
    depots: [], winds: [], patrols: [],
    wormholes: [ { x: 940, y: 140, r: 28, link: 1 }, { x: 580, y: 470, r: 28, link: 0 } ],
    comets: [ { x: 430, y: 640, r: 16, vx: 0, vy: -180 },
              { x: 430, y: 100, r: 16, vx: 0, vy: 190 } ],
    asteroids: [ { x: 230, y: 520, r: 50, bounce: true } ],
    shards: [{ x: 1212, y: 567 }, { x: 1035, y: 712 }, { x: 776, y: 684 }],
    station: { x: 432, y: 410, r: 34, gate: 3 } },
};
