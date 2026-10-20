// Meathead 2 smoke test: every checkpoint of every land (plus the title, the way in and the hub) loaded in a headless
// Chromium (Playwright) against the Vite dev server, played for a few seconds with a dumb input script (hold right,
// hop, shoot, take the cutscene skip once one's been on offer a while), and checked for:
//   ERR    page errors and console errors
//   DRAW   a frame's drawing threw (the "DRAW FAILED: ..." on the canvas) / FRAME: a whole frame threw
//          (counted by GameCanvas.tsx's noteFail into window.__smoke, dev only)
//   BLANK  the canvas near-uniform (one flat color) for over --blank seconds
//   STALL  in a cutscene (player.inCutscene), nobody talking, him not moving, for over --stall seconds (a scene waiting
//          on something that never comes; the picture may well still be moving round him)
//   LOAD   the stage never started (window.__m2, set by each stage's update in dev, never appeared)
// and the frame times (median / p95 of the rAF intervals) as a bonus.
//
//   node tools/smoke/run.mjs                     everything
//   node tools/smoke/run.mjs fantasy cartoon:21  just those: a land (all its checkpoints), land:cp, title, intro, hub
//   options: --secs=12 --tod=7 (the hour: lands cleared, as timeOfDay.ts's ?tod; a list, 0,5,9, runs each visit at
//            each, its id suffixed @<tod>)
//            --jobs=2 --port=5181 --url=http://localhost:5173 (a dev server already up: none started)
//            --blank=1 --stall=9 --headed --shots (a PNG of each failure into tools/smoke/out/)
//            --fault=draw|blank|stall (self-test: fakes that failure on every visit, to prove it's caught)
//            --json=tools/smoke/out/last.json --only-fail (print just the failing rows)
//
// Exit code 1 if anything failed. Don't run it while someone's playing on the same PC: it eats CPU.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'tools', 'smoke', 'out');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(s => s.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const flag = k => args.includes(`--${k}`);
const SECS = +opt('secs', 12), JOBS = +opt('jobs', 2), PORT = +opt('port', 5181), BLANK_S = +opt('blank', 1), STALL_S = +opt('stall', 9);
const FAULT = opt('fault', ''), SHOTS = flag('shots'), HEADED = flag('headed'), ONLY_FAIL = flag('only-fail');
const picks = args.filter(a => !a.startsWith('--'));
mkdirSync(OUT, { recursive: true });

// The lands: their ids (App.tsx's LAND_STAGES), the dev URL parameter that starts one at a checkpoint (each land's
// index.ts: ?<param>=<cp>), and the module whose <NAME>_CHECKPOINTS lists them.
const LANDS = [
  { id: 'adventure', q: 'adv', mod: '/src/m2/adventure/index.ts', list: 'ADV_CHECKPOINTS' },
  { id: 'spooky', q: 'spooky', mod: '/src/m2/spooky/index.ts', list: 'SPOOKY_CHECKPOINTS' },
  { id: 'space', q: 'space', mod: '/src/m2/space/index.ts', list: 'SPACE_CHECKPOINTS' },
  { id: 'hollywood', q: 'hollywood', mod: '/src/m2/hollywood/index.ts', list: 'HOLLYWOOD_CHECKPOINTS' },
  { id: 'foreign', q: 'foreign', mod: '/src/m2/foreign/index.ts', list: 'FOREIGN_CHECKPOINTS' },
  { id: 'frontier', q: 'frontier', mod: '/src/m2/frontier/index.ts', list: 'FRONTIER_CHECKPOINTS' },
  { id: 'fantasy', q: 'fantasy', mod: '/src/m2/fantasy/index.ts', list: 'FANTASY_CHECKPOINTS' },
  { id: 'cartoon', q: 'cartoon', mod: '/src/m2/cartoon/index.ts', list: 'CARTOON_CHECKPOINTS' },
];

