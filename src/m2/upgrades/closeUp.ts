// The cheap shot's CLOSE-UP (cheapShot.ts; SPEC.md's hand armor): Mortal Kombat's X-ray, crude but readable. A panel
// over the middle of the screen: inside the crotch, the pelvis and the thighs see-through, and his boot coming up into
// it: the balls (the ovaries, up in the pelvis behind the fat) squash flat and burst, blood everywhere, the bone
// cracks; machines (the Queen, the rex) are panels, gears and chrome, and spray oil and sparks instead. The White House
// pundits (a cartoon show's) get the 90s slapstick nut shot instead: a face, the eyes crossing, the wheeze.
//
// The generic one, every boss's for now. A boss's own (Phase F) goes in with cheapShot.ts registerCloseUp(id, paint):
// `paint(c, t, look)` draws the panel's insides at (0,0)..(PANEL_W,PANEL_H) for frame t of CLOSE_LEN (the boot lands
// at CLOSE_HIT); the frame round it, the opening and the fade are done here either way.
//
// The still parts (the inside of the panel, each look's) are painted once into a canvas and stamped; only the moving
// bits (the boot, the balls, the blood, the words) are drawn each frame, a handful of shapes.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../m1/constants';

type Ctx = CanvasRenderingContext2D;

/** How long it's up (frames) and when the boot lands, in its own time. */
export const CLOSE_LEN = 96, CLOSE_HIT = 18;
export const PANEL_W = 520, PANEL_H = 280;
const OPEN = 6, FADE = 12;

export interface CloseUpLook {
  id: string; kind: string;
  female: boolean; robot: boolean; slapstick: boolean;
  /** Glitter in the blood (Piper). */
  glitter?: boolean;
  /** A boss's own (registerCloseUp), in place of the generic insides. */
  paint?: CloseUpPaint;
}
export type CloseUpPaint = (c: Ctx, t: number, look: CloseUpLook) => void;

const X0 = (CANVAS_WIDTH - PANEL_W) / 2, Y0 = Math.round(CANVAS_HEIGHT * 0.45 - PANEL_H / 2);
/** The middle of the crotch, in the panel. */
const CX = PANEL_W / 2, CY = 128;

