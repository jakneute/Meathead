// UP-to-start spots (the minigames and their hosts, the doors and Ben's cannons): the zone and its press.
//
// The owner (2026-11-02): "sometimes the 'up' command to initiate contact with the minigames don't show. make sure it
// does. make sure the 'width' of the area to talk to the kid includes the whole cabinet, not just the kid itself. i
// really don't want players to miss it. same for all". The prompts used to want him dead still on the floor (grounded,
// feet within a few px): a hop, a landing bounce or a step's lip and it blinked off, and a press then did nothing. Now
// the footing's loose (on his feet there, or hopping over it), and an UP pressed mid-hop waits for the landing.

/** How far over the floor his feet can be (a hop) and still count as there. */
export const HOP_SLACK = 44;

/** His feet on the zone's floor, or hopping over it (not below it: that's another floor). */
export const onFloorish = (feet: number, floor: number, slack = HOP_SLACK) => feet <= floor + 6 && feet >= floor - slack;

/** The buffered press's frames (kept on the spot's own state). */
export interface UpBuf { upBuf?: number }

/** Call every frame (in the zone or not): true the frame it should start. In the zone, a fresh UP starts it at once
 *  on his feet; pressed mid-hop it's kept a moment and starts the frame he lands (still in the zone). */
export const upStart = (b: UpBuf, press: boolean, inZone: boolean, grounded: boolean): boolean => {
  if (!inZone) { b.upBuf = 0; return false; }
  if (press) b.upBuf = 24;
  if ((b.upBuf ?? 0) > 0 && grounded) { b.upBuf = 0; return true; }
  if (b.upBuf) b.upBuf--;
  return false;
};
