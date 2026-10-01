// Club Caldera, inside: the floor and the atrium. What goes on in there besides
// the fighting: the partygoers screaming as he tears through the place (there's
// no way out: it's a volcano), a tally of the ones he's killed (up while he's on
// the floor; gone once he's up into the atrium), the staircase at the foot of
// the atrium he could have come down instead of all of that, and the window at
// the top into the VIP lounge.

import type { FrameContext } from '../../core/context';
import type { GameState } from '../../core/state';
import { say, Voice, MEATHEAD_VOICE } from '../../platform/speech';
import { playSound } from '../../platform/audio';
import { COURSE, CP } from './course';
import { Lounge, startCrash } from './lounge';
import { isShat } from '../../player/gut';

export interface Club {
  /** The partygoers still standing (by id), how many he's killed, when the last one went (for the tally's jolt). */
  alive: Set<string>;
  killed: number;
  killedAt: number;
  /** Up into the atrium: the tally's gone. */
  tallyGone: boolean;
  /** When the next scream's due, and the one being screamed (over whose head). */
  yellAt: number;
  yell: { id: string; text: string; until: number } | null;
  /** He's seen the stairs (and said so). */
  stairs: boolean;
}

export const createClub = (startedAt: number): Club => ({
  alive: new Set(), killed: 0, killedAt: -999, tallyGone: startedAt >= CP.ATRIUM, yellAt: 0, yell: null, stairs: startedAt >= CP.ATRIUM,
});

/** The partygoers' voices: the guys, the girls. */
const PARTY_GUY: Voice = { id: 'victor.partyguy', pitch: 1.0, rate: 1.2 };
const PARTY_GIRL: Voice = { id: 'victor.partygirl', pitch: 1.2, rate: 1.2 };

/** What they scream as he tears through the club. Mostly: there's no way out. It's a volcano. */
/** The same, once he's shit himself (and in a volcano with the doors shut, that's a lot to take). */
const YELLS_SHAT = [
  "WHERE'S THE EXIT?! I CAN'T BREATHE IN HERE!",
  'WHO PUTS A CLUB IN A VOLCANO?! AND WHO SHITS IN ONE?!',
  "THE FIRE EXIT IS JUST MORE FIRE! IT STILL SMELLS BETTER!",
  'I PAID A THOUSAND DOLLARS FOR BOTTLE SERVICE! NOT THIS!',
  "I'M ON THE LIST! HE IS NOT ON THE LIST! HOW IS HE IN HERE?!",
  'SOMEBODY CALL SECURITY! AND A JANITOR!',
  "IT'S HOT IN HERE AND IT SMELLS LIKE THAT!",
  'THE LAVA SMELLS BETTER THAN HIM!',
];
const YELLS = [
  "WHERE'S THE EXIT?!",
  "THERE IS NO EXIT! WE'RE INSIDE A VOLCANO!",
  'WHO PUTS A CLUB IN A VOLCANO?!',
  'THE FIRE EXIT IS JUST MORE FIRE!',
  'THE EMERGENCY EXIT SIGN POINTS AT THE LAVA!',
  'THE ONLY WAY OUT IS UP! THROUGH THE LAVA!',
  'I PAID A THOUSAND DOLLARS FOR BOTTLE SERVICE!',
  "WE'RE JUST HERE TO DANCE!",
  "I'M ON THE LIST! I'M ON THE LIST!",
  'SOMEBODY CALL SECURITY! NOT THAT GUY!',
  "IT'S HOT IN HERE AND NOT IN A GOOD WAY!",
  'MY PHONE HAS NO SIGNAL IN HERE! IT IS A MOUNTAIN!',
  "I KNEW I SHOULD'VE GONE TO THE OTHER CLUB!",
  "THIS IS WHY WE DON'T PARTY IN VOLCANOES, KYLE!",
];
const pick = <T,>(l: T[]) => l[Math.floor(Math.random() * l.length)];

/** Up the stairs he never saw. */
const STAIRS_LINE = "...THERE WERE STAIRS? I COULD'VE TAKEN THE STAIRS INSTEAD OF ALL THAT LAVA SHIT.";

const meatheadSays = (state: GameState, text: string) => {
  const shown = say(text, MEATHEAD_VOICE, 'queue', {
    onShow: () => { state.playerLastVulgarity = text; state.playerVulgarityTimer = 160; },
    onHide: () => { if (state.playerLastVulgarity === text) state.playerVulgarityTimer = Math.min(state.playerVulgarityTimer, 30); },
  });
  if (!shown) { state.playerLastVulgarity = text; state.playerVulgarityTimer = 140; }
};

export const updateClub = (ctx: FrameContext, club: Club, lounge: Lounge) => {
  const { state } = ctx;
  const p = state.player;
  const A = COURSE.atrium;
  // The tally: a partygoer who's gone (dead, blown away, or not there any more) is one more
  const standing = new Set<string>();
  for (const e of state.enemies) if (e.kind === 'partygoer' && e.health > 0 && !e.isBlownAway) standing.add(e.id);
  for (const id of club.alive) if (!standing.has(id)) { club.killed++; club.killedAt = state.frame; if (!club.tallyGone) playSound('ding', 0.5, -8); }
  club.alive = standing;
  if (!club.tallyGone && p.pos.x >= A.x1 + 40) club.tallyGone = true;
  // A scream now and then, from one of them in a panic in view (only when nobody else is talking: they don't talk
  // over anybody)
  if (club.yell && state.frame > club.yell.until) club.yell = null;
  if (state.frame >= club.yellAt) {
    const cam = state.camera;
    const panicking = state.enemies.filter(e => e.kind === 'partygoer' && e.aiState === 'panic' && e.health > 0 && e.pos.x > cam.x && e.pos.x < cam.x + 800 && e.pos.y > cam.y && e.pos.y < cam.y + 600);
    const who = panicking.length ? pick(panicking) : null;
    if (who) {
      const text = isShat(state) ? pick(YELLS_SHAT) : pick(YELLS);
      const shown = say(text, (who.variant ?? 0) % 2 ? PARTY_GIRL : PARTY_GUY, 'casual', {
        onShow: () => { club.yell = { id: who.id, text, until: state.frame + 60 + text.length * 3 }; },
        onHide: () => { if (club.yell?.text === text) club.yell.until = Math.min(club.yell.until, state.frame + 10); },
      });
      club.yellAt = state.frame + (shown ? 110 + Math.random() * 100 : 30);
    } else club.yellAt = state.frame + 30;
  }
  // The foot of the atrium: the stairwell down to the front door. He sees it
  if (!club.stairs && p.isGrounded && p.pos.x >= A.x1 + 60 && p.pos.x < A.x1 + 500) { club.stairs = true; meatheadSays(state, STAIRS_LINE); }
  // Checkpoint at the foot of it; up at the top, the window into the VIP lounge
  if (state.checkpoint < CP.ATRIUM && p.isGrounded && p.pos.x >= COURSE.checkpoints[CP.ATRIUM].x) state.checkpoint = CP.ATRIUM;
  const w = A.window;
  if (lounge.phase === 'party' && p.isGrounded && p.pos.x + p.width > w.x - 60 && p.pos.y + p.height < A.top + 10) startCrash(state, lounge);
};

/** What the tally's called, by how many. */
export const tallyTitle = (n: number) =>
  n >= 15 ? 'LAST CALL' : n >= 10 ? 'EVERYBODY OUT (THERE IS NO OUT)' : n >= 6 ? 'CLOSING TIME' : n >= 3 ? 'BAD VIBES' : 'PARTY FOUL';