// ---- a cheap repeatable random (the blood's the same every time, nothing kept)
const rnd = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const drawCloseUp = (c: Ctx, look: CloseUpLook, t: number) => {
  const open = clamp(t / OPEN), fade = clamp((CLOSE_LEN - t) / FADE);
  const h = Math.max(2, Math.round(PANEL_H * open));
  c.save();
  c.globalAlpha = fade;
  // (the frame: black, a red rim, a white edge, and the insides clipped to it)
  const y = Y0 + (PANEL_H - h) / 2;
  c.fillStyle = '#000'; c.fillRect(X0 - 10, y - 10, PANEL_W + 20, h + 20);
  c.fillStyle = '#B91C1C'; c.fillRect(X0 - 6, y - 6, PANEL_W + 12, h + 12);
  c.fillStyle = '#FDE68A'; c.fillRect(X0 - 2, y - 2, PANEL_W + 4, h + 4);
  c.beginPath(); c.rect(X0, y, PANEL_W, h); c.clip();
  c.translate(X0, Y0);
  if (look.paint) look.paint(c, t, look);
  else if (look.slapstick) slapstick(c, t);
  else xray(c, t, look);
  // (the opening's white flash)
  if (t < OPEN + 3) { c.fillStyle = `rgba(255,255,255,${(1 - t / (OPEN + 3)).toFixed(2)})`; c.fillRect(0, 0, PANEL_W, PANEL_H); }
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------------
// The X-ray

const baked = new Map<string, HTMLCanvasElement>();
const bakedInside = (look: CloseUpLook) => {
  const key = `${look.robot ? 'r' : 'h'}${look.female ? 'f' : 'm'}`;
  let cv = baked.get(key);
  if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = PANEL_W; cv.height = PANEL_H;
  const g = cv.getContext('2d')!;
  // (the dark, banded: the X-ray's glow down the middle)
  const bands = look.robot ? ['#0B1220', '#111A2B', '#172338', '#1D2B44'] : ['#020617', '#06142B', '#0A1F3D', '#0E2A52'];
  for (let i = 0; i < 4; i++) { g.fillStyle = bands[i]; const w = PANEL_W - i * 110; g.fillRect((PANEL_W - w) / 2, 0, w, PANEL_H); }
  // (dithered between the bands)
  g.fillStyle = 'rgba(255,255,255,0.05)';
  for (let yy = 0; yy < PANEL_H; yy += 2) for (let xx = (yy / 2) % 2 * 2; xx < PANEL_W; xx += 4) if (Math.abs(xx - CX) % 110 < 6) g.fillRect(xx, yy, 1, 1);
  if (look.robot) robotInside(g, look.female); else fleshInside(g, look.female);
  // (scanlines over the lot)
  g.fillStyle = 'rgba(0,0,0,0.22)';
  for (let yy = 0; yy < PANEL_H; yy += 3) g.fillRect(0, yy, PANEL_W, 1);
  // (the X-RAY tag in the corner)
  g.font = '10px "Press Start 2P"'; g.fillStyle = '#7DD3FC'; g.fillText(look.robot ? 'SCAN' : 'X-RAY', 10, 20);
  baked.set(key, cv);
  return cv;
};

/** Thighs and hips see-through, the bones white, the skin's edge lit. */
const fleshInside = (g: Ctx, female: boolean) => {
  // (the body's outline: hips across the top, the two thighs down either side, the crotch between)
  const skin = (col: string, grow: number) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(CX - 230 - grow, -10); g.lineTo(CX + 230 + grow, -10);
    g.lineTo(CX + 210 + grow, PANEL_H + 10); g.lineTo(CX + 40 - grow, PANEL_H + 10);
    g.quadraticCurveTo(CX + 26 - grow, CY + 40, CX, CY + 24 + grow);
    g.quadraticCurveTo(CX - 26 + grow, CY + 40, CX - 40 + grow, PANEL_H + 10);
    g.lineTo(CX - 210 - grow, PANEL_H + 10); g.closePath(); g.fill();
  };
  skin('rgba(125,211,252,0.18)', 0);
  skin('rgba(125,211,252,0.12)', -14);
  // (the fat: a thick band in from the skin, the ladies' deeper; Piper's is the reason for the "through layers of fat")
  if (female) skin('rgba(253,230,138,0.10)', -30);
  // (the pelvis: a butterfly of bone across the top, the hole through the middle)
  g.fillStyle = '#E2E8F0';
  g.beginPath();
  g.moveTo(CX - 200, 6); g.quadraticCurveTo(CX - 120, -4, CX - 60, 30); g.quadraticCurveTo(CX - 30, 60, CX - 18, 88);
  g.lineTo(CX + 18, 88); g.quadraticCurveTo(CX + 30, 60, CX + 60, 30); g.quadraticCurveTo(CX + 120, -4, CX + 200, 6);
  g.lineTo(CX + 170, 60); g.quadraticCurveTo(CX + 100, 70, CX + 60, 92); g.lineTo(CX - 60, 92); g.quadraticCurveTo(CX - 100, 70, CX - 170, 60);
  g.closePath(); g.fill();
  g.fillStyle = '#0A1F3D'; g.beginPath(); g.ellipse(CX, 52, 34, 26, 0, 0, Math.PI * 2); g.fill();
  // (shaded under, a lit top edge)
  g.fillStyle = '#94A3B8'; g.fillRect(CX - 160, 58, 100, 4); g.fillRect(CX + 60, 58, 100, 4);
  g.fillStyle = '#FFFFFF'; g.fillRect(CX - 190, 6, 120, 2); g.fillRect(CX + 70, 6, 120, 2);
  // (the femurs: down from the hip sockets, a knob each)
  for (const s of [-1, 1]) {
    g.fillStyle = '#CBD5E1';
    g.beginPath(); g.ellipse(CX + s * 130, 70, 20, 18, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(CX + s * 130, 70); g.rotate(s * 0.12); g.fillRect(-11, 0, 22, PANEL_H); g.fillStyle = '#94A3B8'; g.fillRect(s > 0 ? 5 : -11, 0, 6, PANEL_H); g.restore();
  }
  // (the pubic bone at the front, the hit's going to crack it)
  g.fillStyle = '#F1F5F9'; g.fillRect(CX - 22, 86, 44, 10);
};

/** Machine insides: plates, bolts, a gear, wiring. */
const robotInside = (g: Ctx, female: boolean) => {
  g.fillStyle = '#475569'; g.fillRect(CX - 220, 0, 440, 60);
  g.fillStyle = '#64748B'; g.fillRect(CX - 220, 0, 440, 6);
  g.fillStyle = '#334155'; g.fillRect(CX - 220, 54, 440, 6);
  for (let i = 0; i < 9; i++) { g.fillStyle = '#CBD5E1'; g.fillRect(CX - 210 + i * 52, 26, 5, 5); }
  // (the legs' struts, a piston each)
  for (const s of [-1, 1]) {
    g.fillStyle = '#475569'; g.fillRect(CX + s * 130 - 22, 60, 44, PANEL_H);
    g.fillStyle = '#94A3B8'; g.fillRect(CX + s * 130 - 8, 70, 16, PANEL_H);
    g.fillStyle = '#1E293B'; g.fillRect(CX + s * 130 + (s > 0 ? -22 : 14), 60, 8, PANEL_H);
  }
  // (a gear, the hatch's frame, wires)
  g.fillStyle = '#78716C';
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; g.fillRect(CX - 150 + Math.cos(a) * 26 - 4, 30 + Math.sin(a) * 26 - 4, 8, 8); }
  g.beginPath(); g.arc(CX - 150, 30, 22, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#FACC15'; g.lineWidth = 3; g.strokeRect(CX - 70, 70, 140, 110);
  g.strokeStyle = '#EF4444'; g.lineWidth = 2; g.beginPath(); g.moveTo(CX - 60, 60); g.bezierCurveTo(CX - 40, 120, CX + 40, 80, CX + 60, 150); g.stroke();
  g.strokeStyle = '#3B82F6'; g.beginPath(); g.moveTo(CX + 50, 60); g.bezierCurveTo(CX + 20, 110, CX - 30, 100, CX - 50, 160); g.stroke();
  g.font = '7px "Press Start 2P"'; g.fillStyle = '#FACC15'; g.fillText(female ? 'REPRO UNIT' : 'NUT ASSY', CX - 62, 82);
};

// ---- the moving parts
const bootAt = (t: number) => {
  // (up from under, fast, into the crotch; it stays buried)
  const k = clamp((t - OPEN) / (CLOSE_HIT - OPEN));
  return { x: CX - 6, y: lerp(PANEL_H + 90, CY + 54, k * k) };
};
const drawBoot = (c: Ctx, x: number, y: number) => {
  // (his boot, toe up, the jeans' cuff over it: solid, the one thing in there that isn't see-through)
  c.fillStyle = '#1E3A8A'; c.fillRect(x - 30, y + 40, 60, 80);
  c.fillStyle = '#2563EB'; c.fillRect(x - 30, y + 40, 8, 80);
  c.fillStyle = '#3F2A14'; c.beginPath(); c.moveTo(x - 32, y + 44); c.lineTo(x - 32, y + 4); c.quadraticCurveTo(x - 30, y - 22, x - 2, y - 26); c.quadraticCurveTo(x + 30, y - 22, x + 32, y + 4); c.lineTo(x + 32, y + 44); c.closePath(); c.fill();
  c.fillStyle = '#6B4423'; c.fillRect(x - 26, y - 14, 10, 50);
  c.fillStyle = '#111'; c.fillRect(x - 34, y - 30, 68, 8);
  c.fillStyle = '#9CA3AF'; for (let i = 0; i < 4; i++) c.fillRect(x - 6, y + 2 + i * 9, 12, 3);
};

const xray = (c: Ctx, t: number, look: CloseUpLook) => {
  c.drawImage(bakedInside(look), 0, 0);
  const hit = t - CLOSE_HIT, b = bootAt(t);
  // (the shake on the hit)
  if (hit >= 0 && hit < 10) c.translate((hit % 2 ? 1 : -1) * (10 - hit), 0);
  if (look.female) ovaries(c, hit, look); else balls(c, hit, look);
  // (the pelvis cracking: lines out from the front)
  if (hit >= 2 && !look.robot) {
    c.strokeStyle = '#000'; c.lineWidth = 2; c.beginPath();
    const n = Math.min(5, 1 + Math.floor(hit / 3));
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(i) - 0.5) * 2.4; c.moveTo(CX, 90); c.lineTo(CX + Math.cos(a) * 30, 90 + Math.sin(a) * 18); c.lineTo(CX + Math.cos(a + 0.4) * 52, 90 + Math.sin(a + 0.4) * 30); }
    c.stroke();
  }
  drawBoot(c, b.x, b.y);
  spray(c, hit, look);
  words(c, hit, look);
};

