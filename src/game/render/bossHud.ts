// A boss's meter, the same kind the mid-bosses get (the moose, the doorman): a panel up top, clear of the player's,
// his name and what he's known for, and his bar under them (filling up as he comes on, a pale trail behind it as he's
// hurt, flashing when he's hit, going red at half). Not the little green bar over the head the regular goons get. The
// finale's alien has his own (stages/finale/room.ts).

import type { GameState } from '../core/state';
import type { Enemy } from '../../types';
import { FINALE_STAGE } from '../../constants';

type Ctx = CanvasRenderingContext2D;

const L = 330, R = 780;

/** What each of them is known for, and his colors (the panel's edge, the bar). */
const BOSS_LOOK: Record<string, { tag: string; edge: string; bar: string }> = {
  'Artie Avalanche': { tag: 'HIS MOUNTAIN. HIS RULES.', edge: '#7DD3FC', bar: '#38BDF8' },
  'Victor Volcano': { tag: 'HOT YOGA. HOTTER TEMPER.', edge: '#F97316', bar: '#EA580C' },
  'Ernie Earthquake': { tag: 'SHAKES THE WHOLE BAY', edge: '#A16207', bar: '#CA8A04' },
  'Hector Hurricane': { tag: 'CATEGORY FIVE ASSHOLE', edge: '#94A3B8', bar: '#64748B' },
  'Toxic Tommy': { tag: 'FULLY BIOHAZARDOUS', edge: '#84CC16', bar: '#65A30D' },
  'Blackout Barry': { tag: 'LIGHTS OUT, MAN', edge: '#FACC15', bar: '#EAB308' },
  'Oily Oscar': { tag: 'GREASIEST MAN IN TEXAS', edge: '#57534E', bar: '#44403C' },
  'Drug Trade Dale': { tag: 'NO QUESTIONS ASKED', edge: '#A855F7', bar: '#9333EA' },
};

/** Per boss: when he was first on the screen (the bar fills as he comes on), the trail behind his bar, his health last frame. */
const seen = new WeakMap<Enemy, { at: number; trail: number; last: number; hitAt: number }>();

export const drawBossHud = (ctx: Ctx, state: GameState, stageId: string | null) => {
  if (!stageId || stageId === FINALE_STAGE || state.player.inCutscene || state.victoryString || state.bossExplosionTimer > 0) return;
  const boss = state.enemies.find(e => e.type === 'boss' && e.health > 0 && !e.isBlownAway);
  if (!boss) return;
  // (only once he's on the screen: not while he's still somewhere up ahead)
  const cam = state.camera;
  if (boss.pos.x + boss.width < cam.x || boss.pos.x > cam.x + 800) return;
  const look = BOSS_LOOK[stageId] ?? { tag: 'PRIORITY TARGET', edge: '#B91C1C', bar: '#DC2626' };
  let s = seen.get(boss);
  if (!s) { s = { at: state.frame, trail: 1, last: boss.health, hitAt: -99 }; seen.set(boss, s); }
  const k = Math.max(0, Math.min(1, boss.health / boss.maxHealth));
  if (boss.health < s.last) s.hitAt = state.frame;
  s.last = boss.health;
  s.trail = Math.max(k, s.trail - 0.004);
  const fill = Math.min(1, (state.frame - s.at) / 70);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(L - 10, 12, R - L + 20, 40);
  ctx.strokeStyle = look.edge; ctx.lineWidth = 2; ctx.strokeRect(L - 10, 12, R - L + 20, 40);
  ctx.font = 'bold 10px "Press Start 2P"'; ctx.fillStyle = '#FDE68A'; ctx.textAlign = 'left';
  ctx.fillText(stageId.toUpperCase(), L, 28);
  ctx.font = '7px "Press Start 2P"'; ctx.fillStyle = '#FCA5A5'; ctx.textAlign = 'right';
  ctx.fillText(look.tag, R, 28);
  ctx.fillStyle = '#1C1917'; ctx.fillRect(L, 34, R - L, 10);
  if (fill >= 1) { ctx.fillStyle = '#FDE68A'; ctx.globalAlpha = 0.45; ctx.fillRect(L, 34, (R - L) * s.trail, 10); ctx.globalAlpha = 1; }
  ctx.fillStyle = state.frame - s.hitAt < 4 ? '#FEF3C7' : k < 0.5 ? '#DC2626' : look.bar;
  ctx.fillRect(L, 34, (R - L) * Math.min(fill, k), 10);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(L, 34, (R - L) * Math.min(fill, k), 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = L; x < R; x += 19) ctx.fillRect(x, 34, 1, 10);
  ctx.restore();
};
