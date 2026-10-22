// Meathead 2 performance harness: plays set spots of the game in a headless Chromium (Playwright), with the CPU
// throttled (to stand in for the min-spec PC), and reports frame times per scenario; with --profile, the hottest
// functions from a CPU profile too.
//
// The page is the perf build (`vite build --mode perf`, see vite.config.ts: the release's code, React's production
// build, unminified, with the dev starts like ?fantasy=31 on) in .build/perf/, served by a little static server here.
// It's built first if it isn't there, or with --build (do that after changing the game). Not the Vite dev server:
// that crawls for minutes on a cold cache, and reloads the page mid-run whenever anyone saves a file.
//
//   npm run perf                                  every scenario (scenarios.mjs), 4x CPU throttle
//   npm run perf -- tragons-lift heli-board       just those (names, or a prefix: "fantasy-" runs every Fairy Land one)
//   options: --build --dist=<folder> (serve that build instead) --throttle=4 --secs=25 --warm=5 --settle=6 --profile --top=25 --port=5179 --shots (a PNG per scenario, into
//            tools/perf/out/) --headed --json=tools/perf/out/last.json --url=http://127.0.0.1:3000 (some other server
//            with the dev starts: none started) --extra=nogl (more on every scenario's URL: ?nogl, the software paths)
//
// Numbers: "med"/"p95" are the requestAnimationFrame intervals (what the player sees: the game steps once a frame, so a
// long frame is slow motion); "work" is the main-thread time spent inside the frame's callbacks (update + draw);
// "drop" counts the 60 Hz frames missed (an interval of 2 frames = 1 dropped). Nothing here ships: Playwright's a
// devDependency only, and the perf build goes nowhere.
//
// Don't run it while someone's playing on the same PC: it eats CPU and their game stutters. Compare before/after
// numbers taken under the same conditions (other jobs on the machine move them a lot).

