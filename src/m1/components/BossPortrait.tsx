import React, { useEffect, useRef } from 'react';
import { drawBoss, makeSitter } from '../game/render/bosses';
import { setCameraStare } from '../game/render/bosses/kit';
import { DOSSIERS } from '../content/dossiers';
import { BOSS_LOCATIONS } from '../content/roster';

/**
 * Stage-select portrait, as a booking photo: the boss's actual in-game sprite, head and shoulders against a
 * height chart, holding his booking placard, staring down the camera. Still alive: he breathes and blinks,
 * and every few seconds the flash goes off (he screws his eyes up, and his shadow jumps onto the wall). Once he's
 * dead, it's the file copy: grey, bloodied, out cold, DECEASED on the placard and crossed off in red marker.
 */

const SIZE = 240;
const SCALE = 2.8;
/** Where his sprite goes on the card. */
const OX = SIZE / 2 - 40 * SCALE, OY = 34;
/** The height chart: where six foot is, and an inch. */
const SIX_FOOT = 72, INCH = 3.3;
/** How often the flash goes, and how long it lasts. */
const FLASH_EVERY = 260, FLASH_FRAMES = 14;

/** The wall's tint for each boss (a booking room somewhere near where he was picked up). */
const WALLS: Record<string, string> = {
  'Artie Avalanche': '#9FB4C4',
  'Victor Volcano': '#B9A393',
  'Ernie Earthquake': '#AFA79B',
  'Hector Hurricane': '#9DB6B8',
  'Toxic Tommy': '#A3AE98',
  'Blackout Barry': '#9C9AAE',
  'Oily Oscar': '#B3A58F',
  'Drug Trade Dale': '#B5A0AE',
};

/** The look each of them gives the camera (Tommy's stays his own: he's surfacing, grinning his head off). */
const MUGSHOT_FACES: Record<string, string> = {
  'Artie Avalanche': 'grim',
  'Victor Volcano': 'grin',
  'Ernie Earthquake': 'grump',
  'Hector Hurricane': 'beam',
  'Blackout Barry': 'blissed',
  'Oily Oscar': 'wink',
  'Drug Trade Dale': 'shifty',
};

/** ...and the look he gives it once he's been picked (locked in as the target): each takes it his own way. */
const TARGETED_FACES: Record<string, string> = {
  'Artie Avalanche': 'fierce',
  'Victor Volcano': 'roar',
  'Ernie Earthquake': 'fierce',
  'Hector Hurricane': 'shock',
  'Toxic Tommy': 'roar',
  'Blackout Barry': 'shock',
  'Oily Oscar': 'fierce',
  'Drug Trade Dale': 'manic',
};

/** His name as the booking officer would put it: no nicknames, no letters after it. */
const bookedName = (id: string) =>
  (DOSSIERS[id]?.realName ?? id.toUpperCase()).replace(/"[^"]*"\s*/g, '').replace(/,.*$/, '').replace(/\s+/g, ' ').trim();

/** A booking number that's always the same for the same man. */
const bookingNo = (id: string) => {
  let h = 7;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 900000;
  return `${String(100000 + h).slice(0, 6)}-${BOSS_LOCATIONS[id]?.stateCode ?? 'US'}`;
};

