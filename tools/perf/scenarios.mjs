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
  // The hub: round the whole roundabout from the staff door (walking right, a lap and a bit)
  { name: 'hub', q: 'hub=9', keys: walk() },
  // (back to the hub out of a land (BACK TO HUB, as after a boss's walk-away): the stage swap, the hub built, the walk
  // back out of the land's portal (the user's: "some slowdown during the portal exit to the hub"))
  { name: 'hub-exit', q: 'adv=0', keys: [[300, 'js', 'window.__m2GoTo("hub")']], warm: 0 },
  // Fairy Land: Truelling Tragons (the lift hill, the first drop, the loop; then the gauntlet)
  { name: 'tragons-lift', q: 'fantasy=31', keys: grip },
  { name: 'tragons-gauntlet', q: 'fantasy=33', keys: grip },
  { name: 'tragons-mountain', q: 'fantasy=35', keys: grip },
  { name: 'tragons-splash', q: 'fantasy=36', keys: grip },
  { name: 'tragons-finale', q: 'fantasy=37', keys: grip },
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
  // Future Land
  { name: 'future-square', q: 'space=0', keys: hopRight() },
  { name: 'future-drag', q: 'space=30', keys: hopRight() },
  { name: 'future-crater', q: 'space=60', keys: hopRight() },
];
