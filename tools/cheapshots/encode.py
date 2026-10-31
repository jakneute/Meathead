"""Meathead 2 cheap shots: tools/cheapshots/out/<job>/ (capture.mjs's frames) into GIFs, the boss deaths' way (the
encoding itself is tools/bossdeaths/encode.py's, borrowed whole): one per boss at 480x360, 25 fps, real time, from a
beat before the kick; and 00-all-cheap-shots.gif at 288x216, 20 fps, a title card and a card per boss.

    py tools/cheapshots/encode.py ["D:/Projects/Meathead/Fun Stuff/m2-cheap-shots"] [job prefixes... | all]
"""
import ast, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..', '..')
# (the deaths' encoder, its functions only: everything bar its last line, main())
_src = open(os.path.join(ROOT, 'tools', 'bossdeaths', 'encode.py'), encoding='utf-8').read()
_src = _src[:_src.rstrip().rfind('main()')]
_argv, sys.argv = sys.argv, sys.argv[:1]
exec(compile(_src, 'bossdeaths/encode.py', 'exec'), globals())
sys.argv = _argv
OUT = os.path.join(ROOT, 'tools', 'cheapshots', 'out')
DEST = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'Fun Stuff', 'm2-cheap-shots')
PICKS = [a for a in sys.argv[2:] if a != 'all']
ONLY_ALL = 'all' in sys.argv[2:]
# (from this long before the kick)
LEAD = 1.0


def labels():
    src = open(os.path.join(HERE, 'jobs.mjs'), encoding='utf-8').read()
    return {m.group(1): list(ast.literal_eval('[' + m.group(2) + ']')) for m in re.finditer(r"name: '([^']+)', label: \[([^\]]*)\]", src.replace("\\'", "\u2019"))}


def main():
    os.makedirs(DEST, exist_ok=True)
    lab = labels()
    jobs = sorted(d for d in os.listdir(OUT) if os.path.exists(os.path.join(OUT, d, 'times.json'))) if os.path.isdir(OUT) else []
    for j in jobs:
        if ONLY_ALL or (PICKS and not any(j.startswith(p) for p in PICKS)):
            continue
        imgs = frames(j, STEP, (480, 360))
        p = to_p(imgs, palette_of(imgs))
        path = os.path.join(DEST, j + '.gif')
        save(path, p, STEP)
        print(f'{j}.gif  {len(p)} frames  {len(p) * STEP / 1000:.1f} s  {os.path.getsize(path) / 1e6:.2f} MB')
    if PICKS:
        return
    jobs = sorted(f[:-4] for f in os.listdir(DEST) if re.match(r'\d\d-.*\.gif$', f))
    allp, durs = [], []
    t = card(['MEATHEAD 2', 'THE CHEAP SHOT', f'{len(jobs)} BOSSES, ONE BOOT'], (288, 216), title=True)
    allp += to_p([t], palette_of([t], 1)); durs.append(2500)
    for j in jobs:
        c = card(lab.get(j, [j]), (288, 216))
        allp += to_p([c], palette_of([c], 1)); durs.append(1500)
        imgs = from_gif(os.path.join(DEST, j + '.gif'), 50, (288, 216))
        allp += to_p(imgs, palette_of(imgs), 32); durs += [50] * len(imgs)
    path = os.path.join(DEST, '00-all-cheap-shots.gif')
    save(path, allp, durs)
    print(f'00-all-cheap-shots.gif  {len(allp)} frames  {sum(durs) / 1000:.0f} s  {os.path.getsize(path) / 1e6:.2f} MB')


main()
