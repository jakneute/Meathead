// Meathead 2's cheap shots, recorded (the owner's fun-stuff GIFs: "do some fun stuff gifs when you can for the 'sex
// organ destoying' you have in as well"): the hand armor's CHEAP SHOT (src/m2/upgrades/cheapShot.ts) on every boss and
// sub-boss it works on, tools/bossdeaths's way. Each fight in a headless Chromium off the perf build (the dev starts,
// `window.__m2`), the HAND ARMOR on (window.__m2SetPiece, dev only; the plain boot: no sabatons), Meathead walked up to
// the boss and the BEATDOWN key (Y + B) pressed till the game's own gate lets the cheap shot go; recorded with the
// DevTools screencast in real time from a beat before it, through the close-up, and the stunned boss after. Frames
// land in tools/cheapshots/out/<job>/ (PNG + times.json); tools/cheapshots/encode.py makes the GIFs.
//
//   node tools/cheapshots/capture.mjs              every job, one at a time
//   node tools/cheapshots/capture.mjs 05 09        just those (prefixes)
//
// Build the perf build first if the game has changed: MEATHEAD_PERF_OUT=.build/perf/<a number newer than the last>
// node --max-old-space-size=8192 node_modules/vite/bin/vite.js build --mode perf --logLevel error (the newest folder in
// .build/perf is served). Then py tools/cheapshots/encode.py ["<dest>"] [prefixes... | all]. The frames are big: clear
// out/ after. One browser, one job at a time, muted: the owner plays on this same PC.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, readdirSync, statSync, createReadStream, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS } from './jobs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'tools', 'cheapshots', 'out');
const PERF = join(ROOT, '.build', 'perf');
const builds = existsSync(PERF) ? readdirSync(PERF).filter(d => existsSync(join(PERF, d, 'meathead2.html'))).sort() : [];
if (!builds.length) { console.error('no perf build in .build/perf: vite build --mode perf first'); process.exit(1); }
const DIST = join(PERF, builds.at(-1));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.bin': 'application/octet-stream', '.json': 'application/json' };
const server = createServer((req, res) => {
  const p = normalize(join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (!p.startsWith(DIST) || !existsSync(p) || !statSync(p).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream', 'content-length': statSync(p).size });
  createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(5194, '127.0.0.1', r));

const picks = process.argv.slice(2);
const list = picks.length ? JOBS.filter(j => picks.some(p => j.name.startsWith(p))) : JOBS;
const browser = await chromium.launch({
  args: ['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-gpu-rasterization', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const CANVAS_ONLY = '* { visibility: hidden !important; } canvas { visibility: visible !important; }';
/** How near (the gap between him and them, px) he walks before trying it: the gate's reach is 60 (upgrades/tune.ts). */
const NEAR = 34;
const failed = [];

/** One go at a job: true if it was recorded through. */
const run = async job => {
  const dir = join(OUT, job.name);
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 800, height: 600 } });
  try {
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('  pageerror', e.message.slice(0, 200)));
    await page.goto(`http://127.0.0.1:5194/meathead2.html?${job.q}`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => document.querySelector('canvas') && window.__m2SetCheat && window.__m2SetPiece && window.__m2, null, { timeout: 120000 });
    await page.addStyleTag({ content: CANVAS_ONLY });
    await page.evaluate(() => { window.__m2SetCheat('god', true); window.__m2SetCheat('ammo', true); window.__m2SetPiece('hands', true); });
    await page.mouse.move(600, 300);
    const js = (fn, arg) => page.evaluate(fn, arg);
    if (job.memo) await js(k => { window.__m2.stageMemo[k] = '1'; }, job.memo);
    await page.waitForTimeout(1500);
    if (job.pre) await js(job.pre);
    // walk in till the fight's on (an intro that plays anyway: skipped once it's been on a while)
    await page.keyboard.down('ArrowRight');
    let on = false, cut = 0;
    for (const t0 = Date.now(); Date.now() - t0 < 45000;) {
      if (await js(job.on).catch(() => false)) { on = true; break; }
      cut = (await js(() => !!window.__m2.player.inCutscene)) ? cut + 1 : 0;
      if (cut > 40) { await page.keyboard.press('Escape'); cut = 0; }
      await page.waitForTimeout(50);
    }
    await page.keyboard.up('ArrowRight');
    if (!on) { console.log('  timed out waiting for the fight'); return false; }
    await page.waitForTimeout(600);

    const rect = await js(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    const cdp = await ctx.newCDPSession(page);
    const frames = [];
    let n = 0;
    cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
      const f = `${String(n++).padStart(5, '0')}.png`;
      writeFileSync(join(dir, f), Buffer.from(data, 'base64'));
      frames.push({ f, t: metadata.timestamp });
      cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    });
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
    const t0 = Date.now();
    // (a beat of the fight first: the GIF starts a second before the kick)
    await page.waitForTimeout(job.lead ?? 1200);

    // Up to them, and Y + B (the BEATDOWN key) till the game's own gate lets it go: walked, and after a while (a boss
    // that won't hold still on the floor) put right by them, on their floor
    const look = `(() => { const e = (${job.foe})(), p = window.__m2.player; if (!e || !p) return null;
      return { gap: p.pos.x + p.width < e.pos.x ? e.pos.x - (p.pos.x + p.width) : p.pos.x > e.pos.x + e.width ? p.pos.x - (e.pos.x + e.width) : 0,
        dir: e.pos.x + e.width / 2 > p.pos.x + p.width / 2 ? 1 : -1, cheap: !!(p.inCutscene && p.untouchable), cut: !!p.inCutscene }; })()`;
    let held = null, kickAt = 0, tries = 0;
    const hold = async k => { if (held === k) return; if (held) await page.keyboard.up(held); held = k; if (k) await page.keyboard.down(k); };
    for (const s0 = Date.now(); Date.now() - s0 < 60000;) {
      const s = await js(look).catch(() => null);
      if (s?.cheap) { kickAt = Date.now() / 1000 - 0.1; break; }
      if (!s) { await page.waitForTimeout(50); continue; }
      if (s.cut) { await hold(null); await page.waitForTimeout(50); continue; }
      if (s.gap > NEAR) {
        await hold(s.dir > 0 ? 'ArrowRight' : 'ArrowLeft');
        // (walked at them for long enough: put down by them instead)
        if (Date.now() - s0 > 15000 && ++tries % 40 === 0) {
          await js(`(() => { const e = (${job.foe})(), p = window.__m2.player; const left = e.pos.x - 24 - p.width > window.__m2.camera.x + 20;
            p.pos.x = left ? e.pos.x - 24 - p.width : e.pos.x + e.width + 24; p.pos.y = e.pos.y + e.height - p.height; p.vel.x = 0; p.vel.y = 0; })()`);
        }
        await page.waitForTimeout(40);
        continue;
      }
      await hold(null);
      if (s.dir > 0) { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(20); await page.keyboard.up('ArrowRight'); }
      else { await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(20); await page.keyboard.up('ArrowLeft'); }
      await page.keyboard.down('KeyR'); await page.waitForTimeout(50); await page.keyboard.up('KeyR');
      await page.waitForTimeout(120);
    }
    await hold(null);
    if (!kickAt) { console.log('  never got the cheap shot off'); await cdp.send('Page.stopScreencast').catch(() => {}); return false; }
    // the cutscene through, then the stunned boss a while (its crushed lines)
    for (const c0 = Date.now(); Date.now() - c0 < 15000;) { if (!(await js(() => window.__m2.player.inCutscene))) break; await page.waitForTimeout(50); }
    await page.waitForTimeout(job.tail ?? 2200);
    await cdp.send('Page.stopScreencast');
    await page.waitForTimeout(300);
    writeFileSync(join(dir, 'times.json'), JSON.stringify({ rect, frames, job: job.name, killAt: kickAt, ended: true, secs: (Date.now() - t0) / 1000 }));
    console.log(`  ${frames.length} frames, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    return true;
  } finally {
    await ctx.close();
  }
};

try {
  for (const job of list) {
    console.log(`== ${job.name}`);
    let ok = await run(job).catch(e => { console.log('  error', String(e).slice(0, 200)); return false; });
    if (!ok) { console.log('  retrying once'); ok = await run(job).catch(e => { console.log('  error', String(e).slice(0, 200)); return false; }); }
    if (!ok) { failed.push(job.name); rmSync(join(OUT, job.name), { recursive: true, force: true }); }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(failed.length ? `FAILED: ${failed.join(' ')}` : 'all recorded');
