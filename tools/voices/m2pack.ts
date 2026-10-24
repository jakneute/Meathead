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
import { FOR_A_WOMAN, FOR_AN_ANIMAL } from '../../src/m1/content/gender';
import { M2_KILL_LINES } from '../../src/m2/moves/killLines';
import { FULL_BAG_LINES, EMPTY_BAG_LINES, BULK_LINES, BULK_FAIL_LINES, DUCK_LINES, TOO_BIG_LINES, TOO_BIG_BY_KIND, GRAB_IMMUNE_LINES } from '../../src/m2/lines/weaponLines';
import { M2_GUT_LINES, M2_GUT_DEATH } from '../../src/m2/lines/gutLines';
import * as introLines from '../../src/m2/intro/lines';
import { ADV_VOICE_LINES } from '../../src/m2/adventure/voices';
import { SPOOKY_VOICE_LINES } from '../../src/m2/spooky/voices';
import { SPACE_VOICE_LINES } from '../../src/m2/space/voices';
import { HOLLYWOOD_VOICE_LINES } from '../../src/m2/hollywood/voices';
import { FOREIGN_VOICE_LINES } from '../../src/m2/foreign/voices';
import { FRONTIER_VOICE_LINES } from '../../src/m2/frontier/voices';
import { FANTASY_VOICE_LINES } from '../../src/m2/fantasy/voices';
import { CARTOON_VOICE_LINES } from '../../src/m2/cartoon/voices';
import { VOICE_LINES as GYM_VOICE_LINES } from '../../src/m2/intro/gym/lines';
import { AMERICA_DENY } from '../../src/m2/lines/hubLines';

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
// (Meathead 2 has its own gut lines: M2_GUT_LINES, below)
add('meathead', pick(dialogue.ENEMY_KILL_LINES as Record<string, unknown>, kinds));
add('meathead', pick(dialogue.BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT as Record<string, unknown>, withShots));
// The announcer's kill callouts
for (const c of Object.values(dialogue.KILL_CALLOUTS)) add('announcer', (c as { lines: string[] }).lines);
for (const c of Object.values(GRAB_CALLOUTS)) add('announcer', c.lines);
// (the other half of every line that says he or she about whoever was killed: Meathead's, the announcer's)
{
  const callouts = new Set([...Object.values(dialogue.KILL_CALLOUTS).flatMap(c => c.lines), ...Object.values(GRAB_CALLOUTS).flatMap(c => [...c.lines])]);
  for (const [m, f] of Object.entries(FOR_A_WOMAN)) add(callouts.has(m) ? 'announcer' : 'meathead', f);
  for (const [m, n] of Object.entries(FOR_AN_ANIMAL)) add(callouts.has(m) ? 'announcer' : 'meathead', n);
}

add('meathead', M2_KILL_LINES);
add('meathead', FULL_BAG_LINES);
add('meathead', EMPTY_BAG_LINES);
add('meathead', BULK_LINES);
add('meathead', BULK_FAIL_LINES);
add('meathead', DUCK_LINES);
// (a grab that can't take: too big, a machine, a boss, one that won't be held; and the kinds with their own)
add('meathead', TOO_BIG_LINES);
add('meathead', TOO_BIG_BY_KIND);
add('meathead', GRAB_IMMUNE_LINES);
add('meathead', M2_GUT_LINES);
add('death', M2_GUT_DEATH);
add('meathead', introLines.MEATHEAD_TICKET);
add('meathead', introLines.MEATHEAD_PARKED);
add('meathead', [introLines.MEATHEAD_BACK_LOT, introLines.MEATHEAD_REENTRY, introLines.MEATHEAD_REENTRY_BACK]);
add('m2.ticket', [introLines.TICKET_LADY, introLines.TICKET_NEXT, introLines.TICKET_ALARM, introLines.TICKET_CUT, introLines.TICKET_REENTRY]);
for (const v of ['m2.guard', 'm2.guardf']) add(v, [introLines.GUARD_ALERT, introLines.GUARD_BARK, introLines.GUARD_IDLE, introLines.GUARD_WELCOME, introLines.GUARD_WELCOME_BACK]);
add('m2.pa', introLines.PA_LINES);
add('m2.pa', introLines.PA_ALPHA_END);
for (const byVoice of ADV_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) add(v, lines);
for (const byVoice of SPOOKY_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) add(v, lines);
for (const byVoice of SPACE_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) add(v, lines);
for (const byVoice of HOLLYWOOD_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) add(v, lines);
for (const byVoice of FOREIGN_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) add(v, lines);
for (const byVoice of FRONTIER_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) add(v, lines);
for (const byVoice of FANTASY_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) add(v, lines);
for (const byVoice of CARTOON_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) add(v, lines);
for (const [v, lines] of Object.entries(GYM_VOICE_LINES)) add(v, lines);
add('meathead', AMERICA_DENY);
for (const v of ['m2.guest', 'm2.guest2']) add(v, [introLines.GUEST_HURRY, introLines.GUEST_CUT, introLines.GUEST_HIT, introLines.GUEST_REACT, introLines.GUEST_REACT_NOW]);
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
