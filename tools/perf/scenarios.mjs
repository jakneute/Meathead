// The spots tools/perf/run.mjs measures: a dev URL to start at (src/m2/App.tsx's ?<land>=<checkpoint>), and what's
// pressed when (ms from the start of the run, which begins with --warm seconds unmeasured): [t, 'down'|'up'|'tap', key]
// (Playwright key names) or [t, 'js', 'code to run in the page']. `warm`: its own unmeasured lead-in (s), over --warm.
// God mode and infinite ammo are always on (run.mjs), so walking right through anything is fine.

const walk = (from = 0) => [[from, 'down', 'ArrowRight']];
/** Walk right, hopping now and then (over steps, gaps). */
const hopRight = (secs = 40) => [[0, 'down', 'ArrowRight'], ...Array.from({ length: secs }, (_, i) => [600 + i * 1000, 'tap', 'Space'])];
/** Walk right, shoulder charging (Shift) over and over. */
const chargeRight = (secs = 40) => [[0, 'down', 'ArrowRight'], ...Array.from({ length: secs * 2 }, (_, i) => [300 + i * 500, 'tap', 'Shift'])];
/** On a ride: hold down (the grip through the loops), nothing else. */
const grip = [[0, 'down', 'ArrowDown']];

export const SCENARIOS = [
  // The water park, level 1 (endgame/park1): the plaza's start (hopping right through the possessed), the Abyss's tube
  // ride (the aliens riding along, shooting), CAMP 4's locked-in floor (two waves: hovers, a trooper, the yeti), the
  // summit's fight (up the stairs, the intro skipped, firing)
  // (the lot outside it (endgame/lot): up and down the lot under the sky fight, the wreck to short of the gate and back)
  { name: 'wp-lot', q: 'lot', keys: Array.from({ length: 12 }, (_, i) => [[i * 3000, 'down', i % 2 ? 'ArrowLeft' : 'ArrowRight'], [i * 3000 + 2900, 'up', i % 2 ? 'ArrowLeft' : 'ArrowRight']]).flat() },
  { name: 'wp-plaza', q: 'park=0', keys: hopRight(40) },
  { name: 'wp-tube', q: 'park=7', warm: 2, keys: [[0, 'js', 'window.__wpAutoTube = true'], [0, 'down', 'ArrowRight'], [6000, 'js', 'window.dispatchEvent(new MouseEvent("mousedown", { button: 0 }))']] },
  { name: 'wp-floor', q: 'park=10', keys: [[300, 'js', 'window.dispatchEvent(new MouseEvent("mousedown", { button: 0 }))'], ...Array.from({ length: 16 }, (_, i) => [600 + i * 1500, 'tap', i % 2 ? 'ArrowLeft' : 'ArrowRight'])] },
  // (up and down the spiral between the Hillary step and the death zone: the turning tower, all the way)
  { name: 'wp-stairs', q: 'park=11', keys: [[0, 'down', 'ArrowLeft'], ...Array.from({ length: 12 }, (_, i) => [1500 + i * 2600, 'tap', 'ArrowDown'])] },
  // (its intro marked seen: the retry's short entrance, straight into it)
  { name: 'wp-boss', q: 'park=11', warm: 14, keys: [[0, 'js', 'window.__m2.stageMemo["m2:boss-intro:zorzarblax"] = "1"'], [100, 'down', 'ArrowLeft'], [7000, 'up', 'ArrowLeft'], [7200, 'js', 'window.dispatchEvent(new MouseEvent("mousedown", { button: 0 }))'], ...Array.from({ length: 14 }, (_, i) => [7600 + i * 1600, 'tap', i % 3 === 2 ? 'Space' : i % 2 ? 'ArrowLeft' : 'ArrowRight'])] },
  // The water park, level 2 (endgame/park2: THE LAZY RIVER): the meeting at the river's head (the cutscene, the river
  // going up and the fire racing off); hopping right along the burning canopy's vines and jets; stood on a burning log
  // walking it across (the three-log run: imps, a hover alien, the footbridges); stood on the TIKI TOWERS' four-tower
  // run, burning, leaning (a hover alien); the son's fight (the retry entrance, firing, hopping)
  { name: 'wp2-meet', q: 'park=40', warm: 3, keys: walk() },
  { name: 'wp2-vines', q: 'park=42', keys: hopRight(30) },
  { name: 'wp2-logs', q: 'park=43', warm: 2, keys: [[0, 'js', 'window.__m2.player.pos.x = 39600 + 12580'], [200, 'down', 'ArrowRight']] },
  { name: 'wp2-towers', q: 'park=44', warm: 2, keys: [[0, 'js', '{ const t = window.__wp2.towers[4].t, p = window.__m2.player; p.pos.x = t.b.x + 30; p.pos.y = t.b.y - p.height - 1; p.vel.y = 0; }'], ...Array.from({ length: 10 }, (_, i) => [1500 + i * 2200, 'js', `{ const t = window.__wp2.towers[${4 + (i % 4)}], p = window.__m2.player; if (!t.gone && !t.fall && !t.rise) { p.pos.x = t.t.b.x + 30; p.pos.y = t.t.b.y - p.height - 1; p.vel.y = 0; } }`])] },
  { name: 'wp2-boss', q: 'park=48', warm: 12, keys: [[0, 'js', 'window.__m2.stageMemo["m2:boss-intro:mehphisto"] = "1"'], [100, 'down', 'ArrowRight'], [6500, 'up', 'ArrowRight'], [6700, 'js', 'window.dispatchEvent(new MouseEvent("mousedown", { button: 0 }))'], ...Array.from({ length: 14 }, (_, i) => [7000 + i * 1600, 'tap', i % 3 === 2 ? 'Space' : i % 2 ? 'ArrowLeft' : 'ArrowRight'])] },
  // The crossbow on a crowd (the user's: slowdown "when using the crossbow and a ton of people are hurling and i move
  // back and forth", in the break room): every weapon on, the crossbow (9), fire held, pacing left and right
  { name: 'crossbow-crowd', q: 'pen', warm: 8, keys: [
    [0, 'js', 'window.__m2SetCheat("allWeapons", true)'], [400, 'tap', '9'],
    [800, 'js', 'window.dispatchEvent(new MouseEvent("mousedown", { button: 0 }))'],
    ...Array.from({ length: 24 }, (_, i) => [1200 + i * 1400, 'down', i % 2 ? 'ArrowLeft' : 'ArrowRight']),
    ...Array.from({ length: 24 }, (_, i) => [2550 + i * 1400, 'up', i % 2 ? 'ArrowLeft' : 'ArrowRight']),
  ] },
  // The hub: round the whole roundabout from the staff door (walking right, a lap and a bit)
  { name: 'hub', q: 'hub=9', keys: walk() },
  // (back to the hub out of a land (BACK TO HUB, as after a boss's walk-away): the stage swap, the hub built, the walk
  // back out of the land's portal (the user's: "some slowdown during the portal exit to the hub"))
  { name: 'hub-exit', q: 'adv=0', keys: [[300, 'js', 'window.__m2GoTo("hub")']], warm: 0 },
  // The endgame's walk out (?walkout: store.ts): put down short of his truck, left to it, the roof bursting, the beam,
  // then the abduction's cutscene, all of it (run it with --secs=40 to see it through)
  { name: 'walkout', q: 'intro&walkout', warm: 1, keys: [[0, 'js', 'window.__m2.player.pos.x = 20560'], [0, 'down', 'ArrowLeft']] },
  // Fairy Land: Truelling Tragons (the lift hill, the first drop, the loop; then the gauntlet)
  { name: 'tragons-lift', q: 'fantasy=31', keys: grip },
  { name: 'tragons-gauntlet', q: 'fantasy=33', keys: grip },
  { name: 'tragons-mountain', q: 'fantasy=35', keys: grip },
  { name: 'tragons-splash', q: 'fantasy=36', keys: grip },
  { name: 'tragons-finale', q: 'fantasy=37', keys: grip },
  // (the ride from behind (fantasy/tragons/behind): the mountain's dark and its mouths; the triple helix, the whole view
  // turned; and the classic side-view ride kept as an extra (?classic))
  { name: 'tragons-cave', q: 'fantasy=35', keys: grip },
  { name: 'tragons-helix', q: 'fantasy=36', keys: grip, warm: 12 },
  { name: 'tragons-classic', q: 'fantasy=31&classic', keys: grip },
  // (the drops (the user's: "slows down when going down hills"): the lift's top and the first drop, straight down at
  // the camera; the second drop and the head-on's dive)
  { name: 'tragons-drop1', q: 'fantasy=31', keys: grip, warm: 9 },
  { name: 'tragons-drop2', q: 'fantasy=33', keys: grip, warm: 8 },
  // Foreign Lands: the helicopter (walk to it, board, the lift and pull-back, the tour; then a landmark fight)
  { name: 'heli-board', q: 'foreign=110', keys: walk() },
  // (just the tour: the lift and the camera round the park, after the walk and the hop in)
  { name: 'heli-tour', q: 'foreign=110', keys: walk(), warm: 12 },
  { name: 'heli-fly', q: 'foreign=111', keys: [[0, 'down', 'Space']] },
  // Fairy Land
  { name: 'fantasy-square', q: 'fantasy=1', keys: hopRight() },
  { name: 'fantasy-wheel', q: 'fantasy=11', keys: [[0, 'down', 'ArrowUp'], ...hopRight()] },
  { name: 'fantasy-glen', q: 'fantasy=20', keys: hopRight() },
  { name: 'fantasy-castle', q: 'fantasy=42', keys: hopRight() },
  { name: 'fantasy-broom', q: 'fantasy=50', keys: [[0, 'down', 'ArrowRight']] },
  // Cartoon Land
  { name: 'cartoon-kiddie', q: 'cartoon=1', keys: hopRight() },
  // (the studio: the lobby through the writers' room to the storyboard wall; the long overseas room into ink and paint)
  { name: 'cartoon-studio', q: 'cartoon=10', keys: hopRight() },
  { name: 'cartoon-studio-overseas', q: 'cartoon=13', keys: hopRight() },
  { name: 'cartoon-whitehouse', q: 'cartoon=21', keys: hopRight() },
  { name: 'cartoon-bigkid', q: 'cartoon=40', keys: hopRight() },
  { name: 'cartoon-itchy', q: 'cartoon=50', keys: hopRight() },
  { name: 'cartoon-amphi', q: 'cartoon=55', keys: hopRight() },
  // Jungle Land
  { name: 'jungle-jungle', q: 'adv=0', keys: hopRight() },
  { name: 'jungle-river', q: 'adv=20', keys: hopRight() },
  // (under the river (the user's: "slows down massively when i jump in the water"): off the dock into the open river;
  // the ride graveyard on, which ran fine, to set it against)
  { name: 'jungle-jumpin', q: 'adv=20', keys: walk() },
  { name: 'jungle-graveyard', q: 'adv=22', keys: walk() },
  { name: 'jungle-dino', q: 'adv=30', keys: hopRight() },
  // (the clearing (the user's: "runs really slow"): the walk round it; the Artie fight)
  { name: 'jungle-clearing', q: 'adv=70', keys: hopRight() },
  { name: 'jungle-boss', q: 'adv=71', keys: hopRight() },
  // (the same two, shoulder charging the whole way (the user's: slowdown "tends to happen when shoulder charging"))
  { name: 'jungle-clearing-charge', q: 'adv=70', keys: chargeRight() },
  { name: 'jungle-boss-charge', q: 'adv=71', keys: chargeRight() },
  { name: 'jungle-cart', q: 'adv=50', keys: [[0, 'down', 'ArrowRight']] },
  // Wilderness Land
  { name: 'wild-train', q: 'frontier=5', keys: hopRight() },
  { name: 'wild-logride', q: 'frontier=29', keys: hopRight() },
  // (Tucker's fight: walk in (his entrance), then the soul sucker's shower over and over: the lions, the mauling's
  // punch-in (the user's: "heavy slowdown during the part where tucker gets mauled"); and the slow-mo lion kill)
  { name: 'wild-tucker-maul', q: 'frontier=61', warm: 8, keys: [[0, 'down', 'ArrowRight'], [2500, 'up', 'ArrowRight'], ...[8500, 14500, 20500, 26500].map(t => [t, 'js', 'window.__m2TuckerShower("maul")'])] },
  { name: 'wild-tucker-kill', q: 'frontier=61', warm: 8, keys: [[0, 'down', 'ArrowRight'], [2500, 'up', 'ArrowRight'], [8500, 'js', 'window.__m2TuckerShower("kill")']] },
  // Hollywood Land (the outdoor stretches: the far off, its landmarks and sky)
  { name: 'hollywood-blvd', q: 'hollywood=0', keys: hopRight() },
  { name: 'hollywood-lot', q: 'hollywood=30', keys: hopRight() },
  { name: 'hollywood-havoc', q: 'hollywood=50', keys: hopRight() },
  { name: 'hollywood-hill', q: 'hollywood=56', keys: hopRight() },
  // (the big avalanche (the user's: "the falling avalanches tank performance as it falls"): from the second bunker on
  // down the hill, out in the open, so the wall of snow comes over the whole screen)
  { name: 'hollywood-avalanche', q: 'hollywood=57', warm: 1, keys: walk() },
  // Foreign Lands' streets: the far backdrop's handoffs between pavilions (the user's: "when i transition from canada
  // to uk, the background transition causes a drop in frame rate"): walked across the UK/Canada border both ways, and
  // Norway's into China; and standing in Canada and in the UK
  { name: 'foreign-uk-canada', q: 'foreign=85', warm: 2, keys: hopRight(30) },
  { name: 'foreign-canada-uk', q: 'foreign=91', warm: 2, keys: [[0, 'down', 'ArrowLeft'], ...Array.from({ length: 30 }, (_, i) => [600 + i * 1000, 'tap', 'Space'])] },
  { name: 'foreign-norway-china', q: 'foreign=14', warm: 2, keys: hopRight(30) },
  { name: 'foreign-canada', q: 'foreign=92', keys: [] },
  { name: 'foreign-uk', q: 'foreign=84', keys: [] },
  // (and every other pavilion's streets, walked from its start: the fronts, the cast, its set pieces coming into view)
  { name: 'foreign-mexico', q: 'foreign=0', warm: 2, keys: hopRight(30) },
  { name: 'foreign-norway', q: 'foreign=10', warm: 2, keys: hopRight(30) },
  { name: 'foreign-china', q: 'foreign=20', warm: 2, keys: hopRight(30) },
  { name: 'foreign-germany', q: 'foreign=30', warm: 2, keys: hopRight(30) },
  { name: 'foreign-italy', q: 'foreign=40', warm: 2, keys: hopRight(30) },
  { name: 'foreign-japan', q: 'foreign=50', warm: 2, keys: hopRight(30) },
  { name: 'foreign-morocco', q: 'foreign=60', warm: 2, keys: hopRight(30) },
  { name: 'foreign-france', q: 'foreign=70', warm: 2, keys: hopRight(30) },
  // Future Land
  { name: 'future-square', q: 'space=0', keys: hopRight() },
  { name: 'future-drag', q: 'space=30', keys: hopRight() },
  { name: 'future-crater', q: 'space=60', keys: hopRight() },
];
