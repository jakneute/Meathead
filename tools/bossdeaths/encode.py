"""Meathead 2 boss deaths: tools/bossdeaths/out/<job>/ (capture.mjs's frames) into GIFs, Meathead 1's set's way:
one per death at 480x360 (25 fps, real time), and 00-all-boss-deaths.gif at 288x216, 20 fps, a title card
and a card per death (Press Start 2P).

    py tools/bossdeaths/encode.py ["D:/Projects/Meathead/Fun Stuff/m2-boss-deaths"] [job prefixes... | all]
"""
import ast, json, os, sys, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'tools', 'bossdeaths', 'out')
DEST = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'Fun Stuff', 'm2-boss-deaths')
PICKS = [a for a in sys.argv[2:] if a != 'all']
ONLY_ALL = 'all' in sys.argv[2:]  # (just the compilation)
FONT = os.path.join(ROOT, 'node_modules', '@fontsource', 'press-start-2p', 'files', 'press-start-2p-latin-400-normal.woff')


def labels():
    """The cards' text, out of jobs.mjs (name: label: ['A', 'B', 'C'])."""
    src = open(os.path.join(ROOT, 'tools', 'bossdeaths', 'jobs.mjs'), encoding='utf-8').read()
    return {m.group(1): list(ast.literal_eval('[' + m.group(2) + ']')) for m in re.finditer(r"name: '([^']+)', label: \[([^\]]*)\]", src.replace("\\'", "\u2019"))}


def frames(job, step_ms, size):
    """The recording resampled to a steady rate (the latest frame at each tick), cropped to the canvas and scaled."""
    d = os.path.join(OUT, job)
    meta = json.load(open(os.path.join(d, 'times.json')))
    r, fs = meta['rect'], meta['frames']
    box = (round(r['x']), round(r['y']), round(r['x'] + r['w']), round(r['y'] + r['h']))
    t0, t1 = fs[0]['t'], fs[-1]['t']
    # (from a beat before the killing blow)
    if meta.get('killAt'):
        t0 = max(t0, meta['killAt'] - LEAD)
    out, i, t = [], 0, t0
    cache = {}
    while t <= t1 + 1e-6:
        while i + 1 < len(fs) and fs[i + 1]['t'] <= t:
            i += 1
        f = fs[i]['f']
        if f not in cache:
            cache.clear()
            cache[f] = Image.open(os.path.join(d, f)).convert('RGB').crop(box).resize(size, Image.LANCZOS)
        out.append(cache[f])
        t += step_ms / 1000
    return out


def from_gif(path, step_ms, size):
    """A death's own GIF resampled (the compilation's made off these, so the raw frames needn't be kept)."""
    im, out, t, at = Image.open(path), [], 0, 0
    for k in range(im.n_frames):
        im.seek(k)
        d = im.info.get('duration', STEP)
        fr = None
        while t < at + d:
            fr = fr or im.convert('RGB').resize(size, Image.LANCZOS)
            out.append(fr)
            t += step_ms
        at += d
    return out


