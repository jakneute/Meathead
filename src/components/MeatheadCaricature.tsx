import React from 'react';

/** Title-screen portrait of Meathead. */
const MeatheadCaricature: React.FC = () => (
  <div className="relative w-36 h-44 md:w-40 md:h-48 mb-1.5 mx-auto drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">
    <svg viewBox="0 0 200 250" className="w-full h-full overflow-visible">
      {/* Background Energy Glow */}
      <defs>
        <radialGradient id="meatGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
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
        <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="125" r="90" fill="url(#meatGlow)" />

      {/* Trapezius Mountains */}
      <path d="M50 100 L75 60 L125 60 L150 100 Z" fill="#C68B45" stroke="#000" strokeWidth="4" />

      {/* Left Cannonball Delt & Bicep (Flexed) */}
      <g>
        {/* Delt */}
        <circle cx="42" cy="100" r="24" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" />
        {/* Bicep */}
        <path d="M22 100 C15 130 30 155 52 145 C65 135 60 110 50 100 Z" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" />
        {/* Bicep Vein */}
        <path d="M30 115 Q38 122 34 135" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Spiked Wristband */}
        <rect x="35" y="145" width="22" height="10" rx="2" fill="#18181B" stroke="#000" strokeWidth="3" transform="rotate(20 46 150)" />
        <circle cx="40" cy="151" r="2" fill="#E5E7EB" />
        <circle cx="48" cy="153" r="2" fill="#E5E7EB" />
        {/* Clenched Fist */}
        <circle cx="56" cy="164" r="14" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" />
        <path d="M48 160 L64 160 M48 165 L64 165 M48 170 L62 170" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Right Cannonball Delt & Bicep (Flexed) */}
      <g>
        {/* Delt */}
        <circle cx="158" cy="100" r="24" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" />
        {/* Bicep */}
        <path d="M178 100 C185 130 170 155 148 145 C135 135 140 110 150 100 Z" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" />
        {/* Bicep Vein */}
        <path d="M170 115 Q162 122 166 135" stroke="#DC2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Spiked Wristband */}
        <rect x="143" y="145" width="22" height="10" rx="2" fill="#18181B" stroke="#000" strokeWidth="3" transform="rotate(-20 154 150)" />
        <circle cx="152" cy="153" r="2" fill="#E5E7EB" />
        <circle cx="160" cy="151" r="2" fill="#E5E7EB" />
        {/* Clenched Fist */}
        <circle cx="144" cy="164" r="14" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" />
        <path d="M136 160 L152 160 M136 165 L152 165 M138 170 L152 170" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Torso & Abs Base */}
      <path d="M52 100 L62 190 L138 190 L148 100 Z" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" />

      {/* Bulging Pectorals */}
      {/* Left Pec */}
      <path d="M56 100 C56 130 96 135 98 105 C98 95 65 95 56 100 Z" fill="#F5D0A9" stroke="#000" strokeWidth="3.5" />
      <path d="M62 108 Q80 105 92 112" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Right Pec */}
      <path d="M144 100 C144 130 104 135 102 105 C102 95 135 95 144 100 Z" fill="#F5D0A9" stroke="#000" strokeWidth="3.5" />
      <path d="M138 108 Q120 105 108 112" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.5" />
      {/* Sternum Center Line */}
      <line x1="100" y1="95" x2="100" y2="185" stroke="#78350F" strokeWidth="3.5" />

      {/* Chiseled 6-Pack Abs */}
      <g>
        {/* Horizontal Ab Dividers */}
        <path d="M72 142 Q100 145 128 142" stroke="#78350F" strokeWidth="3" fill="none" />
        <path d="M74 162 Q100 165 126 162" stroke="#78350F" strokeWidth="3" fill="none" />
        {/* Ab Highlights */}
        <rect x="76" y="126" width="18" height="12" rx="3" fill="#F5D0A9" opacity="0.7" />
        <rect x="106" y="126" width="18" height="12" rx="3" fill="#F5D0A9" opacity="0.7" />
        <rect x="78" y="146" width="17" height="12" rx="3" fill="#F5D0A9" opacity="0.7" />
        <rect x="105" y="146" width="17" height="12" rx="3" fill="#F5D0A9" opacity="0.7" />
        <rect x="80" y="166" width="16" height="10" rx="3" fill="#F5D0A9" opacity="0.7" />
        <rect x="104" y="166" width="16" height="10" rx="3" fill="#F5D0A9" opacity="0.7" />
      </g>

      {/* Heavy Leather Weightlifting Belt */}
      <g>
        <rect x="58" y="186" width="84" height="20" rx="4" fill="url(#beltGrad)" stroke="#000" strokeWidth="4" />
        {/* Stitched Edges */}
        <line x1="62" y1="190" x2="138" y2="190" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="62" y1="202" x2="138" y2="202" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Massive Gold Buckle */}
        <rect x="85" y="183" width="30" height="26" rx="4" fill="url(#goldGrad)" stroke="#000" strokeWidth="3" />
        <rect x="91" y="189" width="18" height="14" rx="2" fill="#451A03" />
        <line x1="100" y1="184" x2="100" y2="208" stroke="#CA8A04" strokeWidth="4" />
        {/* Belt Holes / Rivets */}
        <circle cx="70" cy="196" r="2.5" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
        <circle cx="78" cy="196" r="2.5" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
        <circle cx="122" cy="196" r="2.5" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
        <circle cx="130" cy="196" r="2.5" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
      </g>

      {/* Navy Combat Pants & Legs */}
      <g>
        <path d="M60 206 L55 240 L95 240 L98 215 L102 215 L105 240 L145 240 L140 206 Z" fill="url(#pantsGrad)" stroke="#000" strokeWidth="4" />
        {/* Quad definition seams */}
        <line x1="72" y1="210" x2="68" y2="236" stroke="#1E40AF" strokeWidth="2" />
        <line x1="128" y1="210" x2="132" y2="236" stroke="#1E40AF" strokeWidth="2" />
        {/* Boots peek at bottom */}
        <rect x="52" y="238" width="44" height="12" rx="3" fill="#18181B" stroke="#000" strokeWidth="3" />
        <rect x="104" y="238" width="44" height="12" rx="3" fill="#18181B" stroke="#000" strokeWidth="3" />
        {/* Steel toes */}
        <rect x="84" y="240" width="12" height="9" rx="1" fill="#94A3B8" />
        <rect x="136" y="240" width="12" height="9" rx="1" fill="#94A3B8" />
      </g>

      {/* Head & Neck Base */}
      <path d="M82 68 L82 82 L118 82 L118 68 Z" fill="#C68B45" stroke="#000" strokeWidth="4" />

      {/* Sculpted Square Granite Jaw Head */}
      <path d="M70 28 L130 28 L132 60 L120 74 L80 74 L68 60 Z" fill="url(#skinGrad)" stroke="#000" strokeWidth="4" />

      {/* 5 O'clock Stubble */}
      <path d="M72 58 Q100 80 128 58 L122 72 L78 72 Z" fill="#B07D48" opacity="0.4" />

      {/* Flat-Top Military Buzzcut */}
      <path d="M66 28 L134 28 L134 16 L66 16 Z" fill="#18181B" stroke="#000" strokeWidth="4" />
      {/* Buzzcut Texture */}
      <line x1="72" y1="20" x2="128" y2="20" stroke="#3F3F46" strokeWidth="2" strokeDasharray="4 3" />
      {/* Shaved Fade Sides */}
      <rect x="66" y="28" width="6" height="18" fill="#27272A" />
      <rect x="128" y="28" width="6" height="18" fill="#27272A" />

      {/* Bulging Forehead Rage Vein */}
      <path d="M76 34 L82 38 L80 43" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Thick Menacing Eyebrows */}
      <polygon points="72,42 96,48 94,44 72,39" fill="#09090B" stroke="#000" strokeWidth="1.5" />
      <polygon points="128,42 104,48 106,44 128,39" fill="#09090B" stroke="#000" strokeWidth="1.5" />

      {/* Fierce Eyes */}
      <g>
        <ellipse cx="85" cy="48" rx="7" ry="4.5" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
        <ellipse cx="115" cy="48" rx="7" ry="4.5" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
        <circle cx="87" cy="48" r="3" fill="#DC2626" />
        <circle cx="113" cy="48" r="3" fill="#DC2626" />
        <circle cx="87" cy="48" r="1.5" fill="#000000" />
        <circle cx="113" cy="48" r="1.5" fill="#000000" />
        {/* Eye Shine */}
        <circle cx="88" cy="47" r="1" fill="#FFFFFF" />
        <circle cx="114" cy="47" r="1" fill="#FFFFFF" />
      </g>

      {/* Broad Nose */}
      <path d="M96 46 L98 55 L93 57 L107 57 L102 55 L104 46" fill="#C68B45" stroke="#000" strokeWidth="2" />

      {/* Snarl & Clenched Teeth */}
      <g>
        <rect x="80" y="61" width="40" height="9" rx="3" fill="#18181B" stroke="#000" strokeWidth="2.5" />
        <rect x="82" y="62" width="36" height="7" fill="#FFFFFF" rx="1" />
        {/* Tooth Dividers */}
        <line x1="88" y1="62" x2="88" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="94" y1="62" x2="94" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="100" y1="62" x2="100" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="106" y1="62" x2="106" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="112" y1="62" x2="112" y2="69" stroke="#18181B" strokeWidth="1.5" />
        <line x1="82" y1="65.5" x2="118" y2="65.5" stroke="#18181B" strokeWidth="1" />
      </g>
    </svg>
  </div>
);

export default MeatheadCaricature;
