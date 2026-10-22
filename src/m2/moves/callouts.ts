// The grabs' own kill callouts (called by the announcer, like the rest): beaten to death on the ground, slammed into
// the floor, thrown into the distance, thrown up and coming down. Added to the engine's callout table at startup.

import { KILL_CALLOUTS, type KillCallout } from '../../m1/content/dialogue';

export const GRAB_CALLOUTS = {
  beatdown: { lines: ['GROUND AND POUNDED!', 'TAPPED OUT!', 'REFEREE STOPPAGE!', 'BEATEN SENSELESS!', 'TENDERIZED!'], color: '#DC2626' },
  slam: { lines: ['SLAMMED!', 'POWERBOMBED!', 'PILE DRIVEN!', 'BODY SLAMMED!'], color: '#F97316' },
  thrown: { lines: ['TOSSED!', 'AIRMAILED!', 'YEETED!', 'NO REFUNDS!'], color: '#FDE68A' },
  launched: { lines: ['LAUNCHED!', 'SKY HIGH!', 'SENT TO GOD!', 'GRAVITY WINS!'], color: '#7DD3FC' },
  suplex: { lines: ['SUPLEXED!', 'GERMAN SUPLEX!', 'FOLDED IN HALF!', 'SPIKED!'], color: '#C084FC' },
  // (the air grab's, by which way the arc went: straight down, backflipped, dived)
  piledriver: { lines: ['PILEDRIVEN!', 'TOMBSTONED!', 'HEAD FIRST!', 'NECK CHECKED!', 'SPIKED!'], color: '#FB7185' },
  backdrop: { lines: ['BACKDROPPED!', 'BACKFLIPPED!', 'FLIPPED OFF!', 'ASS OVER TEAKETTLE!'], color: '#A5B4FC' },
  spear: { lines: ['SPEARED!', 'FACE PLANTED!', 'BULLDOGGED!', 'DDT!', 'LAWN DARTED!'], color: '#FBBF24' },
  // (and not a grab's: the souvenir launcher's junk)
  souvenir: { lines: ['SOUVENIRED!', 'GIFT SHOPPED!', 'TOURIST TRAPPED!', 'MADE IN CHINA!'], color: '#F472B6' },
  // (the soul sucker's: into the grinder, and back out the other end)
  shred: { lines: ['SHREDDED!', 'GROUND CHUCK!', 'MINCED!', 'HAMBURGERED!', 'SUCKED IN!'], color: '#A78BFA' },
  // (the laser-guided flintlock's)
  flintlock: { lines: ['HEADSHOT!', 'BLOWN CLEAN OFF!', 'DEAD EYE!', 'HEADS WILL ROLL!', 'DECAPITATED!'], color: '#FB923C' },
  // (the beatdown's finisher, bulked up: the double-fisted smash)
  smash: { lines: ['PULVERIZED!', 'OBLITERATED!', 'PASTE!', 'SPLATTERED!', 'MEAT RAIN!'], color: '#EF4444' },
  // (the beatdown's other two blows: the knee, the headbutt)
  kneed: { lines: ['KNEED!', 'KNEED TO DEATH!', 'GUT CHECKED!', 'KNEE DEEP!', 'WINDED FOREVER!'], color: '#F59E0B' },
  headbutt: { lines: ['HEADBUTTED!', 'GLASGOW KISS!', 'SKULL CRACKED!', 'NUTTED!', 'LIGHTS OUT!'], color: '#FCA5A5' },
  // (their finishers, bulked up: the head stomp, the exploding bearhug)
  stomp: { lines: ['CURB STOMPED!', 'HEAD STOMPED!', 'STOMPED FLAT!', 'BOOT PRINTED!', 'SKULL PANCAKE!'], color: '#FB923C' },
  hugged: { lines: ['HUGGED TO DEATH!', 'SQUEEZED!', 'BEAR HUGGED!', 'POPPED!', 'LOVED TO DEATH!'], color: '#F43F5E' },
  // (the clapperboard's stunt car and stuntman)
  stunt: { lines: ['ROADKILL!', "THAT'S A WRAP!", 'TOTALED!', 'HIT AND RUN!', 'STUNT DOUBLED!'], color: '#F59E0B' },
  // (the mallet, batting one of the queen's own back into her)
  batted: { lines: ['RETURN TO SENDER!', 'HOME RUN!', 'SPECIAL DELIVERY!', 'BACK TO MOMMY!', 'NO RETURNS!'], color: '#FDE047' },
  // (the mallet of pain's: cartoon ones)
  // (the otherworldly spawner's: eaten down to the bone)
  alien: { lines: ['EATEN ALIVE!', 'PICKED CLEAN!', 'DEVOURED!', 'GNAWED!', 'DE-FLESHED!'], color: '#84CC16' },
  // (the crossbow of plagues': puked to death)
  plague: { lines: ['PUKED TO DEATH!', 'BARFED ON!', 'UPCHUCKED!', 'SPEWED!', 'HURLED!'], color: '#A3B320' },
  mallet: { lines: ['BONKED!', 'FLATTENED!', 'TWINKLED!', 'SQUASHED!', 'WHACKED!'], color: '#F472B6' },
  // (the spellbook of the damned's)
  spell: { lines: ['SMITED!', 'HEXED!', 'STRUCK DOWN!', 'CURSED!', 'FRIED!'], color: '#C084FC' },
  gorespray: { lines: ['HOSED DOWN!', 'GORE SHOWER!', 'SPLATTERED!', 'BUDDY BATHED!'], color: '#DC2626' },
} as const;

export type GrabCallout = keyof typeof GRAB_CALLOUTS;

/** Puts them in the engine's table (as callouts of their own) and hands back the key to call one by. */
export const registerGrabCallouts = () => {
  const table = KILL_CALLOUTS as Record<string, { lines: string[]; color: string }>;
  for (const [k, v] of Object.entries(GRAB_CALLOUTS)) table[k] = { lines: [...v.lines], color: v.color };
};
export const grabCallout = (k: GrabCallout) => k as unknown as KillCallout;
