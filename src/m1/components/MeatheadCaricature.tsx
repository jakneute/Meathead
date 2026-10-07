import React from 'react';

/**
 * Title-screen portrait of Meathead: double-biceps flex, snarling, veins popping. Head to boots, in his proportions
 * (legs as long as his torso, thick through the thighs). `shitty`: the shitty pants cheat's on, and it shows: the seat
 * and the inside of his legs gone brown, runs down to his boots, the stink coming up off him, flies.
 */
const MeatheadCaricature: React.FC<{ shitty?: boolean }> = ({ shitty = false }) => (
  <div className="relative w-[124px] h-[186px] md:w-[136px] md:h-[204px] mb-1.5 mx-auto drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">
    <svg viewBox="0 0 200 300" className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id="meatGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D0A9" />
          <stop offset="50%" stopColor="#E0AC69" />
          <stop offset="100%" stopColor="#C68B45" />
        </linearGradient>
        {/* Muscle bulges: lit at the top-front, falling into shadow */}
        <radialGradient id="bulge" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FBE3C4" />
          <stop offset="45%" stopColor="#E0AC69" />
          <stop offset="100%" stopColor="#A86E32" />
        </radialGradient>
        <linearGradient id="trapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D69A55" />
          <stop offset="100%" stopColor="#9C6530" />
        </linearGradient>
        <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3F3F46" />
          <stop offset="100%" stopColor="#09090B" />
        </linearGradient>
        <pattern id="stubble" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="#5B3413" opacity="0.55" />
          <circle cx="3" cy="3" r="0.5" fill="#5B3413" opacity="0.45" />
        </pattern>
        <style>{`
          .mh-rays { transform-origin: 100px 125px; animation: mh-spin 30s linear infinite; }
          .mh-breathe { transform-origin: 100px 190px; animation: mh-breathe 2.6s ease-in-out infinite; }
          .mh-vein { animation: mh-throb 0.9s ease-in-out infinite; }
          .mh-glint { animation: mh-glint 3.2s steps(1) infinite; }
          @keyframes mh-spin { to { transform: rotate(360deg); } }
          @keyframes mh-breathe { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.012, 1.02); } }
          @keyframes mh-throb { 0%, 100% { stroke-width: 2.2; } 50% { stroke-width: 3.4; } }
          @keyframes mh-glint { 0%, 88% { opacity: 0; } 90%, 96% { opacity: 1; } }
          .mh-stink { animation: mh-stink 2.4s linear infinite; }
          .mh-stink2 { animation: mh-stink 2.4s linear infinite; animation-delay: -1.2s; }
          @keyframes mh-stink { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 0.8; } 100% { transform: translateY(-46px); opacity: 0; } }
          .mh-fly { animation: mh-fly 1.1s linear infinite; }
          .mh-fly2 { animation: mh-fly 1.4s linear infinite reverse; }
          @keyframes mh-fly { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </defs>

      {/* Background: glow and a slow burst of rays */}
      <circle cx="100" cy="125" r="92" fill="url(#meatGlow)" />
      <g className="mh-rays" opacity="0.18">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M100 125 L96 20 L104 20 Z" fill="#FCA5A5" transform={`rotate(${i * 30} 100 125)`} />
        ))}
      </g>

      <g className="mh-breathe">
        {/* Lats flaring out behind the torso */}
        <path d="M48 104 L30 150 L62 178 Z M152 104 L170 150 L138 178 Z" fill="#9C6530" stroke="#000" strokeWidth="4" strokeLinejoin="round" />

        {/* Trapezius mountains */}
        <path d="M50 100 L76 58 L124 58 L150 100 Z" fill="url(#trapGrad)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <path d="M78 64 L62 92 M122 64 L138 92" stroke="#7C4A1E" strokeWidth="2" strokeLinecap="round" />

        {/* Left arm: cannonball delt, peaked bicep, forearm, fist */}
        <g>
          <circle cx="42" cy="100" r="24" fill="url(#bulge)" stroke="#000" strokeWidth="4" />
          <path d="M28 92 Q40 84 54 90 M26 102 Q38 96 52 100" stroke="#B07436" strokeWidth="1.8" fill="none" opacity="0.8" />
          <path d="M22 100 C15 130 30 155 52 145 C65 135 60 110 50 100 Z" fill="url(#bulge)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="33" cy="116" rx="6" ry="9" fill="#FBE3C4" opacity="0.55" />
          <path d="M44 138 Q52 132 55 120" stroke="#A86E32" strokeWidth="2" fill="none" />
          <path d="M30 115 Q38 122 34 135" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" className="mh-vein" />
          <path d="M34 125 Q29 130 30 137" stroke="#DC2626" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <rect x="35" y="145" width="22" height="10" rx="2" fill="#18181B" stroke="#000" strokeWidth="3" transform="rotate(20 46 150)" />
          <path d="M39 147 l1.5 -4 l1.5 4 M47 150 l1.5 -4 l1.5 4" fill="#E5E7EB" stroke="#000" strokeWidth="0.8" />
          <circle cx="56" cy="164" r="14" fill="url(#bulge)" stroke="#000" strokeWidth="4" />
          <path d="M48 160 L64 160 M48 165 L64 165 M48 170 L62 170" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <path d="M50 156 Q56 153 62 156" stroke="#FBE3C4" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Right arm */}
        <g>
          <circle cx="158" cy="100" r="24" fill="url(#bulge)" stroke="#000" strokeWidth="4" />
          <path d="M172 92 Q160 84 146 90 M174 102 Q162 96 148 100" stroke="#B07436" strokeWidth="1.8" fill="none" opacity="0.8" />
          <path d="M178 100 C185 130 170 155 148 145 C135 135 140 110 150 100 Z" fill="url(#bulge)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="163" cy="116" rx="6" ry="9" fill="#FBE3C4" opacity="0.55" />
          <path d="M156 138 Q148 132 145 120" stroke="#A86E32" strokeWidth="2" fill="none" />
          <path d="M170 115 Q162 122 166 135" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" className="mh-vein" />
          <path d="M166 125 Q171 130 170 137" stroke="#DC2626" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <rect x="143" y="145" width="22" height="10" rx="2" fill="#18181B" stroke="#000" strokeWidth="3" transform="rotate(-20 154 150)" />
          <path d="M149 150 l1.5 -4 l1.5 4 M157 147 l1.5 -4 l1.5 4" fill="#E5E7EB" stroke="#000" strokeWidth="0.8" />
          <circle cx="144" cy="164" r="14" fill="url(#bulge)" stroke="#000" strokeWidth="4" />
          <path d="M136 160 L152 160 M136 165 L152 165 M138 170 L152 170" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <path d="M138 156 Q144 153 150 156" stroke="#FBE3C4" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* Torso */}
        <path d="M52 100 L62 190 L138 190 L148 100 Z" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        {/* Serratus and obliques */}
        <path d="M62 132 l8 3 M63 140 l8 3 M64 148 l8 3 M138 132 l-8 3 M137 140 l-8 3 M136 148 l-8 3" stroke="#A86E32" strokeWidth="2" strokeLinecap="round" />
        <path d="M66 160 Q70 175 68 188 M134 160 Q130 175 132 188" stroke="#A86E32" strokeWidth="2.5" fill="none" />

        {/* Pecs */}
        <path d="M56 100 C56 130 96 135 98 105 C98 95 65 95 56 100 Z" fill="url(#bulge)" stroke="#000" strokeWidth="3.5" />
        <path d="M144 100 C144 130 104 135 102 105 C102 95 135 95 144 100 Z" fill="url(#bulge)" stroke="#000" strokeWidth="3.5" />
        <path d="M62 108 Q80 105 92 112 M138 108 Q120 105 108 112" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M60 124 Q78 131 96 122 M140 124 Q122 131 104 122" stroke="#8A5424" strokeWidth="2.5" fill="none" opacity="0.7" />
        <line x1="100" y1="95" x2="100" y2="185" stroke="#78350F" strokeWidth="3.5" />

        {/* Six-pack */}
        <g>
          <path d="M72 142 Q100 145 128 142" stroke="#78350F" strokeWidth="3" fill="none" />
          <path d="M74 162 Q100 165 126 162" stroke="#78350F" strokeWidth="3" fill="none" />
          <rect x="76" y="126" width="18" height="12" rx="4" fill="#F5D0A9" opacity="0.75" />
          <rect x="106" y="126" width="18" height="12" rx="4" fill="#F5D0A9" opacity="0.75" />
          <rect x="78" y="146" width="17" height="12" rx="4" fill="#F5D0A9" opacity="0.75" />
          <rect x="105" y="146" width="17" height="12" rx="4" fill="#F5D0A9" opacity="0.75" />
          <rect x="80" y="166" width="16" height="10" rx="4" fill="#F5D0A9" opacity="0.75" />
          <rect x="104" y="166" width="16" height="10" rx="4" fill="#F5D0A9" opacity="0.75" />
          {/* Sweat sheen */}
          <circle cx="82" cy="129" r="1.6" fill="#FFFFFF" opacity="0.8" />
          <circle cx="112" cy="149" r="1.3" fill="#FFFFFF" opacity="0.7" />
          <circle cx="70" cy="108" r="2" fill="#FFFFFF" opacity="0.7" />
          <circle cx="126" cy="106" r="1.5" fill="#FFFFFF" opacity="0.6" />
        </g>
      </g>

      {/* Weightlifting belt */}
      <g>
        <rect x="58" y="186" width="84" height="20" rx="4" fill="url(#beltGrad)" stroke="#000" strokeWidth="4" />
        <line x1="62" y1="190" x2="138" y2="190" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="62" y1="202" x2="138" y2="202" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
        <rect x="85" y="183" width="30" height="26" rx="4" fill="url(#goldGrad)" stroke="#000" strokeWidth="3" />
        <rect x="91" y="189" width="18" height="14" rx="2" fill="#451A03" />
        <line x1="100" y1="184" x2="100" y2="208" stroke="#CA8A04" strokeWidth="4" />
        <path d="M88 186 L96 186" stroke="#FEFCE8" strokeWidth="2" strokeLinecap="round" />
        <circle cx="70" cy="196" r="2.5" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
        <circle cx="78" cy="196" r="2.5" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
        <circle cx="122" cy="196" r="2.5" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
        <circle cx="130" cy="196" r="2.5" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
      </g>

      {/* Combat pants: legs as long as his torso, quads bulging through them, a knee, then down to the boots */}
      <g>
        <path d="M60 204 C49 222 50 242 58 254 L61 280 L93 280 L94 254 C96 240 97 228 98 218 Q100 214 102 218 C103 228 104 240 106 254 L107 280 L139 280 L142 254 C150 242 151 222 140 204 Z" fill="url(#pantsGrad)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        {/* Quad sweep, the knee creases, the outer seams */}
        <path d="M58 218 Q66 236 64 250 M142 218 Q134 236 136 250" stroke="#1E40AF" strokeWidth="2.5" fill="none" />
        <path d="M60 256 Q72 260 86 256 M140 256 Q128 260 114 256" stroke="#0B1330" strokeWidth="2" fill="none" />
        <path d="M60 262 L62 278 M140 262 L138 278" stroke="#1E40AF" strokeWidth="2" />
        {/* Cargo pockets on the thighs */}
        <rect x="72" y="224" width="16" height="14" rx="1.5" fill="none" stroke="#0B1330" strokeWidth="1.5" />
        <rect x="112" y="224" width="16" height="14" rx="1.5" fill="none" stroke="#0B1330" strokeWidth="1.5" />
        <path d="M72 228 h16 M112 228 h16" stroke="#0B1330" strokeWidth="1.2" />
        {/* Boots: laced, a thick sole, the steel toes */}
        <rect x="55" y="278" width="42" height="16" rx="3" fill="#18181B" stroke="#000" strokeWidth="3" />
        <rect x="103" y="278" width="42" height="16" rx="3" fill="#18181B" stroke="#000" strokeWidth="3" />
        <path d="M61 281 l4 3 M67 281 l4 3 M73 281 l4 3 M107 281 l4 3 M113 281 l4 3 M119 281 l4 3" stroke="#71717A" strokeWidth="1.2" />
        <rect x="55" y="291" width="42" height="4" fill="#09090B" />
        <rect x="103" y="291" width="42" height="4" fill="#09090B" />
        <rect x="84" y="280" width="12" height="10" rx="1" fill="#94A3B8" />
        <rect x="132" y="280" width="12" height="10" rx="1" fill="#94A3B8" />
        <path d="M86 282 h4 M134 282 h4" stroke="#F1F5F9" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* The shitty pants cheat: the seat and the insides of his legs gone brown, runs down to his boots, the stink, flies */}
      {shitty && <g>
        {/* a wet brown blotch soaked through round the crotch and up under the belt, spreading down the insides of his thighs */}
        <path d="M84 207 Q92 205 99 208 Q107 204 116 207 Q121 214 115 219 Q118 226 110 230 Q106 236 104 244 Q102 238 100 222 Q98 238 96 244 Q94 236 90 230 Q82 226 85 219 Q79 214 84 207 Z" fill="#6B4423" opacity="0.8" />
        <path d="M89 210 Q99 208 111 210 Q113 216 106 220 Q100 222 94 220 Q87 216 89 210 Z" fill="#4A2E14" opacity="0.75" />
        <path d="M87 222 Q84 226 88 229 M113 222 Q116 226 112 229" stroke="#4A2E14" strokeWidth="2" fill="none" opacity="0.6" />
        {/* runs down the insides of both legs to the boots */}
        <path d="M96 240 Q95 252 95 262 Q94 270 95 276 M92 232 Q90 242 91 250 M104 240 Q105 252 105 264 Q106 271 105 277 M108 232 Q110 240 109 248" stroke="#5C3A1A" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.9" />
        <circle cx="91" cy="251" r="1.8" fill="#5C3A1A" /><circle cx="109" cy="249" r="1.8" fill="#5C3A1A" />
        <ellipse cx="95" cy="278" rx="3" ry="1.6" fill="#5C3A1A" /><ellipse cx="105" cy="279" rx="3" ry="1.6" fill="#5C3A1A" />
        <path d="M88 209 Q93 207 98 208" stroke="#8B5A2B" strokeWidth="1.5" fill="none" opacity="0.7" />
        {/* the stink, coming up off him */}
        <g className="mh-stink"><path d="M40 236 q-5 -6 0 -12 q5 -6 0 -12 M160 236 q5 -6 0 -12 q-5 -6 0 -12" stroke="#84CC16" strokeWidth="2.5" fill="none" strokeLinecap="round" /></g>
        <g className="mh-stink2"><path d="M52 250 q-5 -6 0 -12 q5 -6 0 -12 M148 250 q5 -6 0 -12 q-5 -6 0 -12" stroke="#A3E635" strokeWidth="2" fill="none" strokeLinecap="round" /></g>
        {/* flies, going round his backside */}
        <g style={{ transformOrigin: '100px 226px' }} className="mh-fly"><circle cx="128" cy="218" r="2" fill="#09090B" /><path d="M127 216 l-2 -3 M129 216 l2 -3" stroke="#CBD5E1" strokeWidth="1" /></g>
        <g style={{ transformOrigin: '100px 230px' }} className="mh-fly2"><circle cx="70" cy="236" r="2" fill="#09090B" /><path d="M69 234 l-2 -3 M71 234 l2 -3" stroke="#CBD5E1" strokeWidth="1" /></g>
      </g>}

      {/* Neck: thick as a tree trunk */}
      <path d="M80 66 L78 84 L122 84 L120 66 Z" fill="#C68B45" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
      <path d="M86 72 L90 82 M114 72 L110 82" stroke="#9C6530" strokeWidth="2" strokeLinecap="round" />

      {/* Ears */}
      <path d="M68 40 Q60 42 62 52 Q64 58 69 56 Z" fill="#D69A55" stroke="#000" strokeWidth="3" />
      <path d="M132 40 Q140 42 138 52 Q136 58 131 56 Z" fill="#D69A55" stroke="#000" strokeWidth="3" />

      {/* Granite jaw */}
      <path d="M70 28 L130 28 L132 60 L120 74 L80 74 L68 60 Z" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
      {/* Cheekbones and jaw shadow */}
      <path d="M72 54 Q78 60 84 58 M128 54 Q122 60 116 58" stroke="#A86E32" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72 58 Q100 80 128 58 L122 72 L78 72 Z" fill="#B07D48" opacity="0.35" />
      <path d="M72 58 Q100 80 128 58 L122 72 L78 72 Z" fill="url(#stubble)" />
      {/* Chin cleft */}
      <path d="M100 68 L100 73" stroke="#8A5424" strokeWidth="2" strokeLinecap="round" />
      {/* Forehead highlight */}
      <path d="M86 31 Q100 29 114 31" stroke="#FBE3C4" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />

      {/* Flat-top */}
      <path d="M66 28 L134 28 L134 14 L66 14 Z" fill="url(#hairGrad)" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
      <path d="M70 14 v-2 M76 14 v-3 M82 14 v-2 M88 14 v-3 M94 14 v-2 M100 14 v-3 M106 14 v-2 M112 14 v-3 M118 14 v-2 M124 14 v-3 M130 14 v-2" stroke="#18181B" strokeWidth="2" />
      <line x1="72" y1="19" x2="128" y2="19" stroke="#52525B" strokeWidth="2" strokeDasharray="4 3" />
      <rect x="66" y="28" width="6" height="18" fill="#27272A" />
      <rect x="128" y="28" width="6" height="18" fill="#27272A" />

      {/* Rage vein */}
      <path d="M76 33 L82 37 L79 43" stroke="#DC2626" fill="none" strokeLinecap="round" strokeLinejoin="round" className="mh-vein" />

      {/* Brows with a heavy ridge shadow */}
      <path d="M72 45 Q84 50 97 49 M128 45 Q116 50 103 49" stroke="#A86E32" strokeWidth="2.5" fill="none" opacity="0.7" />
      <polygon points="71,42 97,49 95,43 71,38" fill="#09090B" stroke="#000" strokeWidth="1.5" />
      <polygon points="129,42 103,49 105,43 129,38" fill="#09090B" stroke="#000" strokeWidth="1.5" />

      {/* Eyes */}
      <g>
        <ellipse cx="85" cy="49" rx="7" ry="4" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
        <ellipse cx="115" cy="49" rx="7" ry="4" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
        <circle cx="87" cy="49" r="3" fill="#DC2626" />
        <circle cx="113" cy="49" r="3" fill="#DC2626" />
        <circle cx="87" cy="49" r="1.5" fill="#000000" />
        <circle cx="113" cy="49" r="1.5" fill="#000000" />
        <circle cx="88" cy="48" r="1" fill="#FFFFFF" />
        <circle cx="114" cy="48" r="1" fill="#FFFFFF" />
        {/* Bloodshot */}
        <path d="M79 49 l3 -1 M121 49 l-3 -1" stroke="#EF4444" strokeWidth="0.8" />
        {/* Lower lids */}
        <path d="M79 53 Q85 55 91 53 M109 53 Q115 55 121 53" stroke="#A86E32" strokeWidth="1.5" fill="none" />
        {/* Menacing glint */}
        <path d="M116 44 l1 3 l3 1 l-3 1 l-1 3 l-1 -3 l-3 -1 l3 -1 Z" fill="#FFFFFF" className="mh-glint" />
      </g>

      {/* Broad nose */}
      <path d="M96 47 L98 55 L93 57 L107 57 L102 55 L104 47" fill="#C68B45" stroke="#000" strokeWidth="2" strokeLinejoin="round" />
      <path d="M95 57 Q97 55 99 57 M101 57 Q103 55 105 57" stroke="#5B3413" strokeWidth="1.5" fill="none" />

      {/* Snarl: lip curled up on one side over clenched teeth */}
      <g>
        <path d="M79 61 L121 59 L121 70 L80 70 Z" fill="#18181B" stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M82 62 L118 60.5 L118 69 L82 69 Z" fill="#FFFFFF" />
        <line x1="88" y1="61.7" x2="88" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="94" y1="61.4" x2="94" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="100" y1="61.1" x2="100" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="106" y1="60.8" x2="106" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="112" y1="60.5" x2="112" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="82" y1="65.5" x2="118" y2="65" stroke="#18181B" strokeWidth="1" />
        {/* Canine */}
        <path d="M113 60.6 L115 64 L117 60.5 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="0.8" />
        {/* Snarl crease */}
        <path d="M121 58 Q126 61 124 67" stroke="#8A5424" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>

      {/* Sweat drop off the temple */}
      <path d="M137 34 Q140 40 137 43 Q134 40 137 34 Z" fill="#7DD3FC" stroke="#0C4A6E" strokeWidth="1" />
    </svg>
  </div>
);

export default MeatheadCaricature;