def palette_of(imgs, n=16):
    """One palette for a run of frames: an adaptive 256 off a strip of samples across it."""
    picks = [imgs[int(k * (len(imgs) - 1) / max(1, n - 1))] for k in range(n)]
    w, h = picks[0].size
    strip = Image.new('RGB', (w, h * len(picks)))
    for k, p in enumerate(picks):
        strip.paste(p, (0, h * k))
    # (255 colours: the last index is kept for "same as the frame before", see to_p)
    q = strip.quantize(255, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[:255 * 3]
    out = Image.new('P', (1, 1))
    out.putpalette(pal + [255, 0, 255])
    return out


CLEAR = 255
# (how far off what's showing a pixel has to be to be redrawn: see to_p)
FUZZ = 24
LEAD = 1.0
# (a frame every 40 ms, 25 fps: Meathead 1's were 30 ms, but these deaths run three to five times as long)
STEP = 40


def to_p(imgs, pal, fuzz=FUZZ):
    """Quantized to the palette, each frame after the first only what changed from what's showing (the rest the clear
    index, the frame before showing through). A pixel within `fuzz` of what's showing counts as unchanged: the lighting's
    flicker and the backdrops' drift are what make a GIF of a scene that's always moving a little so big."""
    lut = np.array(pal.getpalette()[:256 * 3], dtype=np.int16).reshape(-1, 3)
    out, shown = [], None
    for im in imgs:
        a = np.asarray(im.quantize(palette=pal, dither=Image.Dither.NONE))
        rgb = lut[a]
        if shown is None:
            b, shown = a.copy(), rgb.copy()
        else:
            ch = np.abs(rgb - shown).max(axis=2) > fuzz
            b = np.where(ch, a, CLEAR).astype(np.uint8)
            shown[ch] = rgb[ch]
        f = Image.fromarray(b, 'P')
        f.putpalette(pal.getpalette())
        f.info['transparency'] = CLEAR
        out.append(f)
    return out


def save(path, imgs, durs):
    imgs[0].save(path, save_all=True, append_images=imgs[1:], duration=durs, loop=0, optimize=False, disposal=1, transparency=CLEAR)


def card(lines, size, title=False):
    """A title card, Meathead 1's: the dark red-to-navy bands, a red rule above and below, the lines centred."""
    w, h = size
    im = Image.new('RGB', size)
    dr = ImageDraw.Draw(im)
    top, bot = (40, 8, 16), (12, 15, 37)
    for y in range(h):
        k = (y // 8) * 8 / h  # (banded, not smooth: SNES)
        dr.line([(0, y), (w, y)], fill=tuple(round(a + (b - a) * k) for a, b in zip(top, bot)))
    for y in (39, h - 43):
        dr.rectangle([0, y, w, y + 3], fill=(127, 29, 29))
    if title:
        spec = [(lines[0], 24, (248, 113, 113)), (lines[1], 10, (253, 224, 71))] + [(l, 8, (229, 231, 235)) for l in lines[2:]]
    else:
        spec = [(lines[0], 14, (147, 197, 253)), (lines[1], 8, (253, 224, 71))] + [(l, 8, (229, 231, 235)) for l in lines[2:]]
    gaps = [10] * len(spec)
    tot = sum(s for _, s, _ in spec) + sum(gaps[1:])
    y = (h - tot) // 2
    for k, (text, sz, col) in enumerate(spec):
        f = ImageFont.truetype(FONT, sz)
        while f.getbbox(text)[2] > w - 16 and sz > 6:
            sz -= 1
            f = ImageFont.truetype(FONT, sz)
        x = (w - f.getbbox(text)[2]) // 2
        sh = 2 if sz >= 12 else 1
        dr.text((x + sh, y + sh), text, font=f, fill=(1, 0, 1))
        dr.text((x, y), text, font=f, fill=col)
        y += sz + (gaps[k + 1] if k + 1 < len(gaps) else 0)
    return im


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
    # The lot, back to back, off the deaths' own GIFs: a card for each
    jobs = sorted(f[:-4] for f in os.listdir(DEST) if re.match(r'\d\d[a-z]-.*\.gif$', f))
    allp, durs = [], []
    t = card(['MEATHEAD 2', 'EVERY BOSS DEATH', f'8 LAND BOSSES, {len(jobs)} DEATHS'], (288, 216), title=True)
    allp += to_p([t], palette_of([t], 1)); durs.append(2500)
    for j in jobs:
        c = card(lab.get(j, [j]), (288, 216))
        allp += to_p([c], palette_of([c], 1)); durs.append(1800)
        imgs = from_gif(os.path.join(DEST, j + '.gif'), 50, (288, 216))
        allp += to_p(imgs, palette_of(imgs), 32); durs += [50] * len(imgs)
    path = os.path.join(DEST, '00-all-boss-deaths.gif')
    save(path, allp, durs)
    print(f'00-all-boss-deaths.gif  {len(allp)} frames  {sum(durs) / 1000:.0f} s  {os.path.getsize(path) / 1e6:.2f} MB')


main()
