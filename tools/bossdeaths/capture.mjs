// Meathead 2 boss deaths, recorded (the user's fun-stuff GIFs, like Meathead 1's "Fun Stuff/boss-deaths"): plays each
// land boss's fight in a headless Chromium off the perf build (tools/perf: the dev starts and `window.__m2` on), sets
// each death up by poking the live fight (the game's own death code plays it), and records the page with the
// DevTools screencast in real time (the lines are voiced: their beats run on the wall clock). Frames land in
// tools/bossdeaths/out/<job>/ (PNG + times.json); tools/bossdeaths/encode.py makes the GIFs.
//
//   node tools/bossdeaths/capture.mjs              every job, one at a time
//   node tools/bossdeaths/capture.mjs 05 02a       just those (prefixes)
//
// Build the perf build first if the game has changed: MEATHEAD_PERF_OUT=.build/perf/<a number newer than the last>
// node node_modules/vite/bin/vite.js build --mode perf (the newest folder in .build/perf is served). Then, for one
// death: node tools/bossdeaths/capture.mjs 02b; py tools/bossdeaths/encode.py "<dest>" 02b; and the compilation, off
// the deaths' GIFs in <dest>: py tools/bossdeaths/encode.py "<dest>" all. The frames are big (out/ is gigabytes):
// clear it out after. One browser, one job at
// a time, muted: the user plays on this same PC.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { existsSync, readdirSync, statSync, createReadStream, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JOBS } from './jobs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'tools', 'bossdeaths', 'out');
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
await new Promise(r => server.listen(5193, '127.0.0.1', r));

const picks = process.argv.slice(2);
const list = picks.length ? JOBS.filter(j => picks.some(p => j.name.startsWith(p))) : JOBS;
const browser = await chromium.launch({
  args: ['--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-gpu-rasterization', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
// (only the canvas: the DOM HUD, the FPS meter, menus all hidden, as Meathead 1's set had it)
const CANVAS_ONLY = '* { visibility: hidden !important; } canvas { visibility: visible !important; }';

try {
  for (const job of list) {
    const dir = join(OUT, job.name);
    rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    console.log(`== ${job.name}`);
    const ctx = await browser.newContext({ viewport: { width: 800, height: 600 } });
    const page = await ctx.newPage();
    page.on('pageerror', e => console.log('  pageerror', e.message.slice(0, 200)));
    await page.goto(`http://127.0.0.1:5193/meathead2.html?${job.q}`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => document.querySelector('canvas') && window.__m2SetCheat && window.__m2, null, { timeout: 120000 });
    await page.addStyleTag({ content: CANVAS_ONLY });
    await page.evaluate(() => { window.__m2SetCheat('god', true); window.__m2SetCheat('ammo', true); window.__m2SetCheat('allWeapons', true); });
    await page.mouse.move(600, 300);
    const js = (fn, arg) => page.evaluate(fn, arg);
    const waitFor = async (fn, ms, what) => {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) { if (await js(fn).catch(() => false)) return true; await page.waitForTimeout(50); }
      console.log(`  timed out waiting for ${what}`); return false;
    };
    // (the boss intro skipped, as on a retry)
    if (job.memo) await js(k => { window.__m2.stageMemo[k] = '1'; }, job.memo);
    await page.waitForTimeout(1500);
    // walk in till the fight's on
    await page.keyboard.down('ArrowRight');
    // (an intro that plays anyway (the memo set too late): skipped, once it's been on a while)
    let on = false, cut = 0;
    for (const t0 = Date.now(); Date.now() - t0 < 40000;) {
      if (await js(job.on).catch(() => false)) { on = true; break; }
      cut = (await js(() => !!window.__m2.player.inCutscene)) ? cut + 1 : 0;
      if (cut > 40) { await page.keyboard.press('Escape'); cut = 0; }
      await page.waitForTimeout(50);
    }
    if (!on) console.log('  timed out waiting for the fight');
    await page.keyboard.up('ArrowRight');
    if (!on) { await ctx.close(); continue; }
    if (job.setup) await job.setup({ page, js, waitFor });
    await waitFor(job.ready ?? job.on, 20000, 'ready');
    // (the canvas's place on the page: cropped to it later)
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
    await page.waitForTimeout(job.lead ?? 800);
    const t0 = Date.now();
    const dealt = await job.kill({ page, js, waitFor });
    // (the moment it was dealt, on the screencast's clock (seconds): the GIF starts a beat before it)
    const killAt = typeof dealt === 'number' ? dealt : Date.now() / 1000;
    const done = await waitFor(() => { const s = window.__m2.stage?.s ?? {}; return Object.values(s).some(v => v && typeof v === 'object' && (v.fight === 'won' || v.phase === 'won' || v.won === true)); }, job.cap ?? 90000, 'the death to end');
    await page.waitForTimeout(job.tail ?? 1200);
    await cdp.send('Page.stopScreencast');
    await page.waitForTimeout(300);
    writeFileSync(join(dir, 'times.json'), JSON.stringify({ rect, frames, job: job.name, killAt, ended: done, secs: (Date.now() - t0) / 1000 }));
    console.log(`  ${frames.length} frames, ${((Date.now() - t0) / 1000).toFixed(1)} s${done ? '' : ' (NOT ended)'}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
