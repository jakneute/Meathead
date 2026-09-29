import React from 'react';
import Cutscene, { Panel } from './Cutscene';
import {
  drawWhiteHouse, drawPressRoom, drawTrumpCloseUp, drawMedal, drawMeatheadEyes, drawBelly,
  drawMeatheadCloseUp, drawPunch, drawFinale,
} from '../game/render/scenes/ending';
import { Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { playSound } from '../game/platform/audio';

// NES-style ending: a run of still images with text typed out underneath (see Cutscene).

const TRUMP_VOICE: Voice = { id: 'president', pitch: 0.75, rate: 0.9 };

const FINALE_FREEZE = 48;

const PANELS: Panel[] = [
  { draw: (c, t) => drawWhiteHouse(c, t), text: 'WASHINGTON, D.C.\nTHE WHITE HOUSE PRESS ROOM.' },
  {
    draw: (c, t, talk) => drawPressRoom(c, t, talk), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: 'Thank you. Thank you. What a crowd. This man, Meathead, took out the most dangerous, most evil terrorists. Believe me.',
  },
  {
    draw: (c, t, talk) => drawTrumpCloseUp(c, t, talk, 'proud'), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: "Nobody's ever seen anything like it. Tremendous job. The best job. People are saying he's the greatest hero in the history of heroes. Maybe ever.",
  },
  {
    draw: (c, t, talk) => drawMedal(c, t, talk), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: "It's my great honor to give him the Presidential Medal of Freedom. Beautiful medal. Very expensive. Frankly, I should get one too.",
  },
  { draw: (c, t) => drawMeatheadEyes(c, t), text: 'Meathead looks the President up and down...', hold: 60 },
  { draw: (c, t) => drawBelly(c, t), text: '...', hold: 50 },
  {
    draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, 'dumb'), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE,
    text: 'Do you even lift, bro?',
  },
  {
    draw: (c, t, talk) => drawTrumpCloseUp(c, t, talk, 'huh'), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: 'Excuse me?',
  },
  { draw: (c, t) => drawMeatheadCloseUp(c, t, false, 'disgust'), text: 'Meathead is disgusted.', hold: 50 },
  {
    draw: (c, t) => drawPunch(c, t), text: '', hold: 70,
    onEnter: () => { playSound('punch', 1.5, -3); playSound('slam'); playSound('crunch'); },
  },
  { draw: (c, t) => drawFinale(c, t, FINALE_FREEZE), text: '' },
];

const EndingCutscene: React.FC<{ onDone: () => void }> = ({ onDone }) => (
  <Cutscene panels={PANELS} endAt={FINALE_FREEZE} endCard="THE END" onDone={onDone} />
);

export default EndingCutscene;
