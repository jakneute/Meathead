import React, { useEffect, useRef, useState } from 'react';
import USAMap from './USAMap';
import { BOSS_LOCATIONS, StageInfo } from '../content/roster';
import { WHITE_HOUSE_ID, WHITE_HOUSE_LOCATION } from '../content/whiteHouse';
import { drawSkyClouds, DEPLOY_CLOUD_SCROLL_END } from '../game/render/skyClouds';
import { getActiveGamepad, isButtonPressed, GP_BUTTONS } from '../game/platform/gamepad';
import { SKIP_AFTER_MS } from '../game/platform/skip';
import SkipPrompt from './SkipPrompt';

/**
 * Target select to gameplay: the recon map goes fullscreen and the camera
 * swoops down onto the target's hometown in a spinning, tilting, SNES "Mode 7"
 * plane, then dives into the clouds. The stage opens by coming out of those
 * same clouds (the skyfall intro), so the two join up.
 *
 * It skips the usual way (SKIP >>, or Start / Esc).
 */

interface Props {
  stageId: string;
  currentStages: StageInfo[];
  defeatedStages: string[];
  onDone: () => void;
}

/** How long it runs (ms). */
const DURATION = 3600;
/** The Mode 7 buffer: chunky, then blown up to the screen with no smoothing. */
const W = 320, H = 240;
/** The map texture: the recon map's 440x290 SVG, drawn at 4x. */
const TEX_SCALE = 4, TW = 440 * TEX_SCALE, TH = 290 * TEX_SCALE;
/** The screen row the target's kept on. */
const TARGET_ROW = H * 0.56;
const FOCAL = 220;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = (a: number, b: number, t: number) => { const k = clamp01((t - a) / (b - a)); return k * k * (3 - 2 * k); };
/** #rrggbb to a little-endian ABGR pixel. */
const px = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0xff << 24) | ((n & 0xff) << 16) | (n & 0xff00) | (n >> 16); };

const GROUND = px('#03070D'), GRID = px('#0B3A4A'), FOG = px('#0A1626');

/** Where the camera is at time u (0..1): spin, altitude and pitch (straight down, tipping up to a skimming Mode 7 view). */
const cameraAt = (u: number) => {
  const angle = -0.4 + Math.PI * 2 * 1.15 * easeInOut(clamp01(u / 0.86));
  // Altitude: high enough to see the whole country, down low over the town, then a dive
  let height = 1700 * Math.pow(70 / 1700, easeInOut(clamp01(u / 0.8)));
  if (u > 0.8) height = 70 - 58 * easeInOut(clamp01((u - 0.8) / 0.2));
  // Pitch below the horizontal: straight down, then tilting up till the horizon's in view
  const pitch = Math.PI / 2 - (Math.PI / 2 - 0.36) * easeInOut(clamp01((u - 0.25) / 0.55)) - 0.12 * easeInOut(clamp01((u - 0.8) / 0.2));
  return { angle, height, pitch };
};