const BossPortrait: React.FC<{ id: string; dead?: boolean; locked?: boolean }> = ({ id, dead = false, locked = false }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  // (picked as the target: his face changes, and the flash goes off as it happens)
  const lockedRef = useRef(locked); lockedRef.current = locked;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    // (dead: out cold and bloodied, the photo gone grey, and he doesn't move)
    const sitter = makeSitter(id);
    if (dead) sitter.health = 0;
    else sitter.faceMood = MUGSHOT_FACES[id];
    const wall = dead ? '#8A8A8A' : WALLS[id] || '#A8A8A8';
    const name = bookedName(id), number = bookingNo(id);
    // (each card's flash goes off at its own time)
    let frame = Math.floor(Math.random() * FLASH_EVERY), raf = 0;

    const sprite = (on: CanvasRenderingContext2D, f: number) => {
      on.save();
      on.translate(OX, OY);
      on.scale(SCALE, SCALE);
      setCameraStare(true);
      drawBoss(on, sitter, id, f);
      setCameraStare(false);
      on.restore();
    };
    const offscreen = () => { const c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE; return c; };

    // Drawn once: the wall (lit from the front, darker round the edges) with its height chart, and his shadow
    // (a blurred silhouette: filters are dear, so it isn't redone every frame)
    const back = offscreen(), bctx = back.getContext('2d')!;
    bctx.fillStyle = wall;
    bctx.fillRect(0, 0, SIZE, SIZE);
    const lit = bctx.createRadialGradient(SIZE / 2, SIZE * 0.35, 20, SIZE / 2, SIZE / 2, SIZE * 0.8);
    lit.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    lit.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    bctx.fillStyle = lit;
    bctx.fillRect(0, 0, SIZE, SIZE);
    heightChart(bctx);
    const shade = offscreen(), sctx = shade.getContext('2d')!;
    sctx.filter = 'brightness(0) blur(2px)';
    sprite(sctx, 0);

    const draw = () => {
      frame++;
      raf = requestAnimationFrame(draw);
      // (30 frames a second is plenty for a photo that breathes)
      if (frame % 2) return;
      // (nothing to draw while it can't be seen: under the garage, say)
      if (canvas!.checkVisibility && !canvas!.checkVisibility({ visibilityProperty: true } as CheckVisibilityOptions)) return;
      if (!dead) {
        const want = lockedRef.current ? TARGETED_FACES[id] : MUGSHOT_FACES[id];
        if (lockedRef.current && sitter.faceMood !== want) frame = frame - (frame % FLASH_EVERY) + FLASH_EVERY; // the flash, now
        sitter.faceMood = want;
      }
      const f = frame % FLASH_EVERY;
      const flash = !dead && f < FLASH_FRAMES ? 1 - f / FLASH_FRAMES : 0;
      // He squints into the flash
      if (!dead) sitter.hitCooldown = f < 12 ? 45 : 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(back, 0, 0);

      // His shadow on the wall (hard and sudden in the flash), then him
      ctx.globalAlpha = 0.18 + flash * 0.35;
      ctx.drawImage(shade, 9, 5);
      ctx.globalAlpha = 1;
      if (dead) ctx.filter = 'grayscale(0.85) contrast(1.15)';
      sprite(ctx, dead ? 0 : frame);
      ctx.filter = 'none';

      placard(ctx, name, dead ? 'DECEASED' : number, dead ? 0 : frame, dead);
      if (dead) crossedOff(ctx);

      // The flash itself, and the film's grain
      if (flash > 0) { ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.75})`; ctx.fillRect(0, 0, SIZE, SIZE); }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 1, 1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      for (let i = 0; i < 25; i++) ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 1, 1);
      // A dead man doesn't move: one photo, and done
      if (dead) cancelAnimationFrame(raf);
    };
    frame |= 1; // (odd, so the first call draws)
    draw();
    return () => cancelAnimationFrame(raf);
  }, [id, dead]);

  return <canvas ref={ref} width={SIZE} height={SIZE} className="w-full h-full" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

/** The height chart painted on the wall: a line an inch, heavier every six, the feet marked at both edges. */
const heightChart = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.font = 'bold 9px "Press Start 2P", monospace';
  ctx.textBaseline = 'middle';
  for (let inches = -24; inches <= 30; inches++) {
    const y = SIX_FOOT - inches * INCH;
    if (y < -4 || y > SIZE + 4) continue;
    const foot = inches % 12 === 0, half = inches % 6 === 0;
    ctx.fillStyle = foot ? 'rgba(20, 24, 30, 0.55)' : half ? 'rgba(20, 24, 30, 0.35)' : 'rgba(20, 24, 30, 0.14)';
    ctx.fillRect(0, y, SIZE, foot ? 1.6 : half ? 1.1 : 0.7);
    if (foot) {
      const label = `${6 + inches / 12}'`;
      ctx.fillStyle = 'rgba(20, 24, 30, 0.7)';
      ctx.textAlign = 'left'; ctx.fillText(label, 4, y - 6);
      ctx.textAlign = 'right'; ctx.fillText(label, SIZE - 4, y - 6);
    }
  }
  ctx.restore();
};

/** The booking placard held up at his chest: department, name, number, date. */
const placard = (ctx: CanvasRenderingContext2D, name: string, number: string, frame: number, dead: boolean) => {
  const w = 146, h = 44;
  const x = SIZE / 2 - w / 2, y = 148 + Math.sin(frame * 0.05) * 0.8;
  ctx.save();
  ctx.translate(SIZE / 2, y + h / 2);
  ctx.rotate(Math.sin(frame * 0.03) * 0.012);
  ctx.translate(-SIZE / 2, -(y + h / 2));
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'; ctx.fillRect(x + 3, y + 3, w, h);
  ctx.fillStyle = '#111317'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#E5E7EB'; ctx.lineWidth = 1; ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  ctx.fillStyle = '#E5E7EB';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillText('DEPT. OF DOMESTIC DISPOSAL', SIZE / 2, y + 9);
  // The name, as big as fits
  let size = 10;
  ctx.font = `${size}px "Press Start 2P", monospace`;
  while (size > 5 && ctx.measureText(name).width > w - 12) { size -= 0.5; ctx.font = `${size}px "Press Start 2P", monospace`; }
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(name, SIZE / 2, y + 21);
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillStyle = dead ? '#EF4444' : '#FACC15';
  ctx.fillText(number, SIZE / 2, y + 33);
  ctx.restore();
};

/** Crossed off the list: two strokes of red marker right across the photo. */
const crossedOff = (ctx: CanvasRenderingContext2D) => {
  ctx.save();
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.85)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(26, 30); ctx.quadraticCurveTo(118, 100, 214, 196); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(212, 26); ctx.quadraticCurveTo(128, 104, 30, 192); ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(30, 29); ctx.quadraticCurveTo(120, 97, 214, 190); ctx.stroke();
  ctx.restore();
};

export default BossPortrait;