/** The balls: hanging there, squashed flat on the hit, then gone to bits. */
const balls = (c: Ctx, hit: number, look: CloseUpLook) => {
  const metal = look.robot;
  const sq = hit < 0 ? 0 : clamp(hit / 3);
  for (const s of [-1, 1]) {
    const x = CX + s * 18, y = CY + 34 - sq * 14;
    if (hit < 6) {
      const rx = 15 * (1 + sq * 0.9), ry = 18 * (1 - sq * 0.7);
      c.fillStyle = metal ? '#CBD5E1' : '#F9A8D4'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = metal ? '#F8FAFC' : '#FBCFE8'; c.beginPath(); c.ellipse(x - 4, y - 6, rx * 0.4, ry * 0.3, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = metal ? '#64748B' : '#BE185D'; c.fillRect(x - rx * 0.6, y + ry * 0.4, rx * 1.2, 3);
    } else {
      // (burst: bits flying out, tumbling down)
      const k = hit - 6;
      for (let i = 0; i < 7; i++) {
        const a = rnd(i + s * 9) * Math.PI * 2, v = 2 + rnd(i * 3 + s) * 4;
        const bx = x + Math.cos(a) * v * k, by = y + Math.sin(a) * v * k + 0.25 * k * k;
        c.fillStyle = metal ? (i % 2 ? '#94A3B8' : '#E2E8F0') : (i % 2 ? '#DB2777' : '#F9A8D4');
        c.fillRect(Math.round(bx) - 3, Math.round(by) - 3, 6 + (i % 3) * 2, 5);
      }
    }
  }
  // (the bag they hung in, slack after)
  if (!metal) { c.strokeStyle = 'rgba(249,168,212,0.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(CX, CY + 30 - sq * 12, 40, 26 * (1 - sq * 0.5), 0, 0, Math.PI); c.stroke(); }
};

/** The ovaries: up in the pelvis, a tube to each; the boot comes up through the fat and they pop. */
const ovaries = (c: Ctx, hit: number, look: CloseUpLook) => {
  const metal = look.robot;
  const y = 66;
  // (the womb and its tubes)
  c.strokeStyle = metal ? '#FACC15' : '#F472B6'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(CX - 60, y); c.quadraticCurveTo(CX - 30, y - 24, CX, y + 4); c.quadraticCurveTo(CX + 30, y - 24, CX + 60, y); c.stroke();
  c.fillStyle = metal ? '#64748B' : '#EC4899'; c.beginPath(); c.ellipse(CX, y + 14, 18, 22, 0, 0, Math.PI * 2); c.fill();
  const sq = hit < 0 ? 0 : clamp(hit / 3);
  for (const s of [-1, 1]) {
    const x = CX + s * 62;
    if (hit < 5) {
      c.fillStyle = metal ? '#A3E635' : '#FBCFE8'; c.beginPath(); c.ellipse(x, y, 12 * (1 + sq), 9 * (1 - sq * 0.6), 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = metal ? '#ECFCCB' : '#FFFFFF'; c.fillRect(x - 4, y - 4, 4, 3);
    } else {
      const k = hit - 5;
      for (let i = 0; i < 6; i++) {
        const a = rnd(i * 7 + s * 5) * Math.PI * 2, v = 2 + rnd(i + s * 2) * 3.5;
        c.fillStyle = metal ? (i % 2 ? '#A3E635' : '#94A3B8') : (i % 2 ? '#DB2777' : '#FBCFE8');
        c.fillRect(Math.round(x + Math.cos(a) * v * k) - 3, Math.round(y + Math.sin(a) * v * k + 0.2 * k * k) - 3, 6, 5);
      }
    }
  }
  // (the boot's way up through the fat: a dent rippling out)
  if (hit >= 0 && hit < 20 && !metal) { c.strokeStyle = `rgba(253,230,138,${(0.6 - hit * 0.03).toFixed(2)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(CX, CY + 30, 30 + hit * 6, 10 + hit * 2, 0, Math.PI, Math.PI * 2); c.stroke(); }
};

/** Blood (or oil and sparks) out of it, falling. */
const spray = (c: Ctx, hit: number, look: CloseUpLook) => {
  if (hit < 0) return;
  const y0 = look.female ? 70 : CY + 26, n = 46;
  for (let i = 0; i < n; i++) {
    const start = Math.floor(rnd(i * 5) * 8);
    const k = hit - start;
    if (k < 0) continue;
    const a = -Math.PI / 2 + (rnd(i) - 0.5) * 3, v = 4 + rnd(i * 2) * 8;
    const x = CX + Math.cos(a) * v * k, y = y0 + Math.sin(a) * v * k + 0.32 * k * k;
    if (y > PANEL_H + 10) continue;
    if (look.robot) {
      if (i % 3 === 0) { c.strokeStyle = i % 2 ? '#FDE047' : '#FFFFFF'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a) * 10, y - Math.sin(a) * 10); c.stroke(); }
      else { c.fillStyle = '#0B0B0B'; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5); c.fillStyle = '#4C1D95'; c.fillRect(Math.round(x) - 1, Math.round(y) - 2, 2, 1); }
    } else {
      const r = 2 + (i % 4);
      c.fillStyle = i % 5 === 0 ? '#7F1D1D' : '#DC2626'; c.fillRect(Math.round(x) - r, Math.round(y) - r, r * 2, r * 2);
      c.fillStyle = '#F87171'; c.fillRect(Math.round(x) - r, Math.round(y) - r, Math.max(1, r - 1), 1);
      if (look.glitter && i % 3 === 0 && (hit + i) % 4 < 2) { c.fillStyle = i % 2 ? '#F0ABFC' : '#FDE047'; c.fillRect(Math.round(x) + r, Math.round(y) - r - 2, 2, 2); }
    }
  }
  // (a pool of it running down the inside of the panel)
  if (!look.robot && hit > 10) { const d = Math.min(PANEL_H - CY, (hit - 10) * 4); c.fillStyle = '#991B1B'; for (let i = 0; i < 6; i++) c.fillRect(CX - 70 + i * 26, CY + 40, 6, d * (0.5 + rnd(i * 11) * 0.5)); }
};

const WORDS_FLESH = ['CRUNCH!', 'POP!', 'SPLUT!'], WORDS_METAL = ['KRZZT!', 'CLANK!', 'SPROING!'];
const words = (c: Ctx, hit: number, look: CloseUpLook) => {
  if (hit < 1) return;
  const pool = look.robot ? WORDS_METAL : WORDS_FLESH;
  const w = pool[Math.floor(rnd(look.kind.length + look.id.length) * pool.length)];
  const s = Math.min(1, hit / 4) * (1 + Math.max(0, 6 - hit) * 0.06);
  c.save(); c.translate(CX + 120, 70); c.rotate(-0.18); c.scale(s, s);
  c.font = '28px "Press Start 2P"'; c.textAlign = 'center';
  c.fillStyle = '#000'; c.fillText(w, 4, 4);
  c.fillStyle = look.robot ? '#FDE047' : '#EF4444'; c.fillText(w, 0, 0);
  c.fillStyle = '#FFFFFF'; c.fillText(w, -1, -2);
  c.fillStyle = look.robot ? '#FDE047' : '#EF4444'; c.fillText(w, 0, 0);
  c.restore();
};

// ---------------------------------------------------------------------------------------------------------------------
// The slapstick one (the pundits: a cartoon show's): a face, gross, the eyes crossing, the cheeks out, the wheeze

const slapstick = (c: Ctx, t: number) => {
  const hit = t - CLOSE_HIT;
  // (sunburst behind, the cartoon's)
  for (let i = 0; i < 12; i++) {
    c.fillStyle = i % 2 ? '#FDE047' : '#F97316';
    c.beginPath(); c.moveTo(CX, 140);
    const a0 = (i / 12) * Math.PI * 2 + t * 0.01, a1 = ((i + 1) / 12) * Math.PI * 2 + t * 0.01;
    c.lineTo(CX + Math.cos(a0) * 400, 140 + Math.sin(a0) * 400); c.lineTo(CX + Math.cos(a1) * 400, 140 + Math.sin(a1) * 400); c.fill();
  }
  const k = clamp(hit / 10), shake = hit >= 0 && hit < 30 ? (hit % 2 ? 2 : -2) : 0;
  const x = CX + shake, y = 140;
  // (the face: big, bulging, going red then purple)
  c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, y, 124, 114, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = hit < 0 ? '#FCD9B6' : k < 1 ? '#F9A8A8' : '#C084FC'; c.beginPath(); c.ellipse(x, y, 120, 110, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(x + 30, y + 30, 80, 70, 0, 0, Math.PI * 2); c.fill();
  // (the cheeks puffing out)
  const puff = hit < 0 ? 0 : Math.min(1, hit / 6) * (1 - Math.max(0, hit - 50) / 40);
  c.fillStyle = '#F87171';
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(x + s * 74, y + 30, 20 + puff * 22, 16 + puff * 16, 0, 0, Math.PI * 2); c.fill(); }
  // (the eyes: wide, the pupils crossing in toward the nose, bloodshot)
  for (const s of [-1, 1]) {
    const ex = x + s * 42, ey = y - 26, r = 26 + puff * 6;
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(ex, ey, r + 3, r + 6, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(ex, ey, r, r + 3, 0, 0, Math.PI * 2); c.fill();
    if (hit > 2) { c.strokeStyle = '#DC2626'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 4; i++) { const a = rnd(i + s * 4) * Math.PI * 2; c.moveTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); c.lineTo(ex + Math.cos(a) * r * 0.5, ey + Math.sin(a) * r * 0.5); } c.stroke(); }
    const cross = -s * k * 14;
    c.fillStyle = '#000'; c.beginPath(); c.arc(ex + cross, ey + 4, 9, 0, Math.PI * 2); c.fill();
  }
  // (the mouth: a tight O, the wheeze; the tongue out after)
  const mo = hit < 0 ? 4 : 10 + Math.sin(hit * 0.5) * 3;
  c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, y + 52, mo, mo * 1.5, 0, 0, Math.PI * 2); c.fill();
  if (hit > 40) { c.fillStyle = '#F472B6'; c.fillRect(x - 6, y + 54, 12, 10 + Math.min(16, hit - 40)); }
  // (sweat flying)
  if (hit > 0) for (let i = 0; i < 6; i++) { const a = rnd(i) * Math.PI - Math.PI, d = 130 + ((hit * 3 + i * 17) % 60); c.fillStyle = '#93C5FD'; c.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8, 5, 8); }
  // (the word: the wheeze)
  if (hit > 4) {
    c.save(); c.translate(CX, 262); c.font = '20px "Press Start 2P"'; c.textAlign = 'center';
    const s = hit < 30 ? 'OOOOOF!' : 'HHHNNNGHH...';
    c.fillStyle = '#000'; c.fillText(s, 3, 3); c.fillStyle = '#FFFFFF'; c.fillText(s, 0, 0);
    c.restore();
  }
};
