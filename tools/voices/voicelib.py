"""What generate.py and check.py share: the cast, every line, and where each line's recording is kept."""
import hashlib, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CACHE = os.path.join(HERE, 'cache')
OUT = os.path.join(ROOT, 'src', 'generated', 'voices.bin')

cast = {k: v for k, v in json.load(open(os.path.join(HERE, 'cast.json'), encoding='utf-8')).items() if not k.startswith('_')}
manifest = json.load(open(os.path.join(HERE, 'manifest.json'), encoding='utf-8'))
extras = json.load(open(os.path.join(HERE, 'extras.json'), encoding='utf-8')) if os.path.exists(os.path.join(HERE, 'extras.json')) else []
lines = manifest + extras

def spec_of(v):
    s = cast.get(v)
    while s and 'alias' in s: s = cast.get(s['alias'])
    return s

def key_of(line, spec):
    k = {'t': line['text'], 's': spec, 'v': 4}
    # (a held-out word, "AAAAAH", "NOOOOO": read a newer way, so those are re-recorded)
    if re.search(r'([A-Za-z])\1\1', line['text']): k['st'] = 1
    blob = json.dumps(k, sort_keys=True)
    return hashlib.sha1(blob.encode('utf-8')).hexdigest()

def path_of(line):
    spec = spec_of(line['voice'])
    return os.path.join(CACHE, key_of(line, spec) + '.ogg') if spec else None
