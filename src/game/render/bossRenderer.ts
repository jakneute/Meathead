import { Enemy } from '../../types';
import { COLORS, BOSS_DOOR_X, ARENA_LEFT, ARENA_RIGHT, DALE_SPEED_WINDUP } from '../../constants';

/** Per-boss sprite drawing (all procedural canvas art). */

export const drawBoss = (ctx: CanvasRenderingContext2D, e: Enemy, id: string | null, frame: number) => {
  const { pos, width, height } = e; ctx.save(); ctx.translate(pos.x, pos.y);
  if (e.rotation) { ctx.translate(width / 2, height / 2); ctx.rotate(e.rotation); ctx.translate(-width / 2, -height / 2); }
  if (id === 'Drug Trade Dale' && e.bossState === 'speed_dash') {
    ctx.filter = `hue-rotate(${frame * 10}deg) saturate(3)`;
  }
  // Twitching harder and harder as the speed hits during the wind-up
  if (id === 'Drug Trade Dale' && e.bossState === 'using_shipment' && e.shipmentType === 'speed') {
    const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP;
    if (t > 0.55) {
      const j = (t - 0.55) * 10;
      ctx.translate((Math.random() - 0.5) * j, (Math.random() - 0.5) * j);
      ctx.filter = `hue-rotate(${Math.floor(frame * 12 * t)}deg) saturate(${1 + t * 2})`;
    }
  }
  switch (id) {
    case 'Artie Avalanche': {
      // 1. Ice-crusted Boots / Greaves
      ctx.fillStyle = '#1B4F72';
      ctx.fillRect(width * 0.15, height * 0.72, width * 0.3, height * 0.28);
      ctx.fillRect(width * 0.55, height * 0.72, width * 0.3, height * 0.28);
      ctx.fillStyle = '#5DADE2';
      ctx.fillRect(width * 0.12, height * 0.88, width * 0.35, height * 0.12);
      ctx.fillRect(width * 0.53, height * 0.88, width * 0.35, height * 0.12);

      // 2. Heavy Cryo Torso & Ice Rune Armor
      ctx.fillStyle = '#1B4F72';
      ctx.fillRect(width * 0.18, height * 0.38, width * 0.64, height * 0.38);
      ctx.strokeStyle = '#0B2027';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.18, height * 0.38, width * 0.64, height * 0.38);
      // Glacier chestplate rune
      ctx.fillStyle = '#5DADE2';
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.42);
      ctx.lineTo(width * 0.65, height * 0.55);
      ctx.lineTo(width * 0.5, height * 0.68);
      ctx.lineTo(width * 0.35, height * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#EBF5FB';
      ctx.fillRect(width * 0.46, height * 0.51, width * 0.08, height * 0.08);

      // 3. Spiked Crystalline Ice Shoulders / Pauldrons
      ctx.fillStyle = '#2E86C1';
      ctx.beginPath();
      ctx.moveTo(width * 0.18, height * 0.38);
      ctx.lineTo(width * 0.02, height * 0.22);
      ctx.lineTo(width * 0.22, height * 0.26);
      ctx.lineTo(width * 0.28, height * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#EBF5FB';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#2E86C1';
      ctx.beginPath();
      ctx.moveTo(width * 0.82, height * 0.38);
      ctx.lineTo(width * 0.98, height * 0.22);
      ctx.lineTo(width * 0.78, height * 0.26);
      ctx.lineTo(width * 0.72, height * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. White Fur-Lined Hood Collar
      ctx.fillStyle = '#E5E8E8';
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.36, width * 0.38, height * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#BDC3C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5. Frost-Blue Head & Face
      ctx.fillStyle = '#90CAF9';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.26, width * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#154360';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 6. Glacier Crown / Ice Horns
      ctx.fillStyle = '#2E86C1';
      ctx.beginPath();
      ctx.moveTo(width * 0.34, height * 0.18);
      ctx.lineTo(width * 0.16, -height * 0.05);
      ctx.lineTo(width * 0.42, height * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#EBF5FB';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.66, height * 0.18);
      ctx.lineTo(width * 0.84, -height * 0.05);
      ctx.lineTo(width * 0.58, height * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central crystal crest
      ctx.fillStyle = '#5DADE2';
      ctx.beginPath();
      ctx.moveTo(width * 0.44, height * 0.14);
      ctx.lineTo(width * 0.5, -height * 0.02);
      ctx.lineTo(width * 0.56, height * 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 7. Frosty White Eyebrows
      ctx.fillStyle = '#EBF5FB';
      ctx.fillRect(width * 0.32, height * 0.20, width * 0.16, height * 0.04);
      ctx.fillRect(width * 0.52, height * 0.20, width * 0.16, height * 0.04);

      // 8. Glowing Cold Cyan Eyes
      ctx.fillStyle = '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 6;
      ctx.fillRect(width * 0.36, height * 0.24, width * 0.09, height * 0.05);
      ctx.fillRect(width * 0.55, height * 0.24, width * 0.09, height * 0.05);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width * 0.39, height * 0.25, width * 0.03, height * 0.03);
      ctx.fillRect(width * 0.58, height * 0.25, width * 0.03, height * 0.03);

      // 9. Menacing Snarl & Sharp Teeth
      ctx.fillStyle = '#154360';
      ctx.fillRect(width * 0.38, height * 0.32, width * 0.24, height * 0.06);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width * 0.40, height * 0.32, width * 0.04, height * 0.03);
      ctx.fillRect(width * 0.48, height * 0.32, width * 0.04, height * 0.03);
      ctx.fillRect(width * 0.56, height * 0.32, width * 0.04, height * 0.03);

      // 10. Frost Breath Particle
      if (frame % 20 < 10) {
        ctx.fillStyle = 'rgba(235, 245, 251, 0.6)';
        ctx.beginPath();
        ctx.arc(width * 0.68 + (frame % 10), height * 0.34, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'Victor Volcano': {
      const lOff = (e.bossState === 'attacking' || e.bossState === 'telegraphing') ? Math.sin(frame * 0.5) * 6 : 0;
      const isTelegraph = e.bossState === 'telegraphing' || e.bossState === 'attacking';

      // 1. Basalt Obsidian Greaves / Legs
      ctx.fillStyle = '#1A0A07';
      ctx.fillRect(width * 0.15, height * 0.72, width * 0.3, height * 0.28);
      ctx.fillRect(width * 0.55, height * 0.72, width * 0.3, height * 0.28);
      ctx.fillStyle = '#BA4A00';
      ctx.fillRect(width * 0.18, height * 0.78, width * 0.24, height * 0.06);
      ctx.fillRect(width * 0.58, height * 0.78, width * 0.24, height * 0.06);

      // 2. Heavy Volcanic Basalt Torso
      ctx.fillStyle = '#261614';
      ctx.fillRect(width * 0.16, height * 0.36 + lOff * 0.5, width * 0.68, height * 0.38);
      ctx.strokeStyle = '#C62828';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.16, height * 0.36 + lOff * 0.5, width * 0.68, height * 0.38);

      // 3. Pulsing Molten Core / Chest Fissures
      const corePulse = Math.sin(frame * 0.2) * 3;
      ctx.fillStyle = isTelegraph ? '#FFEB3B' : '#FF5722';
      ctx.shadowColor = '#FF5722';
      ctx.shadowBlur = isTelegraph ? 12 : 6;
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.40 + lOff * 0.5);
      ctx.lineTo(width * 0.64, height * 0.52 + lOff * 0.5 + corePulse);
      ctx.lineTo(width * 0.5, height * 0.66 + lOff * 0.5);
      ctx.lineTo(width * 0.36, height * 0.52 + lOff * 0.5 + corePulse);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      // Core yellow center
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(width * 0.46, height * 0.49 + lOff * 0.5, width * 0.08, height * 0.06);

      // 4. Cracked Magma Shoulders / Basalt Boulders
      ctx.fillStyle = '#1A0A07';
      ctx.beginPath();
      ctx.arc(width * 0.14, height * 0.38 + lOff * 0.5, width * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width * 0.86, height * 0.38 + lOff * 0.5, width * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 5. Volcanic Rock Head
      ctx.fillStyle = '#3E1A11';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.25 + lOff, width * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#C62828';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 6. Obsidian Chimney Horns & Smoke
      ctx.fillStyle = '#1A0A07';
      ctx.beginPath();
      ctx.moveTo(width * 0.32, height * 0.16 + lOff);
      ctx.lineTo(width * 0.18, -height * 0.04 + lOff);
      ctx.lineTo(width * 0.40, height * 0.10 + lOff);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.68, height * 0.16 + lOff);
      ctx.lineTo(width * 0.82, -height * 0.04 + lOff);
      ctx.lineTo(width * 0.60, height * 0.10 + lOff);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chimney smoke puffs
      ctx.fillStyle = 'rgba(93, 64, 55, 0.6)';
      ctx.beginPath();
      ctx.arc(width * 0.18, -height * 0.08 + lOff + Math.sin(frame * 0.1) * 2, 4, 0, Math.PI * 2);
      ctx.arc(width * 0.82, -height * 0.08 + lOff + Math.cos(frame * 0.1) * 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // 7. Magma Forehead Crack
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.48, height * 0.08 + lOff);
      ctx.lineTo(width * 0.52, height * 0.16 + lOff);
      ctx.lineTo(width * 0.46, height * 0.20 + lOff);
      ctx.stroke();

      // 8. Blazing Molten-Gold Eyes
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FF3D00';
      ctx.shadowBlur = 8;
      ctx.fillRect(width * 0.36, height * 0.22 + lOff, width * 0.09, height * 0.05);
      ctx.fillRect(width * 0.55, height * 0.22 + lOff, width * 0.09, height * 0.05);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width * 0.39, height * 0.23 + lOff, width * 0.03, height * 0.03);
      ctx.fillRect(width * 0.58, height * 0.23 + lOff, width * 0.03, height * 0.03);

      // 9. Molten Magma Jaw
      ctx.fillStyle = '#1A0A07';
      ctx.fillRect(width * 0.36, height * 0.31 + lOff, width * 0.28, height * 0.07);
      ctx.fillStyle = '#FF5722';
      ctx.fillRect(width * 0.39, height * 0.32 + lOff, width * 0.05, height * 0.04);
      ctx.fillRect(width * 0.48, height * 0.32 + lOff, width * 0.05, height * 0.04);
      ctx.fillRect(width * 0.56, height * 0.32 + lOff, width * 0.05, height * 0.04);
      break;
    }
    case 'Ernie Earthquake': {
      // 1. Bedrock Column Legs
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(width * 0.12, height * 0.70, width * 0.32, height * 0.30);
      ctx.fillRect(width * 0.56, height * 0.70, width * 0.32, height * 0.30);
      ctx.strokeStyle = '#271B17';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.12, height * 0.70, width * 0.32, height * 0.30);
      ctx.strokeRect(width * 0.56, height * 0.70, width * 0.32, height * 0.30);

      // 2. Colossal Bedrock Torso with Geological Strata
      ctx.fillStyle = '#6E2C00';
      ctx.fillRect(width * 0.12, height * 0.35, width * 0.76, height * 0.38);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.12, height * 0.35, width * 0.76, height * 0.38);
      // Strata layer bands
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(width * 0.14, height * 0.46, width * 0.72, height * 0.08);
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(width * 0.14, height * 0.58, width * 0.72, height * 0.06);

      // Faultline Gold Fissure on chest
      ctx.strokeStyle = '#FFB300';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width * 0.45, height * 0.38);
      ctx.lineTo(width * 0.52, height * 0.48);
      ctx.lineTo(width * 0.46, height * 0.56);
      ctx.lineTo(width * 0.54, height * 0.65);
      ctx.stroke();

      // 3. Layered Bedrock Shoulder Slabs
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(-width * 0.02, height * 0.28, width * 0.22, height * 0.24);
      ctx.strokeRect(-width * 0.02, height * 0.28, width * 0.22, height * 0.24);
      ctx.fillRect(width * 0.80, height * 0.28, width * 0.22, height * 0.24);
      ctx.strokeRect(width * 0.80, height * 0.28, width * 0.22, height * 0.24);

      // 4. Chiseled Stone Head
      ctx.fillStyle = '#795548';
      ctx.fillRect(width * 0.24, height * 0.08, width * 0.52, height * 0.30);
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(width * 0.24, height * 0.08, width * 0.52, height * 0.30);

      // 5. Tectonic Plate Helmet Crest
      ctx.fillStyle = '#4E342E';
      ctx.beginPath();
      ctx.moveTo(width * 0.22, height * 0.10);
      ctx.lineTo(width * 0.5, -height * 0.02);
      ctx.lineTo(width * 0.78, height * 0.10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#271B17';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(width * 0.44, height * 0.02, width * 0.12, height * 0.06);

      // 6. Heavy Stone Brow Ridge
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(width * 0.28, height * 0.16, width * 0.44, height * 0.05);

      // 7. Glowing Amber Tectonic Eyes
      ctx.fillStyle = '#FFB300';
      ctx.shadowColor = '#FFB300';
      ctx.shadowBlur = 6;
      ctx.fillRect(width * 0.34, height * 0.22, width * 0.10, height * 0.05);
      ctx.fillRect(width * 0.56, height * 0.22, width * 0.10, height * 0.05);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFF8E1';
      ctx.fillRect(width * 0.37, height * 0.23, width * 0.04, height * 0.03);
      ctx.fillRect(width * 0.59, height * 0.23, width * 0.04, height * 0.03);

      // 8. Colossal Granite Sledge-Jaw & Blocky Teeth
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(width * 0.30, height * 0.28, width * 0.40, height * 0.09);
      ctx.strokeStyle = '#271B17';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width * 0.30, height * 0.28, width * 0.40, height * 0.09);
      ctx.fillStyle = '#D7CCC8';
      ctx.fillRect(width * 0.34, height * 0.30, width * 0.06, height * 0.05);
      ctx.fillRect(width * 0.42, height * 0.30, width * 0.06, height * 0.05);
      ctx.fillRect(width * 0.52, height * 0.30, width * 0.06, height * 0.05);
      ctx.fillRect(width * 0.60, height * 0.30, width * 0.06, height * 0.05);

      // Stunned drop dizzy cracks
      if (e.bossState === 'stunned_drop') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.3, height * 0.15);
        ctx.lineTo(width * 0.4, height * 0.25);
        ctx.lineTo(width * 0.35, height * 0.3);
        ctx.stroke();
      }
      break;
    }
    case 'Hector Hurricane': {
      // 1. Aviator Boots / Greaves
      ctx.fillStyle = '#0E4B40';
      ctx.fillRect(width * 0.20, height * 0.72, width * 0.26, height * 0.28);
      ctx.fillRect(width * 0.54, height * 0.72, width * 0.26, height * 0.28);

      // 2. Aerodynamic Storm Commando Torso
      ctx.fillStyle = '#16A085';
      ctx.fillRect(width * 0.20, height * 0.36, width * 0.60, height * 0.38);
      ctx.strokeStyle = '#0E4B40';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.20, height * 0.36, width * 0.60, height * 0.38);

      // Central Turbine Rotor
      ctx.fillStyle = '#34495E';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.52, width * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Spinning turbine blades
      const rotAngle = frame * 0.2;
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 1.5;
      for (let b = 0; b < 4; b++) {
        const a = rotAngle + (b * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5, height * 0.52);
        ctx.lineTo(width * 0.5 + Math.cos(a) * width * 0.10, height * 0.52 + Math.sin(a) * width * 0.10);
        ctx.stroke();
      }

      // 3. Shoulder Turbine Thrusters
      ctx.fillStyle = '#117A65';
      ctx.beginPath();
      ctx.arc(width * 0.16, height * 0.40, width * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0E4B40';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(width * 0.16, height * 0.40, width * 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#117A65';
      ctx.beginPath();
      ctx.arc(width * 0.84, height * 0.40, width * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0E4B40';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(width * 0.84, height * 0.40, width * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // 4. Fluttering Pilot Scarf
      ctx.fillStyle = '#F39C12';
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.35, width * 0.28, height * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fluttering tail
      const scarfWave = Math.sin(frame * 0.3) * 6;
      ctx.beginPath();
      ctx.moveTo(width * 0.65, height * 0.35);
      ctx.lineTo(width * 0.90, height * 0.38 + scarfWave);
      ctx.lineTo(width * 0.85, height * 0.45 + scarfWave);
      ctx.lineTo(width * 0.60, height * 0.40);
      ctx.closePath();
      ctx.fill();

      // 5. Aviator Helmet & Cowl
      ctx.fillStyle = '#16A085';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.24, width * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0E4B40';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Aerodynamic Wing Fins
      ctx.fillStyle = '#48C9B0';
      ctx.beginPath();
      ctx.moveTo(width * 0.30, height * 0.20);
      ctx.lineTo(width * 0.12, height * 0.12);
      ctx.lineTo(width * 0.28, height * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.70, height * 0.20);
      ctx.lineTo(width * 0.88, height * 0.12);
      ctx.lineTo(width * 0.72, height * 0.28);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 6. Face
      ctx.fillStyle = '#F5CBA7';
      ctx.fillRect(width * 0.35, height * 0.24, width * 0.30, height * 0.10);

      // 7. Glowing Cyan Aviator Goggles
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(width * 0.28, height * 0.18, width * 0.44, height * 0.09);
      ctx.fillStyle = '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 6;
      ctx.fillRect(width * 0.31, height * 0.20, width * 0.17, height * 0.06);
      ctx.fillRect(width * 0.52, height * 0.20, width * 0.17, height * 0.06);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#E0F7FA';
      ctx.fillRect(width * 0.33, height * 0.21, width * 0.05, height * 0.03);
      ctx.fillRect(width * 0.54, height * 0.21, width * 0.05, height * 0.03);

      // 8. Cocky Smirk
      ctx.strokeStyle = '#78281F';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.42, height * 0.31);
      ctx.quadraticCurveTo(width * 0.52, height * 0.34, width * 0.58, height * 0.29);
      ctx.stroke();

      // Hurricane weather animations
      if (e.bossState === 'hurricane') {
         ctx.save();
         ctx.translate(width/2, height/2);
         
         // Rain
         ctx.strokeStyle = 'rgba(200, 255, 255, 0.6)';
         ctx.lineWidth = 1;
         for (let i = 0; i < 8; i++) {
            const rx = (Math.random() - 0.5) * 300;
            const ry = (Math.random() - 0.5) * 300;
            const len = 20 + Math.random() * 30;
            const inward = rx < 0 ? 1 : -1; // blown in toward the eye of the storm
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx + inward * len, ry + len/2);
            ctx.stroke();
         }

         // Lightning
         if (Math.random() > 0.7) {
            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            let lx = (Math.random() - 0.5) * 150;
            let ly = (Math.random() - 0.5) * 150;
            ctx.moveTo(lx, ly);
            for(let j=0; j<4; j++) {
                lx += (Math.random() - 0.5) * 40;
                ly += (Math.random() - 0.5) * 40;
                ctx.lineTo(lx, ly);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
         }
         ctx.restore();
      }
      break;
    }
    case 'Drug Trade Dale': {
      // 1. Purple Slacks & Shiny Oxford Shoes
      ctx.fillStyle = '#6C3483';
      ctx.fillRect(width * 0.20, height * 0.70, width * 0.26, height * 0.30);
      ctx.fillRect(width * 0.54, height * 0.70, width * 0.26, height * 0.30);
      ctx.fillStyle = '#111111';
      ctx.fillRect(width * 0.16, height * 0.90, width * 0.30, height * 0.10);
      ctx.fillRect(width * 0.54, height * 0.90, width * 0.30, height * 0.10);

      // 2. Double-Breasted Vice Purple Suit Jacket with Broad 80s Padded Shoulders
      ctx.fillStyle = '#8E44AD';
      ctx.fillRect(width * 0.14, height * 0.32, width * 0.72, height * 0.40);
      ctx.strokeStyle = '#4A235A';
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.14, height * 0.32, width * 0.72, height * 0.40);

      // Broad padded shoulder pads
      ctx.fillStyle = '#9B59B6';
      ctx.fillRect(width * 0.06, height * 0.30, width * 0.18, height * 0.16);
      ctx.strokeRect(width * 0.06, height * 0.30, width * 0.18, height * 0.16);
      ctx.fillRect(width * 0.76, height * 0.30, width * 0.18, height * 0.16);
      ctx.strokeRect(width * 0.76, height * 0.30, width * 0.18, height * 0.16);

      // Hot-pink pocket square
      ctx.fillStyle = '#FF1493';
      ctx.beginPath();
      ctx.moveTo(width * 0.72, height * 0.40);
      ctx.lineTo(width * 0.78, height * 0.36);
      ctx.lineTo(width * 0.80, height * 0.42);
      ctx.closePath();
      ctx.fill();

      // Gold Suit Buttons
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(width * 0.42, height * 0.55, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.58, height * 0.55, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.42, height * 0.65, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.58, height * 0.65, 3, 0, Math.PI * 2);
      ctx.fill();

      // 3. Unbuttoned White Dress Shirt Collar
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(width * 0.38, height * 0.32);
      ctx.lineTo(width * 0.50, height * 0.50);
      ctx.lineTo(width * 0.62, height * 0.32);
      ctx.closePath();
      ctx.fill();

      // 4. Giant 24k Gold Cuban Chain & Heavy Dollar Sign Medallion
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.36, height * 0.32);
      ctx.quadraticCurveTo(width * 0.50, height * 0.54, width * 0.64, height * 0.32);
      ctx.stroke();

      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(width * 0.50, height * 0.52, width * 0.10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#B7950B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#2E1045';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', width * 0.50, height * 0.52);

      // 5. Dale's Head & Face
      ctx.fillStyle = '#F5CBA7';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.22, width * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2C3E50';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 5 o'clock shadow
      ctx.fillStyle = 'rgba(86, 101, 115, 0.25)';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.24, width * 0.18, 0, Math.PI);
      ctx.fill();

      // 6. Slicked-Back Black Pompadour Hair
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.moveTo(width * 0.26, height * 0.18);
      ctx.quadraticCurveTo(width * 0.22, -height * 0.02, width * 0.50, -height * 0.05);
      ctx.quadraticCurveTo(width * 0.78, -height * 0.02, width * 0.74, height * 0.18);
      ctx.quadraticCurveTo(width * 0.50, height * 0.06, width * 0.26, height * 0.18);
      ctx.closePath();
      ctx.fill();
      // Pompadour highlight sheen
      ctx.strokeStyle = '#5D6D7E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width * 0.50, height * 0.02, width * 0.16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();

      // 7. Gold Aviator Sunglasses reflecting Neon Sunset
      ctx.fillStyle = '#111111';
      ctx.fillRect(width * 0.30, height * 0.16, width * 0.40, height * 0.09);
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width * 0.30, height * 0.16, width * 0.40, height * 0.09);
      // Neon reflections in lenses
      ctx.fillStyle = '#FF007F';
      ctx.fillRect(width * 0.32, height * 0.17, width * 0.16, height * 0.04);
      ctx.fillRect(width * 0.52, height * 0.17, width * 0.16, height * 0.04);
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(width * 0.32, height * 0.21, width * 0.16, height * 0.03);
      ctx.fillRect(width * 0.52, height * 0.21, width * 0.16, height * 0.03);

      // 8. Cocky Smirk with Glinting Gold Tooth
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.40, height * 0.28);
      ctx.quadraticCurveTo(width * 0.50, height * 0.31, width * 0.60, height * 0.27);
      ctx.stroke();
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(width * 0.52, height * 0.27, 3, 3);
      if (e.bossState === 'using_shipment') ctx.fillStyle = '#fff'; ctx.fillRect(width * 0.1, -20, width * 0.8, 20); 
      if (e.bossState === 'speed_dash') {
        ctx.save(); ctx.translate(width * 0.2, height * 0.3); ctx.rotate(-0.5);
        ctx.fillStyle = COLORS.PROJECTILE_DART; ctx.fillRect(0, -2, 16, 4);
        ctx.fillStyle = 'red'; ctx.fillRect(16, -4, 6, 8); ctx.restore();
      }
      if (e.truckActive && e.truckX !== undefined) {
        if (e.truckX < BOSS_DOOR_X) {
             if (Math.floor(frame / 15) % 2 === 0) {
                 ctx.save();
                 const warnX = BOSS_DOOR_X + 50 - pos.x; 
                 const warnY = 350 - pos.y;
                 ctx.fillStyle = '#FF0000';
                 ctx.strokeStyle = '#FFFFFF';
                 ctx.lineWidth = 4;
                 ctx.beginPath();
                 ctx.moveTo(warnX, warnY - 30);
                 ctx.lineTo(warnX + 30, warnY + 30);
                 ctx.lineTo(warnX - 30, warnY + 30);
                 ctx.closePath();
                 ctx.fill();
                 ctx.stroke();
                 ctx.fillStyle = 'white';
                 ctx.font = 'bold 40px sans-serif'; 
                 ctx.textAlign = 'center';
                 ctx.fillText('!', warnX, warnY + 22);
                 ctx.restore();
             }
        }
        ctx.save();
        const tx = e.truckX - pos.x;
        const ty = 400 - pos.y;
        
        // Trailer
        ctx.fillStyle = '#ECF0F1'; ctx.fillRect(tx, ty, 250, 150); ctx.strokeRect(tx, ty, 250, 150);
        // Cab Connector
        ctx.fillStyle = '#555'; ctx.fillRect(tx + 250, ty + 100, 20, 20);
        // Cab
        ctx.fillStyle = '#C0392B'; ctx.fillRect(tx + 270, ty + 40, 80, 110); ctx.strokeRect(tx + 270, ty + 40, 80, 110);
        // Window
        ctx.fillStyle = '#85C1E9'; ctx.fillRect(tx + 275, ty + 50, 60, 40);
        // Wheels
        ctx.fillStyle = '#111'; 
        const wheelY = ty + 150;
        ctx.beginPath(); ctx.arc(tx + 60, wheelY, 24, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + 190, wheelY, 24, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(tx + 310, wheelY, 24, 0, Math.PI*2); ctx.fill();
        
        // Text
        ctx.fillStyle = '#E74C3C'; ctx.font = 'bold 16px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText("DALE'S", tx + 125, ty + 60);
        ctx.fillText("DRUG'S", tx + 125, ty + 90);
        ctx.restore();
      }
    }
    break;
    case 'Blackout Barry':
      {
        const isTeleporting = e.bossState === 'blackout_teleport';
        const isTelegraphing = e.bossState === 'telegraphing';
        const isGroundPound = e.bossState === 'ground_pound';
        const isLightning = e.bossState === 'lightning_storm';
        const isExhausted = e.bossState === 'exhausted';
        
        const _α = isTeleporting ? Math.abs(Math.sin(frame * 0.4)) : 1.0;
        ctx.globalAlpha = _α;
        
        if (isExhausted) {
          // Drawing stars floating above head in a halo
          ctx.save();
          const starCount = 3;
          for (let i = 0; i < starCount; i++) {
            const angle = (frame * 0.08) + (i * ((Math.PI * 2) / starCount));
            const sx = Math.cos(angle) * 32 + width / 2;
            const sy = Math.sin(angle * 0.6) * 8 - 14; // Floating directly above head
            
            ctx.fillStyle = '#ffff00';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ffff00';
            ctx.beginPath();
            const spikes = 5;
            const outerRadius = 8;
            const innerRadius = 3;
            for (let j = 0; j < spikes * 2; j++) {
              const r = j % 2 === 0 ? outerRadius : innerRadius;
              const a = (j * Math.PI) / spikes;
              ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        // Shadow cloak / Hood with High-Voltage Tesla Coils
        ctx.fillStyle = '#0a0510';
        ctx.beginPath();
        if (isExhausted) {
          // Hunched
          ctx.moveTo(width * 0.5, height * 0.4);
          ctx.lineTo(0, height);
          ctx.lineTo(width, height);
        } else {
          ctx.moveTo(width * 0.5, 0); 
          ctx.quadraticCurveTo(width * 0.2, 0, width * 0.1, height * 0.3); 
          ctx.lineTo(0, height); 
          ctx.lineTo(width, height); 
          ctx.lineTo(width * 0.9, height * 0.3); 
          ctx.quadraticCurveTo(width * 0.8, 0, width * 0.5, 0); 
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2E1A47';
        ctx.lineWidth = 2;
        ctx.stroke();

        // High-voltage ceramic insulator coils on shoulders
        if (!isExhausted) {
          ctx.fillStyle = '#34495E';
          ctx.fillRect(width * 0.08, height * 0.32, 10, 16);
          ctx.fillRect(width * 0.82, height * 0.32, 10, 16);
          ctx.strokeStyle = '#00E5FF';
          ctx.lineWidth = 1;
          ctx.strokeRect(width * 0.08, height * 0.32, 10, 16);
          ctx.strokeRect(width * 0.82, height * 0.32, 10, 16);
          ctx.beginPath();
          ctx.moveTo(width * 0.08, height * 0.37); ctx.lineTo(width * 0.08 + 10, height * 0.37);
          ctx.moveTo(width * 0.08, height * 0.43); ctx.lineTo(width * 0.08 + 10, height * 0.43);
          ctx.moveTo(width * 0.82, height * 0.37); ctx.lineTo(width * 0.82 + 10, height * 0.37);
          ctx.moveTo(width * 0.82, height * 0.43); ctx.lineTo(width * 0.82 + 10, height * 0.43);
          ctx.stroke();

          // Subtle spark discharge
          if (frame % 15 < 5) {
            ctx.strokeStyle = '#BD00FF';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(width * 0.12, height * 0.30);
            ctx.lineTo(width * 0.16, height * 0.26);
            ctx.lineTo(width * 0.14, height * 0.22);
            ctx.stroke();
          }
        }
        
        // Glowing Piercing Eyes
        const eyeColor = (isGroundPound || isLightning) ? '#ff0000' : '#00e5ff';
        ctx.fillStyle = eyeColor;
        ctx.globalAlpha = _α;
        ctx.shadowBlur = 15;
        ctx.shadowColor = eyeColor;
        const eyeY = isExhausted ? height * 0.6 : height * 0.3;
        ctx.beginPath();
        ctx.ellipse(width * 0.36, eyeY, 6, 3.5, 0.2, 0, Math.PI * 2);
        ctx.ellipse(width * 0.64, eyeY, 6, 3.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // White electric eye slits
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(width * 0.35, eyeY - 1, 2, 2);
        ctx.fillRect(width * 0.63, eyeY - 1, 2, 2);

        // ARMS / POSES
        ctx.fillStyle = '#2e1a47';
        if (isTelegraphing || isLightning || isGroundPound) {
          if (e.jumpCount === 0) {
            // ARMS DOWN - More aggressive downward pose
            ctx.fillRect(-12, height * 0.4, 18, height * 0.7);
            ctx.fillRect(width - 6, height * 0.4, 18, height * 0.7);
            
            // Downward wind/energy lines for telegraphing
            if (isTelegraphing) {
              ctx.strokeStyle = '#bd00ff';
              ctx.lineWidth = 2;
              for (let i = 0; i < 3; i++) {
                const ox = (i - 1) * 20 + width/2;
                const oy = height + 10 + (frame % 20);
                ctx.beginPath();
                ctx.moveTo(ox, oy);
                ctx.lineTo(ox, oy + 20);
                ctx.stroke();
              }
            }
          } else {
            // ARMS OUT
            ctx.fillRect(-40, height * 0.2, 45, 18);
            ctx.fillRect(width - 5, height * 0.2, 45, 18);

            // Circular energy for Outward telegraph
            if (isTelegraphing) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(width/2, height/2, 60 + Math.sin(frame * 0.2) * 10, 0, Math.PI * 2);
                ctx.stroke();
            }
          }
        }

        if (isLightning && e.activeLightningStrikes && e.activeLightningStrikes.length > 0) {
          // Lightning Storm: Vertical bolts everywhere except directly under the boss, persisting with the hurtbox
          ctx.save();
          e.activeLightningStrikes.forEach(strike => {
            const relX = strike.x - e.pos.x;
            const floorY = 550 - e.pos.y;
            const ceilY = 100 - e.pos.y;
            const progress = strike.duration / (strike.maxDuration || 35);
            const halfW = (strike.width || 70) / 2;

            // Translucent glowing column marking the active hurtbox area
            const colGrad = ctx.createLinearGradient(relX - halfW, 0, relX + halfW, 0);
            colGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
            colGrad.addColorStop(0.5, `rgba(0, 240, 255, ${0.35 * progress})`);
            colGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
            ctx.fillStyle = colGrad;
            ctx.fillRect(relX - halfW, ceilY, strike.width || 70, floorY - ceilY);

            // Core electric bolt
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#00e5ff';
            ctx.beginPath();
            ctx.moveTo(relX, ceilY);
            const segments = 12;
            for (let i = 1; i < segments; i++) {
              const segY = ceilY + (i / segments) * (floorY - ceilY);
              const segX = relX + (Math.sin(frame * 0.5 + i * 2.3) * 16) + (Math.random() - 0.5) * 10;
              ctx.lineTo(segX, segY);
            }
            ctx.lineTo(relX, floorY);
            ctx.stroke();

            // Crackling yellow electric branches off the bolt
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ffff00';
            for (let b = 0; b < 3; b++) {
              const branchY = ceilY + ((b + 1) / 4) * (floorY - ceilY);
              const dir = (b % 2 === 0 ? 1 : -1);
              ctx.beginPath();
              ctx.moveTo(relX, branchY);
              ctx.lineTo(relX + dir * (25 + Math.random() * 25), branchY + (Math.random() - 0.5) * 30);
              ctx.stroke();
            }

            // Floor impact electric splash
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(relX, floorY, 12 + Math.random() * 8, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }

        if (isGroundPound) {
          // Perimeter electrification (floor, ceiling, walls light up for a half second on landing)
          if ((e.electrifiedTimer || 0) > 0) {
            const floorY = 550 - e.pos.y;
            const ceilY = 100 - e.pos.y;
            const leftX = 7240 - e.pos.x;
            const rightX = 7960 - e.pos.x;

            ctx.save();
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';

            // 1. High-voltage energy borders
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            // Floor
            ctx.moveTo(leftX, floorY);
            ctx.lineTo(rightX, floorY);
            // Ceiling
            ctx.moveTo(leftX, ceilY);
            ctx.lineTo(rightX, ceilY);
            // Left Wall
            ctx.moveTo(leftX, ceilY);
            ctx.lineTo(leftX, floorY);
            // Right Wall
            ctx.moveTo(rightX, ceilY);
            ctx.lineTo(rightX, floorY);
            ctx.stroke();

            // Core bright white line inside the cyan beam
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.rect(leftX, ceilY, rightX - leftX, floorY - ceilY);
            ctx.stroke();

            // 2. High-frequency crackling lightning arcs along all 4 boundaries
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ffff00';

            // Floor arcs
            const floorSegments = 24;
            ctx.beginPath();
            for (let i = 0; i <= floorSegments; i++) {
              const px = leftX + (i / floorSegments) * (rightX - leftX);
              const py = floorY + (Math.random() - 0.5) * 16;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Ceiling arcs
            const ceilSegments = 24;
            ctx.beginPath();
            for (let i = 0; i <= ceilSegments; i++) {
              const px = leftX + (i / ceilSegments) * (rightX - leftX);
              const py = ceilY + (Math.random() - 0.5) * 16;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Left wall arcs
            const wallSegments = 16;
            ctx.beginPath();
            for (let i = 0; i <= wallSegments; i++) {
              const py = ceilY + (i / wallSegments) * (floorY - ceilY);
              const px = leftX + (Math.random() - 0.5) * 16;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // Right wall arcs
            ctx.beginPath();
            for (let i = 0; i <= wallSegments; i++) {
              const py = ceilY + (i / wallSegments) * (floorY - ceilY);
              const px = rightX + (Math.random() - 0.5) * 16;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            // 3. Electric sparks shooting inwards from boundaries
            for (let i = 0; i < 8; i++) {
              const rx = leftX + Math.random() * (rightX - leftX);
              ctx.beginPath();
              ctx.moveTo(rx, floorY);
              ctx.lineTo(rx + (Math.random() - 0.5) * 30, floorY - Math.random() * 40);
              ctx.stroke();

              const cx = leftX + Math.random() * (rightX - leftX);
              ctx.beginPath();
              ctx.moveTo(cx, ceilY);
              ctx.lineTo(cx + (Math.random() - 0.5) * 30, ceilY + Math.random() * 40);
              ctx.stroke();
            }

            ctx.restore();
          }
        }

        if (isTeleporting) {
          for (let i = 0; i < 8; i++) {
            const px = (Math.random() - 0.5) * width * 2 + width/2;
            const py = (Math.random() - 0.5) * height * 2 + height/2;
            ctx.fillStyle = (Math.random() > 0.5) ? '#120820' : '#4a1175';
            ctx.fillRect(px, py, 3, 3);
          }
        }

        ctx.globalAlpha = 1.0;
      }
      break;
    case 'Toxic Tommy':
      {
        const isSubmerged = e.bossState === 'submerged_chase' || e.bossState === 'telegraph_emerge' || e.bossState === 'dive_in_sludge';
        const isPukingClose = e.bossState === 'puke_closing_in';
        const isPukingFar = e.bossState === 'puke_going_outward';
        const isPuking = isPukingClose || isPukingFar;
        const isWeaknessStunned = e.bossState === 'weakness_stunned';
        const isExhausted = e.bossState === 'vulnerable_idle' || isWeaknessStunned;

        if (isSubmerged) {
          // Submerged in the sludge: show Tommy's actual body underneath enveloped in a pulsating filth shield!
          ctx.save();

          // 1. Draw Tommy's body underneath (dimmed/sludge-tinted)
          ctx.save();
          ctx.globalAlpha = 0.85;

          // Back tank
          ctx.fillStyle = '#4B5563';
          ctx.fillRect(width * 0.05, height * 0.2, width * 0.2, height * 0.5);
          ctx.fillStyle = '#166534';
          ctx.fillRect(width * 0.07, height * 0.25, width * 0.16, height * 0.4);

          // Bloated mutant body & torso
          ctx.fillStyle = '#145A32';
          ctx.beginPath();
          ctx.ellipse(width * 0.5, height * 0.55, width * 0.38, height * 0.36, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0B3B17';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Glowing predatory mutant eyes glowing through the muck
          ctx.fillStyle = '#FFFF00';
          ctx.shadowColor = '#ADFF2F';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(width * 0.42, height * 0.35, 6, 0, Math.PI * 2);
          ctx.arc(width * 0.62, height * 0.35, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#DC2626';
          ctx.beginPath();
          ctx.arc(width * 0.44, height * 0.35, 2.5, 0, Math.PI * 2);
          ctx.arc(width * 0.64, height * 0.35, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Dorsal mutated spines cutting upward
          ctx.fillStyle = '#0F3818';
          ctx.beginPath();
          ctx.moveTo(width * 0.25, height * 0.25);
          ctx.lineTo(width * 0.35, -8);
          ctx.lineTo(width * 0.45, height * 0.25);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(width * 0.5, height * 0.25);
          ctx.lineTo(width * 0.65, -14);
          ctx.lineTo(width * 0.75, height * 0.25);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // 2. The Filth Shield: pulsating biohazard toxic barrier surrounding his entire silhouette
          const pulse = Math.sin(frame * 0.12) * 6;
          const shieldRadiusX = width * 0.62 + pulse;
          const shieldRadiusY = height * 0.55 + pulse * 0.6;
          const shieldCenterX = width * 0.5;
          const shieldCenterY = height * 0.5;

          // Outer toxic aura glow
          const shieldGrad = ctx.createRadialGradient(
            shieldCenterX, shieldCenterY, width * 0.2,
            shieldCenterX, shieldCenterY, shieldRadiusX + 12
          );
          shieldGrad.addColorStop(0, 'rgba(39, 174, 96, 0.1)');
          shieldGrad.addColorStop(0.5, 'rgba(46, 204, 113, 0.35)');
          shieldGrad.addColorStop(0.85, 'rgba(173, 255, 47, 0.6)');
          shieldGrad.addColorStop(1, 'rgba(173, 255, 47, 0.0)');

          ctx.fillStyle = shieldGrad;
          ctx.beginPath();
          ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX + 10, shieldRadiusY + 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Thick protective filth crust ring
          ctx.strokeStyle = '#2ECC71';
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#ADFF2F';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX, shieldRadiusY, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Inner high-voltage toxic barrier ring
          ctx.strokeStyle = '#ADFF2F';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.ellipse(shieldCenterX, shieldCenterY, shieldRadiusX - 8, shieldRadiusY - 6, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Swirling filth chunks orbiting the barrier
          const chunkCount = 6;
          for (let i = 0; i < chunkCount; i++) {
            const angle = (frame * 0.05) + (i * ((Math.PI * 2) / chunkCount));
            const cx = shieldCenterX + Math.cos(angle) * (shieldRadiusX - 2);
            const cy = shieldCenterY + Math.sin(angle) * (shieldRadiusY - 2);
            const cSize = 4 + (i % 3) * 2;
            ctx.fillStyle = i % 2 === 0 ? '#196F3D' : '#85929E';
            ctx.beginPath();
            ctx.arc(cx, cy, cSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ADFF2F';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Electric bio-arcs crackling across the shield
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = '#ADFF2F';
          ctx.shadowBlur = 6;
          for (let a = 0; a < 3; a++) {
            const arcAngle = (frame * 0.08 + a * 2.1) % (Math.PI * 2);
            const startX = shieldCenterX + Math.cos(arcAngle) * (shieldRadiusX - 6);
            const startY = shieldCenterY + Math.sin(arcAngle) * (shieldRadiusY - 4);
            const midX = shieldCenterX + Math.cos(arcAngle + 0.3) * (shieldRadiusX + 4);
            const midY = shieldCenterY + Math.sin(arcAngle + 0.3) * (shieldRadiusY + 3);
            const endX = shieldCenterX + Math.cos(arcAngle + 0.6) * (shieldRadiusX - 6);
            const endY = shieldCenterY + Math.sin(arcAngle + 0.6) * (shieldRadiusY - 4);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(midX, midY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }

          ctx.restore();
          break;
        }

        // When Tommy is emerging, puking, or vulnerable:
        // Sludge geyser beneath him if puking or emerged
        if (isPuking || e.bossState === 'emerge_shatter' || isExhausted) {
          ctx.save();
          // Toxic sludge spout/column lifting Tommy
          ctx.fillStyle = '#27AE60';
          ctx.beginPath();
          ctx.moveTo(width * 0.15, height);
          ctx.lineTo(width * 0.85, height);
          ctx.lineTo(width * 0.95, height + 80);
          ctx.lineTo(width * 0.05, height + 80);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#2ECC71';
          ctx.beginPath();
          ctx.ellipse(width / 2, height + 10, width * 0.4, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Bloated mutant body
        ctx.save();
        if (isExhausted) {
          // Flashing vulnerability outline
          const flash = Math.sin(frame * 0.3) > 0;
          if (flash) {
            ctx.shadowColor = '#FFFF00';
            ctx.shadowBlur = 15;
          }
        }

        // Hazard suit back tank
        ctx.fillStyle = '#7F8C8D';
        ctx.fillRect(width * 0.05, height * 0.2, width * 0.2, height * 0.5);
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(width * 0.07, height * 0.25, width * 0.16, height * 0.4);
        // Sludge level inside glass tank
        const tankSludge = Math.sin(frame * 0.1) * 4;
        ctx.fillStyle = '#ADFF2F';
        ctx.fillRect(width * 0.07, height * 0.4 + tankSludge, width * 0.16, height * 0.25 - tankSludge);

        // Bloated belly & torso
        ctx.fillStyle = '#1E8449';
        ctx.beginPath();
        const bellyBulge = isPuking ? Math.sin(frame * 0.6) * 6 : 0;
        ctx.ellipse(width * 0.5 + bellyBulge, height * 0.55, width * 0.38, height * 0.36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#145A32';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Biohazard Acid Canister on Shoulder
        ctx.fillStyle = '#374151';
        ctx.fillRect(width * 0.08, height * 0.18, 14, 26);
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(width * 0.08, height * 0.18, 14, 26);
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(width * 0.10, height * 0.24, 10, 18);
        ctx.fillStyle = '#ADFF2F';
        ctx.fillRect(width * 0.10, height * 0.27, 10, 15);
        if (frame % 14 < 7) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(width * 0.10 + 5, height * 0.26, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Torn yellow hazard suit remnants
        ctx.fillStyle = '#F1C40F';
        ctx.beginPath();
        ctx.moveTo(width * 0.2, height * 0.35);
        ctx.lineTo(width * 0.4, height * 0.45);
        ctx.lineTo(width * 0.3, height * 0.7);
        ctx.lineTo(width * 0.15, height * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(width * 0.8, height * 0.35);
        ctx.lineTo(width * 0.6, height * 0.45);
        ctx.lineTo(width * 0.7, height * 0.7);
        ctx.lineTo(width * 0.85, height * 0.6);
        ctx.closePath();
        ctx.fill();

        // Toxic veins & boils on body
        ctx.fillStyle = '#ADFF2F';
        ctx.beginPath();
        ctx.arc(width * 0.45, height * 0.55, 6, 0, Math.PI * 2);
        ctx.arc(width * 0.62, height * 0.65, 8, 0, Math.PI * 2);
        ctx.arc(width * 0.38, height * 0.72, 5, 0, Math.PI * 2);
        ctx.fill();

        // Head & mutated jaw
        const pukeFacing = e.pukeDir || 1;
        ctx.fillStyle = '#27AE60';
        const headY = isPuking ? height * 0.18 : height * 0.22;
        const headCenterX = isPuking ? (pukeFacing > 0 ? width * 0.58 : width * 0.42) : width * 0.55;
        ctx.beginPath();
        ctx.ellipse(headCenterX, headY, width * 0.3, height * 0.22, isPuking ? (pukeFacing > 0 ? -0.2 : 0.2) : 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Eyes
        if (isExhausted) {
          // Dizzy X eyes
          ctx.strokeStyle = '#111';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(width * 0.45, headY - 8); ctx.lineTo(width * 0.55, headY + 2);
          ctx.moveTo(width * 0.55, headY - 8); ctx.lineTo(width * 0.45, headY + 2);
          ctx.moveTo(width * 0.65, headY - 8); ctx.lineTo(width * 0.75, headY + 2);
          ctx.moveTo(width * 0.75, headY - 8); ctx.lineTo(width * 0.65, headY + 2);
          ctx.stroke();
        } else {
          // Bloodshot yellow eyes
          ctx.fillStyle = '#F4D03F';
          ctx.beginPath();
          const eye1X = pukeFacing > 0 ? width * 0.5 : width * 0.3;
          const eye2X = pukeFacing > 0 ? width * 0.7 : width * 0.5;
          ctx.arc(eye1X, headY - 4, 7, 0, Math.PI * 2);
          ctx.arc(eye2X, headY - 4, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#C0392B';
          ctx.beginPath();
          ctx.arc(eye1X + 2 * pukeFacing, headY - 4, 3, 0, Math.PI * 2);
          ctx.arc(eye2X + 2 * pukeFacing, headY - 4, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mouth & Puking Animation
        if (isPuking) {
          // Gaping spewing jaw facing pukeDir
          const mouthCenterX = pukeFacing > 0 ? width * 0.68 : width * 0.32;
          ctx.fillStyle = '#196F3D';
          ctx.beginPath();
          ctx.ellipse(mouthCenterX, headY + 14, 14, 18, pukeFacing * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Chunky toxic vomit stream exiting mouth
          ctx.fillStyle = '#ADFF2F';
          ctx.beginPath();
          ctx.arc(mouthCenterX + pukeFacing * 6, headY + 16, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#2ECC71';
          ctx.beginPath();
          ctx.arc(mouthCenterX + pukeFacing * 14, headY + 20, 10, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Grinning jagged teeth with green drool
          ctx.fillStyle = '#111';
          ctx.fillRect(width * 0.48, headY + 10, width * 0.28, 8);
          ctx.fillStyle = '#ADFF2F';
          ctx.fillRect(width * 0.52, headY + 16, 4, 12);
        }

        // Exhausted stars
        if (isExhausted) {
          const starCount = 3;
          for (let i = 0; i < starCount; i++) {
            const angle = (frame * 0.08) + (i * ((Math.PI * 2) / starCount));
            const sx = Math.cos(angle) * 35 + width / 2;
            const sy = Math.sin(angle * 0.6) * 10 - 15;
            ctx.fillStyle = '#FFFF00';
            ctx.beginPath();
            ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (e.isOiled || isWeaknessStunned) {
          // Dark crude oil running down Tommy
          ctx.save();
          ctx.fillStyle = '#111111';
          ctx.fillRect(width * 0.35, height * 0.3, 6, 25);
          ctx.fillRect(width * 0.55, height * 0.35, 8, 30);
          ctx.fillRect(width * 0.72, height * 0.4, 5, 20);
          ctx.fillStyle = '#222222';
          ctx.beginPath();
          ctx.arc(width * 0.5, height * 0.6, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }
      break;
    case 'Oily Oscar': {
      // 1. Industrial Grease Boots
      ctx.fillStyle = '#212121';
      ctx.fillRect(width * 0.16, height * 0.74, width * 0.28, height * 0.26);
      ctx.fillRect(width * 0.56, height * 0.74, width * 0.28, height * 0.26);

      // 2. Petroleum Boiler-Plate Torso
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(width * 0.14, height * 0.36, width * 0.72, height * 0.40);
      ctx.strokeStyle = '#1A110F';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(width * 0.14, height * 0.36, width * 0.72, height * 0.40);

      // Brass Pressure Gauge & Pipe
      ctx.strokeStyle = '#D4AC0D';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.14, height * 0.50);
      ctx.lineTo(width * 0.86, height * 0.50);
      ctx.stroke();

      ctx.fillStyle = '#D4AC0D';
      ctx.beginPath();
      ctx.arc(width * 0.50, height * 0.50, width * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#F9E79F';
      ctx.beginPath();
      ctx.arc(width * 0.50, height * 0.50, width * 0.08, 0, Math.PI * 2);
      ctx.fill();
      // Pressure needle
      ctx.strokeStyle = '#C0392B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.50, height * 0.50);
      ctx.lineTo(width * 0.54, height * 0.44);
      ctx.stroke();

      // 3. Rusted Exhaust Smokestacks on Shoulders
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(width * 0.04, height * 0.16, width * 0.14, height * 0.26);
      ctx.strokeRect(width * 0.04, height * 0.16, width * 0.14, height * 0.26);
      ctx.fillRect(width * 0.82, height * 0.16, width * 0.14, height * 0.26);
      ctx.strokeRect(width * 0.82, height * 0.16, width * 0.14, height * 0.26);

      // Chugging black oily smoke clouds
      const smokeOff = (frame * 0.5) % 20;
      ctx.fillStyle = 'rgba(33, 33, 33, 0.6)';
      ctx.beginPath();
      ctx.arc(width * 0.11, height * 0.10 - smokeOff * 0.6, 5 + smokeOff * 0.3, 0, Math.PI * 2);
      ctx.arc(width * 0.89, height * 0.10 - smokeOff * 0.6, 5 + smokeOff * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // 4. Riveted Iron Welding Helmet
      ctx.fillStyle = '#3E2723';
      ctx.beginPath();
      ctx.moveTo(width * 0.25, height * 0.08);
      ctx.lineTo(width * 0.75, height * 0.08);
      ctx.lineTo(width * 0.78, height * 0.36);
      ctx.lineTo(width * 0.64, height * 0.42);
      ctx.lineTo(width * 0.36, height * 0.42);
      ctx.lineTo(width * 0.22, height * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1A110F';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Brass Rivets on Helmet
      ctx.fillStyle = '#D4AC0D';
      ctx.beginPath();
      ctx.arc(width * 0.28, height * 0.12, 2, 0, Math.PI * 2);
      ctx.arc(width * 0.72, height * 0.12, 2, 0, Math.PI * 2);
      ctx.arc(width * 0.26, height * 0.32, 2, 0, Math.PI * 2);
      ctx.arc(width * 0.74, height * 0.32, 2, 0, Math.PI * 2);
      ctx.fill();

      // 5. Glowing Amber Furnace Visor
      ctx.fillStyle = '#111111';
      ctx.fillRect(width * 0.28, height * 0.18, width * 0.44, height * 0.10);
      ctx.strokeStyle = '#D4AC0D';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width * 0.28, height * 0.18, width * 0.44, height * 0.10);

      ctx.fillStyle = '#FF9800';
      ctx.shadowColor = '#FF9800';
      ctx.shadowBlur = 8;
      ctx.fillRect(width * 0.32, height * 0.20, width * 0.36, height * 0.06);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFEB3B';
      ctx.fillRect(width * 0.35, height * 0.22, width * 0.30, height * 0.02);

      // 6. Heavy Steel Respirator Jaw dripping Crude
      ctx.fillStyle = '#263238';
      ctx.fillRect(width * 0.34, height * 0.30, width * 0.32, height * 0.10);
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(width * 0.34, height * 0.30, width * 0.32, height * 0.10);
      ctx.fillStyle = '#D4AC0D';
      ctx.beginPath();
      ctx.arc(width * 0.42, height * 0.35, 3, 0, Math.PI * 2);
      ctx.arc(width * 0.58, height * 0.35, 3, 0, Math.PI * 2);
      ctx.fill();

      // Black Oil Drips from Jaw
      ctx.fillStyle = '#111111';
      const dripY = (frame * 0.8) % 15;
      ctx.fillRect(width * 0.40, height * 0.40 + dripY, 3, 6);
      ctx.fillRect(width * 0.58, height * 0.40 + ((dripY + 7) % 15), 3, 6);
      break;
    }
    default: ctx.fillStyle = 'yellow'; ctx.fillRect(0, 0, width, height); break;
  }
  ctx.restore();
};

export const drawDaleDrugs = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  if (e.bossState === 'using_shipment' && e.shipmentType === 'speed' && e.stateTimer! > 0) {
    drawSpeedWindup(ctx, e, frame);
    return;
  }
  if (e.bossState === 'using_shipment' && e.shipmentCount! > 0) {
    const stackX = e.pos.x - 60, groundY = 550;
    ctx.save();
    for (let i = 0; i < e.shipmentCount!; i++) {
      const row = Math.floor(i / 2), col = i % 2;
      if (e.shipmentType === 'cocaine') {
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
        const bx = stackX + (col * 20) + (row * 3), by = groundY - (row * 15) - 20;
        ctx.fillRect(bx, by, 18, 18); ctx.strokeRect(bx, by, 18, 18);
      } else if (e.shipmentType === 'meth') {
        ctx.fillStyle = '#111'; ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2;
        const bx = stackX + (col * 30) - 10, by = groundY - (row * 35) - 40;
        ctx.fillRect(bx, by, 30, 40); ctx.strokeRect(bx, by, 30, 40);
        ctx.fillStyle = '#FFD700'; ctx.font = '8px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.fillText("METH", bx + 15, by + 25);
      }
    }
    ctx.restore();
  }
};

/** A big, glowing syringe. (0,0) is the needle tip; it points along -x before rotation. */
const drawBigSyringe = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, fill: number, plunge: number, frame: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // Glow
  ctx.shadowColor = '#ff2fa0';
  ctx.shadowBlur = 16;
  // Needle
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(24, 0); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(22, -4, 6, 8);
  // Barrel
  const barrelX = 28, barrelL = 46;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(barrelX, -9, barrelL, 18);
  // Neon drug inside, draining as the plunger goes in
  const juice = barrelL * fill;
  ctx.shadowColor = '#ff2fa0';
  ctx.shadowBlur = 12;
  ctx.fillStyle = frame % 8 < 4 ? '#ff2fa0' : '#ff6fcf';
  ctx.fillRect(barrelX + 2, -7, juice, 14);
  ctx.shadowBlur = 0;
  // Bubbles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let b = 0; b < 3; b++) {
    const bx = barrelX + 4 + ((frame * 1.5 + b * 13) % Math.max(4, juice - 4));
    ctx.fillRect(bx, -3 + (b % 2) * 4, 2, 2);
  }
  // Graduation marks and outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barrelX, -9, barrelL, 18);
  for (let m = 1; m < 5; m++) { ctx.beginPath(); ctx.moveTo(barrelX + m * 9, -9); ctx.lineTo(barrelX + m * 9, -4); ctx.stroke(); }
  // Finger flange
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(barrelX + barrelL, -15, 4, 30);
  // Plunger rod + red thumb press (slides in as it plunges)
  const rodOut = 34 * (1 - plunge);
  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(barrelX + barrelL - 2 - (barrelL - 4) * plunge, -3, rodOut + (barrelL - 4) * plunge + 6, 6);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(barrelX + barrelL + 4 + rodOut, -12, 6, 24);
  // Glint
  if (frame % 30 < 6) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barrelX + 6 + (frame % 30) * 6, -8, 3, 16);
  }
  ctx.restore();
};

/**
 * Dale's speed wind-up, made unmissable: he hoists a giant syringe, jabs it
 * into his neck and pumps it, while a danger lane shows where he'll charge.
 */
const drawSpeedWindup = (ctx: CanvasRenderingContext2D, e: Enemy, frame: number) => {
  const t = 1 - (e.stateTimer || 0) / DALE_SPEED_WINDUP; // 0 -> 1
  const cx = e.pos.x + e.width / 2;
  const top = e.pos.y;

  // Danger lane across the arena at Dale's height, chevrons racing toward his first dash (left)
  if (t > 0.15) {
    ctx.save();
    const flash = 0.18 + 0.14 * Math.sin(frame * 0.6);
    ctx.fillStyle = `rgba(255, 30, 60, ${flash * Math.min(1, (t - 0.15) * 4)})`;
    ctx.fillRect(ARENA_LEFT, top + 8, ARENA_RIGHT - ARENA_LEFT, e.height - 8);
    ctx.fillStyle = `rgba(255, 220, 220, ${0.6 * Math.min(1, (t - 0.15) * 4)})`;
    const off = (frame * 6) % 40;
    for (let x = ARENA_RIGHT - off; x > ARENA_LEFT; x -= 40) {
      ctx.beginPath();
      ctx.moveTo(x, top + e.height / 2);
      ctx.lineTo(x + 14, top + 18);
      ctx.lineTo(x + 20, top + 18);
      ctx.lineTo(x + 6, top + e.height / 2);
      ctx.lineTo(x + 20, top + e.height - 6);
      ctx.lineTo(x + 14, top + e.height - 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Pulse rings once it's in
  if (t > 0.55) {
    ctx.save();
    for (let r = 0; r < 2; r++) {
      const ring = ((frame * 3 + r * 30) % 60) / 60;
      ctx.strokeStyle = `rgba(255, 47, 160, ${0.7 * (1 - ring)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, top + e.height / 2, 30 + ring * 60, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // The syringe: raise overhead, stab into the neck, then pump
  const neck = { x: cx + 6, y: top + 14 };
  // The barrel extends along +x from the tip, so an angle near -1.9 holds it
  // up and behind his head with the needle pointing down into his neck.
  let sx, sy, angle, plunge = 0;
  if (t < 0.4) {
    // Hoist it up from his side
    const k = t / 0.4;
    const ease = 1 - Math.pow(1 - k, 2);
    sx = cx - 56 + ease * 40;
    sy = top + 34 - ease * 70;
    angle = -0.5 - ease * 1.4;
  } else if (t < 0.55) {
    // Stab down into the neck
    const k = (t - 0.4) / 0.15;
    sx = cx - 16 + (neck.x - (cx - 16)) * k;
    sy = top - 36 + (neck.y - (top - 36)) * k;
    angle = -1.9;
  } else {
    // Pump it in
    sx = neck.x;
    sy = neck.y;
    angle = -1.9;
    plunge = (t - 0.55) / 0.45;
  }
  drawBigSyringe(ctx, sx, sy, angle, 1 - plunge * 0.95, plunge, frame);

  // Impact burst at the moment of the jab
  if (t >= 0.55 && t < 0.65) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.fillRect(neck.x + Math.cos(a) * 16 - 2, neck.y + Math.sin(a) * 16 - 2, 4, 4);
    }
    ctx.restore();
  }

  // Flashing warning over his head
  if (Math.floor(frame / 5) % 2 === 0) {
    ctx.save();
    ctx.font = 'bold 26px "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000000';
    ctx.strokeText('!!', cx, top - 58);
    ctx.fillStyle = '#ff2fa0';
    ctx.fillText('!!', cx, top - 58);
    ctx.restore();
  }
};
