'use strict';
/* MILK RUN — Cosmic Delivery : level definitions.
   World is 1280 x 720 units. Ship starts at ship, goal is station.
   planet: {x,y,r,m} gravity well + solid.  blackhole: {x,y,r,m} gravity + death.
   asteroid: {x,y,r} static solid.  comet: {x,y,r,vx,vy} moving solid (bounces).
   shard: {x,y,r} pickup.  depot: {x,y,r} touch for +1 launch (one use).
   wormhole: {x,y,r,link} paired by index; preserves velocity vector.
   station.orbit: {cx,cy,radius,speed,phase} for moving stations.
   G = 4000 (see game.js). Masses tuned so bends are readable, not brutal.
   v0.9: full difficulty rebalance — all 48 levels redesigned as a true
   difficulty curve, easiest at 1, hardest at 48. */

const SECTORS = [
  { name: 'Drift', tag: 'Sector 1 · learn the ropes' },
  { name: 'Rogue', tag: 'Sector 2 · black holes & moving targets' },
  { name: 'Void',  tag: 'Sector 3 · wormholes & tight budgets' },
  { name: 'Abyss', tag: 'Sector 4 · the hard stuff' },
  { name: 'Maelstrom', tag: 'Sector 5 · ride the storm' },
];

const LEVELS = [
  // ---------------- SECTOR 1 : DRIFT ----------------
{
    name: "First Light",
    sector: 0,
    par: 3,
    launches: 5,
    tip: "Drag to aim, release to launch. Grab every shard, then reach the station.",
    ship: { x: 160, y: 360 },
    planets: [],
    asteroids: [],
    depots: [],
    shards: [{ x: 320, y: 360 }, { x: 460, y: 360 }],
    station: { x: 980, y: 360, r: 85 },
  },
  {
    name: "Around the Bend",
    sector: 0,
    par: 3,
    launches: 5,
    tip: "Planets bend your flight. Aim below the station and let gravity curl you up into it.",
    ship: { x: 160, y: 360 },
    planets: [{ x: 650, y: 150, r: 50, m: 7000 }],
    asteroids: [],
    depots: [],
    shards: [{ x: 340, y: 438 }, { x: 460, y: 467 }],
    station: { x: 1010, y: 290, r: 85 },
  },
  {
    name: "Needle's Eye",
    sector: 0,
    par: 3,
    launches: 4,
    tip: "Asteroids are solid. The shards mark the safe line through the gap.",
    ship: { x: 140, y: 360 },
    planets: [],
    asteroids: [{ x: 520, y: 200, r: 46 }, { x: 520, y: 520, r: 46 }],
    depots: [],
    shards: [{ x: 400, y: 360 }, { x: 480, y: 360 }],
    station: { x: 1050, y: 360, r: 78 },
  },
  {
    name: "Close Shave",
    sector: 0,
    par: 2,
    launches: 4,
    tip: "Skim a planet's edge for a gravity whip. The closer the pass, the harder the sling.",
    ship: { x: 160, y: 560 },
    planets: [{ x: 640, y: 360, r: 110, m: 10000 }],
    asteroids: [],
    depots: [],
    shards: [{ x: 392, y: 690 }, { x: 501, y: 712 }],
    station: { x: 1100, y: 200, r: 70 },
  },
  {
    name: "Serpentine",
    sector: 0,
    par: 2,
    launches: 4,
    ship: { x: 400, y: 360 },
    planets: [{ x: 600, y: 280, r: 50, m: 5000 }, { x: 800, y: 440, r: 50, m: 5000 }],
    asteroids: [],
    depots: [],
    shards: [{ x: 522, y: 382 }, { x: 714, y: 335 }],
    station: { x: 1000, y: 360, r: 65 },
  },
  {
    name: "Top Up",
    sector: 0,
    par: 2,
    launches: 2,
    tip: "Fly through the glowing depot for +1 launch. Budgets are tight from here - every shot counts.",
    ship: { x: 160, y: 360 },
    planets: [],
    asteroids: [],
    depots: [{ x: 600, y: 360, r: 26 }],
    shards: [{ x: 400, y: 360 }, { x: 550, y: 360 }],
    station: { x: 1050, y: 360, r: 70 },
  },
  {
    name: "Rock and a Hard Place",
    sector: 0,
    par: 2,
    launches: 4,
    ship: { x: 160, y: 360 },
    planets: [{ x: 500, y: 280, r: 55, m: 2000 }],
    asteroids: [{ x: 700, y: 180, r: 40 }, { x: 900, y: 540, r: 40 }],
    depots: [],
    shards: [{ x: 309, y: 429 }, { x: 446, y: 469 }],
    station: { x: 1050, y: 360, r: 95 },
  },
  {
    name: "Drift Gauntlet",
    sector: 0,
    par: 2,
    launches: 3,
    ship: { x: 160, y: 360 },
    planets: [],
    asteroids: [{ x: 650, y: 200, r: 42 }, { x: 650, y: 520, r: 42 }, { x: 900, y: 200, r: 42 }, { x: 900, y: 520, r: 42 }],
    depots: [{ x: 775, y: 360, r: 26 }],
    shards: [{ x: 400, y: 360 }, { x: 550, y: 360 }],
    station: { x: 1120, y: 360, r: 80 },
  },

  // ---------------- SECTOR 2 : ROGUE ----------------
{
    name: "Wide Berth",
    sector: 1,
    par: 2,
    launches: 4,
    tip: "Black holes pull harder the closer you get. The red ring is the capture zone - inside it, no launch is fast enough to escape. Skim, don't hug.",
    ship: {
      x: 180,
      y: 360
    },
    planets: [],
    asteroids: [],
    blackholes: [
      {
        x: 640,
        y: 540,
        r: 24,
        m: 2000
      }
    ],
    depots: [],
    comets: [],
    shards: [
      {
        x: 425,
        y: 313
      },
      {
        x: 596,
        y: 294
      }
    ],
    station: {
      x: 1100,
      y: 360,
      r: 70
    }
  },
  {
    name: "Running on Fumes",
    sector: 1,
    par: 1,
    launches: 2,
    tip: "Only two launches in the tank and a long way to fly. Thread the depot mid-flight to bank an extra launch.",
    ship: {
      x: 160,
      y: 560
    },
    planets: [
      {
        x: 640,
        y: 240,
        r: 50,
        m: 7000
      }
    ],
    asteroids: [],
    blackholes: [],
    depots: [
      {
        x: 303,
        y: 557,
        r: 24
      }
    ],
    comets: [],
    shards: [
      {
        x: 400,
        y: 551
      },
      {
        x: 660,
        y: 503
      }
    ],
    station: {
      x: 1120,
      y: 140,
      r: 76
    }
  },
  {
    name: "Orbital Rendezvous",
    sector: 1,
    par: 2,
    launches: 4,
    tip: "The station is on the move - and you can WAIT before launching. Time your shot so the station meets your flight line.",
    ship: {
      x: 200,
      y: 560
    },
    planets: [],
    asteroids: [],
    blackholes: [],
    depots: [],
    comets: [],
    shards: [
      {
        x: 387,
        y: 477
      },
      {
        x: 569,
        y: 396
      }
    ],
    station: {
      x: 1050,
      y: 330,
      r: 64,
      orbit: {
        cx: 1050,
        cy: 330,
        radius: 115,
        speed: 0.35,
        phase: 3.14159
      }
    }
  },
  {
    name: "Comet Crossing",
    sector: 1,
    par: 2,
    launches: 4,
    tip: "Watch the comet's rhythm - launch when the lane is clear, and never chase it across.",
    ship: {
      x: 180,
      y: 360
    },
    planets: [],
    asteroids: [],
    blackholes: [],
    depots: [],
    comets: [
      {
        x: 640,
        y: 250,
        r: 20,
        vx: 0,
        vy: 35
      }
    ],
    shards: [
      {
        x: 423,
        y: 360
      },
      {
        x: 813,
        y: 360
      }
    ],
    station: {
      x: 1100,
      y: 360,
      r: 64
    }
  },
  {
    name: "The Whip",
    sector: 1,
    par: 2,
    launches: 3,
    ship: {
      x: 180,
      y: 360
    },
    planets: [],
    asteroids: [],
    blackholes: [
      {
        x: 640,
        y: 430,
        r: 115,
        m: 8000
      }
    ],
    depots: [],
    comets: [],
    shards: [
      {
        x: 375,
        y: 561
      },
      {
        x: 493,
        y: 618
      }
    ],
    station: {
      x: 1100,
      y: 200,
      r: 60
    }
  },
  {
    name: "Twin Wells",
    sector: 1,
    par: 2,
    launches: 3,
    ship: {
      x: 180,
      y: 360
    },
    planets: [],
    asteroids: [],
    blackholes: [
      {
        x: 640,
        y: 20,
        r: 30,
        m: 400
      },
      {
        x: 640,
        y: 700,
        r: 30,
        m: 400
      }
    ],
    depots: [],
    comets: [],
    shards: [
      {
        x: 386,
        y: 360
      },
      {
        x: 592,
        y: 360
      }
    ],
    station: {
      x: 1100,
      y: 360,
      r: 64
    }
  },
  {
    name: "Crossfire Alley",
    sector: 1,
    par: 2,
    launches: 3,
    ship: {
      x: 180,
      y: 360
    },
    planets: [],
    asteroids: [],
    blackholes: [
      {
        x: 800,
        y: 150,
        r: 26,
        m: 200
      }
    ],
    depots: [],
    comets: [
      {
        x: 400,
        y: 600,
        r: 10,
        vx: 0,
        vy: -20
      }
    ],
    shards: [
      {
        x: 450,
        y: 360
      }
    ],
    station: {
      x: 1100,
      y: 360,
      r: 52
    }
  },
  {
    name: "Rogue's Gambit",
    sector: 1,
    par: 2,
    launches: 3,
    ship: {
      x: 180,
      y: 600
    },
    planets: [],
    asteroids: [
      {
        x: 380,
        y: 130,
        r: 30
      },
      {
        x: 450,
        y: 215,
        r: 28
      },
      {
        x: 640,
        y: 95,
        r: 30
      },
      {
        x: 980,
        y: 560,
        r: 30
      }
    ],
    blackholes: [
      {
        x: 620,
        y: 320,
        r: 32,
        m: 8000
      }
    ],
    depots: [],
    comets: [
      {
        x: 680,
        y: 615,
        r: 18,
        vx: -60,
        vy: 80
      }
    ],
    shards: [
      {
        x: 349,
        y: 646
      },
      {
        x: 445,
        y: 654
      }
    ],
    station: {
      x: 1060,
      y: 220,
      r: 54,
      orbit: {
        cx: 1060,
        cy: 220,
        radius: 95,
        speed: 0.4,
        phase: 1.5708
      }
    }
  },

  // ---------------- SECTOR 3 : VOID ----------------
{
    name: "Blue Door",
    sector: 2,
    par: 2,
    launches: 3,
    tip: "Wormholes travel in pairs. Fly into one and you'll pop out of its twin — same speed, same direction. Aim straight through like it isn't there.",
    ship: { x: 140, y: 360 },
    wormholes: [
      { x: 640, y: 360, r: 34, link: 1 },
      { x: 1020, y: 360, r: 34, link: 0 }
    ],
    shards: [{ x: 390, y: 360 }, { x: 1100, y: 360 }],
    station: { x: 1170, y: 360, r: 44 }
  },
  {
    name: "Exit Interview",
    sector: 2,
    par: 2,
    launches: 3,
    ship: { x: 120, y: 130 },
    wormholes: [
      { x: 560, y: 330, r: 28, link: 1 },
      { x: 960, y: 430, r: 28, link: 0 }
    ],
    asteroids: [
      { x: 1100, y: 540, r: 22 },
      { x: 340, y: 170, r: 20 }
    ],
    shards: [{ x: 340, y: 230 }, { x: 1043, y: 468 }],
    station: { x: 1142, y: 513, r: 40 }
  },
  {
    name: "Two Keys",
    sector: 2,
    par: 2,
    launches: 3,
    tip: "See the diamond pips on the station? It's LOCKED until you bank 2 shards. Take the wormhole detour — there's a shard on each side.",
    ship: { x: 100, y: 620 },
    wormholes: [
      { x: 560, y: 380, r: 28, link: 1 },
      { x: 940, y: 420, r: 28, link: 0 }
    ],
    shards: [{ x: 330, y: 500 }, { x: 1039, y: 368 }],
    station: { x: 1144, y: 314, r: 42, gate: 2 }
  },
  {
    name: "One Shot",
    sector: 2,
    par: 1,
    launches: 2,
    tip: "Par 1. One perfect launch: both shards, then the station. You get 2 launches — use the first to learn the line if you must.",
    ship: { x: 120, y: 620 },
    wormholes: [
      { x: 560, y: 400, r: 28, link: 1 },
      { x: 950, y: 300, r: 28, link: 0 }
    ],
    asteroids: [
      { x: 1078, y: 197, r: 16 },
      { x: 1082, y: 273, r: 16 }
    ],
    shards: [{ x: 340, y: 510 }, { x: 1050, y: 250 }],
    station: { x: 1147, y: 202, r: 40, gate: 2 }
  },
  {
    name: "Relay Race",
    sector: 2,
    par: 2,
    launches: 3,
    ship: { x: 100, y: 620 },
    wormholes: [
      { x: 751, y: 330, r: 28, link: 1 },
      { x: 877, y: 274, r: 28, link: 0 },
      { x: 1014, y: 213, r: 30, link: 3 },
      { x: 1087, y: 181, r: 28, link: 2 }
    ],
    asteroids: [
      { x: 606, y: 526, r: 24 }
    ],
    shards: [{ x: 425, y: 475 }, { x: 945, y: 244 }, { x: 1151, y: 152 }],
    station: { x: 1215, y: 124, r: 44 }
  },
  {
    name: "Skim the Drain",
    sector: 2,
    par: 2,
    launches: 3,
    ship: { x: 140, y: 360 },
    blackholes: [{ x: 620, y: 380, r: 38, m: 15000 }],
    wormholes: [
      { x: 960, y: 480, r: 32, link: 1 },
      { x: 1080, y: 620, r: 30, link: 0 }
    ],
    shards: [{ x: 490, y: 620 }, { x: 1124, y: 572 }],
    station: { x: 1210, y: 480, r: 40 }
  },
  {
    name: "Crossfire Toll",
    sector: 2,
    par: 2,
    launches: 3,
    ship: { x: 120, y: 360 },
    asteroids: [
      { x: 612, y: 221, r: 20 },
      { x: 612, y: 327, r: 20 }
    ],
    comets: [{ x: 700, y: 642, r: 16, vx: 0, vy: -130 }],
    shards: [{ x: 416, y: 308 }, { x: 711, y: 257 }, { x: 957, y: 214 }],
    station: { x: 1150, y: 180, r: 38, gate: 3 }
  },
  {
    name: "The Long Way Home",
    sector: 2,
    par: 1,
    launches: 2,
    ship: { x: 100, y: 640 },
    wormholes: [
      { x: 570, y: 469, r: 28, link: 1 },
      { x: 852, y: 366, r: 28, link: 0 },
      { x: 1040, y: 298, r: 28, link: 3 },
      { x: 1068, y: 288, r: 28, link: 2 }
    ],
    asteroids: [
      { x: 450, y: 466, r: 20 },
      { x: 450, y: 559, r: 20 }
    ],
    shards: [{ x: 335, y: 554 }, { x: 946, y: 332 }, { x: 1143, y: 260 }],
    station: { x: 1209, y: 236, r: 38, gate: 3 }
  },

  // ---------------- SECTOR 4 : ABYSS ----------------
// ---- 25 · Pogo (bounce tutorial) ----
  { name: 'Pogo', sector: 3, par: 1, launches: 3,
    tip: 'That haloed rock is bouncy! Aim for its lower-left cheek — you bank down-right toward the station. The ◆s mark the way.',
    ship: { x: 200, y: 500 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 450, y: 380, r: 80, bounce: true } ],
    shards: [ { x: 297, y: 477 }, { x: 407, y: 517 } ],
    station: { x: 420, y: 581, r: 44 } },

  // ---- 26 · Rebound Line ----
  { name: 'Rebound Line', sector: 3, par: 1, launches: 3,
    tip: 'Same bank, smaller rock, tighter station. One ◆ on the way in, one on the rebound.',
    ship: { x: 200, y: 500 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 450, y: 380, r: 65, bounce: true } ],
    shards: [ { x: 308, y: 474 }, { x: 449, y: 505 } ],
    station: { x: 482, y: 560, r: 44 } },

  // ---- 27 · Bank Shot (gate 2 + bounce) ----
  { name: 'Bank Shot', sector: 3, par: 2, launches: 3,
    tip: 'The station is locked until you bank both ◆◆. One sits on the way in, one on the rebound.',
    ship: { x: 180, y: 540 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 460, y: 340, r: 70, bounce: true } ],
    shards: [ { x: 284, y: 459 }, { x: 315, y: 396 } ],
    station: { x: 242, y: 414, r: 42, gate: 2 } },

  // ---- 28 · Backstop (black hole toll + bounce backboard) ----
  { name: 'Backstop', sector: 3, par: 2, launches: 3,
    tip: 'No straight shot here — bank off the big rock\u2019s lower cheek and drop straight down into the station. The ◆◆ mark the bank.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [],
    depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 500, y: 220, r: 75, bounce: true } ],
    shards: [ { x: 291, y: 322 }, { x: 442, y: 370 } ],
    station: { x: 442, y: 455, r: 50 } },

  // ---- 29 · Slalom (columns + bounce redirect) ----
  { name: 'Slalom', sector: 3, par: 2, launches: 3,
    tip: 'Thread the towers, kiss the rock\u2019s lower-left cheek, and let it tip you down through the second gate.',
    ship: { x: 220, y: 260 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 380, y: 140, r: 38 }, { x: 380, y: 380, r: 38 },
                 { x: 620, y: 260, r: 80, bounce: true },
                 { x: 480, y: 420, r: 38 }, { x: 760, y: 420, r: 38 } ],
    shards: [ { x: 370, y: 289 }, { x: 578, y: 401 } ],
    station: { x: 601, y: 477, r: 52 } },

  // ---- 30 · Crossfire Rebound ----
  { name: 'Crossfire Rebound', sector: 3, par: 2, launches: 3,
    tip: 'Comets strafe the lane — wait for your moment, then bank off the rock\u2019s upper shoulder and ride the rebound up.',
    ship: { x: 500, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [], winds: [], patrols: [],
    comets: [ { x: 650, y: 100, r: 18, vx: 0, vy: 150 },
              { x: 835, y: 620, r: 18, vx: 0, vy: -160 },
              { x: 700, y: 240, r: 18, vx: 120, vy: 0 } ],
    asteroids: [ { x: 900, y: 360, r: 70, bounce: true } ],
    shards: [ { x: 667, y: 335 }, { x: 835, y: 241 } ],
    station: { x: 836, y: 171, r: 48 } },

  // ---- 31 · The Folded Vault (wormhole + bounce vault, gate 2) ----
  { name: 'The Folded Vault', sector: 3, par: 2, launches: 3,
    tip: 'Fold through, then bounce: the vault\u2019s rock banks you down to the locked station. Both ◆◆ first.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [], depots: [], winds: [], patrols: [], comets: [],
    wormholes: [ { x: 420, y: 360, r: 32, link: 1 }, { x: 1000, y: 150, r: 32, link: 0 } ],
    asteroids: [ { x: 1160, y: 110, r: 60, bounce: true } ],
    shards: [ { x: 280, y: 360 }, { x: 1050, y: 150 } ],
    station: { x: 1029, y: 421, r: 36, gate: 2 } },

  // ---- 32 · Orbital Ricochet ----
  { name: 'Orbital Ricochet', sector: 3, par: 2, launches: 3,
    tip: 'The station won\u2019t sit still — and your shot can\u2019t reach its orbit directly. Bank off the rock and time your launch to meet it on the rebound.',
    ship: { x: 200, y: 400 },
    planets: [], blackholes: [], depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 450, y: 400, r: 75, bounce: true } ],
    shards: [ { x: 307, y: 308 }, { x: 274, y: 270 } ],
    station: { x: 0, y: 0, r: 36, orbit: { cx: 234, cy: 225, radius: 40, speed: 0.35, phase: 0 } } },

  // ---- 33 · Needle Storm (dense comets, no bounce) ----
  { name: 'Needle Storm', sector: 3, par: 1, launches: 2,
    tip: 'No tricks, no bounces — just six comets and a long walk. Wait for your gap; the ◆◆ sit just off the safe line.',
    ship: { x: 140, y: 360 },
    planets: [], blackholes: [], depots: [], wormholes: [], winds: [], patrols: [],
    asteroids: [],
    comets: [ { x: 350, y: 80, r: 18, vx: 0, vy: 110 },
              { x: 500, y: 640, r: 18, vx: 0, vy: -120 },
              { x: 650, y: 80, r: 18, vx: 0, vy: 105 },
              { x: 800, y: 640, r: 18, vx: 0, vy: -115 },
              { x: 950, y: 80, r: 18, vx: 0, vy: 120 },
              { x: 1080, y: 640, r: 18, vx: 0, vy: -110 } ],
    shards: [ { x: 400, y: 360 }, { x: 720, y: 360 }, { x: 1040, y: 360 } ],
    station: { x: 1140, y: 360, r: 48, gate: 3 } },

  // ---- 34 · The Maw's Teeth (black hole gauntlet) ----
  { name: 'The Maw\u2019s Teeth', sector: 3, par: 2, launches: 3,
    tip: 'The maws watch from the dark — thread the bounce clean and don\u2019t let them pull you off the rebound. All three ◆◆◆.',
    ship: { x: 200, y: 500 },
    planets: [], blackholes: [ { x: 800, y: 150, r: 26, m: 4000 },
                               { x: 1000, y: 600, r: 26, m: 4000 },
                               { x: 1150, y: 250, r: 26, m: 4000 } ],
    depots: [], wormholes: [], comets: [], winds: [], patrols: [],
    asteroids: [ { x: 450, y: 380, r: 70, bounce: true } ],
    shards: [ { x: 312, y: 473 }, { x: 478, y: 512 }, { x: 501, y: 539 } ],
    station: { x: 533, y: 577, r: 52, gate: 3 } },

  // ---- 35 · Chain Reaction (wormhole chain, gate 3) ----
  { name: 'Chain Reaction', sector: 3, par: 2, launches: 3,
    tip: 'Two folds, three ◆◆, one locked vault. Two comets strafe the long fold — fold in straight and time it.',
    ship: { x: 140, y: 600 },
    planets: [], blackholes: [],
    depots: [], winds: [], patrols: [],
    wormholes: [ { x: 489, y: 579, r: 26, link: 1 }, { x: 300, y: 150, r: 26, link: 0 },
                 { x: 1150, y: 100, r: 26, link: 3 }, { x: 1140, y: 600, r: 28, link: 2 } ],
    comets: [ { x: 725, y: 80, r: 16, vx: 0, vy: 150 },
              { x: 950, y: 640, r: 16, vx: 0, vy: -160 } ],
    asteroids: [],
    shards: [ { x: 315, y: 590 }, { x: 725, y: 125 }, { x: 1175, y: 598 } ],
    station: { x: 1210, y: 596, r: 36, gate: 3 } },

  // ---- 36 · Heart of the Abyss (finale) ----
  { name: 'Heart of the Abyss', sector: 3, par: 2, launches: 3,
    tip: 'Everything at once: fold, bank the rock\u2019s lower limb, thread the comets. All three ◆◆◆ for the vault.',
    ship: { x: 140, y: 600 },
    planets: [], blackholes: [ { x: 200, y: 150, r: 26, m: 5000 } ],
    depots: [], winds: [], patrols: [],
    wormholes: [ { x: 340, y: 580, r: 28, link: 1 }, { x: 700, y: 250, r: 28, link: 0 } ],
    comets: [ { x: 850, y: 80, r: 16, vx: 0, vy: 140 },
              { x: 850, y: 620, r: 16, vx: 0, vy: -150 } ],
    asteroids: [ { x: 1050, y: 200, r: 60, bounce: true } ],
    shards: [ { x: 240, y: 590 }, { x: 841, y: 236 }, { x: 906, y: 272 } ],
    station: { x: 848, y: 310, r: 38, gate: 3 } },

  // ---------------- SECTOR 5 : MAELSTROM ----------------
{ name: "Fair Wind", sector: 4, par: 2, launches: 3,
    tip: "Wind zones push your ship while it's inside. This one's a tailwind — it blows toward the station. Aim through the gap and let it carry you.",
    ship: {x:130,y:360},
    asteroids: [{x:640,y:292,r:40},{x:640,y:428,r:40},{x:300,y:150,r:26},{x:980,y:570,r:26}],
    winds: [{x:320,y:240,w:580,h:240,ax:110,ay:0}],
    shards: [{x:430,y:360},{x:860,y:360}],
    station: {x:1150,y:360,r:42} },

  { name: "Against the Gale", sector: 4, par: 2, launches: 3,
    ship: {x:130,y:360},
    asteroids: [{x:640,y:296,r:36},{x:640,y:424,r:36}],
    winds: [{x:420,y:0,w:560,h:720,ax:-190,ay:0}],
    shards: [{x:300,y:360},{x:700,y:365}],
    station: {x:1150,y:380,r:40} },

  { name: "Crossing Guard", sector: 4, par: 2, launches: 3,
    tip: "Patrol comets sweep a fixed route on a timer, and they are lethal. You can WAIT before launching — watch the sweep, then fire through the gap when it clears.",
    ship: {x:130,y:360},
    asteroids: [{x:640,y:300,r:34},{x:640,y:420,r:34}],
    patrols: [{x1:640,y1:190,x2:640,y2:530,r:24,period:10,phase:0}],
    shards: [{x:430,y:360},{x:860,y:360}],
    station: {x:1150,y:360,r:36} },

  { name: "Gale Watch", sector: 4, par: 1, launches: 3,
    ship: {x:130,y:360},
    winds: [{x:400,y:120,w:480,h:480,ax:-100,ay:150}],
    patrols: [{x1:900,y1:180,x2:900,y2:540,r:24,period:8,phase:0.3}],
    shards: [{x:560,y:300},{x:760,y:290}],
    station: {x:1150,y:360,r:40} },

  { name: "Riding the Thermal", sector: 4, par: 1, launches: 3,
    ship: {x:140,y:600},
    winds: [{x:300,y:80,w:300,h:570,ax:0,ay:-200}],
    asteroids: [{x:500,y:36,r:34},{x:900,y:36,r:34},{x:1020,y:144,r:28},{x:1020,y:284,r:28}],
    shards: [{x:745,y:433},{x:866,y:344},{x:987,y:255}],
    station: {x:1150,y:150,r:38} },

  { name: "Drift Correction", sector: 4, par: 1, launches: 3,
    ship: {x:130,y:360},
    winds: [{x:350,y:100,w:600,h:520,ax:-70,ay:190}],
    comets: [{x:900,y:150,r:20,vx:-90,vy:60}],
    asteroids: [{x:800,y:219,r:28},{x:800,y:324,r:28}],
    shards: [{x:500,y:300},{x:700,y:270},{x:900,y:300}],
    station: {x:1150,y:360,r:36} },

  { name: "The Opening", sector: 4, par: 1, launches: 2,
    ship: {x:130,y:360},
    asteroids: [{x:630,y:300,r:38},{x:630,y:420,r:38}],
    patrols: [{x1:480,y1:170,x2:480,y2:550,r:24,period:9,phase:0},
              {x1:780,y1:170,x2:780,y2:550,r:24,period:9,phase:0.5}],
    shards: [{x:330,y:360},{x:960,y:360}],
    station: {x:1150,y:360,r:38} },

  { name: "Storm Surge", sector: 4, par: 1, launches: 2,
    ship: {x:130,y:400},
    winds: [{x:300,y:0,w:700,h:720,ax:-140,ay:-60}],
    asteroids: [{x:750,y:264,r:28},{x:750,y:374,r:28}],
    patrols: [{x1:550,y1:120,x2:550,y2:520,r:24,period:8,phase:0},
              {x1:850,y1:120,x2:850,y2:520,r:24,period:8,phase:0.5}],
    shards: [{x:550,y:355},{x:850,y:295}],
    station: {x:1150,y:200,r:36,gate:2} },

  { name: "Eye of the Storm", sector: 4, par: 1, launches: 2,
    ship: {x:140,y:360},
    blackholes: [{x:640,y:360,r:35,m:12000}],
    winds: [{x:300,y:0,w:680,h:720,ax:-120,ay:0},
            {x:300,y:80,w:680,h:200,ax:0,ay:-200}],
    asteroids: [{x:1000,y:70,r:28},{x:1000,y:175,r:28}],
    patrols: [{x1:700,y1:0,x2:700,y2:180,r:22,period:7,phase:0}],
    shards: [{x:535,y:82},{x:954,y:86}],
    station: {x:1140,y:360,r:36} },

  { name: "Shear Line", sector: 4, par: 1, launches: 2,
    ship: {x:130,y:360},
    winds: [{x:700,y:200,w:450,h:320,ax:-150,ay:50}],
    asteroids: [{x:600,y:200,r:40},{x:600,y:300,r:40},{x:600,y:400,r:40},{x:600,y:500,r:40},
                {x:1050,y:310,r:28},{x:1050,y:410,r:28}],
    wormholes: [{x:400,y:360,r:30,link:1},{x:700,y:360,r:30,link:0}],
    patrols: [{x1:950,y1:280,x2:950,y2:440,r:22,period:6,phase:0}],
    shards: [{x:250,y:360},{x:900,y:365}],
    station: {x:1150,y:360,r:36} },

  { name: "Maelstrom", sector: 4, par: 1, launches: 2,
    ship: {x:130,y:360},
    winds: [{x:300,y:0,w:700,h:720,ax:-150,ay:0}],
    wormholes: [{x:450,y:360,r:32,link:1},{x:850,y:360,r:32,link:0}],
    patrols: [{x1:650,y1:200,x2:650,y2:520,r:22,period:6,phase:0},
              {x1:1000,y1:200,x2:1000,y2:520,r:22,period:6,phase:0.5}],
    shards: [{x:250,y:360},{x:950,y:360},{x:1080,y:360}],
    station: {x:1150,y:360,r:36,gate:3} },

  { name: "The Last Delivery", sector: 4, par: 1, launches: 2,
    tip: "Last stop on the Milk Run. Every trick in the book at once — wind shear, patrols, the void itself. Two launches. Make the final delivery count.",
    ship: {x:130,y:360},
    winds: [{x:300,y:0,w:700,h:720,ax:-140,ay:0}],
    blackholes: [{x:1000,y:280,r:28,m:12000}],
    wormholes: [{x:450,y:360,r:32,link:1},{x:850,y:360,r:32,link:0}],
    patrols: [{x1:1000,y1:200,x2:1000,y2:520,r:22,period:6,phase:0}],
    shards: [{x:250,y:360},{x:950,y:360},{x:1080,y:360}],
    station: {x:1150,y:360,r:36,gate:3} }
];
