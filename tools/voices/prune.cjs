// `npm run voices:prune` (a dry run) / `npm run voices:prune -- --delete`: prune.py, with the voices' own python.
const { spawnSync } = require('child_process');
const path = require('path');
const here = __dirname;
const py = process.platform === 'win32' ? path.join(here, '.venv', 'Scripts', 'python.exe') : path.join(here, '.venv', 'bin', 'python');
const r = spawnSync(py, [path.join(here, 'prune.py'), ...process.argv.slice(2)], { stdio: 'inherit' });
process.exit(r.status ?? 1);
