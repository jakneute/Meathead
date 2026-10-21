# Voices

Every line in the game is recorded ahead of time in its character's own voice, with
[Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) (Apache 2.0), an open speech model run locally. The recordings
are packed into `src/m1/generated/voices.bin`, which the release build puts inside the page: the game itself never needs
a network. A line that hasn't been recorded is only shown as text, never spoken (and is listed in
`window.__voiceMisses` in the browser console, to find gaps).

## Re-recording after changing dialogue

    npm run voices

That finds every line (`extract.ts` -> `manifest.json`, plus `extras.json` for lines built at runtime), records the
new or changed ones (`generate.py`; everything else is cached in `cache/`), and repacks. Then `npm run release`.

Meathead 2 records only what's in its voice tables (each section's `VOICE_LINES`, by voice). `unresolved.txt` (not
committed) lists anything its code says that isn't in one in that voice ("unrecorded": add it to the section's
`VOICE_LINES`), or that `m2/lines/consistency.ts` would weed out ("weeded out"); the rest of that file is expressions
read only at runtime (a line picked by a helper, a voice off a seeded look), which are fine as long as nothing's
"unrecorded".

## Setup (once)

    py -3 -m venv tools/voices/.venv
    tools/voices/.venv/Scripts/python.exe -m pip install kokoro-onnx soundfile
    curl -L -o tools/voices/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -L -o tools/voices/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

## Casting

`cast.json`: who sounds like what. Each voice is a Kokoro voice (or a blend of several), how fast it talks, how much
faster or slower (higher or deeper) it's played back in the game, and any effect (a radio, a respirator, gargling, a
chorus). Change someone's voice there and re-run: only their lines are re-recorded.