// ---- the dev server (ours, unless --url names one already up)
let server = null, base = opt('url', '');
if (!base) {
  base = `http://localhost:${PORT}`;
  // (a process of its own (serve.mjs: Vite with file watching off), so its work never holds up this one's clock)
  server = spawn(process.execPath, [join(ROOT, 'tools', 'smoke', 'serve.mjs'), String(PORT)], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  server.stdout.on('data', d => { log += d; }); server.stderr.on('data', d => { log += d; });
  server.on('exit', c => { if (c) { console.error(`dev server exited ${c}\n${log}`); process.exit(2); } });
  for (let i = 0; ; i++) {
    if (i > 240) { console.error(`dev server did not start\n${log}`); process.exit(2); }
    try { if ((await fetch(`${base}/meathead2.html`)).ok) break; } catch { /* not yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
}
const stop = () => { try { server?.kill(); } catch { /* gone */ } };
process.on('exit', stop);
process.on('SIGINT', () => { stop(); process.exit(130); });

const browser = await chromium.launch({
  headless: !HEADED,
  args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-gpu-rasterization', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows'],
});

// ---- what to visit: the checkpoint lists, read off the game's own modules (one page, the hub)
const visits = [];
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 960 } });
  const page = await ctx.newPage();
  const boot = [];
  page.on('pageerror', e => boot.push(e.message));
  await page.goto(`${base}/meathead2.html?hub=0`, { waitUntil: 'commit', timeout: 300000 });
  for (let t = Date.now(); !(await page.evaluate(() => !!window.__m2).catch(() => false)); await page.waitForTimeout(500)) {
    if (Date.now() - t > (boot.length ? 20000 : 300000)) { console.error('the game never started (the hub):', boot.join('; ') || 'no page error'); stop(); process.exit(2); }
  }
  const lists = await page.evaluate(async lands => {
    const out = {};
    for (const l of lands) { const m = await import(l.mod); out[l.id] = m[l.list].map(c => ({ cp: c.cp, name: c.name })); }
    return out;
  }, LANDS);
  await ctx.close();
  visits.push({ id: 'title', url: '', kind: 'title' });
  visits.push({ id: 'gym', url: 'gym' });
  visits.push({ id: 'intro', url: 'intro' });
  for (const s of [0, 4, 9]) visits.push({ id: `hub:${s}`, url: `hub=${s}` });
  // (each land in through its portal at the hub: the portal walk, the land opening on him; hub/lands.ts's slots: four
  // lands, America USA, four lands, the staff room)
  const SLOT = { space: 0, frontier: 1, spooky: 2, cartoon: 3, hollywood: 5, fantasy: 6, adventure: 7, foreign: 8 };
  for (const l of LANDS) visits.push({ id: `portal:${l.id}`, url: `hub=${SLOT[l.id]}`, kind: 'portal' });
  for (const l of LANDS) for (const c of lists[l.id]) visits.push({ id: `${l.id}:${c.cp}`, name: c.name, url: `${l.q}=${c.cp}` });
}
const picked = picks.length ? visits.filter(v => picks.some(p => v.id === p || v.id.startsWith(`${p}:`))) : visits;
// (at each hour asked for: the skies, the lighting and the painted-once art all follow it)
const TODS = opt('tod', '').split(',').filter(Boolean);
const chosen = TODS.length ? TODS.flatMap(t => picked.map(v => ({ ...v, id: `${v.id}@${t}`, url: v.kind === 'title' ? v.url : `${v.url}&tod=${t}` }))) : picked;
if (!chosen.length) { console.error('nothing matches; have:', visits.map(v => v.id).join(' ')); process.exit(2); }
console.log(`${chosen.length} visits, ${SECS}s each, ${JOBS} at a time\n`);

