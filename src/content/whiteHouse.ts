import { BossLocationData } from './roster';
import { mapPoint } from './mapGeo';

/** The last stop, once all eight are dead: Washington, and a medal. */
export const WHITE_HOUSE_ID = 'THE WHITE HOUSE';

/** Where the map puts it. */
export const WHITE_HOUSE_LOCATION: BossLocationData = {
  city: 'WASHINGTON',
  state: 'D.C.',
  stateCode: 'DC',
  region: 'THE BELTWAY',
  coords: mapPoint('us', -77.0, 38.9),
  coordinatesText: "38°53'N 77°02'W",
  threatBrief: 'MEDAL CEREMONY. ATTENDANCE MANDATORY.',
};

/** Its file: the summons. */
export const WHITE_HOUSE_DOSSIER = {
  realName: '1600 PENNSYLVANIA AVENUE NW',
  age: 'OLDER THAN THE ASSET\'S FAMILY TREE, WHICH IS SHORT, AND HAS NO BRANCHES',
  occupation: 'Seat of government. Press room. The good silverware.',
  threat: 'NONE. DO NOT MAKE IT ONE.',
  summons: 'All eight targets are confirmed dead. The President has asked to meet the man responsible, in person, in front of the press, with a medal. The President has been told it was one man. The President has not been told anything else.',
  instructions: 'Shower. Wear a shirt. Wear the shirt the whole time. Stand where the tape on the floor says. Shake the hand. Do not squeeze the hand. Do not lift anything that is not offered to you. Do not lift anything that is offered to you. He had the gas station chili on the drive in, both bowls. He is not to crouch down and stay there, doing nothing, for more than fifteen seconds. Keep him moving.',
  risks: 'Several of the press corps have read the damage reports. Do not let them ask him questions. Do not let him answer any. If he is asked about his methods, the answer is "TEAMWORK." He has been practicing it. He says "TEAM WORK," as two words, and then flexes. Standing medical advisory, as on every job: the asset is never more than one long squat away from soiling himself. Today is no exception.',
  irregularities: 'Unconfirmed, and probably nothing. The President has not been seen eating a cheeseburger in eight months; staff call this "not like him." He has been heard humming at a pitch the dog will not stay in the room for. His collar has been described as "loose at the neck, the wrong kind of loose." His Secret Service detail has tripled, and they will not say what from. The press office says it is allergies. This office has no evidence of anything, and has been asked to stop writing this paragraph.',
  /** Tacked on to the handler's note while he's never once had his accident (a nudge to go back over the earlier jobs). */
  spotless: 'P.S. Strangely, not one accident on file from any of his eight jobs. If there had been, the people he ran into along the way would have had a lot to say about it. Someone should go back over those jobs.',
  handler: 'Asset asked if the White House has a gym. It does. Asset asked if it is a good gym. We did not answer. Asset has asked to bring his own bar. The bar weighs more than the podium. Request denied. He is bringing it anyway. He is also bringing everything he took off the eight targets, "just in case." Asked why not just his sidearm, he said, "MY PEASHOOTER? FOR A PRESIDENT?"',
};
