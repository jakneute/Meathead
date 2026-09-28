import React from 'react';
import Cutscene, { Panel } from './Cutscene';
import { drawMeatheadCloseUp } from '../game/render/scenes/ending';
import { drawGarage, drawRadioCloseUp, drawShadowFigure, drawNextFour, garageBg } from '../game/render/scenes/radio';
import { Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { playSquelch } from '../game/platform/audio';
import { BOSS_SET_TITLES } from '../content/roster';

// The mid-game call: the first four are dead and Meathead's off to the gym, when the radio in his garage goes. The
// voice on the other end is scrambled; the man it belongs to is a silhouette behind a very big desk. He has more
// assholes. Meathead can't say no to that.

/** The voice on the radio: low, and said through the modulator (see Cutscene). */
const SHADOW_VOICE: Voice = { pitch: 0.35, rate: 0.95 };
const SHADOW = '???';

const garage = (ctx: CanvasRenderingContext2D) => garageBg(ctx);

const PANELS: Panel[] = [
  { draw: (c, t) => drawGarage(c, t, false), text: "MEATHEAD'S GARAGE.\nHOME GYM (STILL UNDER CONSTRUCTION).", hold: 70 },
  { draw: (c, t) => drawRadioCloseUp(c, t, true), text: '*KSSHHHH*\nTHE RADIO CRACKLES TO LIFE.', hold: 50, onEnter: () => playSquelch() },
  {
    draw: (c, t, talk) => drawShadowFigure(c, t, talk), speaker: SHADOW, voice: SHADOW_VOICE, radio: true,
    text: "Meathead. Big guy. Tremendous guy. Four assholes, all dead. Totally dead. Nobody's ever killed assholes like you. Nobody. People are saying it.",
  },
  {
    draw: (c, t, talk) => drawGarage(c, t, false, talk), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE,
    text: "Cool. So they're all dead now. Awesome. I'm gonna go hit the gym. It's chest day.",
  },
  {
    draw: (c, t, talk) => drawShadowFigure(c, t, talk), speaker: SHADOW, voice: SHADOW_VOICE, radio: true,
    text: "Chest day. Beautiful. I have a tremendous chest, the best chest, doctors can't believe it. But listen. Listen to me. There are more of them.",
  },
  {
    draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, 'think', { bg: garage, medal: false }), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE,
    text: 'More... assholes?',
  },
  {
    draw: (c, t, talk) => drawShadowFigure(c, t, talk), speaker: SHADOW, voice: SHADOW_VOICE, radio: true,
    text: "Four more. Bad ones. Very bad. Worse than the first four, and the first four were a disaster. A total disaster. And they're laughing at you, Meathead. They're laughing at your gains.",
  },
  {
    draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, 'stoked', { bg: garage, medal: false }), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE,
    text: 'More people to kill? SICK! Chest day can wait!',
  },
  {
    draw: (c, t, talk) => drawShadowFigure(c, t, talk), speaker: SHADOW, voice: SHADOW_VOICE, radio: true,
    text: "That's what I like to hear. Very strong. Go get 'em, big guy. And Meathead? This call never happened. Believe me.",
  },
  { draw: (c, t) => drawRadioCloseUp(c, t, false), text: '*CLICK*', hold: 45, onEnter: () => playSquelch() },
  { draw: (c, t) => drawNextFour(c, t), text: '' },
];

/** When the title comes up over the four of them. */
const TITLE_AT = 100;

const RadioCutscene: React.FC<{ onDone: () => void }> = ({ onDone }) => (
  <Cutscene panels={PANELS} endAt={TITLE_AT} endCard={BOSS_SET_TITLES[1]} radio onDone={onDone} />
);

export default RadioCutscene;
