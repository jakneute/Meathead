import React from 'react';
import Cutscene, { Panel } from './Cutscene';
import { drawMeatheadCloseUp } from '../game/render/scenes/ending';
import { drawGym, drawDoorway, drawAgent, drawEscort, drawBriefing, drawFirstFour, gymBg, briefingBg } from '../game/render/scenes/intro';
import { Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { BOSS_SET_TITLES } from '../content/roster';
import { setTitleClass } from './Overlay';

// The opening (START GAME + INTRO): Meathead's on chest day at five in the morning when two men in black suits
// walk into the gym with an offer he can't refuse. Down a corridor to a briefing room, where the four assholes are
// explained to him, not entirely honestly, and the government's resources are put at his disposal. Then the four of
// them in the dark, and the title goes up onto the stage select, the way the mid-game call ends.

/** The agent who does the talking: flat, quick, bored. */
const AGENT_VOICE: Voice = { id: 'agent', pitch: 0.6, rate: 1.05 };
const AGENT = 'AGENT';

const gym = (ctx: CanvasRenderingContext2D) => { gymBg(ctx); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, 256, 144); };
const briefing = (ctx: CanvasRenderingContext2D) => briefingBg(ctx, 0, -1);

const agent = (text: string, where: 'gym' | 'briefing' = 'gym'): Panel =>
  ({ draw: (c, t, talk) => drawAgent(c, t, talk, where), speaker: AGENT, voice: AGENT_VOICE, text });
const slide = (s: Parameters<typeof drawBriefing>[3], text: string): Panel =>
  ({ draw: (c, t, talk) => drawBriefing(c, t, talk, s), speaker: AGENT, voice: AGENT_VOICE, text });
const meathead = (mood: 'dumb' | 'disgust' | 'think' | 'stoked', text: string, bg = gym, hold?: number): Panel =>
  ({ draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, mood, { bg, medal: false }), speaker: 'MEATHEAD', voice: text === '...' ? undefined : MEATHEAD_VOICE, text, hold });

const PANELS: Panel[] = [
  { draw: (c, t) => drawGym(c, t), text: "THE IRON PIT. 5 A.M.\nMEATHEAD'S FOURTH HOUR OF CHEST DAY.", hold: 80 },
  { draw: (c, t) => drawDoorway(c, t), text: 'THE DOOR OPENS. TWO MEN IN BLACK SUITS.\nNOBODY WEARS A SUIT TO THE IRON PIT.', hold: 60 },
  agent('Meathead. We represent a department of the government that does not exist.'),
  meathead('dumb', "I'M MID-SET, BRO."),
  agent("We'll be brief. We have an offer you cannot refuse."),
  agent('Do you like hurting weaklings?'),
  meathead('think', '...', gym, 40),
  meathead('stoked', "DO I LIKE HURTING WEAKLINGS?! THAT'S MY FAVORITE THING! AFTER CHEST DAY! WHERE ARE THEY?!"),
  { draw: (c, t) => drawEscort(c, t), text: 'MEATHEAD FOLLOWS THEM OUT OF THE GYM\nLIKE A DOG THAT HEARD THE WORD "WALK."', hold: 80 },
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
  agent('...Unlimited resources.', 'briefing'),
  meathead('stoked', "LET'S GO HURT SOME WEAKLINGS!", briefing),
  { draw: (c, t) => drawFirstFour(c, t), text: '' },
];

/** When the title comes up over the four of them, and how long it holds before it goes up onto the stage select. */
const TITLE_AT = 100;
const HOLD_TITLE = 110;

/** `onHandoff`: bring the stage select up underneath (the title lands on its heading); `onDone`: the intro's gone. */
const IntroCutscene: React.FC<{ onHandoff: () => void; onDone: () => void }> = ({ onHandoff, onDone }) => (
  <Cutscene
    panels={PANELS} endAt={TITLE_AT} endCard={BOSS_SET_TITLES[0]} onDone={onDone}
    handoff={{ className: setTitleClass(BOSS_SET_TITLES[0]), selector: '[data-set-title]', after: HOLD_TITLE, onHandoff }}
  />
);

export default IntroCutscene;
