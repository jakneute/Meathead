"""
Looks for words the voices will likely say wrong, before anyone has to hear them: every word in every line, as the
speech model's phonemizer will read it, against how a pronouncing dictionary (CMU) says it. Words it reads nothing
like the dictionary are listed (with a line they're in), and so are words the dictionary doesn't know (names, slang,
sound effects: worth a look). Fix any it finds in pronunciations.json.

  tools/voices/.venv/Scripts/python.exe tools/voices/pronscan.py      -> pronscan.txt
"""
import os, re, sys
import cmudict
from kokoro_onnx import Kokoro
from voicelib import HERE, lines, respell
from voicelib import speakable

sys.stdout.reconfigure(encoding='utf-8')
cmu = cmudict.dict()
k = Kokoro(os.path.join(HERE, 'kokoro-v1.0.onnx'), os.path.join(HERE, 'voices-v1.0.bin'))

ARPA = {'AA': 'ɑ', 'AE': 'æ', 'AH': 'ʌ', 'AO': 'ɔ', 'AW': 'aʊ', 'AY': 'aɪ', 'EH': 'ɛ', 'ER': 'ɜɹ', 'EY': 'eɪ', 'IH': 'ɪ',
        'IY': 'i', 'OW': 'oʊ', 'OY': 'ɔɪ', 'UH': 'ʊ', 'UW': 'u', 'B': 'b', 'CH': 'tʃ', 'D': 'd', 'DH': 'ð', 'F': 'f',
        'G': 'ɡ', 'HH': 'h', 'JH': 'dʒ', 'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'NG': 'ŋ', 'P': 'p', 'R': 'ɹ', 'S': 's',
        'SH': 'ʃ', 'T': 't', 'TH': 'θ', 'V': 'v', 'W': 'w', 'Y': 'j', 'Z': 'z', 'ZH': 'ʒ'}
UNITS = ['tʃ', 'dʒ', 'aʊ', 'aɪ', 'eɪ', 'oʊ', 'ɔɪ', 'ɜɹ']

def cmu_units(pron):
    out = []
    for p in pron:
        base, stress = re.match(r'([A-Z]+)(\d?)', p).groups()
        ipa = 'ə' if base == 'AH' and stress == '0' else ARPA[base]
        out += [ipa] if ipa in UNITS or len(ipa) == 1 else list(ipa)
    return norm_units(out)

def ipa_units(s):
    s = re.sub(r'[ˈˌː\s.!?,;:\-]', '', s)
    s = re.sub(r'ɜ(?!ɹ)', 'ɜɹ', s)
    s = s.replace('ɚ', 'ɜɹ').replace('ɝ', 'ɜɹ').replace('ᵻ', 'ɪ').replace('ɐ', 'ə').replace('ɾ', 't').replace('ʔ', 't').replace('r', 'ɹ').replace('ɫ', 'l').replace('ɡ', 'ɡ').replace('g', 'ɡ')
    out, i = [], 0
    while i < len(s):
        two = s[i:i + 2]
        if two in UNITS: out.append(two); i += 2
        else: out.append(s[i]); i += 1
    return norm_units(out)

# sounds that are near enough the same for this (reduced vowels, a/ɑ/ɔ, i/ɪ at the end, the flap)
CLASS = {'ə': 'V0', 'ʌ': 'V0', 'ɪ': 'V0', 'ɑ': 'A', 'ɔ': 'A', 'a': 'A', 'o': 'A', 'ɛ': 'E', 'e': 'E', 'ʊ': 'U', 'u': 'U'}
def norm_units(us): return [CLASS.get(u, u) for u in us]

def dist(a, b):
    """Edit distance, a vowel against a consonant costing double."""
    V = set(CLASS.values()) | {'i', 'æ', 'aʊ', 'aɪ', 'eɪ', 'oʊ', 'ɔɪ', 'ɜɹ'}
    d = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1): d[i][0] = i
    for j in range(len(b) + 1): d[0][j] = j
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            sub = 0 if a[i - 1] == b[j - 1] else (2 if (a[i - 1] in V) != (b[j - 1] in V) else 1)
            d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + sub)
    return d[-1][-1]

words = {}
for l in lines:
    for w in re.findall(r"[A-Za-z][A-Za-z']*", respell(l['text'], l.get('voice'))):
        W = w.strip("'").lower()
        if len(W) < 2: continue
        words.setdefault(W, l['text'])

flagged, unknown = [], []
for w, line in sorted(words.items()):
    said = k.tokenizer.phonemize(speakable(w.upper()), 'en-us')
    got = ipa_units(said)
    key = w.replace("'", '') if w not in cmu else w
    if key not in cmu and w in cmu: key = w
    if key not in cmu:
        unknown.append((w, said, line)); continue
    best = min(dist(got, cmu_units(p)) for p in cmu[key])
    if best >= 2: flagged.append((best, w, said, ' | '.join(' '.join(p) for p in cmu[key]), line))

flagged.sort(reverse=True)
with open(os.path.join(HERE, 'pronscan.txt'), 'w', encoding='utf-8') as f:
    f.write(f'# {len(words)} words; {len(flagged)} read unlike the dictionary; {len(unknown)} not in it\n\n')
    for d, w, said, want, line in flagged: f.write(f'{d}  {w.upper():<16} said {said:<22} dict {want}\n     in: {line[:70]}\n')
    f.write('\n# not in the dictionary\n')
    for w, said, line in unknown: f.write(f'{w.upper():<18} said {said:<24} in: {line[:60]}\n')
print(f'{len(words)} words; {len(flagged)} flagged; {len(unknown)} not in the dictionary (see pronscan.txt)')