const DeployTransition: React.FC<Props> = ({ stageId, currentStages, defeatedStages, onDone }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(false);
  const finish = () => { if (!doneRef.current) { doneRef.current = true; onDone(); } };
  const [skipShown, setSkipShown] = useState(false);

  useEffect(() => {
    const loc = stageId === WHITE_HOUSE_ID ? WHITE_HOUSE_LOCATION : BOSS_LOCATIONS[stageId];
    const target = { x: (loc?.coords.x ?? 220) * TEX_SCALE, y: (loc?.coords.y ?? 145) * TEX_SCALE };
    const canvas = canvasRef.current!, overlay = overlayRef.current!;
    const ctx = canvas.getContext('2d')!, octx = overlay.getContext('2d')!;
    const out = ctx.createImageData(W, H);
    const out32 = new Uint32Array(out.data.buffer);
    let tex32: Uint32Array | null = null;
    let raf = 0, start = 0;
    let padStartHeld = true, skipUp = false;

    // The texture: the recon map's own SVG, rasterised big, with a target painted on the town
    const svg = mapRef.current?.querySelector('svg');
    if (svg) {
      const copy = svg.cloneNode(true) as SVGSVGElement;
      copy.setAttribute('width', String(TW));
      copy.setAttribute('height', String(TH));
      copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      // (not the radar sweep going round the target: the fly-in paints its own)
      copy.querySelectorAll('[data-noraster]').forEach(n => n.remove());
      const img = new Image();
      img.onload = () => {
        const t = document.createElement('canvas'); t.width = TW; t.height = TH;
        const tc = t.getContext('2d')!;
        tc.fillStyle = '#03070D'; tc.fillRect(0, 0, TW, TH);
        tc.drawImage(img, 0, 0, TW, TH);
        // A bullseye on the target
        tc.strokeStyle = '#FF1F1F'; tc.lineWidth = 6;
        for (const r of [18, 38, 62]) { tc.beginPath(); tc.arc(target.x, target.y, r, 0, Math.PI * 2); tc.stroke(); }
        tc.fillStyle = '#FFE14D'; tc.beginPath(); tc.arc(target.x, target.y, 9, 0, Math.PI * 2); tc.fill();
        tex32 = new Uint32Array(tc.getImageData(0, 0, TW, TH).data.buffer);
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy));
    }

    // Sky colours for the rows above the horizon
    const skyRow = (j: number, horizon: number) => {
      const k = clamp01((horizon - j) / 120);
      const r = Math.round(40 - 30 * k), g = Math.round(70 - 55 * k), b = Math.round(110 - 70 * k);
      return (0xff << 24) | (b << 16) | (g << 8) | r;
    };

    const render = (u: number) => {
      const { angle, height, pitch } = cameraAt(u);
      const fx = Math.sin(angle), fy = -Math.cos(angle);   // forward, across the map
      const rx = Math.cos(angle), ry = Math.sin(angle);    // right
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      // Where a screen row's ray meets the map: how far ahead, and how far out per column
      const rowHit = (j: number) => {
        const vy = (j - H / 2) / FOCAL;
        const down = vy * cp + sp;
        if (down <= 0.002) return null;
        const t = height / down;
        return { ahead: t * (cp - vy * sp), t };
      };
      // Put the target on TARGET_ROW, dead centre
      const hit = rowHit(TARGET_ROW)!;
      const camX = target.x - fx * hit.ahead, camY = target.y - fy * hit.ahead;
      const horizonRow = H / 2 - (sp / cp) * FOCAL;
      for (let j = 0; j < H; j++) {
        const row = j * W;
        const h = rowHit(j);
        if (!h) { const c = skyRow(j, horizonRow); for (let i = 0; i < W; i++) out32[row + i] = c; continue; }
        const step = h.t / FOCAL;
        let wx = camX + fx * h.ahead - rx * step * (W / 2);
        let wy = camY + fy * h.ahead - ry * step * (W / 2);
        const sx = rx * step, sy = ry * step;
        // Distance haze toward the horizon
        const fog = clamp01((h.t / height - 4) / 14);
        for (let i = 0; i < W; i++, wx += sx, wy += sy) {
          const ix = wx | 0, iy = wy | 0;
          let c: number;
          if (tex32 && ix >= 0 && iy >= 0 && ix < TW && iy < TH) c = tex32[iy * TW + ix];
          else c = (((ix % 160) + 160) % 160 < 6 || ((iy % 160) + 160) % 160 < 6) ? GRID : GROUND;
          if (fog > 0) {
            const r = c & 0xff, g = (c >> 8) & 0xff, b = (c >> 16) & 0xff;
            const fr = FOG & 0xff, fg = (FOG >> 8) & 0xff, fb = (FOG >> 16) & 0xff;
            c = (0xff << 24) | (Math.round(b + (fb - b) * fog) << 16) | (Math.round(g + (fg - g) * fog) << 8) | Math.round(r + (fr - r) * fog);
          }
          out32[row + i] = c;
        }
      }
      ctx.putImageData(out, 0, 0);

      // On top, at full resolution: the tracking HUD, the dive's clouds, the opening flash
      octx.clearRect(0, 0, 800, 600);
      const hudAlpha = 1 - smooth(0.78, 0.9, u);
      if (hudAlpha > 0) {
        octx.save();
        octx.globalAlpha = hudAlpha;
        // Reticle on the target while it's still a map
        const ret = 1 - smooth(0.45, 0.62, u);
        if (ret > 0) {
          const cx = 400, cy = TARGET_ROW * (600 / H), s = 34 + Math.sin(u * 60) * 4;
          octx.globalAlpha = hudAlpha * ret;
          octx.strokeStyle = '#FF3B3B'; octx.lineWidth = 3;
          for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
            octx.beginPath(); octx.moveTo(cx + dx * s, cy + dy * (s - 14)); octx.lineTo(cx + dx * s, cy + dy * s); octx.lineTo(cx + dx * (s - 14), cy + dy * s); octx.stroke();
          }
          octx.globalAlpha = hudAlpha;
        }
        octx.font = 'bold 12px "Press Start 2P"';
        octx.fillStyle = 'rgba(0,0,0,0.6)'; octx.fillRect(0, 0, 800, 34); octx.fillRect(0, 548, 800, 52);
        octx.fillStyle = '#22D3EE'; octx.textAlign = 'left';
        octx.fillText('SAT-LINK // TARGET LOCK', 16, 23);
        octx.textAlign = 'right';
        octx.fillStyle = '#FDE047';
        octx.fillText(`ALT ${String(Math.round(height * 24)).padStart(6, '0')} FT`, 784, 23);
        // The destination, typed out
        const line = `DEPLOYING TO ${loc ? `${loc.city}, ${loc.stateCode}` : 'TARGET'}`;
        const typed = line.slice(0, Math.floor(clamp01(u / 0.35) * line.length));
        octx.textAlign = 'left'; octx.fillStyle = '#FFFFFF';
        octx.fillText(typed + (Math.floor(u * 30) % 2 ? '_' : ''), 16, 574);
        if (loc) { octx.font = '9px "Press Start 2P"'; octx.fillStyle = '#22D3EE'; octx.fillText(loc.coordinatesText, 16, 591); }
        octx.restore();
      }
      // Diving into the clouds (the stage comes out of them)
      const cover = smooth(0.8, 0.97, u);
      drawSkyClouds(octx, 800, 600, cover, DEPLOY_CLOUD_SCROLL_END * clamp01((u - 0.72) / 0.28));
      // Carry-over flash from the LET'S GO
      const flash = 1 - clamp01(u / 0.07);
      if (flash > 0) { octx.fillStyle = `rgba(255,255,255,${flash})`; octx.fillRect(0, 0, 800, 600); }
    };

    const tick = (now: number) => {
      if (!start) start = now;
      const u = Math.min(1, (now - start) / DURATION);
      render(u);
      // Start skips (a fresh press)
      const gp = getActiveGamepad();
      const startHeld = !!gp && (isButtonPressed(gp, GP_BUTTONS.START) || isButtonPressed(gp, GP_BUTTONS.SELECT));
      if (startHeld && !padStartHeld && now - start > SKIP_AFTER_MS) { finish(); return; }
      padStartHeld = startHeld;
      if (!skipUp && now - start > SKIP_AFTER_MS) { skipUp = true; setSkipShown(true); }
      if (u >= 1) { finish(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const skip = (e: KeyboardEvent) => { if (e.key === 'Escape' && start && performance.now() - start > SKIP_AFTER_MS) finish(); };
    window.addEventListener('keydown', skip);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', skip); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-black">
      {skipShown && <SkipPrompt onSkip={() => finish()} />}
      {/* The recon map, rendered off-screen just to lift its SVG for the texture */}
      <div ref={mapRef} className="absolute -left-[9999px] top-0 w-[440px] pointer-events-none" aria-hidden>
        {/* (Washington: the star on it, the targets all off the map, as on the select screen) */}
        <USAMap selectedBossId={stageId} defeatedStages={defeatedStages} currentStages={stageId === WHITE_HOUSE_ID ? [] : currentStages}
          whiteHouse={stageId === WHITE_HOUSE_ID} whiteHouseSelected={stageId === WHITE_HOUSE_ID} />
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated' }} />
      <canvas ref={overlayRef} width={800} height={600} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default DeployTransition;
