// The spots tools/perf/run.mjs measures: a dev URL to start at (src/m2/App.tsx's ?<land>=<checkpoint>), and what's
// pressed when (ms from the start of the run, which begins with --warm seconds unmeasured): [t, 'down'|'up'|'tap', key]
// (Playwright key names) or [t, 'js', 'code to run in the page']. `warm`: its own unmeasured lead-in (s), over --warm.
// God mode and infinite ammo are always on (run.mjs), so walking right through anything is fine.

const walk = (from = 0) => [[from, 'down', 'ArrowRight']];
/** Walk right, hopping now and then (over steps, gaps). */
const hopRight = (secs = 40) => [[0, 'down', 'ArrowRight'], ...Array.from({ length: secs }, (_, i) => [600 + i * 1000, 'tap', 'Space'])];
/** On a ride: hold down (the grip through the loops), nothing else. */
const grip = [[0, 'down', 'ArrowDown']];

export const SCENARIOS = [
  // Fairy Land: Truelling Tragons (the lift hill, the first drop, the loop; then the gauntlet)
  { name: 'tragons-lift', q: 'fantasy=31', keys: grip },
  { name: 'tragons-gauntlet', q: 'fantasy=33', keys: grip },
  { name: 'tragons-mountain', q: 'fantasy=35', keys: grip },
  { name: 'tragons-splash', q: 'fantasy=36', keys: grip },
  { name: 'tragons-finale', q: 'fantasy=37', keys: grip },
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
  { name: 'cartoon-whitehouse', q: 'cartoon=21', keys: hopRight() },
  { name: 'cartoon-bigkid', q: 'cartoon=40', keys: hopRight() },
  { name: 'cartoon-itchy', q: 'cartoon=50', keys: hopRight() },
  { name: 'cartoon-amphi', q: 'cartoon=55', keys: hopRight() },
  // Jungle Land
  { name: 'jungle-jungle', q: 'adv=0', keys: hopRight() },
  { name: 'jungle-river', q: 'adv=20', keys: hopRight() },
  { name: 'jungle-dino', q: 'adv=30', keys: hopRight() },
  { name: 'jungle-cart', q: 'adv=50', keys: [[0, 'down', 'ArrowRight']] },
  // Wilderness Land
  { name: 'wild-train', q: 'frontier=5', keys: hopRight() },
  { name: 'wild-logride', q: 'frontier=29', keys: hopRight() },
];
