'use strict';
/* MILK RUN — Cosmic Delivery : HARD MODE level definitions.
   Pure, zero dependencies, same schema as levels.js. Keyed by original level
   NUMBER (25-36, Sector 4 "Abyss"). Each variant keeps its original's concept
   but is meaner: tighter corridors, extra or moved hazards, relocated shards,
   reduced par/launches. Uses only pre-existing mechanics (planets, asteroids
   incl. bounce rocks, blackholes, depots, wormholes, comets, shard gates,
   orbiting stations). World is 1280 x 720 units, G = 4000 (see game.js). */

const HARD_LEVELS = {
  // ---- 25 · Trampoline ----
  25: { name: 'Trampoline (Hard)', sector: 3, par: 2, launches: 2,
    tip: 'Arc over the planet, grab the ◆, bend down onto the rock, ride the rebound home.',
    ship: { x: 140, y: 360 },
    planets: [ { x: 850, y: 580, r: 60, m: 16000 } ],
    blackholes: [], depots: [], wormholes: [],
    comets: [ { x: 700, y: 120, r: 18, vx: 0, vy: 150 },
              { x: 640, y: 600, r: 18, vx: 0, vy: -160 } ],
    asteroids: [ { x: 1000, y: 360, r: 55, bounce: true } ],
    shards: [ { x: 700, y: 250 } ],
    station: { x: 500, y: 360, r: 44, gate: 1 } },

  // ---- 26 · Boomerang ----
  26: { name: 'Boomerang (Hard)', sector: 3, par: 2, launches: 2,
    tip: 'Smaller rock, tighter station — and a comet now crosses the rebound lane. Time it.',
    ship: { x: 600, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [],
    comets: [ { x: 400, y: 100, r: 18, vx: 60, vy: 130 } ],
    asteroids: [ { x: 1000, y: 360, r: 55, bounce: true } ],
    shards: [ { x: 820, y: 360 }, { x: 380, y: 360 } ],
    station: { x: 140, y: 360, r: 40 } },

  // ---- 27 · Locked Door ----
  27: { name: 'Locked Door (Hard)', sector: 3, par: 2, launches: 3,
    tip: 'Heavier planet overhead, a third ◆ mid-corridor, and the station wants all three.',
    ship: { x: 140, y: 360 },
    planets: [ { x: 640, y: 120, r: 55, m: 4500 } ],
    asteroids: [],
    blackholes: [], depots: [], wormholes: [], comets: [],
    shards: [ { x: 450, y: 360 }, { x: 640, y: 360 }, { x: 850, y: 360 } ],
    station: { x: 1150, y: 360, r: 42, gate: 3 } },

  // ---- 28 · Toll Booth ----
  28: { name: 'Toll Booth (Hard)', sector: 3, par: 3, launches: 3,
    tip: 'The toll went up: heavier hole, shards pushed wide, tighter station.',
    ship: { x: 140, y: 360 },
    planets: [], asteroids: [],
    blackholes: [ { x: 640, y: 360, r: 26, m: 44000 } ],
    depots: [], wormholes: [], comets: [],
    shards: [ { x: 399, y: 590 }, { x: 797, y: 620 }, { x: 1084, y: 380 } ],
    station: { x: 1150, y: 360, r: 40, gate: 3 } },

  // ---- 29 · Thread the Needle ----
  29: { name: 'Thread the Needle (Hard)', sector: 3, par: 2, launches: 3,
    tip: 'Three columns now, and every column hides a ◆ in its gap.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [],
    asteroids: [ { x: 500, y: 150, r: 30 }, { x: 500, y: 450, r: 30 },
                 { x: 650, y: 265, r: 24 }, { x: 650, y: 455, r: 24 },
                 { x: 800, y: 100, r: 30 }, { x: 800, y: 410, r: 30 },
                 { x: 1000, y: 80, r: 30 }, { x: 1000, y: 370, r: 30 } ],
    shards: [ { x: 500, y: 331 }, { x: 650, y: 319 }, { x: 800, y: 307 } ],
    station: { x: 1150, y: 279, r: 40 } },

  // ---- 30 · Event Horizon ----
  30: { name: 'Event Horizon (Hard)', sector: 3, par: 2, launches: 3,
    tip: 'Heavier hole, smaller backboard, shards hugging the floor — and a comet sweeping low.',
    ship: { x: 140, y: 360 },
    planets: [], depots: [], wormholes: [],
    blackholes: [ { x: 640, y: 360, r: 28, m: 56000 } ],
    asteroids: [ { x: 1050, y: 150, r: 45, bounce: true } ],
    comets: [ { x: 900, y: 620, r: 18, vx: -90, vy: -60 } ],
    shards: [ { x: 340, y: 620 }, { x: 749, y: 680 } ],
    station: { x: 1150, y: 360, r: 40 } },

  // ---- 31 · The Vault ----
  31: { name: 'The Vault (Hard)', sector: 3, par: 2, launches: 3,
    tip: 'Bigger wall, smaller wormholes, shards off the center line, and a new well below.',
    ship: { x: 140, y: 360 },
    planets: [], comets: [], depots: [],
    blackholes: [ { x: 700, y: 590, r: 22, m: 26000 } ],
    asteroids: [ { x: 700, y: 360, r: 55 } ],
    wormholes: [ { x: 500, y: 360, r: 28, link: 1 }, { x: 900, y: 360, r: 28, link: 0 } ],
    shards: [ { x: 300, y: 300 }, { x: 1050, y: 420 } ],
    station: { x: 1150, y: 360, r: 40, gate: 2 } },

  // ---- 32 · Orbit Decay ----
  32: { name: 'Orbit Decay (Hard)', sector: 3, par: 2, launches: 3,
    tip: 'Heavier planet, faster comet, shards split off the old line, and the station orbits wider and faster.',
    ship: { x: 140, y: 360 },
    planets: [ { x: 350, y: 550, r: 60, m: 12000 } ],
    blackholes: [], depots: [], wormholes: [],
    asteroids: [],
    comets: [ { x: 700, y: 620, r: 18, vx: 90, vy: -140 } ],
    shards: [ { x: 446, y: 320 }, { x: 730, y: 410 } ],
    station: { x: 900, y: 360, r: 42,
               orbit: { cx: 900, cy: 360, radius: 220, speed: 0.55, phase: 0 } } },

  // ---- 33 · Comet Crossfire ----
  33: { name: 'Comet Crossfire (Hard)', sector: 3, par: 2, launches: 3,
    tip: 'Faster, fatter comets — and a third ◆ parked right between their lanes.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [],
    asteroids: [ { x: 1000, y: 325, r: 18 } ],
    comets: [ { x: 640, y: 120, r: 22, vx: 0, vy: 200 },
              { x: 640, y: 600, r: 22, vx: 0, vy: -200 } ],
    shards: [ { x: 450, y: 360 }, { x: 640, y: 360 }, { x: 850, y: 360 } ],
    station: { x: 1150, y: 360, r: 42 } },

  // ---- 34 · Gauntlet II ----
  34: { name: 'Gauntlet II (Hard)', sector: 3, par: 2, launches: 2,
    tip: 'Heavier holes, shards dragged toward the maws, and one more well guarding the station.',
    ship: { x: 140, y: 360 },
    planets: [], asteroids: [], depots: [], wormholes: [], comets: [],
    blackholes: [ { x: 450, y: 280, r: 24, m: 44000 }, { x: 700, y: 440, r: 24, m: 44000 },
                  { x: 950, y: 280, r: 24, m: 44000 }, { x: 1150, y: 580, r: 20, m: 30000 } ],
    shards: [ { x: 393, y: 470 }, { x: 822, y: 420 } ],
    station: { x: 1150, y: 360, r: 38 } },

  // ---- 35 · Wormhole Chain ----
  35: { name: 'Wormhole Chain (Hard)', sector: 3, par: 2, launches: 3,
    tip: 'Smaller wormholes, a third ◆ on the exit line, and the station wants all three.',
    ship: { x: 140, y: 360 },
    planets: [], asteroids: [], blackholes: [], depots: [], comets: [],
    wormholes: [ { x: 350, y: 200, r: 28, link: 1 }, { x: 700, y: 520, r: 28, link: 0 },
                 { x: 820, y: 200, r: 28, link: 3 }, { x: 1080, y: 520, r: 28, link: 2 } ],
    shards: [ { x: 287, y: 237 }, { x: 900, y: 334 }, { x: 944, y: 316 } ],
    station: { x: 1150, y: 150, r: 40, gate: 3 } },

  // ---- 36 · Abyssal Heart ----
  36: { name: 'Abyssal Heart (Hard)', sector: 3, par: 2, launches: 3,
    tip: 'Heavier hearts, faster comet, shards dragged toward the maws, station orbits wider.',
    ship: { x: 140, y: 360 },
    planets: [],
    blackholes: [ { x: 500, y: 250, r: 26, m: 48000 }, { x: 800, y: 470, r: 26, m: 48000 } ],
    asteroids: [], depots: [], wormholes: [],
    comets: [ { x: 950, y: 100, r: 18, vx: -110, vy: 160 } ],
    shards: [ { x: 365, y: 480 }, { x: 533, y: 460 }, { x: 702, y: 430 } ],
    station: { x: 1050, y: 360, r: 36, gate: 3,
               orbit: { cx: 1050, cy: 360, radius: 150, speed: 0.6, phase: 1 } } },
};
