import React from 'react';

/** SVG head-shot of each boss for the stage select cards. */
const BossPortrait: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'Artie Avalanche':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Glacier background */}
          <rect width="100" height="100" fill="#0D1B2A" />
          <path d="M0 25 L35 0 L65 30 L100 5 L100 100 L0 100 Z" fill="#1B2631" opacity="0.6" />
          <polygon points="10,20 18,12 24,24 16,30" fill="#2E86C1" opacity="0.5" />
          <polygon points="78,15 88,8 94,22 84,26" fill="#5DADE2" opacity="0.4" />
          
          {/* Ice armor shoulders */}
          <path d="M10 100 L25 70 L45 85 L20 100 Z" fill="#1B4F72" stroke="#2E86C1" strokeWidth="1.5" />
          <path d="M90 100 L75 70 L55 85 L80 100 Z" fill="#1B4F72" stroke="#2E86C1" strokeWidth="1.5" />
          <polygon points="12,75 22,50 30,72" fill="#5DADE2" stroke="#EBF5FB" strokeWidth="1" />
          <polygon points="88,75 78,50 70,72" fill="#5DADE2" stroke="#EBF5FB" strokeWidth="1" />

          {/* White fur hood collar */}
          <ellipse cx="50" cy="58" rx="36" ry="30" fill="#E5E8E8" stroke="#BDC3C7" strokeWidth="2" />
          <path d="M22 62 Q30 50 36 64 Q42 48 50 64 Q58 48 64 64 Q70 50 78 62 Q68 85 50 85 Q32 85 22 62 Z" fill="#BDC3C7" />

          {/* Frosty Face */}
          <ellipse cx="50" cy="50" rx="23" ry="22" fill="#90CAF9" stroke="#1B4F72" strokeWidth="1.5" />

          {/* Ice horns / Glacier Crown */}
          <polygon points="34,35 15,10 38,24" fill="#2E86C1" stroke="#EBF5FB" strokeWidth="1.5" />
          <polygon points="26,24 18,12 34,22" fill="#AED6F1" />
          <polygon points="66,35 85,10 62,24" fill="#2E86C1" stroke="#EBF5FB" strokeWidth="1.5" />
          <polygon points="74,24 82,12 66,22" fill="#AED6F1" />
          <polygon points="42,28 50,14 58,28" fill="#5DADE2" stroke="#EBF5FB" strokeWidth="1.5" />

          {/* Fierce Frost Brows */}
          <path d="M30 42 L46 47 L44 39 Z" fill="#EBF5FB" stroke="#1B4F72" strokeWidth="1" />
          <path d="M70 42 L54 47 L56 39 Z" fill="#EBF5FB" stroke="#1B4F72" strokeWidth="1" />

          {/* Glowing Cold Eyes */}
          <ellipse cx="39" cy="47" rx="5" ry="3.5" fill="#00FFFF" />
          <ellipse cx="61" cy="47" rx="5" ry="3.5" fill="#00FFFF" />
          <ellipse cx="39" cy="47" rx="2" ry="2" fill="#FFFFFF" />
          <ellipse cx="61" cy="47" rx="2" ry="2" fill="#FFFFFF" />

          {/* Snarl & Sharp Teeth */}
          <path d="M37 57 Q50 54 63 57 Q50 67 37 57 Z" fill="#154360" stroke="#0B2027" strokeWidth="1" />
          <polygon points="40,57 43,63 46,57" fill="#FFFFFF" />
          <polygon points="54,57 57,63 60,57" fill="#FFFFFF" />
          <polygon points="45,64 48,58 51,64" fill="#EBF5FB" />
          {/* Frost breath */}
          <circle cx="56" cy="67" r="2.5" fill="#EBF5FB" opacity="0.6" />
          <circle cx="63" cy="70" r="4" fill="#EBF5FB" opacity="0.4" />
        </svg>
      );
    case 'Victor Volcano':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Dark fiery cavern backdrop */}
          <rect width="100" height="100" fill="#1A0602" />
          <circle cx="20" cy="20" r="1.5" fill="#FF5722" opacity="0.8" />
          <circle cx="85" cy="30" r="1.5" fill="#FFD700" opacity="0.7" />
          <circle cx="75" cy="15" r="2" fill="#FF3D00" opacity="0.6" />
          <circle cx="15" cy="70" r="1" fill="#FFEB3B" opacity="0.9" />

          {/* Obsidian magma shoulders */}
          <path d="M5 100 L25 68 L48 85 L20 100 Z" fill="#261614" stroke="#C62828" strokeWidth="2" />
          <path d="M95 100 L75 68 L52 85 L80 100 Z" fill="#261614" stroke="#C62828" strokeWidth="2" />
          {/* Glowing magma fissures in shoulders */}
          <path d="M18 78 L26 72 L23 85" stroke="#FF5722" strokeWidth="2" fill="none" />
          <path d="M82 78 L74 72 L77 85" stroke="#FF5722" strokeWidth="2" fill="none" />

          {/* Molten chest core */}
          <path d="M35 88 L50 78 L65 88 L50 98 Z" fill="#FF5722" stroke="#FFD700" strokeWidth="1.5" />

          {/* Volcanic Crag Head & Neck */}
          <ellipse cx="50" cy="52" rx="24" ry="23" fill="#3E1A11" stroke="#C62828" strokeWidth="2" />

          {/* Obsidian Horns / Chimneys */}
          <polygon points="26,38 12,12 36,26" fill="#1A0A07" stroke="#FF5722" strokeWidth="1.5" />
          <polygon points="74,38 88,12 64,26" fill="#1A0A07" stroke="#FF5722" strokeWidth="1.5" />
          <polygon points="40,28 50,14 60,28" fill="#261614" stroke="#FF5722" strokeWidth="1" />
          {/* Chimney smoke */}
          <ellipse cx="14" cy="9" rx="3" ry="2" fill="#5D4037" opacity="0.5" />
          <ellipse cx="86" cy="9" rx="3" ry="2" fill="#5D4037" opacity="0.5" />

          {/* Magma forehead crack */}
          <path d="M48 24 L52 35 L44 41 L56 46" stroke="#FFD700" strokeWidth="2" fill="none" />
          <path d="M50 35 L62 38" stroke="#FF5722" strokeWidth="1.5" fill="none" />

          {/* Blazing Magma Eyes */}
          <path d="M30 43 L45 47 L43 40 Z" fill="#C62828" />
          <path d="M70 43 L55 47 L57 40 Z" fill="#C62828" />
          <ellipse cx="38" cy="48" rx="5" ry="3.5" fill="#FFD700" />
          <ellipse cx="62" cy="48" rx="5" ry="3.5" fill="#FFD700" />
          <ellipse cx="38" cy="48" rx="2" ry="2" fill="#FFFFFF" />
          <ellipse cx="62" cy="48" rx="2" ry="2" fill="#FFFFFF" />

          {/* Burning Magma Jaw */}
          <path d="M36 60 Q50 56 64 60 Q50 72 36 60 Z" fill="#1A0A07" stroke="#C62828" strokeWidth="1.5" />
          <path d="M38 60 Q50 63 62 60" stroke="#FF5722" strokeWidth="3" fill="none" />
          <polygon points="42,59 45,64 48,59" fill="#FFD700" />
          <polygon points="52,59 55,64 58,59" fill="#FFD700" />
        </svg>
      );
    case 'Ernie Earthquake':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Subterranean rift backdrop */}
          <rect width="100" height="100" fill="#1C1C1C" />
          <path d="M0 40 L30 60 L15 100" stroke="#3E2723" strokeWidth="2" fill="none" />
          <path d="M100 20 L75 50 L90 85" stroke="#3E2723" strokeWidth="2" fill="none" />
          <polygon points="8,15 14,8 20,18" fill="#5D4037" opacity="0.7" />
          <polygon points="84,80 92,72 96,88" fill="#4E342E" opacity="0.6" />

          {/* Layered Bedrock shoulders */}
          <path d="M5 100 L18 64 L48 78 L20 100 Z" fill="#5D4037" stroke="#3E2723" strokeWidth="2" />
          <path d="M95 100 L82 64 L52 78 L80 100 Z" fill="#5D4037" stroke="#3E2723" strokeWidth="2" />
          <path d="M12 75 L28 72 L38 82" stroke="#271B17" strokeWidth="2" fill="none" />
          <path d="M88 75 L72 72 L62 82" stroke="#271B17" strokeWidth="2" fill="none" />

          {/* Chiseled Stone Head & Juggernaut Jaw */}
          <path d="M26 35 L74 35 L76 65 L66 82 L34 82 L24 65 Z" fill="#795548" stroke="#3E2723" strokeWidth="2.5" />

          {/* Tectonic Plate Helmet Crest */}
          <path d="M22 35 L50 18 L78 35 L68 42 L50 32 L32 42 Z" fill="#4E342E" stroke="#271B17" strokeWidth="2" />
          <polygon points="44,18 50,10 56,18" fill="#8D6E63" stroke="#271B17" strokeWidth="1.5" />

          {/* Faultline Gold fissure */}
          <path d="M36 28 L42 38 L38 46 L44 54" stroke="#FFB300" strokeWidth="2" fill="none" />

          {/* Heavy Stone Brow */}
          <rect x="30" y="44" width="40" height="7" fill="#3E2723" />

          {/* Glowing Amber Tectonic Eyes */}
          <rect x="36" y="52" width="8" height="6" rx="1" fill="#FFB300" />
          <rect x="56" y="52" width="8" height="6" rx="1" fill="#FFB300" />
          <rect x="39" y="54" width="3" height="3" fill="#FFF8E1" />
          <rect x="59" y="54" width="3" height="3" fill="#FFF8E1" />

          {/* Colossal Granite Sledge-Jaw & Blocky Teeth */}
          <rect x="34" y="65" width="32" height="13" fill="#4E342E" stroke="#271B17" strokeWidth="1.5" />
          <rect x="38" y="68" width="6" height="6" fill="#D7CCC8" stroke="#271B17" strokeWidth="1" />
          <rect x="44" y="68" width="6" height="6" fill="#D7CCC8" stroke="#271B17" strokeWidth="1" />
          <rect x="50" y="68" width="6" height="6" fill="#D7CCC8" stroke="#271B17" strokeWidth="1" />
          <rect x="56" y="68" width="6" height="6" fill="#D7CCC8" stroke="#271B17" strokeWidth="1" />
        </svg>
      );
    case 'Hector Hurricane':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Tempest Sky & Lightning */}
          <rect width="100" height="100" fill="#0E2F44" />
          <path d="M10 20 Q50 0 90 25" stroke="#16A085" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M5 80 Q60 50 95 75" stroke="#16A085" strokeWidth="2" fill="none" opacity="0.3" />
          {/* Lightning flash */}
          <path d="M82 5 L74 22 L84 25 L72 45" stroke="#FFFF00" strokeWidth="1.5" fill="none" />

          {/* Turbine Aero Shoulders */}
          <path d="M8 100 L22 68 L48 85 L18 100 Z" fill="#117A65" stroke="#0E4B40" strokeWidth="2" />
          <path d="M92 100 L78 68 L52 85 L82 100 Z" fill="#117A65" stroke="#0E4B40" strokeWidth="2" />
          {/* Turbine vents */}
          <circle cx="22" cy="76" r="6" fill="#34495E" stroke="#00FFFF" strokeWidth="1" />
          <circle cx="78" cy="76" r="6" fill="#34495E" stroke="#00FFFF" strokeWidth="1" />

          {/* Wind-blown pilot scarf */}
          <path d="M35 72 Q50 82 65 72 Q75 88 50 86 Q25 88 35 72 Z" fill="#F39C12" stroke="#B9770E" strokeWidth="1" />

          {/* Aviator Helmet & Cowl */}
          <path d="M26 45 Q26 20 50 20 Q74 20 74 45 L70 70 L30 70 Z" fill="#16A085" stroke="#0E4B40" strokeWidth="2" />

          {/* Aerodynamic Wing Fins */}
          <polygon points="26,38 8,28 24,50" fill="#48C9B0" stroke="#0E4B40" strokeWidth="1" />
          <polygon points="74,38 92,28 76,50" fill="#48C9B0" stroke="#0E4B40" strokeWidth="1" />

          {/* Face */}
          <path d="M32 46 L68 46 L64 68 L36 68 Z" fill="#F5CBA7" stroke="#0E4B40" strokeWidth="1" />

          {/* Glowing Cyan Aviator Goggles */}
          <rect x="27" y="38" width="46" height="14" rx="4" fill="#2C3E50" stroke="#0E4B40" strokeWidth="2" />
          <rect x="30" y="40" width="18" height="10" rx="2" fill="#00FFFF" />
          <rect x="52" y="40" width="18" height="10" rx="2" fill="#00FFFF" />
          <polygon points="32,41 38,41 34,49 31,49" fill="#E0F7FA" />
          <polygon points="54,41 60,41 56,49 53,49" fill="#E0F7FA" />

          {/* Cocky Smirk */}
          <path d="M42 58 Q54 62 60 56" stroke="#78281F" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'Toxic Tommy':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Biohazard Sewer Drain Backdrop */}
          <rect width="100" height="100" fill="#091A0D" />
          <circle cx="50" cy="50" r="46" stroke="#1E8449" strokeWidth="3" fill="none" opacity="0.3" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="#1E8449" strokeWidth="2" opacity="0.3" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="#1E8449" strokeWidth="2" opacity="0.3" />

          {/* Acid tank on shoulder */}
          <rect x="12" y="35" width="16" height="35" rx="3" fill="#4B5563" stroke="#111" strokeWidth="1.5" />
          <rect x="14" y="44" width="12" height="22" fill="#2ECC71" />
          <rect x="14" y="48" width="12" height="18" fill="#ADFF2F" />

          {/* Bloated Mutant Shoulders */}
          <path d="M10 100 L25 72 L50 88 L20 100 Z" fill="#145A32" stroke="#0E3A1A" strokeWidth="2" />
          <path d="M90 100 L75 72 L50 88 L80 100 Z" fill="#145A32" stroke="#0E3A1A" strokeWidth="2" />
          {/* Toxic Boils */}
          <circle cx="78" cy="80" r="4" fill="#ADFF2F" stroke="#145A32" strokeWidth="1" />
          <circle cx="85" cy="86" r="2.5" fill="#ADFF2F" />

          {/* Torn Yellow Hazmat Hood Remnants */}
          <path d="M26 40 Q50 18 74 40 L78 68 L68 76 L32 76 L22 68 Z" fill="#F1C40F" stroke="#B7950B" strokeWidth="2" />
          <polygon points="28,52 20,68 34,62" fill="#D4AC0D" />
          <polygon points="72,52 80,68 66,62" fill="#D4AC0D" />

          {/* Mutant Face */}
          <ellipse cx="50" cy="50" rx="21" ry="20" fill="#27AE60" stroke="#145A32" strokeWidth="2" />
          {/* Bioluminescent pustules */}
          <circle cx="36" cy="38" r="3" fill="#ADFF2F" />
          <circle cx="64" cy="40" r="2.5" fill="#ADFF2F" />

          {/* Wild Bloodshot Eyes with Red Slit Pupils */}
          <ellipse cx="38" cy="46" rx="6" ry="6" fill="#F4D03F" stroke="#C0392B" strokeWidth="1" />
          <ellipse cx="62" cy="46" rx="6" ry="6" fill="#F4D03F" stroke="#C0392B" strokeWidth="1" />
          <ellipse cx="38" cy="46" rx="2" ry="4" fill="#C0392B" />
          <ellipse cx="62" cy="46" rx="2" ry="4" fill="#C0392B" />
          <circle cx="39" cy="44" r="1" fill="#FFFFFF" />
          <circle cx="63" cy="44" r="1" fill="#FFFFFF" />

          {/* Gaping Jaw & Toxic Slime Teeth */}
          <path d="M34 58 Q50 54 66 58 Q50 74 34 58 Z" fill="#145A32" stroke="#0E3A1A" strokeWidth="1.5" />
          <polygon points="38,58 41,64 44,58" fill="#F9E79F" />
          <polygon points="46,58 49,65 52,58" fill="#F9E79F" />
          <polygon points="54,58 57,65 60,58" fill="#F9E79F" />
          {/* Acid Green Drip */}
          <path d="M48 64 Q50 76 52 64 Z" fill="#ADFF2F" />
          <circle cx="50" cy="80" r="2" fill="#ADFF2F" />
        </svg>
      );
    case 'Blackout Barry':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* High-voltage abyss backdrop */}
          <rect width="100" height="100" fill="#06020D" />
          <path d="M20 5 L10 35 L28 40 L16 70" stroke="#BD00FF" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M85 10 L72 38 L88 44 L76 80" stroke="#00E5FF" strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* Shadow Cloak Shoulders with High-Voltage Capacitors */}
          <path d="M5 100 L22 65 L48 85 L18 100 Z" fill="#0A0510" stroke="#2E1A47" strokeWidth="2" />
          <path d="M95 100 L78 65 L52 85 L82 100 Z" fill="#0A0510" stroke="#2E1A47" strokeWidth="2" />

          {/* Tesla Coils / Ceramic Insulators on Shoulders */}
          <rect x="14" y="60" width="10" height="18" rx="2" fill="#34495E" stroke="#00E5FF" strokeWidth="1" />
          <line x1="14" y1="65" x2="24" y2="65" stroke="#00E5FF" strokeWidth="1" />
          <line x1="14" y1="71" x2="24" y2="71" stroke="#00E5FF" strokeWidth="1" />
          <rect x="76" y="60" width="10" height="18" rx="2" fill="#34495E" stroke="#00E5FF" strokeWidth="1" />
          <line x1="76" y1="65" x2="86" y2="65" stroke="#00E5FF" strokeWidth="1" />
          <line x1="76" y1="71" x2="86" y2="71" stroke="#00E5FF" strokeWidth="1" />

          {/* Pointed Shadow Cowl & Hood */}
          <path d="M50 10 Q20 18 18 52 L22 80 L78 80 L82 52 Q80 18 50 10 Z" fill="#140A22" stroke="#2E1A47" strokeWidth="2" />
          <path d="M50 10 L30 42 L70 42 Z" fill="#0A0510" />

          {/* Pure Abyss Face Void */}
          <path d="M30 40 Q50 30 70 40 Q72 70 50 74 Q28 70 30 40 Z" fill="#000000" stroke="#BD00FF" strokeWidth="1" />

          {/* Piercing Electric Cyan/Violet Slit Eyes */}
          <ellipse cx="40" cy="52" rx="6" ry="3.5" fill="#00E5FF" />
          <ellipse cx="60" cy="52" rx="6" ry="3.5" fill="#00E5FF" />
          <ellipse cx="40" cy="52" rx="2" ry="1.5" fill="#FFFFFF" />
          <ellipse cx="60" cy="52" rx="2" ry="1.5" fill="#FFFFFF" />
          {/* Electric spark on eye */}
          <line x1="32" y1="52" x2="48" y2="52" stroke="#BD00FF" strokeWidth="1" />
          <line x1="52" y1="52" x2="68" y2="52" stroke="#BD00FF" strokeWidth="1" />
        </svg>
      );
    case 'Oily Oscar':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Industrial refinery background with gas flare */}
          <rect width="100" height="100" fill="#1A110F" />
          <line x1="20" y1="90" x2="20" y2="30" stroke="#3E2723" strokeWidth="3" />
          <line x1="85" y1="90" x2="85" y2="20" stroke="#3E2723" strokeWidth="4" />
          <path d="M85 20 Q90 10 85 5 Q80 10 85 20 Z" fill="#FF5722" />

          {/* Rusted Exhaust Pipes on shoulders puffing black smoke */}
          <rect x="10" y="32" width="12" height="38" rx="2" fill="#5D4037" stroke="#2C1D18" strokeWidth="2" />
          <rect x="78" y="32" width="12" height="38" rx="2" fill="#5D4037" stroke="#2C1D18" strokeWidth="2" />
          <ellipse cx="16" cy="26" rx="6" ry="4" fill="#212121" opacity="0.6" />
          <ellipse cx="84" cy="26" rx="6" ry="4" fill="#212121" opacity="0.6" />

          {/* Petroleum-slicked boiler armor */}
          <path d="M5 100 L22 68 L48 85 L18 100 Z" fill="#2C1D18" stroke="#D4AC0D" strokeWidth="1.5" />
          <path d="M95 100 L78 68 L52 85 L82 100 Z" fill="#2C1D18" stroke="#D4AC0D" strokeWidth="1.5" />
          {/* Brass pressure gauge */}
          <circle cx="50" cy="88" r="8" fill="#D4AC0D" stroke="#3E2723" strokeWidth="2" />
          <circle cx="50" cy="88" r="6" fill="#F9E79F" />
          <line x1="50" y1="88" x2="54" y2="85" stroke="#C0392B" strokeWidth="1.5" />

          {/* Riveted Iron Welding Helmet */}
          <path d="M26 36 L74 36 L76 72 L64 82 L36 82 L24 72 Z" fill="#3E2723" stroke="#1A110F" strokeWidth="2.5" />
          {/* Rivets */}
          <circle cx="28" cy="40" r="1.5" fill="#D4AC0D" />
          <circle cx="72" cy="40" r="1.5" fill="#D4AC0D" />
          <circle cx="28" cy="70" r="1.5" fill="#D4AC0D" />
          <circle cx="72" cy="70" r="1.5" fill="#D4AC0D" />

          {/* Glowing Amber Furnace Visor */}
          <rect x="30" y="44" width="40" height="12" rx="2" fill="#111111" stroke="#D4AC0D" strokeWidth="1.5" />
          <rect x="33" y="47" width="34" height="6" fill="#FF9800" />
          <line x1="35" y1="50" x2="65" y2="50" stroke="#FFEB3B" strokeWidth="2" />

          {/* Heavy Steel Respirator Jaw dripping crude */}
          <rect x="36" y="62" width="28" height="14" fill="#263238" stroke="#111" strokeWidth="1.5" />
          <circle cx="43" cy="69" r="3" fill="#D4AC0D" />
          <circle cx="57" cy="69" r="3" fill="#D4AC0D" />
          {/* Black Oil Drips */}
          <path d="M43 72 L43 82" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M57 72 L57 80" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 74 L50 85" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'Drug Trade Dale':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* 80s Synthwave Vice sunset backdrop */}
          <defs>
            <linearGradient id="daleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E1045" />
              <stop offset="50%" stopColor="#FF007F" />
              <stop offset="100%" stopColor="#FFD700" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#daleGrad)" />
          {/* Palm tree silhouettes */}
          <path d="M0 60 Q10 40 25 35 Q15 45 10 65 Z" fill="#1D0C24" opacity="0.6" />
          <path d="M100 55 Q88 35 75 32 Q85 45 90 65 Z" fill="#1D0C24" opacity="0.6" />

          {/* Purple tailored suit with broad 80s padded shoulders */}
          <path d="M5 100 L20 62 L50 82 L20 100 Z" fill="#8E44AD" stroke="#4A235A" strokeWidth="2" />
          <path d="M95 100 L80 62 L50 82 L80 100 Z" fill="#8E44AD" stroke="#4A235A" strokeWidth="2" />
          {/* Hot pink pocket square */}
          <polygon points="76,70 82,64 85,72" fill="#FF1493" />

          {/* Unbuttoned White Dress Shirt */}
          <polygon points="40,65 50,88 60,65" fill="#FFFFFF" stroke="#D5D8DC" strokeWidth="1" />

          {/* Massive 24k Gold Cuban Link Chain & Heavy Dollar Medallion */}
          <path d="M38 65 Q50 82 62 65" stroke="#FFD700" strokeWidth="3" fill="none" />
          <circle cx="50" cy="80" r="7" fill="#FFD700" stroke="#B7950B" strokeWidth="1" />
          <text x="50" y="84" textAnchor="middle" fill="#2E1045" fontSize="10" fontWeight="900" fontFamily="sans-serif">$</text>

          {/* Dale's Head & 5 o'clock shadow Jaw */}
          <ellipse cx="50" cy="48" rx="20" ry="19" fill="#F5CBA7" stroke="#333" strokeWidth="1" />
          <path d="M34 50 Q50 64 66 50 Q66 64 50 66 Q34 64 34 50 Z" fill="#566573" opacity="0.25" />

          {/* Slicked-Back Black Pompadour Hair */}
          <path d="M26 40 Q22 18 50 14 Q78 18 74 40 Q68 22 50 22 Q32 22 26 40 Z" fill="#111111" stroke="#000" strokeWidth="2" />
          <path d="M34 22 Q50 16 64 22" stroke="#5D6D7E" strokeWidth="2" fill="none" />

          {/* Gold Aviator Sunglasses reflecting Neon Sunset */}
          <rect x="28" y="40" width="44" height="13" rx="3" fill="#111" stroke="#FFD700" strokeWidth="2" />
          <rect x="31" y="42" width="18" height="9" rx="1" fill="#FF007F" />
          <rect x="51" y="42" width="18" height="9" rx="1" fill="#FF007F" />
          <rect x="31" y="46" width="18" height="5" rx="1" fill="#00F0FF" />
          <rect x="51" y="46" width="18" height="5" rx="1" fill="#00F0FF" />
          <line x1="49" y1="44" x2="51" y2="44" stroke="#FFD700" strokeWidth="2" />

          {/* Cocky Smirk with Glinting Gold Tooth */}
          <path d="M40 58 Q50 62 62 57" stroke="#111" strokeWidth="2" fill="none" />
          <polygon points="53,58 57,58 55,62" fill="#FFD700" />
        </svg>
      );
    default:
      return <rect width="100" height="100" fill="#333" />;
  }
};

export default BossPortrait;
