// Meathead 2's voice pack: only the lines Meathead 2 can actually say, copied out of Meathead 1's pack (no new
// recording). Run after every `npm run voices` (run.cjs does it), or on its own: `npm run voices:m2`.
//
// What's in it: Meathead's generic lines (kill taunts by weapon, the general ones, hurt, the gut), the announcer's kill
// callouts, the plain death screen and the ones for falls and animals; for the enemies Meathead 2 has (src/m2/roster.ts),
// what he says killing them, being hurt by them, and the death screens for them; and every line said by the shared
// engine's own code (not a Meathead 1 stage's, boss's or cutscene's).

import * as fs from 'fs';
import * as path from 'path';
import * as dialogue from '../../src/m1/content/dialogue';
import * as deaths from '../../src/m1/content/deaths';
import { M2_ENEMY_KINDS } from '../../src/m2/roster';
import { fitsHappyLand } from '../../src/m2/lines/consistency';
import { GRAB_CALLOUTS } from '../../src/m2/moves/callouts';
import { M2_KILL_LINES } from '../../src/m2/moves/killLines';

const ROOT = path.resolve(__dirname, '../..');
const IN = path.join(ROOT, 'src/m1/generated/voices.bin');
const OUT = path.join(ROOT, 'src/m2/generated/voices.bin');
const manifest: { voice: string; text: string; from: string }[] = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/voices/manifest.json'), 'utf8'));

const allStrings = (v: unknown): string[] => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(allStrings) : v && typeof v === 'object' ? Object.values(v).flatMap(allStrings) : [];
const want = new Set<string>();
const add = (voice: string, v: unknown) => { for (const t of allStrings(v)) want.add(`${voice}|${(voice === 'death' ? t.replace(/\s*\n\s*/g, ' ') : t).trim()}`); };
const pick = (table: Record<string, unknown>, keys: string[]) => keys.flatMap(k => (k in table ? [table[k]] : []));
const kinds = M2_ENEMY_KINDS as string[];
const withShots = kinds.flatMap(k => [k, `${k}_shot`, `${k}_club`, `${k}_bash`]);

// Meathead's generic lines
add('meathead', dialogue.VULGARITIES);
add('meathead', dialogue.KILL_LINES);
add('meathead', dialogue.GENERIC_KILL_LINES);
add('meathead', dialogue.GUT_LINES);
add('meathead', pick(dialogue.ENEMY_KILL_LINES as Record<string, unknown>, kinds));
add('meathead', pick(dialogue.BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT as Record<string, unknown>, withShots));
// The announcer's kill callouts
for (const c of Object.values(dialogue.KILL_CALLOUTS)) add('announcer', (c as { lines: string[] }).lines);
for (const c of Object.values(GRAB_CALLOUTS)) add('announcer', c.lines);
add('meathead', M2_KILL_LINES);
// The death screens
want.add('death|YOU DIED');
add('death', deaths.FALL_DEATH_LINES);
add('death', deaths.ANIMAL_DEATH_LINES);
add('death', pick(deaths.DEATH_LINES as Record<string, unknown>, withShots));
// Whatever the shared engine says itself (not a stage's, a boss's or a cutscene's)
const shared = (from: string) => /^(m1\/)?game\/(core|player|combat|enemies|platform)\//.test(from);
// (the bosses' parting words, said from the engine's code, are Meathead 1's bosses': written in mixed case, not his shouting)
for (const m of manifest) if (shared(m.from) && !/[a-z]{3}/.test(m.text)) want.add(`${m.voice}|${m.text}`);
// (and nothing that names Meathead 1's places, people or weather: consistency.ts)
for (const k of [...want]) if (!fitsHappyLand(k.slice(k.indexOf('|') + 1))) want.delete(k);

// Copy those clips out of the big pack into a small one, the same format
const buf = fs.readFileSync(IN);
const n = buf.readUInt32LE(0);
const header = JSON.parse(buf.subarray(4, 4 + n).toString('utf8')) as { clips: Record<string, [number, number, ...unknown[]]>; voices: Record<string, unknown> };
const base = 4 + n;
const clips: Record<string, unknown[]> = {}, blobs: Buffer[] = [];
let offset = 0;
const voicesUsed = new Set<string>();
for (const [k, c] of Object.entries(header.clips)) {
  if (!want.has(k)) continue;
  const [at, len, ...rest] = c;
  blobs.push(buf.subarray(base + at, base + at + len));
  clips[k] = [offset, len, ...rest];
  offset += len;
  voicesUsed.add(k.split('|')[0]);
}
const voices = Object.fromEntries(Object.entries(header.voices).filter(([v]) => voicesUsed.has(v)));
const head = Buffer.from(JSON.stringify({ clips, voices }), 'utf8');
const len = Buffer.alloc(4); len.writeUInt32LE(head.length, 0);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.concat([len, head, ...blobs]));
console.log(`m2: ${Object.keys(clips).length} of ${Object.keys(header.clips).length} clips, ${(fs.statSync(OUT).size / 1e6).toFixed(1)} MB -> ${path.relative(ROOT, OUT)}`);
