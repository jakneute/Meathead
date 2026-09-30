import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { Prompt } from './ButtonIcons';
import { BOSS_LOCATIONS, BossLocationData, StageInfo } from '../content/roster';
import { GARAGE_MAP } from '../content/garage';
import { MAP_PATHS, AK_BOX, HI_BOX } from '../content/mapGeo';

/**
 * One line of text at one size for every city: the size the longest of them needs to fit on the one line (so switching
 * between cities never jumps between one line and two, or between sizes).
 */
const FitLine: React.FC<{ text: string; fitTo: string; max: number; min?: number; className?: string }> = ({ text, fitTo, max, min = 7, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(max);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const shown = el.textContent;
    el.textContent = fitTo;
    let s = max;
    el.style.fontSize = `${s}px`;
    while (s > min && el.scrollWidth > el.clientWidth) { s -= 0.5; el.style.fontSize = `${s}px`; }
    el.textContent = shown;
    setSize(s);
  }, [fitTo, max, min]);
  return <span ref={ref} className={`block whitespace-nowrap overflow-hidden ${className ?? ''}`} style={{ fontSize: size }}>{text}</span>;
};
/** The longest place name on the map (what the location line's sized for). */
const LONGEST_PLACE = Object.values(BOSS_LOCATIONS).map(l => `${l.city}, ${l.state}`).sort((a, b) => b.length - a.length)[0] ?? '';

interface USAMapProps {
  selectedBossId: string;
  defeatedStages: string[];
  currentStages: StageInfo[];
  onSelectStage?: (stageId: string) => void;
  /** The garage is what's picked (its signal wanders the map), and picking it from the map. */
  garage?: boolean;
  onSelectGarage?: () => void;
}

