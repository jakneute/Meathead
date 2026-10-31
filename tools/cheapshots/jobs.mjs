// The cheap shots tools/cheapshots/capture.mjs records: one job per boss or sub-boss the hand armor's CHEAP SHOT works on
// (src/m2/upgrades/cheapShot.ts), in land order. Each: the dev start (the boss's checkpoint, as tools/bossdeaths/jobs.mjs
// has them), the intro memo (skipped, as on a retry), when the fight's on, and `foe`: the enemy the cheap shot's gate
// is asked about (the one he walks up to). The game's own Y + B (the BEATDOWN key, R) sets it off: its own gate, its own
// cutscene and close-up. `label` is the compilation's title card.


export const JOBS = [
  {
    name: '01-artie', label: ['SAFARI ARTIE', 'PRIDE', 'THE CHEAP SHOT'], q: 'adv=71',
    on: () => { const f = window.__m2.stage?.s?.clearing?.f; return !!f && f.mode !== 'dead' && !!f.e; },
    foe: () => window.__m2.stage.s.clearing.f.e,
  },
  {
    name: '02-donnie', label: ['DONNIE DRACULA', 'GLUTTONY', 'THE CHEAP SHOT'], q: 'spooky=62', memo: 'm2:boss-intro:donnie',
    on: () => { const f = window.__m2.stage?.s?.ballroom?.f; return !!f && f.mode !== 'intro' && f.mode !== 'dead' && window.__m2.enemies.includes(f.e); },
    foe: () => window.__m2.stage.s.ballroom.f.e,
  },
  {
    name: '03-queen', label: ['THE QUEEN', 'THE ROBOT', 'THE CHEAP SHOT'], q: 'space=74', memo: 'm2:boss-intro:queen',
    on: () => { const f = window.__m2.stage?.s?.queen?.f; return !!f && !['intro', 'wait', 'dead'].includes(f.mode) && window.__m2.enemies.includes(f.e); },
    foe: () => window.__m2.stage.s.queen.f.e,
  },
  {
    name: '04-steve', label: ['STUNTMAN STEVE', 'ENVY', 'THE CHEAP SHOT'], q: 'hollywood=60', memo: 'm2:boss-intro:steve',
    on: () => { const f = window.__m2.stage?.s?.stunt?.f; return !!f && f.mode === 'on'; },
    foe: () => window.__m2.stage.s.stunt.f.e,
  },
  {
    name: '05-harry', label: ['HELICOPTER HARRY', 'WRATH', 'THE CHEAP SHOT'], q: 'foreign=120', memo: 'm2:boss-intro:harry',
    on: () => { const f = window.__m2.stage?.s?.harry?.f; return !!f && f.mode === 'on'; },
    foe: () => window.__m2.stage.s.harry.f.e,
  },
  {
    name: '06-tucker', label: ['TUCKER', 'GREED', 'THE CHEAP SHOT'], q: 'frontier=61',
    on: () => { const s = window.__m2.stage?.s?.arena; return !!s && s.phase === 'up' && !!s.fight && s.fight.mode === 'on'; },
    foe: () => window.__m2.stage.s.arena.fight.e,
  },
  {
    name: '07-piper', label: ['PIPER THE PIXIE', 'LUST', 'THE CHEAP SHOT'], q: 'fantasy=61',
    on: () => { const f = window.__m2.stage?.s?.bedroom?.f; return !!f && f.mode === 'on' && f.act !== 'bounce' && f.act !== 'entrance' && window.__m2.enemies.includes(f.e); },
    foe: () => window.__m2.stage.s.bedroom.f.e,
  },
  {
    // (on his couch, uncrushed: the only way the cheap shot's on for him)
    name: '08-dad', label: ['DAD GUY', 'SLOTH', 'THE CHEAP SHOT'], q: 'cartoon=62', memo: 'm2:boss-intro:dad',
    on: () => { const f = window.__m2.stage?.s?.amphi?.fight; return !!f && f.mode === 'on' && f.act !== 'enter'; },
    foe: () => window.__m2.stage.s.amphi.fight.e,
  },
  // ---- the sub-bosses it works on
  {
    // (the park's robots made hostile (the pebble switch's job) and him put in the paddock, past where it's on)
    name: '09-rex', label: ['THE T. REX', 'JUNGLE LAND', 'THE CHEAP SHOT'], q: 'adv=33',
    pre: () => { const s = window.__m2.stage.s, r = s.rex, p = window.__m2.player; if (s.dino) { s.dino.hostile = true; s.dino.held = false; } if (r) { p.pos.x = r.inX + 380; p.vel.x = 0; } },
    on: () => { const r = window.__m2.stage?.s?.rex; return !!r && r.fight === 'on' && r.st !== 'intro'; },
    foe: () => window.__m2.stage.s.rex.parts.legs.e,
  },
  {
    name: '10-demon', label: ['THE DEMON', 'SPOOKY LAND', 'THE CHEAP SHOT'], q: 'spooky=52',
    on: () => { const d = window.__m2.stage?.s?.hell?.demon; return !!d && d.fight === 'on' && d.st !== 'rise' && !!d.e; },
    foe: () => window.__m2.stage.s.hell.demon.e,
  },
  {
    name: '11-perot', label: ['ROSS PEROT', 'THE WHITE HOUSE', 'THE CHEAP SHOT'], q: 'cartoon=22',
    on: () => { const q = window.__m2.stage?.s?.whitehouse1?.perot; return !!q && q.phase === 'on' && !!q.e; },
    foe: () => window.__m2.stage.s.whitehouse1.perot.e,
  },
  {
    name: '12-falwell', label: ['JERRY FALWELL', 'THE WHITE HOUSE', 'THE CHEAP SHOT'], q: 'cartoon=25',
    on: () => { const q = window.__m2.stage?.s?.whitehouse1?.falwell; return !!q && q.phase === 'on' && !!q.e; },
    foe: () => window.__m2.stage.s.whitehouse1.falwell.e,
  },
  {
    name: '13-limbaugh', label: ['RUSH LIMBAUGH', 'THE WEST WING', 'THE CHEAP SHOT'], q: 'cartoon=31',
    on: () => { const q = window.__m2.stage?.s?.whitehouse2?.limbaugh; return !!q && q.phase === 'on' && !!q.e; },
    foe: () => window.__m2.stage.s.whitehouse2.limbaugh.e,
  },
  {
    name: '14-dole', label: ['BOB DOLE', 'THE WEST WING', 'THE CHEAP SHOT'], q: 'cartoon=33',
    on: () => { const q = window.__m2.stage?.s?.whitehouse2?.dole; return !!q && q.phase === 'on' && !!q.e; },
    foe: () => window.__m2.stage.s.whitehouse2.dole.e,
  },
  {
    name: '15-newt', label: ['NEWT GINGRICH', 'THE WEST WING', 'THE CHEAP SHOT'], q: 'cartoon=36',
    on: () => { const q = window.__m2.stage?.s?.whitehouse2?.newt; return !!q && q.phase === 'on' && !!q.e; },
    foe: () => window.__m2.stage.s.whitehouse2.newt.e,
  },
];
