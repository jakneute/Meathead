

import React from 'react';
import { GameStatus, WeaponType } from '../types';
import { 
  STAGES, 
  WEAPON_NAMES, 
  WEAPON_DESCRIPTIONS,
  BOSS_SET_TITLES,
  BOSS_LOCATIONS
} from '../constants';
import USAMap from './USAMap';

interface OverlayProps {
  status: GameStatus;
  onStart: () => void;
  onResume?: () => void;
  onBossSelect?: () => void;
  onQuitToMenu?: () => void;
  onSelectStage?: (stage: string) => void;
  onSelectIndex?: (index: number) => void;
  onIconClick?: (index: number) => void;
  onCheatAllWeapons?: () => void;
  onToggleInvincibility?: () => void;
  onToggleInfiniteAmmo?: () => void;
  onToggleInfinitePower?: () => void;
  onToggleJumpToBoss?: () => void;
  onIncrementRank?: () => void;
  onDecrementRank?: () => void;
  cheatEnabled?: boolean;
  invincibilityEnabled?: boolean;
  infiniteAmmoEnabled?: boolean;
  infinitePowerEnabled?: boolean;
  jumpToBossEnabled?: boolean;
  progressionRank?: number;
  showCheats?: boolean;
  bossTaunt?: string;
  victorySpeech?: string;
  briefing?: string;
  defeatedStages?: string[];
  selectedIndex: number;
  overlayActiveTime: number; 
  stageId?: string | null;
  availableWeapons?: WeaponType[];
  currentWeapon?: WeaponType;
}

const BossPortrait = ({ id }: { id: string }) => {
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

interface WeaponIconProps {
  type: WeaponType;
  isEquipped: boolean;
  isSelected: boolean;
  onClick?: () => void;
}

const WeaponIcon: React.FC<WeaponIconProps> = ({ type, isEquipped, isSelected, onClick }) => {
  const renderGraphic = () => {
    switch (type) {
      case 'GUN':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10" fill="white">
            <rect x="2" y="4" width="6" height="2" />
            <rect x="2" y="6" width="2" height="2" />
          </svg>
        );
      case 'BOULDER':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10" fill="#8B4513">
            <path d="M2 3 L5 1 L8 3 L9 6 L7 9 L3 9 L1 6 Z" />
          </svg>
        );
      case 'SHOTGUN':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10" fill="#00FFFF">
            <rect x="1" y="4" width="8" height="2" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="6" y="3" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
          </svg>
        );
      case 'FLAMETHROWER':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10" fill="#FF4500">
            <path d="M5 1 C5 1 2 4 2 6 C2 8 3 9 5 9 C7 9 8 8 8 6 C8 4 5 1 5 1 Z" />
            <path d="M5 4 C5 4 4 5 4 6 C4 7 4.5 7.5 5 7.5 C5.5 7.5 6 7 6 6 C6 5 5 4 5 4 Z" fill="yellow" />
          </svg>
        );
      case 'TSUNAMI':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10" fill="#1E90FF">
            <path d="M1 8 Q 3 2, 5 5 Q 7 2, 9 8 L 9 9 L 1 9 Z" />
            <rect x="4" y="3" width="2" height="1" fill="white" />
          </svg>
        );
      case 'NEEDLES':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10" fill="silver">
            <rect x="4" y="2" width="2" height="5" />
            <rect x="4.5" y="7" width="1" height="2" fill="red" />
            <rect x="3" y="1" width="4" height="1" />
          </svg>
        );
      case 'TASER':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10" fill="#FFFF00">
            <path d="M6 1 L2 5 L5 5 L4 9 L8 5 L5 5 Z" />
          </svg>
        );
      case 'SLUDGE':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10" fill="#2E7D32">
             <circle cx="5" cy="5" r="4" fill="#1B5E20" />
             <path d="M2 5 Q5 2 8 5 Q5 8 2 5" fill="#ADFF2F" />
             <circle cx="3" cy="4" r="1" fill="white" opacity="0.4" />
          </svg>
        );
      case 'OIL_ROCKET':
        return (
          <svg viewBox="0 0 10 10" className="w-10 h-10">
             <rect x="2" y="3" width="6" height="4" fill="#212121" />
             <path d="M8 3 L10 5 L8 7 Z" fill="#D32F2F" />
             <rect x="1" y="2" width="2" height="6" fill="#757575" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      onClick={onClick}
      title={type.replace(/_/g, ' ')}
      className={`w-16 h-16 border-4 flex items-center justify-center p-1 transition-all cursor-pointer hover:border-yellow-200 pointer-events-auto ${isSelected ? 'border-yellow-400 scale-110 shadow-[0_0_15px_yellow] z-10' : 'border-white/20'} ${isEquipped ? 'bg-red-800' : 'bg-gray-800'}`}
    >
      {renderGraphic()}
    </div>
  );
};

