// (dev only) Contact sheets of level 3's new figures, for checking every pose: window.__wp3Sheet(name) gives a PNG data
// URL. 'gup' (GUPPLAX, every pose), 'gupArmor' (his armor and hives,
// 0 to 5 tanks burst, on six poses), 'gross' (his gross-up, shut and open), 'janitor' / 'tech' (six looks, every pose),
// 'critters' (the grubs and the eels, every pose).

import { paintGup, GUP_POSES } from './gupArt';
import { drawGupGross, drawGupGrossBack } from './gupGross';
import { paintStaffPose, staffLook, STAFF_POSES, drawGrub, GRUB_POSES, drawEel, EEL_POSES, type StaffKind } from './kindArt';

const sheet = (cols: number, rows: number, cw: number, ch: number, scale: number, cell: (g: CanvasRenderingContext2D, i: number) => string | void) => {
  const cv = document.createElement('canvas');
  cv.width = cols * cw * scale; cv.height = rows * ch * scale;
  const g = cv.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#6A7A8A'; g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < cols * rows; i++) {
    const x = (i % cols) * cw, y = Math.floor(i / cols) * ch;
    g.save(); g.scale(scale, scale); g.translate(x, y);
    g.fillStyle = (i + Math.floor(i / cols)) % 2 ? '#7A8A9A' : '#8A9AAA'; g.fillRect(0, 0, cw, ch);
    g.save(); const name = cell(g, i); g.restore();
    if (name) { g.fillStyle = '#000'; g.font = '8px monospace'; g.fillText(name, 3, 10); }
    g.restore();
  }
  return cv.toDataURL('image/png');
};

export const contactSheet = (what: string): string => {
  if (what === 'gup') {
    return sheet(8, 3, 300, 300, 1, (g, i) => {
      if (i >= GUP_POSES.length) { if (i === GUP_POSES.length) { g.translate(150, 210); g.scale(-1, 1); paintGup(g, { pose: 'ram', q: 0 }, -1); return 'ram (left)'; } return; }
      g.translate(150, 210); paintGup(g, { pose: GUP_POSES[i], q: 2, mouth: GUP_POSES[i] === 'talk' }); g.fillStyle = '#C00'; g.fillRect(-1, 0, 2, 2); return GUP_POSES[i];
    });
  }
  // (his armor and hives by tanks burst, 0 to 5, across; a row a pose)
  if (what === 'gupArmor') {
    const poses = ['idle', 'glide', 'ram', 'bite', 'sneeze', 'slow'] as const;
    return sheet(6, 6, 300, 300, 1, (g, i) => { const pose = poses[Math.floor(i / 6)], a = i % 6; g.translate(150, 210); paintGup(g, { pose, q: 2, arm: a }); return pose + ' a' + a; });
  }
  if (what === 'gross') return sheet(1, 2, 800, 600, 1, (g, i) => { drawGupGrossBack(g, 800, 600); drawGupGross(g, 400, 306, 1, 0, i === 1); return i ? 'open' : 'shut'; });
  if (what === 'janitor' || what === 'tech') {
    const kind = what as StaffKind;
    return sheet(7, 6, 90, 110, 3, (g, i) => { const seed = Math.floor(i / 7) * 97 + 13, pose = STAFF_POSES[i % 7]; g.translate(44, 104); paintStaffPose(g, kind, staffLook(seed), pose, 2); return pose; });
  }
  if (what === 'critters') {
    return sheet(4, 2, 110, 90, 3, (g, i) => {
      g.translate(55, 60);
      if (i < GRUB_POSES.length) { drawGrub(g, GRUB_POSES[i], 6); return `grub ${GRUB_POSES[i]}`; }
      const k = i - GRUB_POSES.length;
      if (k < EEL_POSES.length) { drawEel(g, EEL_POSES[k], 10); return `eel ${EEL_POSES[k]}`; }
    });
  }
  return '';
};
