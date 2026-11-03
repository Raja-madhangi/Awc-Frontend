import React from 'react';

/**
 * Official emblem of Animal Welfare Club (AWC), PSG College of Technology.
 * Uses the authentic club shield logo provided by the club featuring the elephant,
 * panther, dog & cat silhouettes enclosed in golden laurel wreath and "ANIMAL WELFARE CLUB" ribbon.
 */
export const AwcLogoMark = ({ size = 44, className = "" }) => {
  return (
    <img
      src="/awc-logo.png"
      alt="Animal Welfare Club PSG Tech"
      width={size}
      height={size}
      className={`shrink-0 select-none object-contain drop-shadow-sm ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, maxWidth: 'none' }}
      loading="eager"
      onError={(e) => {
        if (!e.currentTarget.dataset.fallback) {
          e.currentTarget.dataset.fallback = '1';
          e.currentTarget.src = '/assets/aistudio/image_d0c8e6de.png';
        }
      }}
    />
  );
};

export const AwcLogoFull = ({ className = "", showBadgeOnly = false, size = 44 }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <AwcLogoMark size={size} className="hover:rotate-3 transition-transform duration-300" />
      {!showBadgeOnly && (
        <div className="leading-tight">
          <div className="font-serif-display text-[16px] md:text-[18px] text-[#1e3a2a] tracking-tight font-bold flex items-center gap-1.5">
            <span>Animal Welfare Club</span>
          </div>
          <div className="eyebrow text-[9.5px] text-[#1e3a2a]/65 tracking-wider font-semibold">
            PSG COLLEGE OF TECHNOLOGY
          </div>
        </div>
      )}
    </div>
  );
};

export default AwcLogoMark;

