// The hidden upgrades put into the engine (state.ts's README): run once, from App.tsx, before anything's built.
// Max health (respawns, pickups, the gore on him), every weapon's capacity, the power cells, the dive kick free (no
// stomp refund: the owner's "just remove the dive kick refunding. it's just generally free to use"), and his moves'
// damage: regular enemies' tables untouched, piece or not (the owner's "upgraded charge moves should only do extra
// damage to bosses"), the sub-bosses that take his moves through the engine (the
// White House pundits) normalized (bossMelee.ts). The land bosses' own fights work theirs out themselves (each
// fight.ts's plain hit: bossMelee), and the rex and the hell demon land his moves on themselves (subBossMelee).

import type { Enemy } from '../../m1/types';
import { setPlayerMaxHealth, setPowerCells, setStompRefund, setMeleeDamageHook, setPowerHold } from '../../m1/game/core/tuning';
import { noteMelee } from './lastHit';
import { setMaxAmmoScale, maxAmmo, MAX_AMMO } from '../../m1/constants';
import { maxHealth, ammoScale, powerCells, subscribeUpgrades } from './state';
import { bossMeleeOf } from './bossMelee';
import { raged } from './amulet';
import { installGear } from './gear';
import { installArmorArt } from './armorArt';
import { setScreenOverlay, setUnderEnemies } from '../../m1/game/render/world';
import { drawCheapShotPanel, drawCheapShotFloor } from './cheapShot';
import { installCloseUps } from './closeups';
import { drawFireworksWash } from '../fireworks';
import { liveState } from '../cheats';
import type { WeaponType } from '../../m1/types';

/** The sub-bosses whose own sims take whatever the engine's move did to them (the White House pundits). */
const ENGINE_SUB_BOSSES = new Set(['m2:ct_perot', 'm2:ct_falwell', 'm2:ct_limbaugh', 'm2:ct_dole', 'm2:ct_newt']);

let installed = false;
export const installUpgrades = () => {
  if (installed) return;
  installed = true;
  setPlayerMaxHealth(maxHealth);
  setPowerCells(powerCells);
  setMaxAmmoScale(ammoScale);
  setStompRefund(false);
  // (what the armor and the cape do to his moves, his legs and what hurts him: gear.ts)
  installGear();
  // (the armor's look: every piece on him wherever he's drawn, while he has it: armorArt.ts)
  installArmorArt();
  // (the hand armor's cheap shot: its close-up, over everything)
  // (under it, the fireworks' faint wash of color over the outdoor picture at the day's last hour: fireworks.ts)
  setScreenOverlay((c, s) => { drawFireworksWash(c); drawCheapShotPanel(c, s); });
  // (and what it tore out, lying on the floor under everyone after)
  setUnderEnemies(drawCheapShotFloor);
  installCloseUps();
  // (the power rule: no cell refills through a dive kick or the flash kick either; the engine already holds them through
  // a charge, a slide and an uppercut)
  setPowerHold(p => !!p.isDivekicking || !!p.flashKick);
  setMeleeDamageHook((e: Enemy, move, damage) => {
    // (which move landed on whom, for the armor's follow-ups: moves/followups.ts)
    noteMelee(e, move);
    // (the pundits: the normalized sub-boss hit, the amulet's rage already in it)
    if (e.kind && ENGINE_SUB_BOSSES.has(e.kind)) return bossMeleeOf(move, true);
    // (everything else, regular enemies, the engine's bosses, the land bosses' fights, the ensemble, the machines: as it
    // is, harder through the amulet's rage (amulet.ts raged; the land bosses' own fights get theirs through
    // bossMelee, not this number))
    return raged(damage);
  });
  // (changed mid-run, the cheats: his numbers brought into line on the spot; more room's handed to him filled)
  let was = { hp: maxHealth(), k: ammoScale() };
  subscribeUpgrades(() => {
    const now = { hp: maxHealth(), k: ammoScale() };
    const st = liveState();
    if (st) {
      const p = st.player;
      p.maxHealth = now.hp;
      if (p.health > 0) p.health = Math.max(1, Math.min(now.hp, p.health + Math.max(0, now.hp - was.hp)));
      if (now.k !== was.k && p.weaponAmmo) {
        for (const w of Object.keys(p.weaponAmmo) as WeaponType[]) {
          const full = maxAmmo(w, st.stageId), base = MAX_AMMO[w];
          if (!Number.isFinite(full) || !(base > 0)) continue;
          const before = Math.max(1, Math.round(base * was.k));
          p.weaponAmmo[w] = Math.max(0, Math.min(full, (p.weaponAmmo[w] ?? 0) + Math.max(0, full - before)));
        }
      }
      const cells = powerCells();
      if (p.power > cells) p.power = cells;
    }
    was = now;
  });
};
