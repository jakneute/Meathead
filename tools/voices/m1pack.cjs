// Meathead 1's voice pack: the big pack (src/m1/generated/voices.bin, every line of both games) less the lines only
// Meathead 2 says, so Meathead 1's build doesn't carry Meathead 2's voices. Run after every `npm run voices` (run.cjs
// does it), or on its own: `npm run voices:m1`.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const IN = path.join(ROOT, 'src/m1/generated/voices.bin');
const OUT = path.join(ROOT, 'src/m1/generated/voices-m1.bin');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/voices/manifest.json'), 'utf8'));

// (where extract.ts says a line comes from: these tables are Meathead 2's own)
const M2_ONLY = new Set(['GRAB_CALLOUTS', 'M2_KILL_LINES', 'FULL_BAG_LINES', 'EMPTY_BAG_LINES', 'BULK_LINES', 'BULK_FAIL_LINES',
  'DUCK_LINES', 'TOO_BIG_LINES', 'M2_GUT_LINES', 'M2_GUT_DEATH', 'INTRO', 'ADVENTURE', 'SPOOKY', 'SPACE', 'HOLLYWOOD', 'FOREIGN', 'FRONTIER', 'FANTASY', 'HUB']);
const from = new Map(manifest.map(m => [`${m.voice}|${m.text}`, m.from]));
// (but a line of theirs that Meathead 1's own code says too (a kill line, a death screen) stays: its source, read whole)
let m1src = '';
const walk = d => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (f !== 'generated') walk(p); } else if (/\.tsx?$/.test(f)) m1src += fs.readFileSync(p, 'utf8');
  }
};
walk(path.join(ROOT, 'src/m1'));
const saidInM1 = t => m1src.includes(t) || m1src.includes(t.replace(/'/g, "\'"));
const m2Only = k => k.startsWith('m2.') || (M2_ONLY.has(from.get(k)) && !saidInM1(k.slice(k.indexOf('|') + 1)));

const buf = fs.readFileSync(IN);
const n = buf.readUInt32LE(0);
const header = JSON.parse(buf.subarray(4, 4 + n).toString('utf8'));
const base = 4 + n;
const clips = {}, blobs = [];
let offset = 0;
const voicesUsed = new Set();
for (const [k, c] of Object.entries(header.clips)) {
  if (m2Only(k)) continue;
  const [at, len, ...rest] = c;
  blobs.push(buf.subarray(base + at, base + at + len));
  clips[k] = [offset, len, ...rest];
  offset += len;
  voicesUsed.add(k.split('|')[0]);
}
const voices = Object.fromEntries(Object.entries(header.voices).filter(([v]) => voicesUsed.has(v)));
const head = Buffer.from(JSON.stringify({ clips, voices }), 'utf8');
const len = Buffer.alloc(4); len.writeUInt32LE(head.length, 0);
fs.writeFileSync(OUT, Buffer.concat([len, head, ...blobs]));
console.log(`m1: ${Object.keys(clips).length} of ${Object.keys(header.clips).length} clips, ${(fs.statSync(OUT).size / 1e6).toFixed(1)} MB -> ${path.relative(ROOT, OUT)}`);
