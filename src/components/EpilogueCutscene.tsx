import React, { useEffect } from 'react';
import Cutscene, { Panel } from './Cutscene';
import { drawTrumpCloseUp, drawMeatheadCloseUp, drawPunch, type MeatheadMood } from '../game/scenes/ending';
import { drawCloset, drawSkinRack, drawLawnPress, fireBg, drawLaunch, LAUNCH_TWINKLE, IRIS_AT, IRIS_LEN } from '../game/scenes/epilogue';
import { drawFood } from '../game/scenes/fastFood';
import { Voice, MEATHEAD_VOICE } from '../game/platform/speech';
import { playSound } from '../game/platform/audio';
import { setShatPants, shatClocked } from '../game/scenes/shatLook';

// After the alien: the real President, found tied up in a broom closet in the sub-basement (a rack of spare skins
// behind the mops: they'd been pulling the strings the whole time), holds an "emergency" press conference on the lawn
// in front of the burning White House. Meathead has no idea what's going on. Better than a medal: fast food, a quick
// run of it up close in all its glory (see fastFood) while he sells it. He gets punched too. Up over the roof he goes, a twinkle, an iris in on Meathead's grin: THE END. For real this time.
//
// Same panels as the ending (see Cutscene): watch it all or skip the lot.
//
// `shat`: he's still (or newly) shit himself, the alien dead: it shows on him (see scenes/shatLook), and the
// President, saved, has a word on it.

const TRUMP_VOICE: Voice = { id: 'president', pitch: 0.75, rate: 0.9 };
const TRUMP = 'PRESIDENT TRUMP';

/** The real one up close, the fire behind him: in a state, and (`hands`) selling it. */
const trump = (text: string, hands = true, mood: 'proud' | 'huh' = 'proud'): Panel =>
  ({ draw: (c, t, talk) => drawTrumpCloseUp(c, t, talk, mood, { bg: g => fireBg(g, t), rough: true, hands }), speaker: TRUMP, voice: TRUMP_VOICE, text });
const meathead = (mood: MeatheadMood, text: string, hold?: number): Panel =>
  ({ draw: (c, t, talk) => drawMeatheadCloseUp(c, t, talk, mood, { bg: g => fireBg(g, t) }), speaker: 'MEATHEAD', voice: MEATHEAD_VOICE, text, hold });

/** The President selling it, over a close-up of it (in far too much detail): a few seconds each. */
const offer = (food: Parameters<typeof drawFood>[0], text: string): Panel =>
  ({ draw: drawFood(food), hires: true, speaker: TRUMP, voice: TRUMP_VOICE, text, hold: 60 });

/** Sounds on given frames of a panel (its draw's called once a frame). */
const cue = (draw: Panel['draw'], at: Record<number, () => void>): Panel['draw'] => (c, t, talking) => { at[t]?.(); draw(c, t, talking); };

/** When THE END comes up: the iris has closed on him. */
const THE_END_AT = IRIS_AT + IRIS_LEN + 6;

const panels = (shat: boolean): Panel[] => [
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
  trump(shat
    ? "And Meathead saved me. Saved the whole planet, frankly. Nobody's ever saved a planet like this. Or smelled like this."
    : "And Meathead saved me. Saved the whole planet, frankly. Nobody's ever saved a planet like this."),
  meathead('confused', 'WHY ARE THERE TWO OF YOU?'),
  trump("Forget that medal. Fake medal, very cheap. I'll give you something much better. Something beautiful."),
  // A quick run of it, each up close for a few seconds, while he sells it
  offer('burger', 'Fast food, folks. The best fast food.'),
  offer('chicken', 'All you can eat. Every single day.'),
  offer('fries', 'For the rest of your life. Free.'),
  offer('soda', 'Nobody eats like this. Believe me.'),
  meathead('disgust', 'OF COURSE YOU EAT FAST FOOD, FATTIE.'),
  trump('Excuse me?', false, 'huh'),
  {
    draw: (c, t) => drawPunch(c, t, true), text: '', hold: 70,
    onEnter: () => { playSound('punch', 1.5, -3); playSound('slam'); playSound('crunch'); },
  },
  // Up over the roof, gone with a twinkle; the iris in on Meathead's grin. THE END.
  { draw: cue((c, t) => drawLaunch(c, t), { 2: () => playSound('whoosh', 1, -2), [LAUNCH_TWINKLE]: () => playSound('ding', 0.9, 4) }), text: '' },
];

const CLEAN = panels(false);
/** (the flies and the stink kept on each panel's frame) */
const SHAT = panels(true).map(p => ({ ...p, draw: shatClocked(p.draw) }));

const EpilogueCutscene: React.FC<{ shat?: boolean; onDone: () => void }> = ({ shat = false, onDone }) => {
  // (set before the first frame's drawn, and cleared once it's gone)
  setShatPants(shat);
  useEffect(() => { setShatPants(shat); return () => setShatPants(false); }, [shat]);
  return <Cutscene panels={shat ? SHAT : CLEAN} endAt={THE_END_AT} endCard="THE END" onDone={onDone} />;
};

export default EpilogueCutscene;