// ---- in the page, before anything of the game's: the frame meter and the failure counters
const INIT = () => {
  window.__smoke = { draw: 0, frame: 0 };
  try { localStorage.clear(); sessionStorage.clear(); } catch { /* none */ }
  const orig = window.requestAnimationFrame.bind(window);
  const P = (window.__perf = { on: false, dt: [] });
  let ts0 = -1;
  window.requestAnimationFrame = cb => orig(ts => { if (ts !== ts0) { if (P.on && ts0 >= 0) P.dt.push(ts - ts0); ts0 = ts; } cb(ts); });
  const keep = () => window.requestAnimationFrame(keep); keep();
};

// One sample of the page: the canvases on show, shrunk to 40x30 (its spread of colors and a hash, to tell blank and
// frozen pictures), and where he is / what he's in.
const SAMPLE = async () => {
  // (every big canvas on show, in page order, one over the next: the game's, and any laid over it, the title's)
  const cs = [...document.querySelectorAll('canvas')].filter(c => { const r = c.getBoundingClientRect(); return r.width * r.height > innerWidth * innerHeight * 0.25 && getComputedStyle(c).visibility !== 'hidden' && c.offsetParent !== null; });
  let range = -1, hash = 0;
  if (cs[0]) {
    const t = (window.__smokeTiny ??= Object.assign(document.createElement('canvas'), { width: 40, height: 30 }));
    const g = t.getContext('2d', { willReadFrequently: true });
    g.clearRect(0, 0, 40, 30); for (const c of cs) g.drawImage(c, 0, 0, 40, 30);
    const d = g.getImageData(0, 0, 40, 30).data;
    let lo = [255, 255, 255], hi = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4) {
      for (let k = 0; k < 3; k++) { if (d[i + k] < lo[k]) lo[k] = d[i + k]; if (d[i + k] > hi[k]) hi[k] = d[i + k]; }
      hash = (hash * 31 + (d[i] >> 3) * 7 + (d[i + 1] >> 3) * 3 + (d[i + 2] >> 3)) | 0;
    }
    range = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
  }
  const s = window.__m2, p = s?.player;
  let talking = false, skip = false;
  try { talking = (await import('/src/m1/game/platform/speech.ts')).isTalking(); } catch { /* */ }
  try { skip = (await import('/src/m1/game/platform/skip.ts')).canSkip(); } catch { /* */ }
  return {
    range, hash, has: !!s, frame: s?.frame ?? 0, x: p ? Math.round(p.pos.x) : null, y: p ? Math.round(p.pos.y) : null,
    cut: !!p?.inCutscene, hidden: !!p?.hidden, talking, skip, section: s?.stage?.section ?? null, stageId: s?.stageId ?? null,
  };
};

const stats = a => {
  const s = [...a].sort((x, y) => x - y), q = p => s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN;
  return { med: q(0.5), p95: q(0.95) };
};

