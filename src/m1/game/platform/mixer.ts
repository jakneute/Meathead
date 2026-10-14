// The mix: everything comes out through one master volume, the music, the sound effects and the voices each through
// their own under it (the options screen's sliders). Each sound connects to its kind's bus instead of the speakers.

export type MixBus = 'music' | 'sfx' | 'voice';

const levels: Record<MixBus | 'master', number> = { master: 1, music: 1, sfx: 1, voice: 1 };
const buses = new WeakMap<AudioContext, Record<MixBus | 'master', GainNode>>();
let lastCtx: AudioContext | null = null;

// (a slider's 0-1 heard as loudness: squared, so the bottom half isn't all near-silent and the top all the same)
const curve = (v: number) => Math.max(0, Math.min(1, v)) ** 2;

const nodesFor = (ctx: AudioContext) => {
  let n = buses.get(ctx);
  if (!n) {
    const master = ctx.createGain();
    master.connect(ctx.destination);
    const make = (k: MixBus) => { const g = ctx.createGain(); g.connect(master); return g; };
    n = { master, music: make('music'), sfx: make('sfx'), voice: make('voice') };
    for (const k of Object.keys(n) as (MixBus | 'master')[]) n[k].gain.value = curve(levels[k]);
    buses.set(ctx, n);
  }
  lastCtx = ctx;
  return n;
};

/** Where a sound of this kind goes (in place of ctx.destination). */
export const mixOut = (ctx: AudioContext, bus: MixBus): AudioNode => nodesFor(ctx)[bus];

/** Sets a volume (0 to 1): the master, or one kind's. Heard straight away. */
export const setMixLevel = (bus: MixBus | 'master', level: number) => {
  levels[bus] = level;
  if (!lastCtx) return;
  const n = buses.get(lastCtx);
  if (n) n[bus].gain.setTargetAtTime(curve(level), lastCtx.currentTime, 0.02);
};
