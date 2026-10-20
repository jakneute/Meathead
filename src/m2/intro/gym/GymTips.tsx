import React from 'react';
import { Prompt } from '../../../m1/components/ButtonIcons';
import ChordPrompt from '../../ChordPrompt';
import type { GymTip } from './index';

// The Iron Pit's lesson cards (gym/index.ts tipFor): what to do to the G-men in the room he's in, as the buttons that do
// it on whatever's being played with (a pad's, or the keyboard's and the mouse's as they're bound; changing over the
// moment he switches), and what's in the room to pulverize them with. Up in the top right, out of the HUD's way.

const S = 14;
const CARDS: Record<GymTip, { how: React.ReactNode; what: string; note?: string }> = {
  move: {
    how: <><Prompt pad={['DPAD']} kb={['@left', '@right']} size={S} label="MOVE" /><span className="mx-2" /><Prompt pad={['A']} kb={['@jump']} size={S} label="JUMP" /><span className="mx-2" /><Prompt pad={['DPAD_DOWN']} kb={['@down']} size={S} label="CROUCH" /></>,
    what: 'G-MEN IN YOUR GYM. ON LEG DAY.',
    note: 'HOLD JUMP TO JUMP HIGHER.',
  },
  shoot: {
    how: <Prompt pad={['X']} kb={['@@fire']} size={S} label="SHOOT" />,
    what: 'SHOOT THEM. SHOOT THE STACK OF PROTEIN AND IT COMES DOWN ON THE ONES HIDING BEHIND IT.',
  },
  charge: {
    how: <Prompt pad={['B']} kb={['@charge', '@special']} size={S} label="SHOULDER CHARGE" />,
    what: 'PLOW THROUGH THE HUMAN WALL. THE ONES YOU SEND FLYING TAKE OUT THE ONES BEHIND THEM. CHARGE ONE INTO THE DUMBBELL RACK.',
    note: 'HOLD IT TO KEEP CHARGING. IT USES POWER (THE CELLS UNDER YOUR HEALTH): THEY REFILL.',
  },
  slide: {
    how: <ChordPrompt pad={['DPAD_DOWN', 'B']} join="+" kb={['@down', '@special']} size={S} label="SLIDE TACKLE" />,
    what: 'THEY\'RE CRAWLING UNDER THE DUCT. SLIDE IN AFTER THEM. SLIDE INTO THE KETTLEBELLS AND THEY GO ROLLING.',
    note: 'HOLD DOWN TO CRAWL UNDER IT.',
  },
  uppercut: {
    how: <ChordPrompt pad={['DPAD_UP', 'B']} join="+" kb={['@up', '@special']} size={S} label="UPPERCUT" />,
    what: 'UP ON THE SHELVES, OUT OF REACH. UPPERCUT THEM DOWN. UPPERCUT THE CABLE MACHINE: WHAT GOES UP COMES DOWN.',
  },
  divekick: {
    how: <><ChordPrompt pad={['DPAD_DOWN', 'B']} join="+" kb={['@down', '@special']} size={S} label="DIVE KICK" /><span className="ml-1">IN THE AIR</span></>,
    what: 'OFF THE EDGE, DOWN ON THEIR HEADS. BOUNCE AND DO IT AGAIN. LAND ON THE BENCH\'S BAR AND THE PLATES GO FLYING.',
    note: 'DIVE KICKS ARE FREE, AND ONE THAT DOESN\'T KILL GIVES YOU POWER BACK.',
  },
  mix: {
    how: <span className="text-yellow-300">ALL OF IT</span>,
    what: 'WHATEVER YOU LIKE. THEY WON\'T FIGHT BACK.',
  },
  beatdown: {
    how: <ChordPrompt pad={['Y', 'B']} join="+" kb={['@beatdown']} size={S} label="BEATDOWN" />,
    what: 'GET ON TOP OF HIM AND PUNCH. EVERY PUNCH HEALS YOU.',
    note: 'THEY\'RE PADDED. THEY CAN TAKE IT.',
  },
  shakedown: {
    how: <ChordPrompt pad={['Y', 'X']} join="+" kb={['@shakedown']} size={S} label="SHAKEDOWN" />,
    what: 'UP BY THE NECK: SHAKE THE AMMO OUT OF HIM. HOLD A DIRECTION TO THROW HIM. DOWN SLAMS HIM.',
  },
  airgrab: {
    how: <ChordPrompt pad={['A', 'B']} join="+" kb={['@airGrab']} size={S} label="AIR GRAB" />,
    what: 'LEAP UP AND GRAB THE ONE ON THE JETPACK. IT SLAMS HIM AND HEALS YOU.',
    note: 'HOLD BACK: BACKFLIP. HOLD FORWARD: DIVE.',
  },
  exit: {
    how: <span className="text-red-400">EXIT &#9654;</span>,
    what: 'THAT\'S EVERYTHING. THE DOOR\'S OPEN.',
  },
};

const GymTips: React.FC<{ tip: GymTip }> = ({ tip }) => {
  const c = CARDS[tip];
  return (
    <div key={tip} className="absolute right-3 top-3 z-20 max-w-[440px] px-3 py-2 text-[8px] leading-[1.6] text-zinc-100 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300"
      style={{ background: 'rgba(0,0,0,0.78)', border: '2px solid #FACC15', boxShadow: '3px 3px 0 #000' }}>
      <div className="flex flex-wrap items-center gap-1 text-[9px] text-yellow-300">{c.how}</div>
      <div className="mt-2 text-white">{c.what}</div>
      {c.note && <div className="mt-1 text-[7px] text-cyan-300">{c.note}</div>}
    </div>
  );
};

export default GymTips;
