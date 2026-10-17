// The helicopter's homing rockets on the main HUD's PWR row (right of the boost's cell): one little missile per
// charge, lit when it's ready, dim and filling in (tail to nose) while it comes back.

import React from 'react';

const Missile: React.FC<{ fill: number }> = ({ fill }) => {
  const ready = fill >= 1, w = Math.round(14 * Math.max(0, Math.min(1, fill)));
  const body = (on: boolean) => (
    <>
      <rect x={2} y={3} width={11} height={4} fill={on ? '#E5E7EB' : '#52525B'} />
      <rect x={2} y={3} width={11} height={1} fill={on ? '#FFFFFF' : '#71717A'} />
      <rect x={2} y={6} width={11} height={1} fill={on ? '#9CA3AF' : '#3F3F46'} />
      <rect x={13} y={3} width={2} height={4} fill={on ? '#B91C1C' : '#7F1D1D'} />
      <rect x={13} y={3} width={1} height={1} fill={on ? '#F87171' : '#7F1D1D'} />
      <rect x={15} y={4} width={1} height={2} fill={on ? '#B91C1C' : '#7F1D1D'} />
      <rect x={7} y={3} width={1} height={4} fill={on ? '#1D4ED8' : '#3F3F46'} />
      <rect x={0} y={1} width={3} height={2} fill={on ? '#52525B' : '#3F3F46'} />
      <rect x={0} y={7} width={3} height={2} fill={on ? '#52525B' : '#3F3F46'} />
    </>
  );
  return (
    <svg viewBox="0 0 16 10" width={24} height={15} shapeRendering="crispEdges" style={{ imageRendering: 'pixelated', filter: ready ? 'drop-shadow(0 0 3px rgba(250,204,21,0.7))' : 'none' }}>
      {body(false)}
      {/* (the one coming back: lit in from the tail as it refills) */}
      {(ready || w > 0) && <svg x={0} y={0} width={ready ? 16 : w} height={10} viewBox={`0 0 ${ready ? 16 : w} 10`} opacity={ready ? 1 : 0.55}>{body(true)}</svg>}
    </svg>
  );
};

const HeliRockets: React.FC<{ charges: number }> = ({ charges }) => (
  <div className="flex gap-[2px] ml-1">
    {[0, 1, 2].map(i => <Missile key={i} fill={Math.max(0, Math.min(1, charges - i))} />)}
  </div>
);

export default HeliRockets;
