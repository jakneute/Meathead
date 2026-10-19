// The bits the HUD skins (hudThemes.tsx and the lands' own in hudSkins/) are drawn with: strips, stickers, rivets,
// corner pieces, little drawn shapes. Everything's built once, at load (the skins are constants), so nothing here runs
// per frame.

import React from 'react';

/** A strip down the plate's left edge. */
export const edge = (background: string, w = 4) => <div className="absolute left-0 top-0 bottom-0" style={{ width: w, background }} />;
/** A band along the plate's top (inside it). */
export const topBand = (background: string, h = 4) => <div className="absolute left-0 right-0 top-0" style={{ height: h, background }} />;
/** A band along the plate's bottom (inside it). */
export const bottomBand = (background: string, h = 4) => <div className="absolute left-0 right-0 bottom-0" style={{ height: h, background }} />;
/** A little label stuck on (a sticker, a stamp), at the plate's corner. */
export const tag = (text: string, style: React.CSSProperties) => (
  <div className="absolute text-[5px] font-black px-[3px] py-[1px] whitespace-nowrap" style={{ right: 4, top: -6, ...style }}>{text}</div>
);
/** Rivets in the four corners. */
export const rivets = (col: string, inset = 3) => (
  <>{[[inset, inset], [inset, -1], [-1, inset], [-1, -1]].map(([l, t], i) => (
    <div key={i} className="absolute w-[4px] h-[4px] rounded-full" style={{ background: col, boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.5)', left: l >= 0 ? l : undefined, right: l < 0 ? inset : undefined, top: t >= 0 ? t : undefined, bottom: t < 0 ? inset : undefined }} />
  ))}</>
);
/** L-shaped pieces over the four corners (brackets, gilt corners, iron straps). */
export const corners = (col: string, size = 8, thick = 2, out = 2) => (
  <>{[0, 1, 2, 3].map(i => {
    const r = i & 1, b = i >> 1;
    return <div key={i} className="absolute" style={{
      width: size, height: size,
      [r ? 'right' : 'left']: -out, [b ? 'bottom' : 'top']: -out,
      [r ? 'borderRight' : 'borderLeft']: `${thick}px solid ${col}`,
      [b ? 'borderBottom' : 'borderTop']: `${thick}px solid ${col}`,
    }} />;
  })}</>
);
/** Any little drawn piece, placed by its style. */
export const bit = (style: React.CSSProperties, children?: React.ReactNode) => <div className="absolute" style={style}>{children}</div>;
/** A word or a glyph, placed by its style (tiny, bold). */
export const word = (text: string, style: React.CSSProperties) => <div className="absolute text-[5px] font-black whitespace-nowrap leading-none" style={style}>{text}</div>;

export const PIXEL_SHADOW = '0 0 0 2px #000, 3px 3px 0 2px rgba(0,0,0,0.6)';
/** The pause frame's outer ring and the dark round it (its color, a glow's color). */
export const FRAME_SHADOW = (ring = '#000', glow = 'rgba(0,0,0,0.9)') => `0 0 0 3px ${ring}, 0 0 40px ${glow}`;
