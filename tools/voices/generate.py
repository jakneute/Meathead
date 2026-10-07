"""
Records every line in manifest.json (see extract.ts) in its speaker's voice (cast.json), with Kokoro (an open speech
model, run here, offline), and packs them into src/m1/generated/voices.bin for the game. Recordings are cached by what
went into them (tools/voices/cache), so a run only records lines that are new or changed.

  tools/voices/.venv/Scripts/python.exe tools/voices/generate.py [--limit N] [--only VOICE]
"""
import json, os, re, sys, struct, time
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

from voicelib import HERE, ROOT, CACHE, OUT, cast, lines, spec_of, key_of, sentences, respell, speakable, KEEP
os.makedirs(CACHE, exist_ok=True)
os.makedirs(os.path.dirname(OUT), exist_ok=True)

args = sys.argv[1:]
limit = int(args[args.index('--limit') + 1]) if '--limit' in args else None
only = args[args.index('--only') + 1] if '--only' in args else None

kokoro = None
SR = 24000

def style(voice):
    if isinstance(voice, str): return voice
    total = sum(w for _, w in voice)
    return sum(kokoro.get_voice_style(n) * (w / total) for n, w in voice)

def synth(text, voice, speed):
    # A sentence at a time, with a proper pause after each (said all in one go, the model runs them together)
    parts = sentences(text)
    if len(parts) == 1:
        s, sr = kokoro.create(speakable(text), voice=style(voice), speed=speed, lang='en-us')
        return np.asarray(s, dtype=np.float32)
    out = []
    for k, (sent, gap) in enumerate(parts):
        s, sr = kokoro.create(speakable(sent), voice=style(voice), speed=speed, lang='en-us')
        out.append(trim(np.asarray(s, dtype=np.float32)))
        if k < len(parts) - 1: out.append(np.zeros(int(gap * SR / speed), np.float32))
    return np.concatenate(out)

def trim(x, thresh=0.012):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx): return x
    a = max(0, idx[0] - int(0.02 * SR)); b = min(len(x), idx[-1] + int(0.06 * SR))
    return x[a:b]

def resample(x, factor):
    """Deeper/slower (factor < 1 lengthens) by plain interpolation."""
    n = int(len(x) / factor)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)

def render(text, spec):
    if spec.get('fx') == 'chorus':
        # Everyone at once, a little apart, deep
        takes = [synth(text, v, spec['speed'] * (1 + 0.03 * (k - 1.5))) for k, v in enumerate(spec['voice'])]
        n = max(len(t) for t in takes) + int(0.05 * SR) * len(takes)
        mix = np.zeros(n, np.float32)
        for k, t in enumerate(takes):
            off = int(0.025 * SR) * k
            mix[off:off + len(t)] += t * (1.0 if k == 0 else 0.7)
        return mix
    return synth(text, spec['voice'], spec.get('speed', 1.0))

def finish(x):
    x = trim(x)
    peak = float(np.max(np.abs(x))) if len(x) else 1.0
    x = x / (peak or 1.0) * 0.89
    f = min(len(x), int(0.01 * SR))
    if f: x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    return x

todo = [l for l in lines if (not only or l['voice'] == only)]
missing_cast = sorted({l['voice'] for l in todo if not spec_of(l['voice'])})
if missing_cast: print('NO CAST FOR:', ', '.join(missing_cast))
todo = [l for l in todo if spec_of(l['voice'])]
if limit: todo = todo[:limit]

made = 0; t0 = time.time()
for i, l in enumerate(todo):
    spec = spec_of(l['voice'])
    path = os.path.join(CACHE, key_of(l, spec) + '.ogg')
    if os.path.exists(path): continue
    if kokoro is None: kokoro = Kokoro(os.path.join(HERE, 'kokoro-v1.0.onnx'), os.path.join(HERE, 'voices-v1.0.bin'))
    try:
        audio = finish(render(respell(l['text'], l['voice']), spec))
        sf.write(path, audio, SR, format='OGG', subtype='OPUS', compression_level=0.95)
        made += 1
    except Exception as e:
        print('FAILED', l['voice'], l['text'], e)
    if made and made % 25 == 0:
        el = time.time() - t0
        print(f'{made} recorded ({i + 1}/{len(todo)}), {el:.0f}s', flush=True)

def sentence_starts(path, n):
    """When each sentence after the first starts (seconds), found as the n-1 longest quiet stretches in the recording
    (the pauses put between sentences). Kept next to the recording."""
    side = path[:-4] + '.sents.json'
    if os.path.exists(side): return json.load(open(side))
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1: x = x.mean(axis=1)
    hop = int(0.01 * sr)
    rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
    quiet = rms < max(0.012, 0.06 * float(rms.max() if len(rms) else 1))
    runs = []; i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if i > 0 and j < len(quiet): runs.append((j - i, i, j))
            i = j
        else: i += 1
    runs.sort(reverse=True)
    starts = sorted(round(max(0, j * hop / sr - 0.03), 3) for _, i, j in runs[:n - 1])
    json.dump(starts, open(side, 'w'))
    return starts

# ---- the pack: a header (every clip's place in the file, each voice's playback) and the clips end to end
clips = {}; blobs = []; offset = 0
for l in lines:
    spec = spec_of(l['voice'])
    if not spec: continue
    path = os.path.join(CACHE, key_of(l, spec) + '.ogg')
    if not os.path.exists(path): continue
    data = open(path, 'rb').read()
    k = f"{l['voice']}|{l['text'].strip()}"
    if k in clips: continue
    clips[k] = [offset, len(data)]
    n = len(sentences(l['text']))
    if n > 1: clips[k].append(sentence_starts(path, n))
    blobs.append(data); offset += len(data)
voices = {v: {'rate': spec_of(v).get('rate', 1.0), 'gain': spec_of(v).get('gain', 1.0), 'fx': spec_of(v).get('fx', '')} for v in cast if spec_of(v)}
header = json.dumps({'clips': clips, 'voices': voices}, separators=(',', ':')).encode('utf-8')
with open(OUT, 'wb') as f:
    f.write(struct.pack('<I', len(header))); f.write(header)
    for b in blobs: f.write(b)
print(f'recorded {made} new; packed {len(clips)} clips, {os.path.getsize(OUT) / 1e6:.1f} MB -> {OUT}')

# ---- a check on what came out: anything much too short or long for its words is probably garbled
if '--stats' in args:
    odd = []
    for l in lines:
        spec = spec_of(l['voice'])
        if not spec: continue
        path = os.path.join(CACHE, key_of(l, spec) + '.ogg')
        if not os.path.exists(path): continue
        d = sf.info(path).duration
        n = max(1, len(re.sub(r'[^A-Za-z]', '', l['text'])))
        per = d / n
        if per < 0.03 or per > 0.2 or d > 12: odd.append((per, d, l['voice'], l['text']))
    odd.sort()
    for per, d, v, t in odd: print(f'{per:.3f}s/letter {d:.1f}s  {v}: {t}')
    print(len(odd), 'odd')
