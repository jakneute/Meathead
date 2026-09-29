"""
Listens back to every recording (with Whisper, a speech recognizer, run locally) and checks it says what it should.
Every line whose words don't come back right is listed, worst first, in check.txt: for catching the model mumbling,
skipping words or reading something oddly, without anybody having to sit through 1,500 lines.

  tools/voices/.venv/Scripts/python.exe tools/voices/check.py [--model base.en] [--only VOICE] [--below 0.8]
"""
import difflib, json, os, re, sys
from faster_whisper import WhisperModel
from voicelib import HERE, lines, path_of

args = sys.argv[1:]
model_name = args[args.index('--model') + 1] if '--model' in args else 'base.en'
only = args[args.index('--only') + 1] if '--only' in args else None
below = float(args[args.index('--below') + 1]) if '--below' in args else 0.8

NUM = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten', '12': 'twelve', '15': 'fifteen', '18': 'eighteen', '20': 'twenty', '45': 'forty five', '80': 'eighty', '250': 'two fifty', '400': 'four hundred'}
def words(t):
    t = t.lower().replace("'", '')
    t = re.sub(r'(\d+)', lambda m: ' ' + NUM.get(m.group(1), m.group(1)) + ' ', t)
    ws = re.findall(r'[a-z]+', t)
    # (a word held out, "aaaaah", "nooooo": squeezed down, so the count of letters doesn't matter)
    return [re.sub(r'(.)\1{2,}', r'\1\1', w) for w in ws]

model = WhisperModel(model_name, device='cpu', compute_type='int8')
results = []
todo = [l for l in lines if (not only or l['voice'] == only)]
for i, l in enumerate(todo):
    p = path_of(l)
    if not p or not os.path.exists(p): continue
    segs, _ = model.transcribe(p, language='en', beam_size=1, vad_filter=False)
    heard = ' '.join(s.text for s in segs)
    want, got = words(l['text']), words(heard)
    score = difflib.SequenceMatcher(None, want, got).ratio() if want else 1.0
    results.append((score, l['voice'], l['text'], heard.strip()))
    if (i + 1) % 100 == 0: print(f'{i + 1}/{len(todo)}', flush=True)

results.sort()
# (everything, for going through by hand: check.json)
with open(os.path.join(HERE, 'check.json'), 'w', encoding='utf-8') as f:
    json.dump([{'score': round(s, 3), 'voice': v, 'text': t, 'heard': h} for s, v, t, h in results], f, indent=1)
bad = [r for r in results if r[0] < below]
with open(os.path.join(HERE, 'check.txt'), 'w', encoding='utf-8') as f:
    for s, v, t, h in bad: f.write(f'{s:.2f}  {v}\n  said: {t}\n  heard: {h}\n')
print(f'checked {len(results)}; {len(bad)} under {below} (see check.txt); average {sum(r[0] for r in results) / max(1, len(results)):.3f}')
