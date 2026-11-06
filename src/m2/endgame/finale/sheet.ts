// (dev only) Contact sheets of the finale's figures and art, for checking every pose: window.__finSheet(name) gives a
// PNG data URL. 'satan' (every pose), 'widow' (every pose), 'heave' (giant Meathead's grab and throw, with a boss on
// his hands), 'ben' (Ben giant: his poses here, and round a boss), 'musk' (the rocket man's gross-up, both), 'lm'
// (every landmark, standing), 'minions'.

import { drawSatanBody, drawWidowBody, SATAN_POSES, WIDOW_POSES, warmSatan } from './bossArt';
import { heavePose, HEAVE_PHASES } from './throw';
import { drawPoseSprite } from '../../moves/grab';
import { drawBen } from '../../upgrades/confucktious/art';
import { drawMuskGross, drawMuskGrossBack, warmMuskGross } from './muskGross';
import { LANDMARKS } from './sections';
import { BEN_K } from './ben';
import { neckPose, drawDangle, type Blow } from './hold';
import { paintFinisherPic, FINISHER_IDS } from './finishers';

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

export const contactSheetFin = (what: string): string => {
  if (what === 'satan') { warmSatan(); return sheet(5, 3, 180, 200, 2, (g, i) => { const p = SATAN_POSES[i]; if (!p) return; g.translate(90, 190); drawSatanBody(g, p, 20, p === 'talk'); return p; }); }
  if (what === 'widow') return sheet(5, 3, 160, 180, 2, (g, i) => { const p = WIDOW_POSES[i]; if (!p) return; g.translate(80, 172); drawWidowBody(g, p, 20, p === 'talk'); return p; });
  if (what === 'heave') {
    warmSatan();
    return sheet(5, 2, 140, 150, 3, (g, i) => {
      const ph = HEAVE_PHASES[i % 5];
      g.translate(70, 140);
      if (i >= 5) { g.save(); g.translate(0, -110); g.rotate(-Math.PI / 2); g.translate(0, 74); g.scale(0.5, 0.5); if (i % 2) drawSatanBody(g, 'thrown', 0); else drawWidowBody(g, 'thrown', 0); g.restore(); }
      drawPoseSprite(g, 0, 0, 1, c => heavePose(c, 0, ph, 30));
      return `${ph}${i >= 5 ? ' +boss' : ''}`;
    });
  }
  if (what === 'ben') {
    const poses = ['stand', 'brace', 'yank', 'nuts'] as const;
    return sheet(4, 2, 150, 150, 2, (g, i) => {
      g.translate(75, 140);
      if (i < 4) { g.scale(BEN_K, BEN_K); drawBen(g, 0, 0, 1, poses[i], 0, null); return `${poses[i]} x${BEN_K}`; }
      // (round a boss: the boss, him behind it, his arms' band across them)
      const sat = i % 2 === 0;
      g.save(); g.translate(14, 0); g.scale(0.62, 0.62); if (sat) drawSatanBody(g, 'held', 10); else drawWidowBody(g, 'held', 10); g.restore();
      g.save(); g.translate(10, 0); g.scale(BEN_K, BEN_K); drawBen(g, 0, 0, i < 6 ? 1 : -1, 'brace', 0, null); g.restore();
      return `holding ${sat ? 'satan' : 'widow'}`;
    });
  }
  if (what === 'neck') {
    // (the neck hold: holding, the punch (mid, landed), the knee, the headbutt, walking; Satan then the widow)
    warmSatan();
    const cells: [Blow | null, number, number, string][] = [[null, 0, 0, 'hold'], ['punch', 0.5, 0, 'punch'], ['knee', 0.5, 0, 'knee'], ['head', 0.5, 0, 'headbutt'], [null, 0, 1.6, 'walk']];
    return sheet(5, 2, 200, 220, 2, (g, i) => {
      const [blow, k, ph, name] = cells[i % 5], who = i < 5 ? 'satan' : 'widow';
      g.translate(70, 205);
      g.fillStyle = '#5A6A4A'; g.fillRect(-70, 0, 200, 15);
      drawDangle(g, 20, who, 0, 0, 1, !!blow && k > 0.4);
      drawPoseSprite(g, 0, 0, 1, c => neckPose(c, 0, blow, k, ph, ph > 0));
      return `${name} (${who})`;
    });
  }
  if (what === 'finishers') {
    // (every finisher's four pictures, each well into its beat: 11 rows)
    warmSatan();
    return sheet(4, FINISHER_IDS.length, 256, 144, 1, (g, i) => { const id = FINISHER_IDS[Math.floor(i / 4)], st = i % 4; paintFinisherPic(g, id, st, 60, 'clean'); return `${id} ${st}`; });
  }
  if (what === 'dead') {
    // (pinned by the tower (dazed), and dead: lying where they went down)
    warmSatan();
    return sheet(4, 1, 230, 200, 2, (g, i) => {
      const sat = i % 2 === 0;
      g.translate(115, 185); g.fillStyle = '#5A6A4A'; g.fillRect(-115, 0, 230, 15);
      if (i < 2) { g.scale(-1, 1); if (sat) drawSatanBody(g, 'dazed', 10); else drawWidowBody(g, 'dazed', 10); return `pinned ${sat ? 'satan' : 'widow'}`; }
      g.translate(0, -26); g.rotate(-Math.PI / 2); g.translate(0, (sat ? 168 : 150) / 2);
      if (sat) drawSatanBody(g, 'thrown', 10); else drawWidowBody(g, 'thrown', 10);
      return `dead ${sat ? 'satan' : 'widow'}`;
    });
  }
  if (what === 'musk') { warmMuskGross(); return sheet(2, 1, 800, 600, 1, (g, i) => { drawMuskGrossBack(g, 800, 600); drawMuskGross(g, 400, 310, 0.95, i * 7); return i ? 'fist up' : 'fist low'; }); }
  if (what === 'lm') {
    const ids = Object.keys(LANDMARKS);
    return sheet(6, Math.ceil(ids.length / 6), 330, 190, 1, (g, i) => {
      const d = LANDMARKS[ids[i]]; if (!d) return;
      g.translate(165, 180); const k = d.h > 170 ? 170 / d.h : 1; g.scale(k, k); d.paint(g);
      return d.name;
    });
  }
  return '';
};