const MeatheadCaricature = () => (
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

const ControlsGuide = () => (
  <div className="w-full max-w-md mt-2 pt-2 border-t border-red-950/80 shrink-0">
    <div className="text-[7.5px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-1.5 opacity-90">
      TACTICAL COMBAT CONTROLS
    </div>
    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[7.5px] uppercase font-mono w-full">
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">MOVE:</span>
        <span className="text-gray-300 font-semibold">WASD / ARROWS / D-PAD</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">JUMP:</span>
        <span className="text-gray-300 font-semibold">SPACE / A (PAD)</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">FIRE:</span>
        <span className="text-gray-300 font-semibold">L-CLICK / X, RT</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">SHLDR CHRG:</span>
        <span className="text-gray-300 font-semibold">SHIFT / B, LT</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">UPPERCUT:</span>
        <span className="text-gray-300 font-semibold">UP+SHIFT / UP+B</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">DIVEKICK:</span>
        <span className="text-gray-300 font-semibold">DOWN+SHIFT (AIR)</span>
      </div>
      <div className="flex items-center justify-between border-b border-gray-900/90 pb-0.5">
        <span className="text-red-500 font-bold tracking-wider">CYCLE WPN:</span>
        <span className="text-gray-300 font-semibold">Q, E / WHEEL / BUMPERS</span>
      </div>
      <div className="flex items-center justify-center gap-2 border-b border-gray-900/90 pb-0.5 col-span-2 text-center pt-0.5">
        <span className="text-red-500 font-bold tracking-wider">PAUSE / ARSENAL:</span>
        <span className="text-gray-300 font-semibold">ESC / START (PAD)</span>
      </div>
    </div>
  </div>
);

const Overlay: React.FC<OverlayProps> = ({ 
  status, onStart, onResume, onBossSelect, onQuitToMenu, onSelectStage, onSelectIndex, onIconClick, onCheatAllWeapons, onToggleInvincibility, onToggleInfiniteAmmo, onToggleInfinitePower, onToggleJumpToBoss,
  onIncrementRank, onDecrementRank, progressionRank = 0,
  cheatEnabled, invincibilityEnabled, infiniteAmmoEnabled, infinitePowerEnabled, jumpToBossEnabled, showCheats = false, bossTaunt, victorySpeech, briefing, defeatedStages = [], selectedIndex, overlayActiveTime, stageId,
  availableWeapons = [], currentWeapon
}) => {
  const isInputLocked = overlayActiveTime < 2000;
  const currentStages = STAGES(progressionRank);

  if (status === GameStatus.PLAYING || status === GameStatus.LEVEL_INTRO || status === GameStatus.BOSS_TRANSITION) return null;

  const getWeaponDescription = (w: WeaponType) => {
    if (w === 'GUN') return "STANDARD PUMP ACTION";
    if (w === 'SHOTGUN') return WEAPON_DESCRIPTIONS["Artie Avalanche"];
    if (w === 'FLAMETHROWER') return WEAPON_DESCRIPTIONS["Victor Volcano"];
    if (w === 'BOULDER') return WEAPON_DESCRIPTIONS["Ernie Earthquake"];
    if (w === 'TSUNAMI') return WEAPON_DESCRIPTIONS["Hector Hurricane"];
    if (w === 'TASER') return WEAPON_DESCRIPTIONS["Blackout Barry"];
    if (w === 'NEEDLES') return WEAPON_DESCRIPTIONS["Drug Trade Dale"];
    if (w === 'SLUDGE') return WEAPON_DESCRIPTIONS["Toxic Tommy"];
    if (w === 'OIL_ROCKET') return WEAPON_DESCRIPTIONS["Oily Oscar"];
    return "HEAVY DEVASTATION";
  };

  return (
    <div className={`absolute inset-0 ${status === GameStatus.PAUSED ? 'bg-black/85 backdrop-blur-[2px]' : 'bg-black'} flex flex-col items-center justify-center z-50 p-6 text-center overflow-hidden`}>
      {status === GameStatus.START && (
        <>
          {showCheats && (
            <div className="absolute top-2 right-2 z-[60] flex flex-col gap-1 items-end max-w-[150px]">
                <div className="flex w-full border-2 border-gray-600 bg-gray-900 shadow-[2px_2px_0px_white] items-center overflow-hidden">
                   <button onClick={onDecrementRank} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px]">-</button>
                   <div className="flex-1 text-[7px] font-black text-yellow-400 uppercase tracking-tighter">SKP SET: {progressionRank}</div>
                   <button onClick={onIncrementRank} className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-white font-black text-[10px]">+</button>
                </div>
                <button onClick={onToggleJumpToBoss} className={`w-full px-2 py-1 border-2 transition-all font-black text-[7px] uppercase shadow-[2px_2px_0px_white] ${jumpToBossEnabled ? 'bg-red-500 border-white text-black' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>SKIP LEVEL: {jumpToBossEnabled ? 'ON' : 'OFF'}</button>
                <div className="h-2 w-full" />
                <button onClick={onToggleInvincibility} className={`w-full px-2 py-1 border-2 transition-all font-black text-[7px] uppercase shadow-[2px_2px_0px_white] ${invincibilityEnabled ? 'bg-green-500 border-white text-black' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>GOD MODE: {invincibilityEnabled ? 'ON' : 'OFF'}</button>
                <button onClick={onCheatAllWeapons} className={`w-full px-2 py-1 border-2 transition-all font-black text-[7px] uppercase shadow-[2px_2px_0px_white] ${cheatEnabled ? 'bg-yellow-500 border-white text-black' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>ALL WEAPONS: {cheatEnabled ? 'ON' : 'OFF'}</button>
                <button onClick={onToggleInfiniteAmmo} className={`w-full px-2 py-1 border-2 transition-all font-black text-[7px] uppercase shadow-[2px_2px_0px_white] ${infiniteAmmoEnabled ? 'bg-blue-500 border-white text-black' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>INF AMMO: {infiniteAmmoEnabled ? 'ON' : 'OFF'}</button>
                <button onClick={onToggleInfinitePower} className={`w-full px-2 py-1 border-2 transition-all font-black text-[7px] uppercase shadow-[2px_2px_0px_white] ${infinitePowerEnabled ? 'bg-purple-500 border-white text-black' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>INF POWER: {infinitePowerEnabled ? 'ON' : 'OFF'}</button>
            </div>
          )}
          <div className="animate-in fade-in zoom-in duration-700 max-w-lg relative w-full h-full flex flex-col items-center justify-center pt-1 pb-1">
            <MeatheadCaricature />
            <h1 className="text-3xl md:text-4xl text-red-600 mb-1 font-black tracking-tighter drop-shadow-[3px_3px_0px_white] shrink-0">MEATHEAD</h1>
            <div className="text-white text-[8px] md:text-[8.5px] mb-2 border-y border-red-900/80 py-1 px-3 italic uppercase tracking-tight leading-relaxed max-w-sm mx-auto shrink-0">MISSION: {briefing}</div>
            <button disabled={isInputLocked} onClick={onStart} className={`px-8 py-2.5 text-white text-base md:text-lg border-b-[6px] transition-all font-black uppercase ring-2 ring-white/10 shrink-0 ${isInputLocked ? 'bg-gray-700 border-gray-900 opacity-50 cursor-not-allowed' : 'bg-red-700 hover:bg-red-500 border-red-900 active:translate-y-1 active:border-b-0'}`}>
              {isInputLocked ? 'READYING PUMP...' : 'BEGIN THE PUMP'}
            </button>
            <ControlsGuide />
          </div>
        </>
      )}

      {status === GameStatus.STAGE_SELECT && (
        <div className="w-full h-full flex flex-col items-center justify-start pt-2 pb-1 animate-in slide-in-from-bottom-8 duration-500 overflow-hidden select-none">
          {/* Main Title according to user requirement */}
          <div className="flex flex-col items-center mb-2 shrink-0">
            <h2 className="text-xl md:text-2xl text-red-600 font-black tracking-widest border-b-4 border-red-900 pb-1 uppercase italic drop-shadow-[0_2px_2px_rgba(153,0,0,0.8)] [text-shadow:2px_2px_0_rgb(0,0,0),_0_4px_0_rgba(153,0,0,0.8),_0_8px_0_rgba(153,0,0,0.4),_2px_12px_2px_rgba(255,0,0,0.5)]">
              {BOSS_SET_TITLES[progressionRank] || "THE FOUR ASSHOLES"}
            </h2>
            <div className="text-[8px] font-mono text-cyan-400/90 tracking-widest uppercase mt-0.5">
              TARGET SELECTION // UNITED STATES RADAR INFILTRATION
            </div>
          </div>

          {/* Adjusted 2-Column Screen Layout with USA Map on the side */}
          <div className="w-full max-w-[770px] flex flex-row items-center justify-center gap-4 px-2">
            {/* Left Column: 2x2 Boss Cards */}
            <div className="w-[330px] grid grid-cols-2 gap-2.5 shrink-0">
              {currentStages.map((stage, idx) => {
                const isDefeated = defeatedStages.includes(stage.id);
                const isSelected = idx === selectedIndex;
                const loc = BOSS_LOCATIONS[stage.id];
                return (
                  <button 
                    key={stage.id} 
                    onClick={() => {
                      onSelectIndex?.(idx);
                      onSelectStage?.(stage.id);
                    }}
                    onMouseEnter={() => onSelectIndex?.(idx)}
                    className={`w-full h-[185px] ${isDefeated ? 'opacity-70' : ''} border-3 ${isSelected ? 'border-yellow-400 scale-[1.03] shadow-[0_0_20px_rgba(255,255,0,0.6)] z-10 ring-2 ring-yellow-400/50' : 'border-white/40 hover:border-white/80'} bg-[#1E1E1E] transition-all flex flex-col overflow-hidden group shadow-lg rounded-sm text-left`}
                  >
                    <div className="flex-1 bg-black relative overflow-hidden">
                      <BossPortrait id={stage.id} />
                      {isDefeated && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 pointer-events-none">
                          <div className="text-red-600 text-xs font-black rotate-[-15deg] border-2 border-red-900 px-1 py-0.5 uppercase tracking-tighter bg-black/90 shadow-[0_0_10px_rgba(220,38,38,0.8)] [text-shadow:1px_1px_0_black]">
                            FUCKING DEAD
                          </div>
                        </div>
                      )}
                      {/* State tag on card */}
                      {loc && (
                        <div className="absolute bottom-1 right-1 bg-black/85 px-1 py-0.5 rounded border border-cyan-500/40 text-[7px] font-mono font-bold text-cyan-300 pointer-events-none">
                          {loc.stateCode}
                        </div>
                      )}
                    </div>
                    <div className={`p-1 flex flex-col items-center justify-center ${isSelected ? 'bg-yellow-400 text-black' : 'bg-zinc-900 text-white'}`}>
                      <span className="text-[8.5px] font-black uppercase leading-tight text-center truncate w-full">
                        {stage.id}
                      </span>
                      {loc && (
                        <span className={`text-[7px] font-mono uppercase truncate w-full text-center ${isSelected ? 'text-black/80 font-bold' : 'text-gray-400'}`}>
                          {loc.city}, {loc.stateCode}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: USA Map (Alaska and Hawaii included) on the side */}
            <div className="w-[390px] shrink-0 flex flex-col justify-center">
              <USAMap 
                selectedBossId={currentStages[selectedIndex]?.id || currentStages[0]?.id}
                defeatedStages={defeatedStages}
                currentStages={currentStages}
                onSelectStage={(id) => {
                  const idx = currentStages.findIndex(s => s.id === id);
                  if (idx !== -1) {
                    onSelectIndex?.(idx);
                    onSelectStage?.(id);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {status === GameStatus.PAUSED && (
        <div className="animate-in fade-in duration-200 flex flex-col items-center w-full max-w-lg px-6 py-4 bg-zinc-950/95 border-2 border-yellow-500/80 shadow-[0_0_40px_rgba(0,0,0,0.9)] rounded-sm">
           <h2 className="text-xl md:text-2xl text-white mb-2 font-black uppercase tracking-widest italic border-b-2 border-yellow-500 pb-1 shrink-0">RESTING SET</h2>
           <div className="mb-2 w-full flex flex-col items-center shrink-0">
              <div className="text-yellow-400 text-[9px] font-black uppercase mb-1 tracking-tighter italic opacity-80">CHOOSE ARMAMENT</div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {availableWeapons.map((w, i) => (
                  <WeaponIcon 
                    key={w} 
                    type={w} 
                    isEquipped={w === currentWeapon} 
                    isSelected={selectedIndex === i} 
                    onClick={() => onIconClick?.(i)}
                  />
                ))}
              </div>
              <div className="min-h-[50px] text-center px-2 flex flex-col items-center justify-start overflow-hidden">
                {selectedIndex < availableWeapons.length && (
                  <>
                    <div className="text-white text-[10px] font-black uppercase italic drop-shadow-md underline decoration-red-600 decoration-1 underline-offset-2 mb-0.5">
                      {availableWeapons[selectedIndex]?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-gray-400 text-[8px] font-bold italic uppercase tracking-tight leading-tight max-w-xs">
                      "{getWeaponDescription(availableWeapons[selectedIndex])}"
                    </div>
                  </>
                )}
              </div>
           </div>
           <div className="flex flex-col gap-1.5 w-56 shrink-0">
              <button onClick={onResume} className={`py-1 bg-yellow-600 text-white text-sm font-black border-b-[3px] border-yellow-800 transition-all uppercase ${selectedIndex === availableWeapons.length ? 'ring-2 ring-white scale-105 bg-yellow-500' : ''}`}>RESUME</button>
              <button onClick={onBossSelect} className={`py-1 bg-red-700 text-white text-sm font-black border-b-[3px] border-red-900 transition-all uppercase ${selectedIndex === availableWeapons.length + 1 ? 'ring-2 ring-white scale-105 bg-red-600' : ''}`}>BOSS SELECT</button>
              <button onClick={onQuitToMenu} className={`py-1 bg-gray-700 text-white text-sm font-black border-b-[3px] border-gray-900 transition-all uppercase ${selectedIndex === availableWeapons.length + 2 ? 'ring-2 ring-white scale-105 bg-gray-600' : ''}`}>QUIT TO MENU</button>
           </div>
        </div>
      )}

      {status === GameStatus.BOSS_INTRO && (
        <div className="bg-red-950/90 border-4 border-red-600 p-6 max-w-lg animate-in fade-in slide-in-from-top-4 duration-500 shadow-[0_0_40px_rgba(255,0,0,0.4)]">
          <h2 className="text-xl md:text-2xl text-red-500 mb-4 font-black tracking-tighter italic uppercase underline decoration-2">ENEMY LOG:</h2>
          <div className="max-h-32 overflow-y-auto mb-6 px-4 text-left border-l-4 border-red-500 bg-black/40 py-4">
            <p className="text-white italic text-sm md:text-base leading-snug uppercase tracking-tight">"{bossTaunt}"</p>
          </div>
          <button disabled={isInputLocked} onClick={onStart} className={`px-8 py-4 text-white text-lg font-black border-b-[6px] transition-all uppercase ${isInputLocked ? 'bg-gray-700 border-gray-900 opacity-50' : 'bg-red-600 hover:bg-red-500 border-red-900 active:translate-y-1 active:border-b-0'}`}>
            {isInputLocked ? 'LISTENING...' : 'STFU AND DIE'}
          </button>
        </div>
      )}

      {status === GameStatus.BOSS_VICTORY_SPEECH && (
        <div className="bg-blue-900/95 border-8 border-blue-400 p-6 max-w-2xl animate-in fade-in zoom-in duration-500">
          <h2 className="text-3xl md:text-5xl text-yellow-400 mb-6 font-black uppercase tracking-widest italic underline decoration-4 underline-offset-4">GAINS</h2>
          <div className="mb-8 text-center bg-black/50 p-8 rounded-lg border-2 border-white/10 flex flex-col gap-4">
            <p className="text-yellow-400 text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">You have gained {stageId ? WEAPON_NAMES[stageId] : 'NEW MUSCLES'}</p>
            {stageId && WEAPON_DESCRIPTIONS[stageId] && <p className="text-white text-sm md:text-base font-bold italic tracking-tight leading-relaxed max-w-lg mx-auto">"{WEAPON_DESCRIPTIONS[stageId]}"</p>}
          </div>
          <button disabled={isInputLocked} onClick={onStart} className={`px-12 py-6 text-black text-xl font-black border-b-[8px] transition-all uppercase ${isInputLocked ? 'bg-gray-500 border-gray-700 opacity-50' : 'bg-yellow-500 hover:bg-yellow-400 border-yellow-800 active:translate-y-1 active:border-b-0'}`}>
            {isInputLocked ? 'INFUSING GAINS...' : 'fuck yeah'}
          </button>
        </div>
      )}

      {status === GameStatus.VICTORY && (
        <div className="animate-in fade-in duration-1000 max-w-xl bg-black/90 p-6 md:p-10 border-4 border-yellow-400 shadow-[0_0_50px_rgba(255,255,0,0.3)] flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl text-yellow-400 mb-4 font-black tracking-tighter uppercase italic leading-none drop-shadow-md shrink-0">CONGRATULATIONS!!</h2>
          <div className="mb-6 max-h-[180px] md:max-h-[240px] overflow-y-auto bg-black/60 p-4 border border-white/10 rounded-sm w-full">
            <p className="text-white text-[9px] md:text-[10px] uppercase font-black tracking-normal leading-relaxed text-left">
              {progressionRank === 0 
                ? 'Good job, Meathead. Your quest to just fucking kill everyone in sight paid off. Local counter terrorism units identified the men you killed as "The Four Assholes." You saved the world! Or did you?'
                : 'Meathead... you have obliterated the second set of threats. Your biceps are officially classified as weapons of mass destruction. The world is safe, and your protein shake is waiting.'
              }
            </p>
          </div>
          <button disabled={isInputLocked} onClick={onStart} className={`w-full py-5 text-black font-black border-b-[8px] text-lg shadow-xl transition-all ${isInputLocked ? 'bg-gray-700 border-gray-900 opacity-50 text-gray-500' : 'bg-yellow-400 hover:bg-yellow-300 border-yellow-700 active:translate-y-1 active:border-b-0'}`}>
            {isInputLocked ? 'WAITING...' : 'BRING IT!'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Overlay;