import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, writeFileSync, createReadStream, statSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, extname, normalize, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCENARIOS } from './scenarios.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'tools', 'perf', 'out');
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(s => s.startsWith(`--${k}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const flag = k => args.includes(`--${k}`);
const THROTTLE = +opt('throttle', 4), SECS = +opt('secs', 25), WARM = +opt('warm', 5), PORT = +opt('port', 5179), TOP = +opt('top', 25);
const SETTLE = +opt('settle', 6);
const PROFILE = flag('profile'), SHOTS = flag('shots'), HEADED = flag('headed');
const picks = args.filter(a => !a.startsWith('--'));
const list = picks.length ? SCENARIOS.filter(s => picks.some(p => s.name === p || (p.endsWith('-') && s.name.startsWith(p)))) : SCENARIOS;
if (!list.length) { console.error('no such scenario; have:', SCENARIOS.map(s => s.name).join(' ')); process.exit(1); }
mkdirSync(OUT, { recursive: true });

// ---- the perf build, served (unless --url names a server already up)
// (each build into a folder of its own, .build/perf/<time>, the newest served: Windows won't always let a folder go
// the moment it's done with (a virus scan of the 90 MB voice pack), so the old ones are cleared up when they can be)
const PERF = join(ROOT, '.build', 'perf');
const builds = () => (existsSync(PERF) ? readdirSync(PERF).filter(d => /^\d+$/.test(d) && existsSync(join(PERF, d, 'meathead2.html'))).sort() : []);
let server = null, base = opt('url', '');
if (!base) {
  if (flag('build') || (!builds().length && !opt('dist', ''))) {
    const out = join(PERF, String(Date.now()));
    console.log(`building ${out} ...`);
    const r = spawnSync(process.execPath, ['--max-old-space-size=8192', join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--mode', 'perf', '--logLevel', 'warn'], { cwd: ROOT, stdio: 'inherit', env: { ...process.env, MEATHEAD_PERF_OUT: out } });
    if (r.status !== 0) process.exit(r.status ?? 1);
    for (const d of readdirSync(PERF)) if (join(PERF, d) !== out) try { rmSync(join(PERF, d), { recursive: true, force: true }); } catch { /* still held: next time */ }
  }
}
// (--dist=<folder>: some other perf build (an older one kept to compare against), not the newest)
const DIST = opt('dist', '') ? (isAbsolute(opt('dist', '')) ? normalize(opt('dist', '')) : join(ROOT, opt('dist', ''))) : join(PERF, builds().at(-1) ?? '');
if (!base && !existsSync(join(DIST, 'meathead2.html'))) { console.error(`no perf build at ${DIST}`); process.exit(1); }
if (!base) {
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.bin': 'application/octet-stream', '.json': 'application/json' };
  server = createServer((req, res) => {
    const p = normalize(join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (!p.startsWith(DIST) || !existsSync(p) || !statSync(p).isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream', 'content-length': statSync(p).size });
    createReadStream(p).pipe(res);
  });
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  base = `http://127.0.0.1:${PORT}`;
}
const stop = () => { try { server?.close(); } catch { /* gone */ } };

// ---- the frame meter, in the page before anything of the game's: every rAF callback timed, per frame
const METER = () => {
  const orig = window.requestAnimationFrame.bind(window);
  const P = (window.__perf = { on: false, dt: [], work: [] });
  let ts0 = -1, work = 0;
  window.requestAnimationFrame = cb => orig(ts => {
    if (ts !== ts0) { if (P.on && ts0 >= 0) { P.dt.push(ts - ts0); P.work.push(work); } ts0 = ts; work = 0; }
    const t = performance.now();
    try { cb(ts); } finally { work += performance.now() - t; }
  });
  // (something to keep the meter ticking even if the game's loop isn't running)
  const keep = () => window.requestAnimationFrame(keep); keep();
};

const browser = await chromium.launch({
  headless: !HEADED,
  args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-gpu-rasterization', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
});
const stats = a => {
  const s = [...a].sort((x, y) => x - y), q = p => s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN;
  return { med: q(0.5), p95: q(0.95), max: s[s.length - 1] ?? NaN, mean: a.reduce((x, y) => x + y, 0) / (a.length || 1) };
};
const results = [];
for (const sc of list) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 960 } });
  await ctx.addInitScript(METER);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  const cdp = await ctx.newCDPSession(page);
  await page.goto(`${base}/meathead2.html?${sc.q}${opt('extra', '') ? `&${opt('extra', '')}` : ''}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => document.querySelector('canvas') && window.__m2SetCheat, null, { timeout: 120000 });
  // (god mode and the like, through the dev server's own modules)
  await page.evaluate(() => { window.__m2SetCheat('god', true); window.__m2SetCheat('ammo', true); });
  await page.mouse.move(640, 480);
  // (unthrottled a while first: the sound effects are made in the background a few seconds after the audio starts
  // (sfx.ts warmSfx), and a land's music bank is rendered as it comes in; neither's what's being measured)
  await page.waitForTimeout(SETTLE * 1000);
  if (THROTTLE > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });
  // (the scenario's inputs, on their own clock from here: held keys, taps)
  const t0 = Date.now();
  const steps = [...(sc.keys ?? [])].sort((a, b) => a[0] - b[0]);
  let stepAt = 0;
  const runSteps = async upTo => {
    while (stepAt < steps.length && steps[stepAt][0] <= upTo) {
      const [, kind, key] = steps[stepAt++];
      if (kind === 'down') await page.keyboard.down(key);
      else if (kind === 'up') await page.keyboard.up(key);
      else if (kind === 'tap') await page.keyboard.press(key, { delay: 60 });
      else if (kind === 'js') await page.evaluate(key);
    }
  };
  const until = async ms => { while (Date.now() - t0 < ms) { await runSteps(Date.now() - t0); await page.waitForTimeout(50); } };
  // (a scenario can ask for a longer unmeasured lead-in of its own: its slow stretch comes later)
  const warm = sc.warm ?? WARM;
  await until(warm * 1000);
  if (PROFILE) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); }
  await page.evaluate(() => { window.__perf.dt.length = 0; window.__perf.work.length = 0; window.__perf.on = true; });
  await until((warm + SECS) * 1000);
  const m = await page.evaluate(() => { window.__perf.on = false; return { dt: window.__perf.dt, work: window.__perf.work }; });
  // (every frame's numbers, in order, for seeing which stretch of a scenario is the slow one)
  writeFileSync(join(OUT, `${sc.name}.frames.json`), JSON.stringify({ dt: m.dt.map(v => +v.toFixed(1)), work: m.work.map(v => +v.toFixed(1)) }));
  let hot = null;
  if (PROFILE) {
    const { profile } = await cdp.send('Profiler.stop');
    hot = summarize(profile);
    writeFileSync(join(OUT, `${sc.name}.cpuprofile`), JSON.stringify(profile));
  }
  if (SHOTS) await page.screenshot({ path: join(OUT, `${sc.name}.png`) });
  for (const k of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Space']) await page.keyboard.up(k).catch(() => {});
  const f = stats(m.dt), w = stats(m.work);
  const drop = m.dt.reduce((n, d) => n + Math.max(0, Math.round(d / (1000 / 60)) - 1), 0);
  const r = { name: sc.name, frames: m.dt.length, med: +f.med.toFixed(1), p95: +f.p95.toFixed(1), max: +f.max.toFixed(0), drop, fps: +(1000 / f.mean).toFixed(1), workMed: +w.med.toFixed(1), workP95: +w.p95.toFixed(1), errs: errs.slice(0, 3), hot };
  results.push(r);
  console.log(`${sc.name.padEnd(22)} fps ${String(r.fps).padStart(5)}  med ${String(r.med).padStart(5)}  p95 ${String(r.p95).padStart(5)}  max ${String(r.max).padStart(4)}  drop ${String(drop).padStart(4)}/${r.frames}  work med ${r.workMed} p95 ${r.workP95}${errs.length ? `  ERR ${errs[0]}` : ''}`);
  if (hot) {
    console.log('  self:');
    for (const h of hot.self.slice(0, TOP)) console.log(`    ${h.pct.toFixed(1).padStart(5)}%  ${h.fn}  ${h.at}   <- ${h.by}`);
    console.log('  inclusive (game code):');
    for (const h of hot.inclusive.filter(h => h.at).slice(0, TOP)) console.log(`    ${h.pct.toFixed(1).padStart(5)}%  ${h.fn}  ${h.at}`);
  }
  await ctx.close();
}
writeFileSync(opt('json', join(OUT, 'last.json')), JSON.stringify({ throttle: THROTTLE, secs: SECS, results }, null, 1));
await browser.close();
stop();
process.exit(0);

/** Self time per function (name + where), from a CDP CPU profile, biggest first. */
function summarize(profile) {
  const byId = new Map(profile.nodes.map(n => [n.id, n]));
  const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
  const keyOf = n => { const cf = n.callFrame, url = cf.url.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, ''); return `${cf.functionName || '(anon)'}|${url ? `${url}:${cf.lineNumber + 1}` : ''}`; };
  const self = new Map(), incl = new Map(), callers = new Map();
  const dts = profile.timeDeltas;
  let total = 0;
  profile.samples.forEach((id, i) => {
    const n = byId.get(id), dt = (dts[i + 1] ?? dts[i] ?? 0) / 1000;
    const key = keyOf(n);
    self.set(key, (self.get(key) ?? 0) + dt);
    total += dt;
    // (inclusive: every function on the stack, once; and the self time's callers, two up)
    const seen = new Set();
    let up = [];
    for (let p = id; p !== undefined; p = parent.get(p)) { const k = keyOf(byId.get(p)); if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) ?? 0) + dt); } if (p !== id && up.length < 2) up.push(k.split('|')[0]); }
    const cm = callers.get(key) ?? new Map(); callers.set(key, cm); const ck = up.join(' < '); cm.set(ck, (cm.get(ck) ?? 0) + dt);
  });
  const selfList = [...self.entries()].map(([k, v]) => {
    const [fn, at] = k.split('|');
    const by = [...callers.get(k).entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([c, t]) => `${c} ${((100 * t) / v).toFixed(0)}%`).join('; ');
    return { fn, at, self: v, pct: (100 * v) / total, incl: incl.get(k), by };
  }).sort((a, b) => b.self - a.self);
  const inclusive = [...incl.entries()].map(([k, v]) => { const [fn, at] = k.split('|'); return { fn, at, pct: (100 * v) / total }; }).sort((a, b) => b.pct - a.pct);
  return { self: selfList, inclusive };
}