const USAMap: React.FC<USAMapProps> = ({
  selectedBossId,
  defeatedStages,
  currentStages,
  onSelectStage,
  garage,
  onSelectGarage,
}) => {
  // The garage's signal: never in the same place twice
  const [gq, setGq] = useState({ x: 230, y: 110 });
  useEffect(() => {
    if (!garage) return;
    const id = setInterval(() => setGq({ x: 70 + Math.random() * 320, y: 55 + Math.random() * 135 }), 900);
    return () => clearInterval(id);
  }, [garage]);
  const activeLocation: BossLocationData = garage ? {
    city: GARAGE_MAP.place, state: '???', stateCode: '??', region: GARAGE_MAP.region, coords: gq,
    coordinatesText: GARAGE_MAP.coords, threatBrief: GARAGE_MAP.brief,
  } : BOSS_LOCATIONS[selectedBossId] || {
    city: 'UNKNOWN',
    state: 'USA',
    stateCode: 'US',
    region: 'NORTH AMERICA',
    coords: { x: 220, y: 150 },
    coordinatesText: "00°00'N 00°00'W",
    threatBrief: 'UNKNOWN TARGET HAZARD'
  };

  const isCurrentDefeated = defeatedStages.includes(selectedBossId);

  return (
    <div className="w-full flex flex-col items-center bg-[#070d14]/95 border-2 border-cyan-500/80 p-2.5 shadow-[0_0_30px_rgba(0,255,255,0.25)] rounded-sm text-left relative overflow-hidden">
      {/* Tactical radar header bar */}
      <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-cyan-500/40">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_6px_rgba(0,255,255,0.8)]">
            US TACTICAL RECON RADAR
          </span>
        </div>
        <div className="text-[8px] font-mono text-cyan-300/80 tracking-tighter uppercase">
          SAT-LINK // NORAD FEED
        </div>
      </div>

      {/* The map: the real outlines, a dotted ocean, lat/long lines, state lines, the insets, the pins */}
      <div className="relative w-full aspect-[440/290] bg-[#02060c] border border-cyan-900/80 overflow-hidden shadow-inner">
        <svg viewBox="0 0 440 290" className="w-full h-full select-none" fontFamily="'Press Start 2P', monospace">
          <defs>
            <pattern id="ocean-dots" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.45" fill="#0E7490" />
            </pattern>
            <pattern id="land-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="4" stroke="#22D3EE" strokeWidth="0.35" opacity="0.18" />
            </pattern>
            <linearGradient id="land-fill" x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#123247" />
              <stop offset="100%" stopColor="#0A1C2B" />
            </linearGradient>
            <radialGradient id="ocean-vignette" cx="50%" cy="45%" r="70%">
              <stop offset="55%" stopColor="rgba(2,6,12,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.75)" />
            </radialGradient>
            <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(250,204,21,0)" />
              <stop offset="100%" stopColor="rgba(250,204,21,0.35)" />
            </linearGradient>
          </defs>

          {/* Ocean */}
          <rect width="440" height="290" fill="#02060c" />
          <rect width="440" height="290" fill="url(#ocean-dots)" opacity="0.55" />
          <g stroke="#22D3EE" strokeWidth="0.45" fill="none" opacity="0.13">
            {MAP_PATHS.graticule.map((d, i) => <path key={i} d={d} strokeDasharray="1.5 2" />)}
          </g>

          {/* The lower 48: a glow along the coast, the land, its hatching, the state lines, the lakes */}
          <path d={MAP_PATHS.lower48} fill="none" stroke="#22D3EE" strokeWidth="4" opacity="0.18" strokeLinejoin="round" />
          <path d={MAP_PATHS.lower48} fill="url(#land-fill)" />
          <path d={MAP_PATHS.lower48} fill="url(#land-hatch)" />
          <g stroke="#67E8F9" strokeWidth="0.5" fill="none" opacity="0.28" strokeDasharray="2 1.4">
            {MAP_PATHS.borders.map((d, i) => <path key={i} d={d} />)}
          </g>
          <path d={MAP_PATHS.lower48} fill="none" stroke="#22D3EE" strokeWidth="1.1" strokeLinejoin="round" />
          <g fill="#02060c" stroke="#22D3EE" strokeWidth="0.6" strokeLinejoin="round">
            {MAP_PATHS.lakes.map((d, i) => <path key={i} d={d} />)}
          </g>

          {/* The insets */}
          {[{ box: AK_BOX, label: 'INSET 01 // AK' }, { box: HI_BOX, label: 'INSET 02 // HI' }].map(({ box, label }) => (
            <g key={label}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="#030b13" stroke="#22D3EE" strokeWidth="0.9" strokeDasharray="4 2" />
              <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="url(#ocean-dots)" opacity="0.4" />
              <rect x={box.x} y={box.y} width={box.w} height="11" fill="rgba(34,211,238,0.16)" />
              <text x={box.x + 3} y={box.y + 7.8} fill="#67E8F9" fontSize="4.6">{label}</text>
            </g>
          ))}
          <path d={MAP_PATHS.alaska} fill="url(#land-fill)" stroke="#22D3EE" strokeWidth="1" strokeLinejoin="round" />
          <path d={MAP_PATHS.alaska} fill="url(#land-hatch)" />
          {MAP_PATHS.aleutians.filter(p => p.x > AK_BOX.x + 3 && p.y < AK_BOX.y + AK_BOX.h - 2).map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={1.1 - i * 0.1} fill="#22D3EE" />)}
          {MAP_PATHS.hawaii.map((d, i) => <path key={i} d={d} fill="url(#land-fill)" stroke="#22D3EE" strokeWidth="0.9" strokeLinejoin="round" />)}

          {/* Corner brackets and the compass */}
          <g stroke="#FACC15" strokeWidth="1.4" fill="none" opacity="0.8">
            <path d="M3,14 V3 H14" /><path d="M426,3 H437 V14" /><path d="M437,276 V287 H426" /><path d="M14,287 H3 V276" />
          </g>
          <g transform="translate(418 196)" opacity="0.85">
            <circle r="10" fill="rgba(2,6,12,0.8)" stroke="#22D3EE" strokeWidth="0.6" />
            <path d="M0,-8 L2.4,0 L0,-1.6 L-2.4,0 Z" fill="#F87171" />
            <path d="M0,8 L2.4,0 L0,1.6 L-2.4,0 Z" fill="#67E8F9" />
            <text y="-11.5" fill="#E2E8F0" fontSize="4.5" textAnchor="middle">N</text>
          </g>
          <g transform="translate(330 284)" fill="#67E8F9" fontSize="3.8">
            <rect width="40" height="1.6" fill="#22D3EE" /><rect width="10" height="1.6" fill="#02060c" x="10" /><rect width="10" height="1.6" fill="#02060c" x="30" />
            <text x="44" y="2">500 MI</text>
          </g>
          <text x="232" y="286" fill="#155E75" fontSize="3.8">CONUS // {currentStages.length - defeatedStages.filter(id => currentStages.some(s => s.id === id)).length} LIVE CONTACTS</text>

          {/* Radar round the target: rings and a sweep going round */}
          {activeLocation && (
            <g className="pointer-events-none" data-noraster="1">
              {[18, 34, 50].map(r => (
                <circle key={r} cx={activeLocation.coords.x} cy={activeLocation.coords.y} r={r} fill="none" stroke="#FACC15" strokeWidth="0.5" strokeDasharray="1.5 2.5" opacity={0.5 - r / 140} />
              ))}
              <g>
                <path d={`M${activeLocation.coords.x},${activeLocation.coords.y} L${activeLocation.coords.x + 50},${activeLocation.coords.y} A50,50 0 0,0 ${activeLocation.coords.x + 50 * Math.cos(0.7)},${activeLocation.coords.y - 50 * Math.sin(0.7)} Z`}
                  fill="url(#sweep)" />
                <animateTransform attributeName="transform" type="rotate" from={`0 ${activeLocation.coords.x} ${activeLocation.coords.y}`}
                  to={`-360 ${activeLocation.coords.x} ${activeLocation.coords.y}`} dur="3s" repeatCount="indefinite" />
              </g>
            </g>
          )}

          {/* The bosses: a marker and the town's name for each; the dead ones struck off */}
          {currentStages.map((st) => {
            const loc = BOSS_LOCATIONS[st.id];
            if (!loc) return null;
            const isSelected = st.id === selectedBossId && !garage;
            const isDefeated = defeatedStages.includes(st.id);
            const { x, y } = loc.coords;
            const labelLeft = x > 330;
            return (
              <g key={st.id} className="cursor-pointer" onClick={() => onSelectStage?.(st.id)}>
                <rect x={x - 3.2} y={y - 3.2} width="6.4" height="6.4" transform={`rotate(45 ${x} ${y})`}
                  fill={isDefeated ? '#1F2937' : isSelected ? '#EF4444' : '#FACC15'} stroke={isDefeated ? '#6B7280' : '#FFFFFF'} strokeWidth="0.8" />
                {isDefeated && <path d={`M${x - 3.5},${y - 3.5} L${x + 3.5},${y + 3.5} M${x + 3.5},${y - 3.5} L${x - 3.5},${y + 3.5}`} stroke="#EF4444" strokeWidth="1.2" />}
                {!isDefeated && !isSelected && (
                  <circle cx={x} cy={y} r="4" fill="none" stroke="#FACC15" strokeWidth="0.6">
                    <animate attributeName="r" values="4;9;4" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={labelLeft ? x - 6 : x + 6} y={y + 1.8} textAnchor={labelLeft ? 'end' : 'start'} fontSize="4.2"
                  fill={isDefeated ? '#6B7280' : isSelected ? '#FDE047' : '#CBD5E1'} textDecoration={isDefeated ? 'line-through' : undefined}
                  stroke="#02060c" strokeWidth="1.4" paintOrder="stroke">
                  {loc.city}
                </text>
              </g>
            );
          })}

          {/* The garage, when it's the one picked: a question mark that won't sit still */}
          {garage && (
            <text x={gq.x} y={gq.y + 6} textAnchor="middle" fontSize={16}
              fill="#FACC15" stroke="#02060c" strokeWidth="1.5" paintOrder="stroke" style={{ cursor: 'pointer', transition: 'x 0.25s, y 0.25s' }}
              onClick={() => onSelectGarage?.()}>?</text>
          )}

          {/* The locked target: a reticle closing in and turning, and the tag */}
          {activeLocation && (() => {
            const { x, y } = activeLocation.coords;
            const tagRight = x < 300;
            const tx = tagRight ? x + 18 : x - 18 - 62;
            return (
              <g className="pointer-events-none">
                <g stroke="#EF4444" strokeWidth="1.3" fill="none">
                  <path d={`M${x - 11},${y - 6} V${y - 11} H${x - 6} M${x + 6},${y - 11} H${x + 11} V${y - 6} M${x + 11},${y + 6} V${y + 11} H${x + 6} M${x - 6},${y + 11} H${x - 11} V${y + 6}`} />
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`90 ${x} ${y}`} dur="1.6s" repeatCount="indefinite" />
                </g>
                <line x1={x - 16} y1={y} x2={x - 7} y2={y} stroke="#EF4444" strokeWidth="0.7" />
                <line x1={x + 7} y1={y} x2={x + 16} y2={y} stroke="#EF4444" strokeWidth="0.7" />
                <line x1={x} y1={y - 16} x2={x} y2={y - 7} stroke="#EF4444" strokeWidth="0.7" />
                <line x1={x} y1={y + 7} x2={x} y2={y + 16} stroke="#EF4444" strokeWidth="0.7" />
                <circle cx={x} cy={y} r="5.5" fill="#EF4444" opacity="0.3" />
                <circle cx={x} cy={y} r="3.2" fill="#FF1F1F" stroke="#FDE047" strokeWidth="1">
                  <animate attributeName="opacity" values="1;0.35;1" dur="0.8s" repeatCount="indefinite" />
                </circle>
                <polyline points={`${x + (tagRight ? 4 : -4)},${y - 4} ${x + (tagRight ? 14 : -14)},${y - 16} ${tx + (tagRight ? 0 : 62)},${y - 16}`} fill="none" stroke="#FACC15" strokeWidth="0.9" />
                <rect x={tx} y={y - 24} width="62" height="10" fill="rgba(0,0,0,0.9)" stroke="#FACC15" strokeWidth="0.8" />
                <rect x={tx} y={y - 24} width="3" height="10" fill="#FACC15" />
                <text x={tx + 6} y={y - 17} fill="#FDE047" fontSize="4.6">{garage ? 'SIGNAL ???' : isCurrentDefeated ? 'ELIMINATED' : 'TARGET LOCKED'}</text>
              </g>
            );
          })()}

          <rect width="440" height="290" fill="url(#ocean-vignette)" pointerEvents="none" />
        </svg>

        {/* CRT scanlines, and a slow bright band rolling down them */}
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)' }} />
        <div className="absolute inset-x-0 top-0 h-1/4 pointer-events-none bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-[mapscan_5s_linear_infinite] will-change-transform" />
        <style>{'@keyframes mapscan { from { transform: translateY(-100%); } to { transform: translateY(400%); } }'}</style>
      </div>

      {/* ========================================================= */}
      {/* DIRECTLY UNDERNEATH: CITY AND STATE (User requirement)    */}
      {/* ========================================================= */}
      <div className="w-full mt-2 bg-black/90 border-t-2 border-yellow-400/80 pt-2 px-1 flex flex-col gap-1">
        {/* City and State: always the one line, the same size and height for every city */}
        <div className="flex items-center gap-2 h-[24px] border-b border-gray-800 pb-1">
          <span className="shrink-0 text-red-500 font-mono text-[9px] font-black uppercase tracking-wider">
            LOCATION:
          </span>
          <FitLine
            text={`${activeLocation.city}, ${activeLocation.state}`}
            fitTo={LONGEST_PLACE}
            max={13}
            className="flex-1 min-w-0 text-yellow-400 font-black tracking-wide uppercase leading-none [text-shadow:1px_1px_0_black]"
          />
          <span className="shrink-0 text-cyan-400 font-mono text-[8px] font-bold tracking-tight">
            [{activeLocation.coordinatesText}]
          </span>
        </div>

        {/* Target Boss & Threat Profile */}
        <div className="flex flex-col gap-0.5 text-[8px] font-mono leading-tight">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">
              TARGET: <strong className="text-white uppercase">{selectedBossId}</strong>
            </span>
            <span className={`font-black uppercase px-1 py-0.2 rounded-sm ${
              isCurrentDefeated 
                ? 'bg-red-950 text-red-400 border border-red-800' 
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse'
            }`}>
              {garage ? 'UNVERIFIED' : isCurrentDefeated ? 'ELIMINATED' : 'ACTIVE THREAT'}
            </span>
          </div>
          <div className="text-gray-400 truncate">
            DOSSIER: <span className="text-cyan-200">{activeLocation.threatBrief}</span>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="mt-1 pt-1 border-t border-gray-900 flex items-center justify-between text-[7.5px] font-mono text-gray-500">
          <span>{activeLocation.region}</span>
          <span className="text-yellow-500/90 font-bold uppercase animate-pulse">
            {isCurrentDefeated ? 'ALREADY DEAD // PICK ANOTHER' : <Prompt pad={['OK']} kb={['ENTER']} mouse="left" label="LOCK IN" size={13} />}
          </span>
        </div>
      </div>
    </div>
  );
};

export default USAMap;
