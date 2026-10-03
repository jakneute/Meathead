import React, { useEffect } from 'react';
import Cutscene, { Panel } from './Cutscene';
import { drawMeatheadCloseUp } from '../game/scenes/ending';
import { drawGrossArm, drawGrossGun } from '../game/scenes/grossUp';
import { playSound } from '../game/platform/audio';
import { drawGym, drawDoorwayPencils, drawPencilNeck, drawAgent, drawEscort, drawBriefing, drawFirstFour, gymBg, briefingBg } from '../game/scenes/intro';
import { Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { BOSS_SET_TITLES } from '../content/roster';
import { setTitleClass } from './Overlay';
import { setShatPants, shatClocked } from '../game/scenes/shatLook';

// The opening (START GAME + INTRO), in two halves with the gym played between them.
//
// The first: Meathead's on chest day at five in the morning when four skinny men in cheap suits come in through the
// door, one of them shoved out in front to do the talking. Pencil necks. Invading his space. On chest day. He must
// destroy them (and then he does: that's the gym, game/stages/gym).
//
// The second, once the last of them's down: the bigger fellas the pencil necks were sent ahead of. Meathead knows his
// own kind when he sees it. The pitch (the interns were to see what he'd do); then down a corridor to a briefing
// room, where the four assholes are explained to him, not entirely honestly, and the government's resources are put
// at his disposal. Then the four of them in the dark, and the title goes up onto the stage select, the way the
// mid-game call ends.
//
// If he shit himself in the gym (`shat`: see game/player/gut.ts), the pitch knows it: it's on him in every shot (see
// scenes/shatLook), the agents notice, and he's proud of it.

/** The agent who does the talking: flat, quick, bored. */
const AGENT_VOICE: Voice = { id: 'agent', pitch: 0.6, rate: 1.05 };
const AGENT = 'AGENT';
/** The pencil neck who's been made to do the talking: high, fast, a wobble in it. */
const INTERN_VOICE: Voice = { id: 'gym.intern', pitch: 1.5, rate: 1.25 };
const INTERN = 'INTERN';

const gym = (ctx: CanvasRenderingContext2D) => { gymBg(ctx); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, 256, 144); };
const briefing = (ctx: CanvasRenderingContext2D) => briefingBg(ctx, 0, -1);

const agent = (text: string, where: 'gym' | 'briefing' = 'gym'): Panel =>
  ({ draw: (c, t, talk) => drawAgent(c, t, talk, where), speaker: AGENT, voice: AGENT_VOICE, text });
const intern = (text: string, scared = false, hold?: number): Panel =>
  ({ draw: (c, t, talk) => drawPencilNeck(c, t, talk, scared), speaker: INTERN, voice: INTERN_VOICE, text, hold });
const slide = (s: Parameters<typeof drawBriefing>[3], text: string): Panel =>
  ({ draw: (c, t, talk) => drawBriefing(c, t, talk, s), speaker: AGENT, voice: AGENT_VOICE, text });
const meathead = (mood: 'dumb' | 'disgust' | 'think' | 'stoked', text: string, bg = gym, hold?: number, pose?: 'flex' | 'gun'): Panel =>
  ({ draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, mood, { bg, medal: false, pose }), speaker: 'MEATHEAD', voice: text === '...' ? undefined : MEATHEAD_VOICE, text, hold });

/** Before the gym: the pencil necks come in. */
const OPENING: Panel[] = [
  { draw: (c, t) => drawGym(c, t), text: "THE IRON PIT. 5 A.M.\nMEATHEAD'S FOURTH HOUR OF CHEST DAY.", hold: 80 },
  { draw: (c, t) => drawDoorwayPencils(c, t), text: 'THE DOOR OPENS. FOUR SKINNY MEN IN CHEAP SUITS.\nNOBODY WEARS A SUIT TO THE IRON PIT.', hold: 70 },
  intern('Um. Excuse me. Mister... Meathead?'),
  meathead('dumb', "I'M MID-SET, BRO."),
  intern("We're from a department of the government that, uh... doesn't exist? We just need a moment of your..."),
  meathead('disgust', 'PENCIL NECKS.'),
  meathead('disgust', 'PENCIL NECKS... INVADING MY SPACE. ON CHEST DAY.'),
  intern('...Is that a no?', true),
  meathead('stoked', 'I MUST DESTROY THEM.'),
  intern('...Oh no.', true, 20),
];

