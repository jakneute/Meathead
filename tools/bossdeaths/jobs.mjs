// The deaths tools/bossdeaths/capture.mjs records: one job per death, in land order. Each: the dev start (the boss's
// checkpoint), the intro memo (skipped, as on a retry), when the fight's on, and how the death's set off: the fight's
// own fields poked between frames (window.__m2 is the GameState in a dev build; a section's state is stage.s[id]), so
// the game's own damage path and death code decide and play it. `label` is the compilation's title card.

const lock = w => { window.__m2.lockWeapon = w; window.__m2.player.currentWeapon = w; };

// ---- Safari Artie (Jungle Land): he can only be hit while he's out of his bushes
const artieOut = () => { const f = window.__m2.stage?.s?.clearing?.f; return !!f && f.mode !== 'dead' && ['reach', 'gut', 'aim', 'coil', 'lunge', 'landed', 'exposed', 'hop', 'knocked', 'stunned', 'whistle', 'watch', 'dodge', 'trampled'].includes(f.mode) && window.__m2.enemies.includes(f.e); };

// ---- Donnie Dracula (Spooky Land)
const donnieOn = () => { const f = window.__m2.stage?.s?.ballroom?.f; return !!f && f.mode !== 'intro' && f.mode !== 'dead' && window.__m2.enemies.includes(f.e); };
// ---- The Queen (Future Land)
const queenOn = () => { const f = window.__m2.stage?.s?.queen?.f; return !!f && !['intro', 'wait', 'dead'].includes(f.mode) && window.__m2.enemies.includes(f.e); };
// ---- Stuntman Steve (Hollywood Land)
const steveOn = () => { const f = window.__m2.stage?.s?.stunt?.f; return !!f && f.mode === 'on'; };
// ---- Helicopter Harry (Foreign Lands)
const harryOn = () => { const f = window.__m2.stage?.s?.harry?.f; return !!f && f.mode === 'on'; };
// ---- Tucker (Wilderness Land)
const tuckerOn = () => { const s = window.__m2.stage?.s?.arena; return !!s && s.phase === 'up' && !!s.fight && s.fight.mode === 'on'; };
// ---- Piper (Fairy Land)
const piperOn = () => { const f = window.__m2.stage?.s?.bedroom?.f; return !!f && f.mode === 'on' && f.act !== 'bounce' && f.act !== 'entrance' && window.__m2.enemies.includes(f.e); };
// ---- Dad Guy (Cartoon Land)
const dadOn = () => { const f = window.__m2.stage?.s?.amphi?.fight; return !!f && f.mode === 'on' && f.act !== 'enter'; };

/** Poke once the predicate holds (checked and poked in the same evaluate: no frame in between). */
const when = (pred, poke, ms = 30000) => async ({ page }) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await page.evaluate(`(${pred})() && ((${poke})(), true)`)) return;
    await page.waitForTimeout(16);
  }
  console.log('  kill: never got the moment');
};

/** Harry's statue brought down: her collapse started straight off (the fight's own crumbling, 170 frames) once her arm's
 *  up out of the way, and waited out. */
const crumbleHer = async ({ js, waitFor }) => {
  await waitFor(() => { const f = window.__m2.stage.s.harry.f; if (f.arm.st !== 'up' || f.crumble >= 0) return false; f.crumble = 0; f.lib.face = 'dread'; return true; }, 15000, 'her arm up');
  await waitFor(() => window.__m2.stage.s.harry.f.crumbled && window.__m2.stage.s.harry.f.crumble < 0, 15000, 'the statue to crumble');
};

/** Stupid Dad: the family gone and the couch crushed (what the clapperboard's first five cars do), so the next car's
 *  for him. */
const setForDad = async ({ js }) => {
  await js(`(${lock})('STUNT_CAR')`);
  await js(() => { const f = window.__m2.stage.s.amphi.fight; for (const m of ['mom', 'sis', 'boy', 'gramps']) f.family[m].alive = false; f.couch.crushed = true; f.seated = false; f.sad = true; f.act = 'up'; f.actT = 0; f.recharge = 0; f.cars = []; });
};

