import React from 'react';
import { WeaponType } from '../types';

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

export default WeaponIcon;
