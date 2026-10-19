// The HUD's weapon box on the dirt bike (Wilderness Land's chase): his bare fist, Genesis style (inked round, the
// knuckles stepped from shine to shadow, the thumb across, a scrape). No gun out here: he punches left and right.

import React from 'react';

const INK = '#140C06';
const SK = ['#7A4220', '#A86630', '#E0AC69', '#EEC48E', '#F8DCB4'];

const BikeFist: React.FC = () => (
  <svg viewBox="0 0 16 16" width={40} height={40} shapeRendering="crispEdges" className="inline-block">
    {/* (the ink round it) */}
    <rect x="2" y="3" width="12" height="10" fill={INK} />
    <rect x="1" y="6" width="2" height="6" fill={INK} />
    <rect x="4" y="13" width="8" height="2" fill={INK} />
    {/* (the four knuckles, lit along their tops, the creases between) */}
    <rect x="3" y="4" width="10" height="5" fill={SK[2]} />
    <rect x="3" y="4" width="10" height="1" fill={SK[4]} />
    <rect x="3" y="5" width="10" height="1" fill={SK[3]} />
    <rect x="5" y="4" width="1" height="4" fill={SK[1]} />
    <rect x="8" y="4" width="1" height="4" fill={SK[1]} />
    <rect x="11" y="4" width="1" height="4" fill={SK[1]} />
    <rect x="3" y="8" width="10" height="1" fill={SK[1]} />
    {/* (the thumb across, the heel of the hand, the wrist) */}
    <rect x="2" y="7" width="7" height="3" fill={SK[3]} />
    <rect x="2" y="7" width="7" height="1" fill={SK[4]} />
    <rect x="8" y="8" width="1" height="2" fill={SK[0]} />
    <rect x="3" y="10" width="10" height="2" fill={SK[2]} />
    <rect x="9" y="10" width="4" height="2" fill={SK[1]} />
    <rect x="5" y="12" width="6" height="1" fill={SK[0]} />
    {/* (a scrape across the knuckles) */}
    <rect x="9" y="5" width="2" height="1" fill="#B91C1C" />
  </svg>
);

export default BikeFist;
