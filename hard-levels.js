'use strict';
/* MILK RUN — Cosmic Delivery : HARD MODE level definitions.
   Pure, zero dependencies, same schema as levels.js. Keyed by original level
   NUMBER (25-36, Sector 4 "Abyss"). Each variant keeps its original's concept
   but is meaner: tighter corridors, extra or moved hazards, relocated shards,
   reduced par/launches. Uses only pre-existing mechanics (planets, asteroids
   incl. bounce rocks, blackholes, depots, wormholes, comets, shard gates,
   orbiting stations). World is 1280 x 720 units, G = 4000 (see game.js).
   v0.9: re-derived from the rebalanced 25-36; every variant is strictly
   tighter than its normal counterpart. */

const HARD_LEVELS = {
  // ---- 25 · Pogo (Hard) — smaller rock, smaller station, second shard pulled toward the rock ----
  25: { name: 'Pogo (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The pogo rock shrank and the cup is tighter. Kiss the lower-left cheek — the second ◆ rides closer to the rock now.',
    ship: { x: 200, y: 500 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 455, y: 375, r: 60, bounce: true } ],
    shards: [ { x: 297, y: 477 }, { x: 415, y: 508 } ],
    station: { x: 420, y: 581, r: 36 } },

  // ---- 26 · Rebound Line (Hard) — smaller rock, tighter cup, return shard near the rock ----
  26: { name: 'Rebound Line (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Same bank, smaller rock, tighter cup. The return ◆ hangs just above the rock\u2019s halo.',
    ship: { x: 200, y: 500 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 452, y: 376, r: 50, bounce: true } ],
    shards: [ { x: 305, y: 468 }, { x: 449, y: 492 } ],
    station: { x: 482, y: 560, r: 36 } },

  // ---- 27 · Bank Shot (Hard) — gate 2, smaller rock, riskier second shard ----
  27: { name: 'Bank Shot (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The vault still wants both ◆◆ before it opens — and the second one sits nearer the rock now.',
    ship: { x: 180, y: 540 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 465, y: 335, r: 52, bounce: true } ],
    shards: [ { x: 292, y: 445 }, { x: 335, y: 390 } ],
    station: { x: 242, y: 414, r: 36, gate: 2 } },

  // ---- 28 · Backstop (Hard) — smaller rock, tighter cup ----
  28: { name: 'Backstop (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Bank the smaller rock\u2019s lower cheek and drop straight down. The second ◆ hugs the rock on the way off.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [],
    depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 505, y: 215, r: 60, bounce: true } ],
    shards: [ { x: 291, y: 322 }, { x: 462, y: 345 } ],
    station: { x: 442, y: 455, r: 36 } },

  // ---- 29 · Slalom (Hard) — fatter towers, rebound shard pulled toward the rock ----
  29: { name: 'Slalom (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The towers grew teeth and the rebound ◆ rides closer to the rock. Thread, kiss, and dive.',
    ship: { x: 220, y: 260 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 380, y: 140, r: 46 }, { x: 380, y: 380, r: 46 },
                 { x: 620, y: 260, r: 80, bounce: true },
                 { x: 480, y: 420, r: 46 }, { x: 760, y: 420, r: 46 } ],
    shards: [ { x: 370, y: 289 }, { x: 585, y: 398 } ],
    station: { x: 601, y: 477, r: 36 } },

  // ---- 30 · Crossfire Rebound (Hard) — faster strafe comets, smaller rock and cup ----
  30: { name: 'Crossfire Rebound (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The strafe runs are faster now. Wait for your gap, bank the upper shoulder, ride the rebound.',
    ship: { x: 500, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [], winds: [], patrols: [],
    comets: [ { x: 650, y: 100, r: 18, vx: 0, vy: 175 },
              { x: 835, y: 620, r: 18, vx: 0, vy: -185 },
              { x: 700, y: 240, r: 18, vx: 140, vy: 0 } ],
    asteroids: [ { x: 905, y: 360, r: 52, bounce: true } ],
    shards: [ { x: 667, y: 335 }, { x: 835, y: 241 } ],
    station: { x: 836, y: 171, r: 36 } },

  // ---- 31 · The Folded Vault (Hard) — narrow folds, smaller vault rock, gate 2 ----
  31: { name: 'The Folded Vault (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Narrower folds, a smaller vault rock, a tighter cup. Both ◆◆ before the vault unlocks.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [], depots: [], winds: [], patrols: [], comets: [],
    wormholes: [ { x: 420, y: 360, r: 26, link: 1 }, { x: 1000, y: 150, r: 26, link: 0 } ],
    asteroids: [ { x: 1165, y: 108, r: 45, bounce: true } ],
    shards: [ { x: 290, y: 368 }, { x: 1050, y: 150 } ],
    station: { x: 1029, y: 421, r: 36, gate: 2 } },

  // ---- 32 · Orbital Ricochet (Hard) — faster orbit, smaller rock ----
  32: { name: 'Orbital Ricochet (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The station laps faster and the bank rock is smaller. Time your launch to meet it on the rebound.',
    ship: { x: 200, y: 400 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 450, y: 400, r: 55, bounce: true } ],
    shards: [ { x: 330, y: 322 }, { x: 300, y: 290 } ],
    station: { x: 0, y: 0, r: 36, orbit: { cx: 234, cy: 225, radius: 40, speed: 0.45, phase: 0 } } },

  // ---- 33 · Needle Storm (Hard) — faster comets, off-line shards, smaller cup, gate 3 ----
  33: { name: 'Needle Storm (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Faster strafe runs and the ◆◆◆ drift off the safe line. Pick your gap and fly a razor.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [], winds: [], patrols: [],
    asteroids: [],
    comets: [ { x: 350, y: 80, r: 18, vx: 0, vy: 130 },
              { x: 500, y: 640, r: 18, vx: 0, vy: -140 },
              { x: 650, y: 80, r: 18, vx: 0, vy: 125 },
              { x: 800, y: 640, r: 18, vx: 0, vy: -135 },
              { x: 950, y: 80, r: 18, vx: 0, vy: 140 },
              { x: 1080, y: 640, r: 18, vx: 0, vy: -130 } ],
    shards: [ { x: 400, y: 348 }, { x: 720, y: 372 }, { x: 1040, y: 346 } ],
    station: { x: 1140, y: 360, r: 36, gate: 3 } },

  // ---- 34 · The Maw\u2019s Teeth (Hard) — heavier maws, smaller rock and cup, gate 3 ----
  34: { name: 'The Maw\u2019s Teeth (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'The maws pull harder now. Thread the smaller bounce clean and don\u2019t let them drag you off the rebound. All three ◆◆◆.',
    ship: { x: 200, y: 500 },
    planets: [], blackholes: [ { x: 800, y: 150, r: 26, m: 5500 },
                               { x: 1000, y: 600, r: 26, m: 5500 },
                               { x: 1150, y: 250, r: 26, m: 5500 } ],
    depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 450, y: 380, r: 52, bounce: true } ],
    shards: [ { x: 312, y: 473 }, { x: 462, y: 505 }, { x: 490, y: 525 } ],
    station: { x: 533, y: 577, r: 36, gate: 3 } },

  // ---- 35 · Chain Reaction (Hard) — faster strafe comets, riskier middle shard, gate 3 ----
  35: { name: 'Chain Reaction (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Two folds, three ◆◆, one locked vault. The strafe runs are faster and the middle ◆ rides the comet line.',
    ship: { x: 140, y: 600 },
    planets: [], blackholes: [],
    depots: [], winds: [], patrols: [],
    wormholes: [ { x: 489, y: 579, r: 26, link: 1 }, { x: 300, y: 150, r: 26, link: 0 },
                 { x: 1150, y: 100, r: 26, link: 3 }, { x: 1140, y: 600, r: 28, link: 2 } ],
    comets: [ { x: 725, y: 80, r: 16, vx: 0, vy: 190 },
              { x: 950, y: 640, r: 16, vx: 0, vy: -195 } ],
    asteroids: [],
    shards: [ { x: 315, y: 590 }, { x: 742, y: 148 }, { x: 1175, y: 598 } ],
    station: { x: 1210, y: 596, r: 36, gate: 3 } },

  // ---- 36 · Heart of the Abyss (Hard) — finale: heavier maw, narrower folds, smaller rock, faster comets ----
  36: { name: 'Heart of the Abyss (Hard)', sector: 3, par: 1, launches: 2,
    tip: 'Everything at once, turned up: heavier maw, narrower folds, a smaller bank rock, faster strafe. All three ◆◆◆ for the vault.',
    ship: { x: 140, y: 600 },
    planets: [], blackholes: [ { x: 200, y: 150, r: 26, m: 6500 } ],
    depots: [], winds: [], patrols: [],
    wormholes: [ { x: 340, y: 580, r: 26, link: 1 }, { x: 700, y: 250, r: 26, link: 0 } ],
    comets: [ { x: 850, y: 80, r: 16, vx: 0, vy: 165 },
              { x: 850, y: 620, r: 16, vx: 0, vy: -175 } ],
    asteroids: [ { x: 1055, y: 198, r: 45, bounce: true } ],
    shards: [ { x: 240, y: 590 }, { x: 870, y: 232 }, { x: 930, y: 268 } ],
    station: { x: 848, y: 310, r: 36, gate: 3 } },
};
