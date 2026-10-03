import React from 'react';
import Cutscene, { Panel } from './Cutscene';
import { drawTrumpCloseUp, drawMeatheadCloseUp, drawPunch, type MeatheadMood } from '../game/scenes/ending';
import { drawCloset, drawSkinRack, drawLawnPress, fireBg, drawLaunch, LAUNCH_TWINKLE, IRIS_AT, IRIS_LEN } from '../game/scenes/epilogue';
import { drawFood } from '../game/scenes/fastFood';
import { Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { playSound } from '../game/platform/audio';

// After the alien: the real President, found tied up in a broom closet in the sub-basement (a rack of spare skins
// behind the mops: they'd been pulling the strings the whole time), holds an "emergency" press conference on the lawn
// in front of the burning White House. Meathead has no idea what's going on. Better than a medal: fast food, offered
// item by item, each one up close in all its glory (see fastFood), Meathead more appalled by each. He gets punched too. Up over the roof he goes, a twinkle, an iris in on Meathead's grin: THE END. For real this time.
//
// Same panels as the ending (see Cutscene): watch it all or skip the lot.

const TRUMP_VOICE: Voice = { id: 'president', pitch: 0.75, rate: 0.9 };
const TRUMP = 'PRESIDENT TRUMP';

/** The real one up close, the fire behind him: in a state, and (`hands`) selling it. */
const trump = (text: string, hands = true, mood: 'proud' | 'huh' = 'proud'): Panel =>
  ({ draw: (c, t, talk) => drawTrumpCloseUp(c, t, talk, mood, { bg: g => fireBg(g, t), rough: true, hands }), speaker: TRUMP, voice: TRUMP_VOICE, text });
const meathead = (mood: MeatheadMood, text: string, hold?: number): Panel =>
  ({ draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, mood, { bg: g => fireBg(g, t) }), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE, text, hold });

/** The President offering it, over a close-up of it (in far too much detail). */
const offer = (food: Parameters<typeof drawFood>[0], text: string): Panel =>
  ({ draw: drawFood(food), hires: true, speaker: TRUMP, voice: TRUMP_VOICE, text, hold: 50 });

/** Sounds on given frames of a panel (its draw's called once a frame). */
const cue = (draw: Panel['draw'], at: Record<number, () => void>): Panel['draw'] => (c, t, talking) => { at[t]?.(); draw(c, t, talking); };

/** When THE END comes up: the iris has closed on him. */
const THE_END_AT = IRIS_AT + IRIS_LEN + 6;

const PANELS: Panel[] = [
  { draw: (c, t) => drawCloset(c, t), text: 'THE WHITE HOUSE. THE SUB-BASEMENT.\nA BROOM CLOSET.', hold: 60 },
  { draw: (c, t) => drawCloset(c, t + 200), text: 'The real President. Held hostage the whole time.', hold: 70 },
  {
    draw: (c, t) => drawSkinRack(c, t),
    text: 'Behind the mops, a rack of spare skins.\nShape-shifting alien imposters, pulling the strings all along.', hold: 60,
  },
  { draw: (c, t) => drawLawnPress(c, t, false), text: 'THE SOUTH LAWN.\nAN "EMERGENCY" PRESS CONFERENCE.', hold: 70, onEnter: () => playSound('siren', 0.4) },
  {
    draw: (c, t, talk) => drawLawnPress(c, t, talk), speaker: TRUMP, voice: TRUMP_VOICE,
    text: 'Folks, what a night. I was held hostage. In a closet. The worst closet. Believe me.',
  },
  trump("Shape-shifting aliens, running everything. Nobody knew. I knew. I didn't know, but I knew.", false),
  { draw: (c, t) => drawMeatheadCloseUp(c, t, false, 'confused', { bg: g => fireBg(g, t) }), text: 'Meathead has no idea what is going on.', hold: 70 },
  trump("And Meathead saved me. Saved the whole planet, frankly. Nobody's ever saved a planet like this."),
  meathead('confused', 'WHY ARE THERE TWO OF YOU?'),
  trump("Forget that medal. Fake medal, very cheap. I'll give you something much better. Something beautiful."),
  trump('Fast food. The best fast food. All you can eat, for life. Believe me.'),
  // The offers, one by one, each up close; Meathead taking each worse than the last
  offer('burger', 'The biggest burger. Six patties, eight cheeses. They named it after me. Beautiful burger.'),
  meathead('macros', "SIX PATTIES... EIGHT CHEESES... CARRY THE ONE... THAT'S ZERO GAINS, BRO."),
  offer('chicken', "Buckets of chicken. Extra crispy, extra skin. The skin's the best part. Everybody says so."),
  meathead('gag', "THAT'S NOT PROTEIN, BRO. THAT'S A GREASE SPONGE WITH A BONE IN IT."),
  offer('fries', "Fries. Golden fries, nice and soaked. You'll never have a dry fry again."),
  meathead('horrified', "I'M JUST LOOKING AT IT AND MY SIX-PACK'S TURNING INTO A KEG."),
  offer('soda', 'And the biggest soda. A bucket of it. I have two a night. Very healthy.'),
  meathead('disgust', 'OF COURSE YOU EAT FAST FOOD, FATTIE.'),
  trump('Excuse me?', false, 'huh'),
  {
    draw: (c, t) => drawPunch(c, t, true), text: '', hold: 70,
    onEnter: () => { playSound('punch', 1.5, -3); playSound('slam'); playSound('crunch'); },
  },
  // Up over the roof, gone with a twinkle; the iris in on Meathead's grin. THE END.
  { draw: cue((c, t) => drawLaunch(c, t), { 2: () => playSound('whoosh', 1, -2), [LAUNCH_TWINKLE]: () => playSound('ding', 0.9, 4) }), text: '' },
];

const EpilogueCutscene: React.FC<{ onDone: () => void }> = ({ onDone }) => (
  <Cutscene panels={PANELS} endAt={THE_END_AT} endCard="THE END" onDone={onDone} />
);

export default EpilogueCutscene;
