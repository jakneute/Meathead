// The ticket, up close, at the window (intro/index.ts): what Meathead slaps down on the counter. Clean, it's a ticket:
// HAPPY LAND, ONE DAY, ADMIT ONE, stars and stripes. Shitty, it's the same ticket, brown, damp, buzzing. Naked, there's
// no ticket: his hand, slapping his bare hip where the pocket was.

import React from 'react';

const Ticket: React.FC<{ shitty: boolean }> = ({ shitty }) => (
  <svg viewBox="0 0 320 150" width={480} height={225} style={{ imageRendering: 'pixelated', transform: 'rotate(-4deg)' }}>
    {/* the stub's punched edge, the paper */}
    <rect x="6" y="6" width="308" height="138" fill="#1A0B06" />
    <rect x="10" y="10" width="300" height="130" fill="#FEF9EC" />
    {Array.from({ length: 13 }, (_, i) => <circle key={i} cx={232} cy={14 + i * 10} r={2.4} fill="#1A0B06" />)}
    {/* stripes down the left, stars on blue */}
    <rect x="10" y="10" width="44" height="130" fill="#1E3A8A" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x="54" y={10 + i * 22} width="10" height="11" fill="#B91C1C" />)}
    {Array.from({ length: 9 }, (_, i) => <text key={i} x={18 + (i % 3) * 12} y={30 + Math.floor(i / 3) * 40} fontSize="10" fill="#FDE047">★</text>)}
    <text x="146" y="44" fontSize="20" fontFamily='"Press Start 2P"' fill="#EC4899" textAnchor="middle">HAPPY</text>
    <text x="146" y="68" fontSize="20" fontFamily='"Press Start 2P"' fill="#EC4899" textAnchor="middle">LAND</text>
    <text x="146" y="90" fontSize="8" fontFamily='"Press Start 2P"' fill="#1E3A8A" textAnchor="middle">ONE DAY ADMISSION</text>
    <text x="146" y="106" fontSize="8" fontFamily='"Press Start 2P"' fill="#B91C1C" textAnchor="middle">ADMIT ONE</text>
    <text x="146" y="128" fontSize="5" fontFamily='"Press Start 2P"' fill="#78716C" textAnchor="middle">NON-REFUNDABLE. NON-TRANSFERABLE. GOD BLESS.</text>
    {/* the stub: a barcode */}
    {Array.from({ length: 22 }, (_, i) => <rect key={i} x={244 + i * 3} y="30" width={i % 3 ? 1 : 2} height="80" fill="#1A0B06" />)}
    <text x="276" y="128" fontSize="6" fontFamily='"Press Start 2P"' fill="#1A0B06" textAnchor="middle">No. 000001</text>
    {shitty && (
      <g>
        {/* soaked through: brown, darker where it's thickest, a damp edge, a fly or two, stink coming off it */}
        <ellipse cx="190" cy="92" rx="88" ry="44" fill="rgba(92, 58, 22, 0.75)" />
        <ellipse cx="160" cy="104" rx="50" ry="26" fill="rgba(70, 42, 14, 0.85)" />
        <ellipse cx="250" cy="60" rx="30" ry="18" fill="rgba(92, 58, 22, 0.6)" />
        <rect x="132" y="118" width="6" height="24" fill="rgba(70, 42, 14, 0.85)" />
        <circle cx="135" cy="144" r="4" fill="rgba(70, 42, 14, 0.85)" />
        <rect x="110" y="96" width="14" height="3" fill="rgba(200, 160, 100, 0.5)" />
        <circle cx="96" cy="40" r="3" fill="#0B0B0F" /><rect x="91" y="35" width="4" height="2" fill="#E2E8F0" /><rect x="97" y="35" width="4" height="2" fill="#E2E8F0" />
        <circle cx="270" cy="30" r="3" fill="#0B0B0F" /><rect x="265" y="25" width="4" height="2" fill="#E2E8F0" /><rect x="271" y="25" width="4" height="2" fill="#E2E8F0" />
        {[180, 205, 230].map((x, i) => <path key={i} d={`M ${x} 4 q 6 -8 0 -16 q -6 -8 0 -16`} stroke="rgba(132, 155, 60, 0.85)" strokeWidth="3" fill="none" />)}
      </g>
    )}
  </svg>
);

/** No ticket: his big hand slapping his bare hip, where his pocket was. */
const NoTicket: React.FC = () => (
  <svg viewBox="0 0 320 150" width={480} height={225} style={{ imageRendering: 'pixelated' }}>
    <rect x="0" y="0" width="320" height="150" fill="#E0AC69" />
    <rect x="0" y="0" width="320" height="22" fill="#C68B45" />
    {/* leg hair, his bare hip */}
    {Array.from({ length: 40 }, (_, i) => <rect key={i} x={(i * 53) % 310} y={30 + ((i * 37) % 110)} width="2" height="5" fill="rgba(60, 35, 15, 0.6)" />)}
    {/* where the pocket would be: nothing */}
    <rect x="90" y="40" width="120" height="70" fill="none" stroke="rgba(60, 35, 15, 0.35)" strokeWidth="3" strokeDasharray="8 6" />
    {/* the hand, slapping it */}
    <g transform="translate(150 60) rotate(-12)">
      <rect x="-50" y="-26" width="100" height="56" rx="18" fill="#D99A58" stroke="#1A0B06" strokeWidth="4" />
      {[-30, -10, 10, 30].map(x => <rect key={x} x={x - 8} y="-46" width="16" height="30" rx="7" fill="#D99A58" stroke="#1A0B06" strokeWidth="4" />)}
      <rect x="-60" y="0" width="22" height="32" rx="9" fill="#D99A58" stroke="#1A0B06" strokeWidth="4" transform="rotate(-30 -50 10)" />
      <rect x="-50" y="22" width="100" height="10" fill="#09090B" />
    </g>
    {[60, 250].map(x => <text key={x} x={x} y="40" fontSize="22" fontFamily='"Press Start 2P"' fill="#FFFFFF" stroke="#1A0B06" strokeWidth="1">*</text>)}
    <text x="160" y="140" fontSize="10" fontFamily='"Press Start 2P"' fill="#7F1D1D" textAnchor="middle">SLAP</text>
  </svg>
);

const TicketCard: React.FC<{ kind: 'clean' | 'shitty' | 'nude' }> = ({ kind }) => (
  <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.25), rgba(0,0,0,0.7))' }}>
    <div style={{ border: '4px solid #1A0B06', boxShadow: '6px 6px 0 #000', background: '#1A0B06' }}>
      {kind === 'nude' ? <NoTicket /> : <Ticket shitty={kind === 'shitty'} />}
    </div>
  </div>
);

export default TicketCard;
