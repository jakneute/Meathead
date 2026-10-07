// `npm run voices`: find every line (extract.ts), then record the new ones and repack (generate.py, in the voices venv).
const { execFileSync } = require('child_process');
const path = require('path');
const here = __dirname;
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit', cwd: path.resolve(here, '../..') });
run(process.execPath, [path.join(here, '..', '..', 'node_modules', 'esbuild', 'bin', 'esbuild'), 'tools/voices/extract.ts', '--bundle', '--platform=node', '--format=cjs', '--outfile=tools/voices/.extract.cjs', '--external:typescript', '--log-level=error']);
run(process.execPath, [path.join(here, '.extract.cjs')]);
const py = process.platform === 'win32' ? path.join(here, '.venv', 'Scripts', 'python.exe') : path.join(here, '.venv', 'bin', 'python');
run(py, [path.join(here, 'generate.py'), ...process.argv.slice(2)]);
// ...and Meathead 2's little pack, out of the big one (m2pack.ts)
run(process.execPath, [path.join(here, '..', '..', 'node_modules', 'esbuild', 'bin', 'esbuild'), 'tools/voices/m2pack.ts', '--bundle', '--platform=node', '--format=cjs', '--outfile=tools/voices/.m2pack.cjs', '--log-level=error', '--loader:.bin=empty', '--loader:.png=dataurl']);
run(process.execPath, [path.join(here, '.m2pack.cjs')]);