// (a context per worker, a fresh page per visit: the browser cache carries over, so the dev server's ~1300 modules
// aren't fetched afresh every time; the save and settings are wiped at each page's start (INIT))
const newCtx = async () => { const c = await browser.newContext({ viewport: { width: 1280, height: 960 } }); await c.addInitScript(INIT); return c; };
async function visit(v, ctx) {
  const page = await ctx.newPage();
  const errs = [];
  const noteErr = t => { t = String(t).slice(0, 300); if (!errs.includes(t)) errs.push(t); };
  page.on('pageerror', e => noteErr(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') noteErr(m.text()); });
  const r = { id: v.id, name: v.name ?? '', fails: [], errs, skips: 0 };
  try {
    await page.goto(`${base}/meathead2.html${v.url ? `?${v.url}` : ''}`, { waitUntil: 'commit', timeout: 300000 });
    await page.waitForSelector('canvas', { timeout: 300000 });
    if (v.kind !== 'title') {
      // (up to 2 minutes for the stage to start; 20 s once the page has thrown)
      for (let t = Date.now(); !(await page.evaluate(() => !!window.__m2 && window.__m2.frame > 2).catch(() => false)); await page.waitForTimeout(250)) {
        if (Date.now() - t > (errs.some(e => e.startsWith('pageerror')) ? 20000 : 120000)) { r.fails.push('LOAD'); break; }
      }
      await page.evaluate(async () => { const c = await import('/src/m2/cheats.ts'); c.setCheat('god', true); c.setCheat('ammo', true); }).catch(() => {});
    }
    // (in through the hub's portal, as a player gets there: UP at the portal (the map), ENTER (the walk in), then the
    // land, opened on him; its checkpoint 0)
    if (v.kind === 'portal' && !r.fails.length) {
      await page.waitForTimeout(1200);
      const hubId = await page.evaluate(() => window.__m2.stageId);
      await page.keyboard.press('ArrowUp', { delay: 80 }); await page.waitForTimeout(700);
      await page.keyboard.press('Enter', { delay: 80 });
      const t = Date.now();
      while (!(await page.evaluate(h => !!window.__m2 && window.__m2.stageId !== h && window.__m2.frame > 2, hubId).catch(() => false))) {
        if (Date.now() - t > 45000) { r.fails.push('PORTAL'); break; }
        await page.waitForTimeout(250);
      }
      r.name = await page.evaluate(() => window.__m2?.stageId ?? '').catch(() => '');
    }
    await page.mouse.move(640, 480);
    // (the self-test: the failure faked, from here on)
    if (FAULT) await page.evaluate(fault => {
      const cv = () => [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0];
      if (fault === 'draw') { const o = CanvasRenderingContext2D.prototype.fillRect; CanvasRenderingContext2D.prototype.fillRect = function (...a) { if (this.canvas === cv()) throw new Error('smoke fault'); return o.apply(this, a); }; }
      const each = fn => { const go = () => { fn(); requestAnimationFrame(go); }; go(); };
      if (fault === 'blank') each(() => { const g = cv().getContext('2d'); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, 1e4, 1e4); g.restore(); });
      if (fault === 'stall') { const p = window.__m2.player, at = { ...p.pos }; each(() => { p.inCutscene = true; p.pos.x = at.x; p.pos.y = at.y; p.vel.x = p.vel.y = 0; }); }
    }, FAULT);
    await page.evaluate(() => { window.__perf.dt.length = 0; window.__perf.on = true; });
    const t0 = Date.now(), samples = [];
    let nextHop = 600, nextShot = 300, mouseDown = false, nextSkip = 4000;
    if (v.kind !== 'title') await page.keyboard.down('ArrowRight');
    while (Date.now() - t0 < SECS * 1000) {
      const t = Date.now() - t0;
      if (v.kind !== 'title') {
        if (t >= nextHop) { nextHop += 900; await page.keyboard.press('Space', { delay: 80 }); }
        if (t >= nextShot) { nextShot += 250; if (mouseDown) await page.mouse.up(); else await page.mouse.down(); mouseDown = !mouseDown; }
      }
      const s = await page.evaluate(SAMPLE);
      s.t = Date.now() - t0;
      samples.push(s);
      // (a scene that's been skippable a while: skip it, as a player would, so scenes that need it get exercised)
      if (s.skip && t >= nextSkip) { nextSkip = t + 3000; r.skips++; await page.evaluate(async () => (await import('/src/m1/game/platform/skip.ts')).requestSkip()); }
      await page.waitForTimeout(150);
    }
    await page.keyboard.up('ArrowRight').catch(() => {});
    await page.mouse.up().catch(() => {});
    const m = await page.evaluate(() => ({ dt: window.__perf.dt, smoke: window.__smoke }));
    const f = stats(m.dt);
    r.med = +f.med.toFixed(1); r.p95 = +f.p95.toFixed(1); r.frames = m.dt.length;
    r.draw = m.smoke?.draw ?? 0; r.frame = m.smoke?.frame ?? 0;
    if (r.draw) { r.fails.push('DRAW'); r.lastDraw = m.smoke.lastDraw; }
    if (r.frame) { r.fails.push('FRAME'); r.lastFrame = m.smoke.lastFrame; }
    // blank: the longest run of near-uniform pictures
    let run = 0, blankMax = 0, stallMax = 0, stallAt = null, prev = null, sRun = 0;
    for (const s of samples) {
      if (prev) {
        const dt = s.t - prev.t;
        run = s.range >= 0 && s.range < 6 ? run + dt : 0;
        blankMax = Math.max(blankMax, run);
        const still = s.cut && !s.talking && s.x === prev.x && s.y === prev.y;
        sRun = still ? sRun + dt : 0;
        if (sRun > stallMax) { stallMax = sRun; stallAt = { x: s.x, y: s.y, section: s.section, skip: s.skip, hidden: s.hidden }; }
      }
      prev = s;
    }
    r.blank = blankMax; r.stall = stallMax; r.stallAt = stallAt;
    if (blankMax > BLANK_S * 1000) r.fails.push('BLANK');
    if (stallMax > STALL_S * 1000) r.fails.push('STALL');
    if (errs.length) r.fails.push('ERR');
    const first = samples.find(s => s.has), last = samples[samples.length - 1];
    r.section = first?.section ? `${first.section}${last?.section && last.section !== first.section ? `>${last.section}` : ''}` : '';
    r.moved = first && last && first.x !== null && last.x !== null ? last.x - first.x : null;
    r.cutAll = samples.length > 4 && samples.slice(Math.floor(samples.length / 2)).every(s => s.cut);
    if (SHOTS && r.fails.length) await page.screenshot({ path: join(OUT, `${v.id.replace(/[:]/g, '_')}.png`) });
  } catch (e) {
    r.fails.push('HARNESS'); r.harness = String(e.message).slice(0, 200);
  }
  await page.close().catch(() => {});
  return r;
}

const results = [];
let at = 0;
const row = r => `${r.id.padEnd(14)} ${(r.name || '').slice(0, 22).padEnd(22)} ${(r.fails.join(',') || 'ok').padEnd(12)} med ${String(r.med ?? '-').padStart(5)} p95 ${String(r.p95 ?? '-').padStart(5)}  ${r.section ?? ''}${r.cutAll ? ' [cutscene throughout]' : ''}${r.skips ? ` skips ${r.skips}` : ''}`
  + (r.lastDraw ? `\n      DRAW: ${r.lastDraw}` : '') + (r.lastFrame ? `\n      FRAME: ${r.lastFrame}` : '')
  + (r.fails.includes('BLANK') ? `\n      BLANK for ${(r.blank / 1000).toFixed(1)}s` : '')
  + (r.fails.includes('STALL') ? `\n      STALL ${(r.stall / 1000).toFixed(1)}s at ${JSON.stringify(r.stallAt)}` : '')
  + (r.harness ? `\n      HARNESS: ${r.harness}` : '')
  + r.errs.slice(0, 4).map(e => `\n      ERR: ${e}`).join('');
await Promise.all(Array.from({ length: Math.max(1, JOBS) }, async () => {
  const ctx = await newCtx();
  while (at < chosen.length) {
    const v = chosen[at++];
    const r = await visit(v, ctx);
    results.push(r);
    if (!ONLY_FAIL || r.fails.length) console.log(row(r));
  }
}));
const order = new Map(chosen.map((v, i) => [v.id, i]));
results.sort((a, b) => order.get(a.id) - order.get(b.id));
const failed = results.filter(r => r.fails.length);
console.log(`\n${results.length - failed.length}/${results.length} clean; ${failed.length} with failures${failed.length ? ': ' + failed.map(r => `${r.id}(${r.fails.join(',')})`).join(' ') : ''}`);
writeFileSync(opt('json', join(OUT, 'last.json')), JSON.stringify({ secs: SECS, results }, null, 1));
await browser.close();
stop();
process.exit(failed.length ? 1 : 0);
