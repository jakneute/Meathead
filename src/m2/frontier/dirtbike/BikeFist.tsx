// The HUD's weapon box on the dirt bike (Wilderness Land's chase): his bare fist, pixel style. No gun out here: he
// punches left and right.

import React from 'react';

const BikeFist: React.FC = () => (
  <svg viewBox="0 0 16 16" width={40} height={40} shapeRendering="crispEdges" className="inline-block">
    <rect x="3" y="5" width="10" height="7" fill="#1C1209" />
    <rect x="4" y="6" width="8" height="5" fill="#E0AC69" />
    <rect x="4" y="6" width="8" height="1" fill="#F5D0A9" />
    <rect x="6" y="6" width="1" height="3" fill="#C68B45" />
    <rect x="8" y="6" width="1" height="3" fill="#C68B45" />
    <rect x="10" y="6" width="1" height="3" fill="#C68B45" />
    <rect x="2" y="8" width="3" height="3" fill="#1C1209" />
    <rect x="3" y="8" width="2" height="2" fill="#E0AC69" />
    <rect x="5" y="11" width="6" height="3" fill="#09090B" />
  </svg>
);

export default BikeFist;