/** After the gym: the bigger fellas, the pitch, and the briefing. */
const pitch = (shat: boolean): Panel[] => [
  agent('Meathead. We represent a department of the government that does not exist.'),
  // (he knows his own kind when he sees it)
  meathead('think', '...YOU GUYS LIFT?'),
  agent('...We lift.'),
  meathead('stoked', 'BROS.'),
  agent(shat ? 'Those were interns. We sent them in first to see what you would do. We did not expect that.' : 'Those were interns. We sent them in first to see what you would do.'),
  shat ? meathead('stoked', "THAT'S CALLED GOING TO FAILURE, BRO.") : meathead('dumb', 'YOU SENT ME PENCIL NECKS? ...FOR ME?'),
  agent('Looks like you enjoy hurting weaklings. How would you like to hurt more?'),
  meathead('think', '...', gym, 40),
  meathead('stoked', "HURT MORE WEAKLINGS?! THAT'S MY FAVORITE THING! AFTER CHEST DAY! WHERE ARE THEY?!"),
  { draw: (c, t) => drawEscort(c, t), text: shat ? 'MEATHEAD FOLLOWS THEM OUT OF THE GYM\nLIKE A DOG THAT HEARD "WALK." THEY WALK FASTER.' : 'MEATHEAD FOLLOWS THEM OUT OF THE GYM\nLIKE A DOG THAT HEARD THE WORD "WALK."', hold: 80 },
  slide('four', 'These are the four assholes. Very dangerous. Very weak. Extremely hurtable.'),
  slide('artie', 'Artie Avalanche. Alaska. He looked at your protein shake funny.'),
  meathead('disgust', 'MY SHAKE?!', briefing),
  slide('victor', "Victor Volcano. Hawaii. He's telling everybody you skip leg day."),
  meathead('disgust', 'I HAVE NEVER SKIPPED LEG DAY IN MY LIFE.', briefing),
  slide('ernie', 'Ernie Earthquake. San Francisco. An old man with some very heavy rocks. He needs help moving them. Permanently.'),
  slide('hector', 'Hector Hurricane. Miami. He went on the news and predicted a bad forecast for your gains.'),
  meathead('think', "WHY DON'T YOU GUYS DO IT? YOU'VE GOT SUITS.", briefing),
  slide('drop', "We don't do that kind of thing. You do. Planes, choppers, cargo drops: unlimited resources to put you wherever you need to be."),
  meathead('think', 'UNLIMITED... PROTEIN?', briefing),
  agent(shat ? '...Unlimited resources. Starting with pants.' : '...Unlimited resources.', 'briefing'),
  // The armory: he won't need it. He's got his guns. And a gun.
  agent('And the armory. Rocket launchers, flamethrowers, anything you want. Take your pick.', 'briefing'),
  meathead('dumb', "WEAPONS? NAH. I DON'T NEED WEAPONS.", briefing),
  meathead('stoked', 'I ONLY NEED MY GUNS.', briefing, undefined, 'flex'),
  // (a gross-up of the guns: held, in far too much detail)
  { draw: drawGrossArm, text: '', hold: 110, hires: true, onEnter: () => playSound('slam', 0.7, -3) },
  meathead('think', '...', briefing, 50, 'flex'),
  meathead('stoked', '...AND THIS.', briefing, undefined, 'gun'),
  // (and of the gun)
  { draw: drawGrossGun, text: '', hold: 110, hires: true, onEnter: () => playSound('reload', 0.9) },
  // Back to him, just him, pleased with himself
  meathead('stoked', '...', briefing, 30),
  agent('...Noted.', 'briefing'),
  meathead('stoked', "LET'S GO HURT SOME WEAKLINGS!", briefing),
  { draw: (c, t) => drawFirstFour(c, t), text: '' },
];

/** When the title comes up over the four of them, and how long it holds before it goes up onto the stage select. */
const TITLE_AT = 100;
const HOLD_TITLE = 110;
/** How long the opening's last panel holds before the gym takes over. */
const OPENING_END = 90;

const PITCH = pitch(false);
/** (the flies and the stink kept on each panel's frame) */
const PITCH_SHAT = pitch(true).map(p => ({ ...p, draw: shatClocked(p.draw) }));

/**
 * `part`: the opening (into the gym: `onDone` when it's over) or the pitch (`onHandoff`: bring the stage select up
 * underneath, the title landing on its heading; `onDone`: the cutscene's gone). `shat`: he came out of the gym like it
 * (the pitch only).
 */
const IntroCutscene: React.FC<{ part: 'opening' | 'pitch'; shat?: boolean; onHandoff?: () => void; onDone: () => void }> = ({ part, shat = false, onHandoff, onDone }) => {
  const on = part === 'pitch' && shat;
  // (set before the first frame's drawn, and cleared once it's gone)
  setShatPants(on);
  useEffect(() => { setShatPants(on); return () => setShatPants(false); }, [on]);
  return part === 'opening'
    ? <Cutscene panels={OPENING} endAt={OPENING_END} endCard="" autoEnd onDone={onDone} />
    : <Cutscene
      panels={on ? PITCH_SHAT : PITCH} endAt={TITLE_AT} endCard={BOSS_SET_TITLES[0]} onDone={onDone}
      handoff={{ className: setTitleClass(BOSS_SET_TITLES[0]), selector: '[data-set-title]', after: HOLD_TITLE, onHandoff: onHandoff ?? (() => {}) }}
    />;
};

export default IntroCutscene;
