// What the goons fire and throw, by what they're holding: a pistol or a rifle fires a slug, Artie's cryo rifle a
// frost bolt, Victor's flare gun a flare, Barry's exterminator a cloud of bug spray, his lab tech a ray gun's zap.
// The ones behind a shield drop it to throw whatever they've got on them.

import type { EnemyKind, ShotLook, ThrownKind } from '../../types';

/** What a shield goon throws when he drops his shield (by kind). The rest fire. */
export const THROWN: Partial<Record<EnemyKind, ThrownKind>> = {
  shielder: 'ice', surfer: 'coconut', riotcop: 'teargas', blastshield: 'rock', protester: 'water', cardoor: 'tequila',
  bum: 'forty', reader: 'coffee', hr: 'stapler', custodian: 'cleaner', scientist: 'flask', manhole: 'wrench',
  deputy: 'horseshoe', clerk: 'coffee',
};

/** What a gun goon's shot looks like. */
export const shotLook = (kind?: EnemyKind): ShotLook | undefined =>
  kind === 'shooter' ? 'cryo'
  : kind === 'heatsuit' || kind === 'raver' ? 'flare'
  : kind === 'exterminator' || kind === 'hazmat' ? 'spray'
  : kind === 'banger' || kind === 'lowrider' ? 'tracer'
  : kind === 'labtech' ? 'zap'
  : kind === 'tourist' || kind === 'cop' || kind === 'techbro' || kind === 'sicario' || kind === 'jetskier' || kind === 'drone' || kind === 'junkie'
    || kind === 'pimp' || kind === 'guard' || kind === 'exec' || kind === 'ranger' || kind === 'cruiser' || kind === 'parkranger' || kind === 'suit' ? 'slug'
  : undefined;

/** How fast each kind of shot goes (a rifle's faster than a pistol, a flare's slow and bright). */
export const shotSpeed = (look?: ShotLook, kind?: EnemyKind) =>
  look === 'flare' ? 5.5 : look === 'cryo' ? 6.5 : look === 'spray' ? 5 : look === 'zap' ? 6.5 : kind === 'sicario' ? 9 : 7.5;
