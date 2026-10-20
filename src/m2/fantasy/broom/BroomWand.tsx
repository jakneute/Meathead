// The HUD's weapon box on the broomstick (Fairy Land's deathmatch): the LASER on the broom's end (the user's): the ash
// handle's tip in steps, a brass ferrule, the steel emitter clamped round it with its cooling fins, the pink lens and its
// glint, the beam out of it in steps and a sparkle at its end. Unlimited.

import React from 'react';

const INK = '#1A1028';

const BroomWand: React.FC = () => (
  <svg viewBox="0 0 16 16" width={40} height={40} shapeRendering="crispEdges" className="inline-block">
    {/* (the handle's end: ash in steps, a grain line) */}
    <rect x="0" y="8" width="4" height="4" fill={INK} />
    <rect x="0" y="9" width="4" height="2" fill="#A87440" />
    <rect x="0" y="9" width="4" height="1" fill="#E2B47A" />
    <rect x="1" y="10" width="2" height="1" fill="#5A3A1E" />
    {/* (the brass ferrule) */}
    <rect x="3" y="8" width="2" height="4" fill="#C8962A" />
    <rect x="3" y="8" width="1" height="4" fill="#FFF0A8" />
    {/* (the emitter: inked, steel in steps, its fins) */}
    <rect x="4" y="6" width="7" height="8" fill={INK} />
    <rect x="5" y="7" width="5" height="6" fill="#8A8AA0" />
    <rect x="5" y="7" width="5" height="1" fill="#D2D2E2" />
    <rect x="5" y="12" width="5" height="1" fill="#4A4A5C" />
    <rect x="6" y="5" width="1" height="10" fill={INK} />
    <rect x="8" y="5" width="1" height="10" fill={INK} />
    <rect x="6" y="6" width="1" height="1" fill="#AAAAC0" />
    <rect x="8" y="6" width="1" height="1" fill="#AAAAC0" />
    {/* (the lens, glowing, a glint) */}
    <rect x="11" y="7" width="2" height="6" fill={INK} />
    <rect x="11" y="8" width="1" height="4" fill="#F472B6" />
    <rect x="11" y="8" width="1" height="1" fill="#FFFFFF" />
    {/* (the beam, stepped, a sparkle at its end) */}
    <rect x="12" y="8" width="3" height="4" fill="#DB2777" />
    <rect x="12" y="9" width="3" height="2" fill="#F9A8D4" />
    <rect x="12" y="10" width="3" height="1" fill="#FFE4F2" />
    <rect x="15" y="9" width="1" height="2" fill="#FFFFFF" />
    <rect x="14" y="7" width="1" height="1" fill="#FFF6C8" />
    <rect x="14" y="12" width="1" height="1" fill="#FFF6C8" />
  </svg>
);

export default BroomWand;
