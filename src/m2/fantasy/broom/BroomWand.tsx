// The HUD's weapon box on the broomstick (Fairy Land's deathmatch): the LASER on the broom's end (the user's): a steel
// emitter clamped round the handle's tip, cooling rings, the pink lens, a beam out of it. Unlimited.

import React from 'react';

const INK = '#1A1028';

const BroomWand: React.FC = () => (
  <svg viewBox="0 0 16 16" width={40} height={40} shapeRendering="crispEdges" className="inline-block">
    {/* (the handle's end, wood) */}
    <rect x="0" y="8" width="5" height="3" fill={INK} />
    <rect x="0" y="9" width="5" height="1" fill="#B8864A" />
    {/* (the emitter: inked, steel in steps, the rings) */}
    <rect x="4" y="6" width="7" height="7" fill={INK} />
    <rect x="5" y="7" width="5" height="5" fill="#8A8AA0" />
    <rect x="5" y="7" width="5" height="1" fill="#CACADA" />
    <rect x="6" y="7" width="1" height="5" fill="#3A3A48" />
    <rect x="8" y="7" width="1" height="5" fill="#3A3A48" />
    {/* (the lens, glowing) */}
    <rect x="11" y="7" width="2" height="5" fill={INK} />
    <rect x="11" y="8" width="1" height="3" fill="#F472B6" />
    {/* (the beam) */}
    <rect x="12" y="9" width="4" height="1" fill="#FFE4F2" />
    <rect x="12" y="8" width="4" height="1" fill="#F472B6" />
    <rect x="12" y="10" width="4" height="1" fill="#F472B6" />
  </svg>
);

export default BroomWand;
