// Frames since something happened, for module-level stamps (a line's last saying, a button's last press). Every stage
// counts its frames from nothing, so a stamp left over from the last one can be ahead of now: that's long ago, not
// "just now" (and not a cooldown that never runs out).

export const since = (frame: number, at: number) => (frame >= at ? frame - at : Infinity);
