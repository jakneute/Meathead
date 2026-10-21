// The HUD's weapon box while he's the cat (the cartoon White House): the HAIRBALL in the ray gun's place: a wet wad of
// gray-brown fur in steps, tufts sticking out of it, a shine of spit, a drool drop and a loose hair trailing.

import React from 'react';

const INK = '#1A1028';

export const HAIRBALL_ART: React.ReactNode = <HairballSvg size={40} />;

/** At any size (the pause menu's arsenal and its close-up, the weapon wheel). */
export function HairballSvg({ size }: { size: number }) {
  return (
  <svg viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" className="inline-block">
    {/* (the ink round it, tufts poking out) */}
    <rect x="4" y="3" width="8" height="10" fill={INK} />
    <rect x="3" y="4" width="10" height="8" fill={INK} />
    <rect x="6" y="2" width="1" height="1" fill={INK} />
    <rect x="11" y="3" width="1" height="1" fill={INK} />
    <rect x="13" y="7" width="1" height="1" fill={INK} />
    <rect x="2" y="9" width="1" height="1" fill={INK} />
    {/* (the wad, in steps: shadow, fur, the lit side) */}
    <rect x="4" y="4" width="8" height="8" fill="#6B5B4E" />
    <rect x="5" y="4" width="5" height="5" fill="#8A7766" />
    <rect x="5" y="5" width="3" height="2" fill="#B9AC9C" />
    <rect x="9" y="9" width="3" height="3" fill="#4A3F37" />
    <rect x="4" y="10" width="2" height="2" fill="#4A3F37" />
    <rect x="7" y="8" width="1" height="2" fill="#4A3F37" />
    {/* (the spit's shine) */}
    <rect x="5" y="5" width="2" height="1" fill="#FFFFFF" />
    {/* (a drool drop, a loose hair) */}
    <rect x="12" y="12" width="1" height="2" fill="#D7F2F7" />
    <rect x="13" y="10" width="2" height="1" fill="#4A3F37" />
    <rect x="1" y="6" width="2" height="1" fill="#4A3F37" />
  </svg>
  );
}