export const JOBS = [
  {
    name: '01a-artie-weakness', label: ['SAFARI ARTIE', 'WEAKNESS (SPAWNER)', 'EATEN ALIVE'], q: 'adv=71', on: () => !!window.__m2.stage?.s?.clearing?.f,
    kill: when(artieOut, () => { const f = window.__m2.stage.s.clearing.f; f.hp = 0; f.byWeakness = true; }, 60000),
  },
  {
    name: '01b-artie-plain', label: ['SAFARI ARTIE', 'ANY OTHER WAY', 'GORED'], q: 'adv=71', on: () => !!window.__m2.stage?.s?.clearing?.f,
    kill: when(artieOut, () => { const f = window.__m2.stage.s.clearing.f; f.hp = 0; f.byWeakness = false; }, 60000),
  },
  {
    name: '02a-donnie-weakness', label: ['DONNIE DRACULA', 'WEAKNESS (THE REDEEMER)', 'BURNED TO ASH'], q: 'spooky=62', memo: 'm2:boss-intro:donnie', on: donnieOn, lead: 2500,
    kill: when(donnieOn, () => { const f = window.__m2.stage.s.ballroom.f; f.hp = 1; f.iframes = 0; f.souvenir = { id: 'redeemer' }; f.e.health = 100000 - 30; }),
  },
  {
    name: '02b-donnie-plain', label: ['DONNIE DRACULA', 'ANY OTHER WAY', 'SHAT INTO THE CEILING'], q: 'spooky=62', memo: 'm2:boss-intro:donnie', on: donnieOn, lead: 2500,
    kill: when(donnieOn, () => { const f = window.__m2.stage.s.ballroom.f; f.hp = 0; }),
  },
  {
    name: '03a-queen-weakness', label: ['THE QUEEN', 'WEAKNESS (MALLET)', 'BLOWN APART'], q: 'space=74', memo: 'm2:boss-intro:queen', on: queenOn, lead: 2500,
    kill: when(queenOn, () => { const f = window.__m2.stage.s.queen.f; f.hp = 0; f.byWeakness = true; }),
  },
  {
    name: '03b-queen-plain', label: ['THE QUEEN', 'ANY OTHER WAY', 'THE ENDOSKELETON'], q: 'space=74', memo: 'm2:boss-intro:queen', on: queenOn, lead: 2500,
    kill: when(queenOn, () => { const f = window.__m2.stage.s.queen.f; f.hp = 0; f.byWeakness = false; }),
  },
  {
    // (the spellbook's bolt on him through the fight's own dev hook (struck: the zap, the pyro, fried): the real cast
    // only finds him when he's on screen, which a headless start can't count on)
    name: '04a-steve-weakness', label: ['STUNTMAN STEVE', 'WEAKNESS (SPELLBOOK)', 'FRIED'], q: 'hollywood=60', memo: 'm2:boss-intro:steve', on: steveOn, lead: 2500,
    kill: async ({ js }) => { await js(() => window.__m2SteveBolt()); },
  },
  {
    name: '04b-steve-plain', label: ['STUNTMAN STEVE', 'ANY OTHER WAY', 'THE STEVE SIDESTEP'], q: 'hollywood=60', memo: 'm2:boss-intro:steve', on: steveOn, lead: 2500,
    kill: when(steveOn, () => { window.__m2.stage.s.stunt.f.hp = 0; }),
  },
  {
    name: '05a-harry-weakness', label: ['HELICOPTER HARRY', 'WEAKNESS (CROSSBOW)', 'BURIED IN CONCRETE'], q: 'foreign=120', memo: 'm2:boss-intro:harry', on: harryOn, lead: 3000,
    kill: when(harryOn, () => { const f = window.__m2.stage.s.harry.f; f.hp = 100; f.sick = 10; f.sickAt = f.total; }),
  },
  {
    name: '05b-harry-plain', label: ['HELICOPTER HARRY', 'ANY OTHER WAY', 'WHAT GOES UP...'], q: 'foreign=120', memo: 'm2:boss-intro:harry', on: harryOn, lead: 3000,
    kill: when(harryOn, () => { window.__m2.stage.s.harry.f.hp = 0; }),
  },
  {
    name: '05c-harry-plain-statue-gone', label: ['HELICOPTER HARRY', 'ANY OTHER WAY, STATUE GONE', 'WHAT GOES UP... ALONE'], q: 'foreign=120', memo: 'm2:boss-intro:harry', on: harryOn, lead: 1500,
    setup: crumbleHer, ready: () => window.__m2.stage.s.harry.f.mode === 'on' && window.__m2.stage.s.harry.f.crumbled,
    kill: when(harryOn, () => { window.__m2.stage.s.harry.f.hp = 0; }),
  },
  {
    name: '05d-harry-barfed', label: ['HELICOPTER HARRY', 'CROSSBOW, STATUE GONE', 'BARFED TO DEATH'], q: 'foreign=120', memo: 'm2:boss-intro:harry', on: harryOn, lead: 1500,
    setup: crumbleHer, ready: () => window.__m2.stage.s.harry.f.mode === 'on' && window.__m2.stage.s.harry.f.crumbled,
    kill: when(harryOn, () => { const f = window.__m2.stage.s.harry.f; f.hp = 12; f.sick = 10; f.sickAt = f.total; }),
  },
  {
    // (the soul sucker's shower, through the fight's own dev hook: the lions come for real)
    name: '06a-tucker-weakness', label: ['TUCKER', 'WEAKNESS (SOUL SUCKER)', 'TORN APART BY LIONS'], q: 'frontier=61', on: tuckerOn, lead: 1500,
    kill: async ({ js }) => { await js(() => window.__m2TuckerShower('kill')); },
  },
  {
    name: '06b-tucker-plain', label: ['TUCKER', 'ANY OTHER WAY', 'THE GRIZZLY'], q: 'frontier=61', on: tuckerOn, lead: 1500,
    kill: when(tuckerOn, () => { const f = window.__m2.stage.s.arena.fight; if (f.act !== 'mauled') f.hp = 0; }),
  },
  {
    // (a flintlock ball through the fight's own hit path: her last hole)
    name: '07a-piper-weakness', label: ['PIPER THE PIXIE', 'WEAKNESS (FLINTLOCK)', 'DEFLATED'], q: 'fantasy=61', on: piperOn, lead: 2500,
    setup: async ({ js }) => { await js(`(${lock})('FLINTLOCK')`); },
    kill: when(piperOn, () => { const f = window.__m2.stage.s.bedroom.f; window.__m2.lockWeapon = 'FLINTLOCK'; window.__m2.player.currentWeapon = 'FLINTLOCK'; f.hp = 1; f.e.health = 100000 - 1; }),
  },
  {
    name: '07b-piper-plain', label: ['PIPER THE PIXIE', 'ANY OTHER WAY', 'POPPED LIKE A CORK'], q: 'fantasy=61', on: piperOn, lead: 2500,
    kill: when(piperOn, () => { const f = window.__m2.stage.s.bedroom.f; f.hp = 1; f.iframes = 0; f.e.health = 100000 - 1; }),
  },
  {
    // (the clapperboard for real, the family and the couch already gone: the car's for him)
    name: '08a-dad-weakness', label: ['DAD GUY', 'WEAKNESS (CLAPPERBOARD)', 'IN PIECES'], q: 'cartoon=62', memo: 'm2:boss-intro:dad', on: dadOn, lead: 1200,
    setup: setForDad,
    kill: async ({ page, js }) => {
      await js(() => { const f = window.__m2.stage.s.amphi.fight; f.recharge = 0; window.__m2.lockWeapon = 'STUNT_CAR'; window.__m2.player.currentWeapon = 'STUNT_CAR'; });
      const at = Date.now() / 1000;
      await page.mouse.down(); await page.waitForTimeout(80); await page.mouse.up();
      return at;
    },
  },
  {
    name: '08b-dad-plain', label: ['DAD GUY', 'ANY OTHER WAY', 'THE FRIDGE'], q: 'cartoon=62', memo: 'm2:boss-intro:dad', on: dadOn, lead: 2500,
    kill: when(dadOn, () => { window.__m2.stage.s.amphi.fight.hp = 0; }),
  },
];
