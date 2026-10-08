// Whatever's pumping him up for a while (Meathead 2's "bulk up" spell): how much faster he runs, how much bigger he's
// drawn, and how much harder what he hits goes flying (charges, slides, uppercuts, dive kicks; a game's own throws can
// read it too). All 1 normally: Meathead 1 never touches them.

export const buffs = { speed: 1, size: 1, knock: 1 };
export const setBuffs = (b: Partial<typeof buffs>) => { Object.assign(buffs, b); };
