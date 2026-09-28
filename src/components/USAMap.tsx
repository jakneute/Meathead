import React from 'react';
import { BOSS_LOCATIONS, BossLocationData, StageInfo } from '../content/roster';

interface USAMapProps {
  selectedBossId: string;
  defeatedStages: string[];
  currentStages: StageInfo[];
  onSelectStage?: (stageId: string) => void;
}

const USAMap: React.FC<USAMapProps> = ({
  selectedBossId,
  defeatedStages,
  currentStages,
  onSelectStage
}) => {
  const activeLocation: BossLocationData = BOSS_LOCATIONS[selectedBossId] || {
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

      {/* SVG Map of the United States */}
      <div className="relative w-full aspect-[440/290] bg-[#03070d] border border-cyan-900/80 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Radar scan grid background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 255, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        <svg viewBox="0 0 440 290" className="w-full h-full select-none">
          <defs>
            {/* Radar gradient */}
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.12)" />
              <stop offset="100%" stopColor="rgba(3, 7, 13, 0)" />
            </radialGradient>
            
            {/* Blinking pin gradient */}
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFF00" />
              <stop offset="50%" stopColor="#FF0000" />
              <stop offset="100%" stopColor="rgba(255,0,0,0)" />
            </radialGradient>

            {/* Filter for glowing target */}
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background subtle radar circles */}
          <circle cx="220" cy="145" r="70" fill="none" stroke="rgba(0, 255, 255, 0.08)" strokeDasharray="3 3" />
          <circle cx="220" cy="145" r="130" fill="none" stroke="rgba(0, 255, 255, 0.08)" strokeDasharray="4 4" />
          <line x1="220" y1="10" x2="220" y2="280" stroke="rgba(0, 255, 255, 0.06)" strokeDasharray="2 2" />
          <line x1="10" y1="145" x2="430" y2="145" stroke="rgba(0, 255, 255, 0.06)" strokeDasharray="2 2" />

          {/* ========================================================= */}
          {/* MAINLAND UNITED STATES SILHOUETTE                         */}
          {/* ========================================================= */}
          <path
            d="
              M 42,38 
              L 54,38 L 96,38 L 148,38 L 210,38 L 244,28 L 258,38 L 274,44 L 296,50 L 316,52 L 324,72 L 340,76 L 360,64 L 380,54 L 396,42 L 416,32 L 432,40 L 426,55 L 416,78 L 422,84 L 410,92 L 412,102 L 398,106 L 394,120 L 388,134 L 396,152 L 382,168 L 368,180 L 358,195 L 360,206 L 368,226 L 372,242 L 372,260 L 362,236 L 352,218 L 335,210 L 312,212 L 298,226 L 270,216 L 254,218 L 235,236 L 236,252 L 218,220 L 195,226 L 168,198 L 130,184 L 82,182 L 74,168 L 62,154 L 44,122 L 36,95 L 42,38 Z
            "
            fill="#0f2336"
            stroke="#00E5FF"
            strokeWidth="1.75"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          />

          {/* Internal State/Regional Grid Dividers */}
          <g stroke="rgba(0, 229, 255, 0.2)" strokeWidth="0.8" fill="none" strokeDasharray="2 2">
            {/* West Coast border */}
            <path d="M 74,38 L 72,118 L 82,182" />
            <path d="M 72,90 L 102,90 L 102,142" />
            {/* Mountain / Desert borders */}
            <path d="M 124,38 L 122,125 L 172,125 L 170,186" />
            <path d="M 122,125 L 72,125" />
            {/* Midwest / Texas border */}
            <path d="M 172,38 L 172,125" />
            <path d="M 172,148 L 244,148 L 244,218" />
            {/* Mississippi river division */}
            <path d="M 284,48 L 280,105 L 294,165 L 298,226" />
            {/* Northeast corridor */}
            <path d="M 346,78 L 346,140 L 388,134" />
            <path d="M 335,210 L 346,140" />
          </g>

          {/* Great Lakes Water cutouts */}
          <g fill="#03070d" stroke="#00E5FF" strokeWidth="0.8" opacity="0.9">
            {/* Lake Superior */}
            <ellipse cx="278" cy="46" rx="16" ry="6" />
            {/* Lake Michigan */}
            <path d="M 302,56 Q 306,78 308,92 Q 303,92 298,72 Z" />
            {/* Lake Huron */}
            <ellipse cx="328" cy="62" rx="8" ry="10" />
            {/* Lake Erie */}
            <ellipse cx="348" cy="74" rx="11" ry="5" />
            {/* Lake Ontario */}
            <ellipse cx="372" cy="64" rx="9" ry="4" />
          </g>

          {/* ========================================================= */}
          {/* ALASKA INSET (AK) - Explicitly required                    */}
          {/* ========================================================= */}
          <g>
            {/* Inset Border Box */}
            <rect
              x="10"
              y="190"
              width="106"
              height="90"
              fill="#06121d"
              stroke="#00E5FF"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              rx="2"
            />
            {/* Box Header */}
            <rect x="10" y="190" width="106" height="13" fill="rgba(0, 229, 255, 0.2)" />
            <text
              x="14"
              y="200"
              fill="#00FFFF"
              fontSize="7"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="1"
            >
              INSET 01 // ALASKA (AK)
            </text>

            {/* Alaska Landmass */}
            <path
              d="
                M 18,228 
                L 26,218 L 38,210 L 64,208 L 84,212 L 96,218 L 98,244 L 92,254 L 84,248 L 74,258 L 68,244 L 56,242 L 50,256 L 42,266 L 36,258 L 44,248 L 34,244 L 24,248 L 22,238 Z
              "
              fill="#0f2336"
              stroke="#00E5FF"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Aleutian Islands dots */}
            <circle cx="28" cy="270" r="1.5" fill="#00E5FF" />
            <circle cx="22" cy="274" r="1.2" fill="#00E5FF" />
            <circle cx="16" cy="278" r="1" fill="#00E5FF" />
            {/* Alaska Panhandle */}
            <path d="M 92,254 L 98,266 L 102,274" stroke="#00E5FF" strokeWidth="1.2" fill="none" />
          </g>

          {/* ========================================================= */}
          {/* HAWAII INSET (HI) - Explicitly required                    */}
          {/* ========================================================= */}
          <g>
            {/* Inset Border Box */}
            <rect
              x="122"
              y="226"
              width="82"
              height="54"
              fill="#06121d"
              stroke="#00E5FF"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              rx="2"
            />
            {/* Box Header */}
            <rect x="122" y="226" width="82" height="13" fill="rgba(0, 229, 255, 0.2)" />
            <text
              x="126"
              y="235"
              fill="#00FFFF"
              fontSize="7"
              fontFamily="monospace"
              fontWeight="bold"
              letterSpacing="1"
            >
              INSET 02 // HAWAII (HI)
            </text>

            {/* Hawaiian Island Archipelago */}
            {/* Kauai */}
            <ellipse cx="134" cy="248" rx="3.5" ry="2.5" fill="#0f2336" stroke="#00E5FF" strokeWidth="1" />
            {/* Oahu (Honolulu) */}
            <ellipse cx="146" cy="252" rx="4" ry="3" fill="#0f2336" stroke="#00E5FF" strokeWidth="1" />
            {/* Molokai */}
            <line x1="154" y1="254" x2="160" y2="254" stroke="#00E5FF" strokeWidth="1.8" />
            {/* Maui */}
            <ellipse cx="165" cy="256" rx="4" ry="3" fill="#0f2336" stroke="#00E5FF" strokeWidth="1" />
            {/* Big Island (Hawaii / Hilo) */}
            <path
              d="M 172,260 L 178,258 L 184,264 L 182,274 L 174,272 Z"
              fill="#0f2336"
              stroke="#00E5FF"
              strokeWidth="1.2"
            />
          </g>

          {/* ========================================================= */}
          {/* BOSS PINS ON MAP                                          */}
          {/* ========================================================= */}
          {currentStages.map((st) => {
            const loc = BOSS_LOCATIONS[st.id];
            if (!loc) return null;
            const isSelected = st.id === selectedBossId;
            const isDefeated = defeatedStages.includes(st.id);

            // If not selected, render a subtle ping / pin
            if (!isSelected) {
              return (
                <g 
                  key={st.id} 
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => onSelectStage?.(st.id)}
                >
                  <circle
                    cx={loc.coords.x}
                    cy={loc.coords.y}
                    r={isDefeated ? 3 : 3.5}
                    fill={isDefeated ? "#4B5563" : "#00E5FF"}
                    stroke={isDefeated ? "#1F2937" : "#FFFFFF"}
                    strokeWidth="1"
                    opacity={isDefeated ? 0.6 : 0.85}
                  />
                  {isDefeated ? (
                    <text
                      x={loc.coords.x}
                      y={loc.coords.y + 2.5}
                      fill="#EF4444"
                      fontSize="6"
                      fontWeight="black"
                      textAnchor="middle"
                    >
                      ×
                    </text>
                  ) : null}
                  <text
                    x={loc.coords.x + 5}
                    y={loc.coords.y + 3}
                    fill={isDefeated ? "#6B7280" : "#94A3B8"}
                    fontSize="6"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {loc.stateCode}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* ========================================================= */}
          {/* ACTIVE BLINKING TARGET DOT & RETICLE                      */}
          {/* ========================================================= */}
          {activeLocation && (
            <g className="pointer-events-none">
              {/* Sonar / Radar Pinging Ring */}
              <circle
                cx={activeLocation.coords.x}
                cy={activeLocation.coords.y}
                r="14"
                fill="none"
                stroke="#FF3333"
                strokeWidth="2"
                className="animate-ping"
                style={{ transformOrigin: `${activeLocation.coords.x}px ${activeLocation.coords.y}px` }}
              />

              {/* Second outer pulsing ring */}
              <circle
                cx={activeLocation.coords.x}
                cy={activeLocation.coords.y}
                r="9"
                fill="none"
                stroke="#FACC15"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                className="animate-pulse"
              />

              {/* Crosshair lines */}
              <line
                x1={activeLocation.coords.x - 14}
                y1={activeLocation.coords.y}
                x2={activeLocation.coords.x - 5}
                y2={activeLocation.coords.y}
                stroke="#EF4444"
                strokeWidth="1.5"
              />
              <line
                x1={activeLocation.coords.x + 5}
                y1={activeLocation.coords.y}
                x2={activeLocation.coords.x + 14}
                y2={activeLocation.coords.y}
                stroke="#EF4444"
                strokeWidth="1.5"
              />
              <line
                x1={activeLocation.coords.x}
                y1={activeLocation.coords.y - 14}
                x2={activeLocation.coords.x}
                y2={activeLocation.coords.y - 5}
                stroke="#EF4444"
                strokeWidth="1.5"
              />
              <line
                x1={activeLocation.coords.x}
                y1={activeLocation.coords.y + 5}
                x2={activeLocation.coords.x}
                y2={activeLocation.coords.y + 14}
                stroke="#EF4444"
                strokeWidth="1.5"
              />

              {/* Core Blinking Dot */}
              <circle
                cx={activeLocation.coords.x}
                cy={activeLocation.coords.y}
                r="4.5"
                fill="#FF0000"
                stroke="#FFFF00"
                strokeWidth="1.5"
                filter="url(#neonGlow)"
                className="animate-pulse"
              />

              {/* Callout Tag attached with line */}
              {activeLocation.coords.x < 300 ? (
                <g>
                  <polyline
                    points={`
                      ${activeLocation.coords.x + 4},${activeLocation.coords.y - 4} 
                      ${activeLocation.coords.x + 20},${activeLocation.coords.y - 16} 
                      ${activeLocation.coords.x + 75},${activeLocation.coords.y - 16}
                    `}
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="1.2"
                  />
                  <rect
                    x={activeLocation.coords.x + 20}
                    y={activeLocation.coords.y - 27}
                    width="55"
                    height="10"
                    fill="rgba(0,0,0,0.85)"
                    stroke="#FACC15"
                    strokeWidth="0.8"
                  />
                  <text
                    x={activeLocation.coords.x + 22}
                    y={activeLocation.coords.y - 19}
                    fill="#FFFF00"
                    fontSize="6.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    TARGET LOCKED
                  </text>
                </g>
              ) : (
                <g>
                  <polyline
                    points={`
                      ${activeLocation.coords.x - 4},${activeLocation.coords.y - 4} 
                      ${activeLocation.coords.x - 20},${activeLocation.coords.y - 16} 
                      ${activeLocation.coords.x - 75},${activeLocation.coords.y - 16}
                    `}
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="1.2"
                  />
                  <rect
                    x={activeLocation.coords.x - 75}
                    y={activeLocation.coords.y - 27}
                    width="55"
                    height="10"
                    fill="rgba(0,0,0,0.85)"
                    stroke="#FACC15"
                    strokeWidth="0.8"
                  />
                  <text
                    x={activeLocation.coords.x - 73}
                    y={activeLocation.coords.y - 19}
                    fill="#FFFF00"
                    fontSize="6.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    TARGET LOCKED
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>

        {/* Scanline CRT overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none animate-pulse" />
      </div>

      {/* ========================================================= */}
      {/* DIRECTLY UNDERNEATH: CITY AND STATE (User requirement)    */}
      {/* ========================================================= */}
      <div className="w-full mt-2 bg-black/90 border-t-2 border-yellow-400/80 pt-2 px-1 flex flex-col gap-1">
        {/* City and State */}
        <div className="flex items-baseline justify-between border-b border-gray-800 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-red-500 font-mono text-[9px] font-black uppercase tracking-wider">
              LOCATION:
            </span>
            <span className="text-yellow-400 font-black text-[12px] md:text-[13px] tracking-wide uppercase [text-shadow:1px_1px_0_black]">
              {activeLocation.city}, {activeLocation.state}
            </span>
          </div>
          <span className="text-cyan-400 font-mono text-[8px] font-bold tracking-tight">
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
              {isCurrentDefeated ? 'ELIMINATED' : 'ACTIVE THREAT'}
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
            {isCurrentDefeated ? 'ALREADY DEAD // PICK ANOTHER' : 'ENTER / (A) / CLICK: LOCK IN'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default USAMap;
