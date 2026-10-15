"""Clear out recordings no line uses any more: old versions of lines since rewritten, lines cut, voices recast.
`npm run voices:prune` lists what would go; `npm run voices:prune -- --delete` deletes it. Run it after `npm run voices`
(the manifest has to be current, or lines it missed would lose their recordings and be re-recorded next run)."""
import os, sys
from voicelib import CACHE, lines, spec_of, key_of

keep = set()
for l in lines:
    spec = spec_of(l['voice'])
    if spec: keep.add(key_of(l, spec))

if len(keep) < 1000:
    sys.exit(f'only {len(keep)} lines in the manifest: that looks wrong, nothing pruned (run npm run voices first)')

dead, size = [], 0
for f in os.listdir(CACHE):
    key = f.split('.', 1)[0]
    if key not in keep:
        p = os.path.join(CACHE, f)
        dead.append(p); size += os.path.getsize(p)

print(f'{len(keep)} lines in use; {len(dead)} cache files unused ({size / 1e9:.2f} GB)')
if '--delete' in sys.argv:
    for p in dead: os.remove(p)
    print('deleted')
else:
    print('dry run: add --delete to remove them')
