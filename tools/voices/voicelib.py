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

_pron = os.path.join(HERE, 'pronunciations.json')
fixes = json.load(open(_pron, encoding='utf-8')).get('fixes', []) if os.path.exists(_pron) else []

def respell(text, voice=None):
    """The line as it's to be said: with the fixes in pronunciations.json (a word said wrong, respelled where it comes up)."""
    for f in fixes:
        if f.get('voice') and f['voice'] != voice: continue
        pat = re.escape(f['in'])
        # ('word': only where it's a word on its own, not inside another)
        if f.get('word'): pat = r'(?<![A-Za-z])' + pat + r'(?![A-Za-z])'
        text = re.sub(pat, f['say'], text, flags=re.I)
    return text

def spec_of(v):
    s = cast.get(v)
    while s and 'alias' in s: s = cast.get(s['alias'])
    return s

def sentences(text):
    """A line split into its sentences, each with the pause that follows it (seconds): a beat after a full stop, a
    shorter one after a shout or a question, a longer one after a trailing-off "...". A bit of punctuation with no words
    of its own ("...", "?!") stays with its neighbor."""
    parts = re.split(r'(?<=[.!?])\s+', text.strip())
    out = []
    for p in parts:
        if out and not re.search(r'[A-Za-z0-9]', p): out[-1] = out[-1] + ' ' + p; continue
        if out and not re.search(r'[A-Za-z0-9]', out[-1]): out[-1] = out[-1] + ' ' + p; continue
        out.append(p)
    def pause(s):
        if s.endswith('...'): return 0.42
        if s.endswith('?') or s.endswith('?!') or s.endswith('!?'): return 0.3
        if s.endswith('!'): return 0.26
        if s.endswith('.'): return 0.34
        return 0.2
    return [(s, pause(s)) for s in out]

def key_of(line, spec):
    k = {'t': line['text'], 's': spec, 'v': 4}
    # (a held-out word, "AAAAAH", "NOOOOO": read a newer way, so those are re-recorded)
    if re.search(r'([A-Za-z])\1\1', line['text']): k['st'] = 1
    # (said a sentence at a time, with a pause between: those are re-recorded)
    if len(sentences(line['text'])) > 1: k['sp'] = 1
    # (a word respelled so it's said right: re-recorded)
    said = respell(line['text'], line.get('voice'))
    if said != line['text']: k['say'] = said
    blob = json.dumps(k, sort_keys=True)
    return hashlib.sha1(blob.encode('utf-8')).hexdigest()

def path_of(line):
    spec = spec_of(line['voice'])
    return os.path.join(CACHE, key_of(line, spec) + '.ogg') if spec else None

# ---- words: the game's all-caps shouting, as something the model reads naturally
KEEP = {'ID', 'FBI', 'DEA', 'TV', 'USA', 'NYC', 'OK', 'DJ', 'VIP', 'SUV', 'LMG', 'IQ', 'UFO', 'CEO', 'ATM', 'HR', 'R&D', 'AC/DC', 'NOAA', 'CPR', 'DNA', 'EPA', 'RV', 'OD', 'NASA', 'AM', 'PM', 'GPS'}
def speakable(text):
    t = text.replace('*', '').replace('…', '...').strip()
    # A held-out word ("AAAAAAH", "NOOOOO", "NOTHIIIING"): the model reads a long run of one letter as gibberish,
    # so it gets two of it, and a pure scream is just "Aaah!"
    t = re.sub(r'\b[Aa]{3,}[Hh]*\b', 'Aaah', t)
    t = re.sub(r'([A-Za-z])\1{2,}', r'\1\1', t)
    words = re.split(r'(\s+)', t)
    out = []
    for w in words:
        core = re.sub(r"[^A-Za-z&/'.]", '', w)
        if core.upper().strip("'.") in KEEP and core.isupper():
            out.append(w)
        else:
            out.append(w.lower())
    t = ''.join(out)
    # Sentences start with a capital; "i" on its own is "I"
    t = re.sub(r"(^|[.!?]\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), t)
    t = re.sub(r"\bi\b", 'I', t)
    t = re.sub(r"\bi('m|'ll|'ve|'d)\b", lambda m: 'I' + m.group(1), t)
    return t
