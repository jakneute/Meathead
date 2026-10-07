import React from 'react';
import Cutscene, { Panel } from './Cutscene';
import { drawMeatheadCloseUp } from '../game/scenes/ending';
import { drawGarage, drawRadioCloseUp, drawShadowFigure, drawShadowBriefing, garageBg } from '../game/scenes/radio';
import { Slide } from '../game/scenes/intro';
import { drawSecondFour } from '../game/scenes/bossFour';
import { Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { playSquelch } from '../game/platform/audio';
import { BOSS_SET_TITLES } from '../content/roster';
import { setTitleClass } from './Overlay';

// The mid-game call: the first four are dead and Meathead's off to the gym, when the radio in his garage goes. The
// voice on the other end is scrambled; the man it belongs to is a silhouette behind a very big desk. He has more
// assholes, and slides on every one of them, and a reason apiece for Meathead to want them dead (none of them true,
// bar one). Meathead can't say no to that.

/** The voice on the radio: low, and said through the modulator (see Cutscene). */
const SHADOW_VOICE: Voice = { id: 'president', pitch: 0.35, rate: 1.3 };
const SHADOW = '???';

const garage = (ctx: CanvasRenderingContext2D) => garageBg(ctx);

const shadow = (text: string): Panel => ({ draw: (c, t, talk) => drawShadowFigure(c, t, talk), speaker: SHADOW, voice: SHADOW_VOICE, radio: true, text });
const slide = (s: Slide, text: string): Panel => ({ draw: (c, t, talk) => drawShadowBriefing(c, t, talk, s), speaker: SHADOW, voice: SHADOW_VOICE, radio: true, text });
const meathead = (mood: 'dumb' | 'disgust' | 'think' | 'stoked', text: string): Panel =>
  ({ draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, mood, { bg: garage, medal: false }), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE, text });

const PANELS: Panel[] = [
  { draw: (c, t) => drawGarage(c, t, false), text: "MEATHEAD'S GARAGE.", hold: 70 },
  { draw: (c, t) => drawRadioCloseUp(c, t, true), text: '*KSSHHHH*\nTHE RADIO CRACKLES TO LIFE.', hold: 50, onEnter: () => playSquelch() },
  shadow("Meathead. Big guy. Tremendous guy. Four assholes, all dead. Nobody's ever killed assholes like you. People are saying it."),
  { draw: (c, t, talk) => drawGarage(c, t, false, talk), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE, text: "Cool. I'm gonna go hit the gym. It's chest day." },
  shadow("Chest day. Beautiful. I have a tremendous chest, doctors can't believe it. Can't even find a heartbeat. But listen. There are more of them."),
  meathead('think', 'More... assholes?'),
  slide('four2', "Four more. Worse than the first four. Worst on this whole planet, and I've seen a lot of planets. And they're laughing at your gains. I made slides. Beautiful slides."),
  slide('tommy', 'Toxic Tommy. Flint. Lives in a sewer, drinks the sewer. And he says protein powder is a scam. I heard him say it.'),
  meathead('disgust', 'PROTEIN POWDER IS NOT A SCAM!'),
  slide('barry', 'Blackout Barry. New York, my city. Turns off all the lights. And he stole your headphones. Right off your head.'),
  meathead('think', 'I KNEW IT.'),
  slide('oscar', 'Oily Oscar. Texas. Great for oil, honestly. But he sells fake creatine. And his bikers said something about your mother.'),
  meathead('disgust', 'NOBODY TALKS ABOUT MY MOM.'),
  slide('dale', 'Drug Trade Dale. New Mexico. The worst drugs. And he parks in your spot. Every day.'),
  meathead('think', "I DON'T HAVE A CAR."),
  shadow("He parks in it anyway. That's how bad he is. Planes, choppers, whatever you need. Unlimited."),
  meathead('stoked', 'More people to kill? SICK! Chest day can wait!'),
  shadow("Go get 'em, big guy. And Meathead? This call never happened. Believe me."),
  { draw: (c, t) => drawRadioCloseUp(c, t, false), text: '*CLICK*', hold: 45, onEnter: () => playSquelch() },
  { draw: (c, t) => drawSecondFour(c, t), text: '' },
];

/** When the title comes up over the four of them. */
const TITLE_AT = 100;

/** How long the title holds over the four of them before it goes up onto the stage select. */
const HOLD_TITLE = 110;

/**
 * `onHandoff`: bring the stage select up underneath (the title rises onto its heading and the cutscene fades away round
 * it, straight into picking the next target); `onDone`: the cutscene's gone.
 */
const RadioCutscene: React.FC<{ onHandoff: () => void; onDone: () => void }> = ({ onHandoff, onDone }) => (
  <Cutscene
    panels={PANELS} endAt={TITLE_AT} endCard={BOSS_SET_TITLES[1]} radio onDone={onDone}
    handoff={{ className: setTitleClass(BOSS_SET_TITLES[1]), selector: '[data-set-title]', after: HOLD_TITLE, onHandoff }}
  />
);

export default RadioCutscene;
