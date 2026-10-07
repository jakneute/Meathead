import React, { useEffect } from 'react';
import Cutscene, { Panel } from './Cutscene';
import {
  drawWhiteHouse, drawPressRoom, drawTrumpCloseUp, drawMedal, drawMeatheadEyes,
  drawMeatheadCloseUp, drawPunch, drawFinale,
} from '../game/scenes/ending';
import {
  drawLanding, LAND_AT, drawSkinSplit, SPLIT_TEAR, SPLIT_OPEN, SPLIT_LEN, drawAlienEmerges, DROP_AT, drawPressGasp,
  drawAlienCloseUp, drawZap, ZAP_FIRE, drawLegSinge, drawSniff, SNIFF_TURN, drawSquareOff,
} from '../game/scenes/endingAlien';
import { ALIEN_VOICE } from '../game/scenes/alienLook';
import { Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { playSound } from '../game/platform/audio';
import { drawGrossPresident, drawGrossAlien } from '../game/scenes/grossUp';
import { setShatPants, shatClocked } from '../game/scenes/shatLook';

// NES-style ending: a run of still images with text typed out underneath (see Cutscene).
//
// The medal, the gross-up, "Do you even lift, bro?", the punch, the freeze: THE END? ...and as the President lands,
// the thing that was wearing him splits him down the middle and climbs out. He zaps Meathead's leg hair. It's on (and
// `onDone` goes straight into the fight).
//
// `shat`: he shit himself on the walk out to his mark (see stages/whiteHouse). It shows on him in every shot (see
// scenes/shatLook), and the moments it'd get a reaction get one: the President, the press, and Meathead, who isn't
// bothered.

const TRUMP_VOICE: Voice = { id: 'president', pitch: 0.75, rate: 0.9 };
/** The one down front with the mic. */
const REPORTER_VOICE: Voice = { id: 'reporter', pitch: 1.35, rate: 1.05 };

const FINALE_FREEZE = 48;
/** How long THE END? holds over the freeze before he lands. */
const FAKE_END_HOLD = 110;
/** How long the square-off holds before the fight takes over. */
const SQUARE_OFF = 56;

/** Sounds on given frames of a panel (its draw's called once a frame, its frame counter going up by one). */
const cue = (draw: Panel['draw'], at: Record<number, () => void>): Panel['draw'] => (c, t, talking) => { at[t]?.(); draw(c, t, talking); };

const panels = (shat: boolean): Panel[] => [
  { draw: (c, t) => drawWhiteHouse(c, t), text: 'WASHINGTON, D.C.\nTHE WHITE HOUSE PRESS ROOM.' },
  {
    draw: (c, t, talk) => drawPressRoom(c, t, talk), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: shat
      ? "Thank you. Thank you. What a crowd. What a smell. Is that... that's him. This man, Meathead, took out the most evil terrorists. Believe me."
      : 'Thank you. Thank you. What a crowd. This man, Meathead, took out the most dangerous, most evil terrorists. Believe me.',
  },
  {
    draw: (c, t, talk) => drawTrumpCloseUp(c, t, talk, 'proud'), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: "Nobody's ever seen anything like it. Tremendous job. The best job. People are saying he's the greatest hero in the history of heroes. Maybe ever.",
  },
  {
    draw: (c, t, talk) => drawMedal(c, t, talk), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: shat
      ? "It's my great honor to give him the Presidential Medal of Freedom. At arm's length. Somebody open a window. Frankly, I should get a medal for this."
      : "It's my great honor to give him the Presidential Medal of Freedom. Beautiful medal. Very expensive. Frankly, I should get one too.",
  },
  { draw: (c, t) => drawMeatheadEyes(c, t), text: 'Meathead looks the President up and down...', hold: 60 },
  // (a gross-up of what he's looking at, the camera tilting down it and back up as his eyes do)
  { draw: drawGrossPresident, text: '', hold: 185, hires: true },
  {
    draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, 'dumb'), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE,
    text: 'Do you even lift, bro?',
  },
  {
    draw: (c, t, talk) => drawTrumpCloseUp(c, t, talk, 'huh'), speaker: 'PRESIDENT TRUMP', voice: TRUMP_VOICE,
    text: shat ? 'Excuse me? You shit your pants. In the White House. On television.' : 'Excuse me?',
  },
  // (shat: he's got an answer for that; otherwise he's just disgusted)
  shat
    ? { draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, 'disgust'), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE, text: "IT'S PROTEIN, BRO. IT'S GOTTA GO SOMEWHERE." }
    : { draw: (c, t) => drawMeatheadCloseUp(c, t, false, 'disgust'), text: 'Meathead is disgusted.', hold: 50 },
  {
    draw: (c, t) => drawPunch(c, t), text: '', hold: 70,
    onEnter: () => { playSound('punch', 1.5, -3); playSound('slam'); playSound('crunch'); },
  },
  // THE END? (it isn't)
  { draw: (c, t) => drawFinale(c, t, FINALE_FREEZE), text: '', card: 'THE END?', cardAt: FINALE_FREEZE, hold: FINALE_FREEZE + FAKE_END_HOLD },
  // He comes down on his face; something under his jacket starts pushing
  {
    draw: cue((c, t) => drawLanding(c, t), {
      [LAND_AT]: () => { playSound('thud', 1.3); playSound('crunch', 0.6, -2); },
      90: () => playSound('rumble', 0.5, -4),
      114: () => playSound('splat', 0.8, -3),
    }),
    text: '', hold: 140,
  },
  // (up close: it rips him down the middle and pries him open)
  {
    draw: cue(drawSkinSplit, {
      30: () => playSound('rumble', 0.5, -5),
      [SPLIT_TEAR]: () => { playSound('crunch', 1.2, -4); playSound('splat', 1, -2); },
      [SPLIT_OPEN]: () => { playSound('splat', 1.2, -5); playSound('bellow', 0.8, -3); },
    }),
    text: '', hold: SPLIT_LEN, hires: true,
  },
  // He climbs out of the President and shrugs him off onto the floor
  {
    draw: cue((c, t) => drawAlienEmerges(c, t), { 2: () => playSound('snort', 0.8, -4), [DROP_AT]: () => playSound('splat', 1.3, -4) }),
    text: '', hold: 150,
  },
  {
    draw: (c, t, talk) => drawPressGasp(c, t, talk), speaker: 'REPORTER', voice: REPORTER_VOICE,
    text: shat ? 'Oh my God. It was an imposter president all along! And our hero shit himself!' : 'Oh my God. It was an imposter president all along!',
  },
  {
    draw: (c, t, talk) => drawAlienCloseUp(c, t, talk), speaker: 'ALIEN', voice: ALIEN_VOICE, hires: true,
    text: 'Uh... four more years?',
  },
  // Meathead sizes him up, and likes what he sees
  { draw: (c, t) => drawMeatheadEyes(c, t, 'alien'), text: 'Meathead looks the alien up and down...', hold: 50 },
  // (a gross-up of him too, the camera down him and back up the same way)
  { draw: drawGrossAlien, text: '', hold: 185, hires: true },
  {
    draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, 'stoked'), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE,
    text: '...NICE TRAPS, BRO.',
  },
  // Zap
  {
    draw: cue((c, t) => drawZap(c, t), { 14: () => playSound('powerup', 0.5, -3), [ZAP_FIRE]: () => playSound('egun', 1.2, -2), [ZAP_FIRE + 4]: () => playSound('ignite', 0.9) }),
    text: '', hold: 80,
  },
  // (up close: his leg hair)
  { draw: drawLegSinge, text: '', hold: 120, hires: true, onEnter: () => playSound('ignite', 0.6, -3) },
  {
    draw: cue((c, t) => drawSniff(c, t), { [SNIFF_TURN]: () => playSound('slam', 0.6, -4) }),
    text: shat ? 'Through the other smell, Meathead smells something burning.\nHis leg hair.' : 'Meathead smells something burning.\nHis leg hair.', hold: 40,
  },
  {
    draw: (c, t, talk) => drawMeatheadCloseUp(c, t + 12, talk, 'fury'), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE,
    text: "IT'S ON, FUCKFACE.",
  },
  // Squared up; into the fight
  { draw: cue((c, t) => drawSquareOff(c, t), { 1: () => playSound('slam', 1, -5) }), text: '' },
];

const CLEAN = panels(false);
/** (the flies and the stink kept on each panel's frame) */
const SHAT = panels(true).map(p => ({ ...p, draw: shatClocked(p.draw) }));

const EndingCutscene: React.FC<{ shat?: boolean; onDone: () => void }> = ({ shat = false, onDone }) => {
  // (set before the first frame's drawn, and cleared once it's gone: nothing else that draws him shows it)
  setShatPants(shat);
  useEffect(() => { setShatPants(shat); return () => setShatPants(false); }, [shat]);
  return <Cutscene panels={shat ? SHAT : CLEAN} endAt={SQUARE_OFF} endCard="" autoEnd onDone={onDone} />;
};

export default EndingCutscene;
