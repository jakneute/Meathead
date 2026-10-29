// The quick check after every build: opens a built page headless, waits, prints the title screen's text and any
// errors. Pass: "PRESS ANY BUTTON" (Meathead 2) or "START GAME" (Meathead 1) in BODY, and no PAGEERROR lines.
//
//   node tools/smoke/loadcheck.mjs                         release-m2/app/Meathead2.html
//   node tools/smoke/loadcheck.mjs release-m1/app/Meathead.html
import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const page = path.resolve(process.argv[2] ?? 'release-m2/app/Meathead2.html');
const b = await chromium.launch({ args: ['--mute-audio'] });
try {
  const p = await b.newPage();
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push('error: ' + m.text().slice(0, 400)); });
  p.on('pageerror', e => errs.push('PAGEERROR: ' + (e.stack || e.message).slice(0, 1200)));
  await p.goto(pathToFileURL(page).href, { timeout: 120000 });
  await p.waitForTimeout(8000);
  console.log('BODY:', JSON.stringify(await p.evaluate(() => document.body.innerText.slice(0, 300))));
  if (errs.length) console.log(errs.slice(0, 15).join('\n'));
} finally { await b.close(); }
