// The grabs' own kill callouts (called by the announcer, like the rest): beaten to death on the ground, slammed into
// the floor, thrown into the distance, thrown up and coming down. Added to the engine's callout table at startup.

import { KILL_CALLOUTS, type KillCallout } from '../../m1/content/dialogue';

export const GRAB_CALLOUTS = {
  beatdown: { lines: ['GROUND AND POUNDED!', 'TAPPED OUT!', 'REFEREE STOPPAGE!', 'BEATEN SENSELESS!', 'NO MERCY RULE!'], color: '#DC2626' },
  slam: { lines: ['SLAMMED!', 'POWERBOMBED!', 'PILE DRIVEN!', 'BODY SLAMMED!'], color: '#F97316' },
  thrown: { lines: ['TOSSED!', 'AIRMAILED!', 'SHAKEN AND THROWN!', 'NO REFUNDS!'], color: '#FDE68A' },
  launched: { lines: ['LAUNCHED!', 'SKY HIGH!', 'AIR TIME!', 'WHAT GOES UP!'], color: '#7DD3FC' },
  suplex: { lines: ['SUPLEXED!', 'GERMAN SUPLEX!', 'BRIDGED!', 'SPIKED!'], color: '#C084FC' },
} as const;

export type GrabCallout = keyof typeof GRAB_CALLOUTS;

/** Puts them in the engine's table (as callouts of their own) and hands back the key to call one by. */
export const registerGrabCallouts = () => {
  const table = KILL_CALLOUTS as Record<string, { lines: string[]; color: string }>;
  for (const [k, v] of Object.entries(GRAB_CALLOUTS)) table[k] = { lines: [...v.lines], color: v.color };
};
export const grabCallout = (k: GrabCallout) => k as unknown as KillCallout;
