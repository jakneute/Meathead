// What's said on the backlot, by voice (recorded with the rest: hollywood/voices.ts gathers these; tools/voices). In
// the user's voice (hollywood-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to
// him. The backlot's cast's and gear's hurt and death lines are here too (registered in kinds.ts and index.ts).

import type { ByPants } from '../blvd/lines';

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Out through the hole he made, past the dumpster (once, from the start). */
export const ARRIVE = [
  'THAT DUMPSTER IS FULL OF MOVIE STARS. BEST THING THEY EVER STARRED IN.',
  'I PARKED THE BULLDOZER. SOMEBODY ELSE CAN FIND IT A SPACE.',
];
/** Coming back past it later (the bodies still there). */
export const DUMPSTER_AGAIN = ['STILL THERE. NOBODY TAKES OUT THE TRASH IN THIS TOWN.', 'THEY\'RE STARTING TO SMELL LIKE A SEQUEL.'];
export const GAG_LINES: Record<'merch' | 'gate' | 'newyork' | 'rain' | 'flood' | 'western' | 'tower' | 'pit' | 'suburb' | 'giftshop' | 'disaster' | 'steve', string[]> = {
  merch: [
    'THEY\'RE ALREADY SELLING SHIRTS OF THE SCRIPT I LEAKED. TEN MINUTES AGO.',
    'REVENGERS: RESEMBLE. RESEMBLE WHAT? WHAT DOES THAT MEAN?',
  ],
  gate: [
    'NOTHING FILMED HERE SINCE 1987. IT SHOWS.',
    'A BACKLOT. THE WHOLE TOWN IS ONE PLANK THICK. LIKE MY COUSIN.',
  ],
  newyork: [
    'NEW YORK. IT\'S PLYWOOD. STILL SMELLS LIKE PISS. ACCURATE.',
    'FAKE NEW YORK. THE RATS ARE REAL THOUGH.',
  ],
  rain: [
    'FAKE RAIN. WITH REAL LIGHTNING. WHO SIGNED OFF ON THIS?',
    'THE STREET IS WET AND THE SKY IS A SPRINKLER. GET OFF THE GROUND, DUMBASS.',
  ],
  flood: [
    'FLASH FLOOD. THE TOUR\'S MOST BELOVED EFFECT. IT\'S A BATHTUB WITH A GRUDGE.',
    'A FLOOD TANK. I AIN\'T SWIMMING IN THAT. GUESTS PEE IN IT.',
  ],
  western: [
    'A COWBOY TOWN. EVERY SALOON IS A WALL WITH A DOOR PAINTED ON.',
    'THE OLD WEST. THE OLDEST THING HERE IS THE TOUR GUIDE.',
  ],
  tower: [
    'A WATER TOWER. SOMETHING SHINY UP TOP.',
    'THE DOLLY GOES UP THE TOWER. I\'M RIDING THE DOLLY.',
  ],
  pit: [
    'MAIN STREET COLLAPSE. STUNT SHOW CLOSED 1991. THE HOLE STAYED OPEN.',
    'A HOLE WHERE THE STUNT SHOW WAS. STUNTMAN STEVE\'S RETIREMENT PLAN.',
  ],
  suburb: [
    'THE SAME HOUSE SIX TIMES. NO BACKS. LIKE MY SUBURB.',
    'FAKE SUBURB. THERE\'S NO HOUSES BEHIND THE HOUSES. THERE\'S A PIT.',
  ],
  giftshop: [
    'EXIT THROUGH THE GIFT SHOP. I\'LL EXIT THROUGH THE CASHIER.',
    'A REVENGERS PLUSHIE. I KILLED HIM AN HOUR AGO. FORTY DOLLARS.',
  ],
  disaster: [
    'DISASTER: THE RIDE. FINALLY SOMETHING HONEST.',
    'DISASTER: THE RIDE. I\'M THE DISASTER. LET\'S RIDE.',
  ],
  steve: [
    'STUNTMAN STEVE. THAT GUY AGAIN. I\'M GONNA MEET HIM AND I\'M GONNA HATE HIM.',
    'HE\'S ON EVERY WALL. STUNTMAN STEVE IS THE MOST FAMOUS NOBODY ALIVE.',
  ],
};
/** Grabbed and yanked by a lasso (sometimes). */
export const LASSOED = ['YEE-HAW MY ASS!', 'LET GO OF ME, COWBOY!'];
/** Over the edge into the stunt pit or the foundation pit (once a fall). */
export const FALL_SCREAM = ['TIMBERRRR!', 'NOT IN THE PIIIIT!'];

// ---------------------------------------------------------------------------------------------------------------
// The backlot's cast (men's and women's voices, by seed)

export const LOT_VOICES = {
  guide: 'm2.hollywood.guide', guidef: 'm2.hollywood.guidef',
  security: 'm2.hollywood.security', securityf: 'm2.hollywood.securityf',
  extra: 'm2.hollywood.extra', extraf: 'm2.hollywood.extraf',
  gossip: 'm2.hollywood.gossip', gossipf: 'm2.hollywood.gossipf',
} as const;

/** A tour guide on the megaphone, at him. */
export const GUIDE_BARK: ByPants = {
  clean: ['ON YOUR LEFT, A GUEST WHO LEFT THE TOUR! STAY ON THE TRAM!', 'SIR! THE BACKLOT IS TRAM ONLY! SIR!'],
  shitty: ['ON YOUR LEFT, FOLKS, A MAN WHO HAS SHAT HIMSELF! DON\'T LOOK!', 'SIR! THE TRAM HAS RESTROOMS! HAD!'],
  nude: ['ON YOUR LEFT, A NAKED MAN! COVER THE CHILDREN\'S EYES!', 'SIR! THIS IS A FAMILY BACKLOT!'],
};
/** Backlot security, gunning the golf cart at him. */
export const SECURITY_BARK: ByPants = {
  clean: ['STOP RIGHT THERE! I HAVE A GOLF CART!', 'YOU\'RE NOT ON THE TOUR! GET ON THE TOUR!'],
  shitty: ['CODE BROWN ON THE BACKLOT!', 'HE SHIT IN FAKE NEW YORK! AGAIN!'],
  nude: ['CODE NUDE! CODE NUDE!', 'PUT IT AWAY OR I RUN IT OVER!'],
};
/** An extra in costume (a centurion, a cowboy), staying in character. */
export const EXTRA_BARK: ByPants = {
  clean: ['I\'M BACKGROUND! I DON\'T HAVE LINES! THIS IS A LINE!', 'HALT! I\'M SAG ELIGIBLE!'],
  shitty: ['THE SCENE SAYS THE MAN SMELLS! METHOD!', 'WARDROBE! HE SHAT IN WARDROBE!'],
  nude: ['NOBODY SAID THIS WAS A NUDE SCENE!', 'CLOSED SET! HE\'S NAKED! CLOSED SET!'],
};
/** The guests reading the leaked script's pages (spoiler gossip, as he passes). */
export const GOSSIP = [
  'PAGE FORTY! THE CAPTAIN GUY DIES ON THE TOILET!',
  'THEY ALL RESEMBLE AT THE END! THAT\'S THE TWIST!',
  'IT SAYS HERE THE DOG GETS HIS OWN MOVIE.',
  'THE WHOLE THIRD ACT IS JUST A GROUP HUG?',
  'NO WAY. THE VILLAIN IS THEIR ACCOUNTANT.',
  'SPOILER: IT\'S BAD.',
];
/** The guests, seeing him go past. */
export const GOSSIP_HIM: ByPants = {
  clean: ['THAT\'S HIM! THE GUY FROM THE DUMPSTER!', 'HE LEAKED IT! I LOVE HIM!'],
  shitty: ['THAT\'S HIM! HE SMELLS LIKE THE DUMPSTER!', 'HE LEAKED THE SCRIPT AND HIS PANTS!'],
  nude: ['THAT\'S HIM! HE\'S NAKED NOW!', 'IS THAT IN THE SCRIPT? IS HE IN THE SCRIPT?'],
};

// ---------------------------------------------------------------------------------------------------------------
// The PA (the same Happywood announcer as the boulevard's: the trailer voice)

export const PA_LOT: ByPants = {
  clean: [
    'WELCOME TO THE HAPPYWOOD BACKLOT! WHERE THE MAGIC HAPPENED! ONCE!',
    'IN A WORLD... WHERE NOTHING HAS BEEN FILMED SINCE 1987... THE BACKLOT.',
  ],
  shitty: [
    'ATTENTION. A GUEST HAS SOILED THE BACKLOT. PLEASE STAY ON THE TRAM.',
    'IN A WORLD... WHERE ONE MAN... STILL HASN\'T CHANGED HIS PANTS.',
  ],
  nude: [
    'ATTENTION. A NUDE GUEST IS ON THE BACKLOT. THIS IS NOT A WARDROBE MALFUNCTION. IT IS A MAN.',
    'IN A WORLD... WHERE ONE MAN... SHOWS EVERYONE EVERYTHING.',
  ],
};
export const PA_RAIN = ['ENJOY OUR FAMOUS RAINSTORM EFFECT! PLEASE STAY OFF THE WET PAVEMENT DURING THE LIGHTNING!'];
export const PA_FLOOD = ['FLASH FLOOD! THE TOUR\'S MOST BELOVED EFFECT! ALL GUESTS IN THE TANK WILL BE REIMBURSED!'];
export const PA_STEVE_LOT = [
  'STUNTMAN STEVE\'S STUPENDOUS STUNTERY! HE WAS IN A REAL MOVIE! YOU CAN SEE HIS HAND!',
  'STUNTMAN STEVE! NINETEEN EIGHTY-SIX! THE ONE WHERE THE CAR GOES BY! THAT WAS NEAR HIM!',
];
export const PA_DISASTER: ByPants = {
  clean: [
    'DISASTER: THE RIDE! FEEL THE FURY OF NATURE! MILDLY!',
    'NOW BOARDING: DISASTER: THE RIDE! IT IS COMPLETELY SAFE!',
  ],
  shitty: [
    'SIR, DISASTER: THE RIDE IS NOT A DISASTER YOU BRING WITH YOU.',
    'DISASTER: THE RIDE! FEATURING, APPARENTLY, YOUR PANTS!',
  ],
  nude: [
    'SIR, DISASTER: THE RIDE REQUIRES PANTS. THE BLIZZARD SCENE GETS CHILLY.',
    'DISASTER: THE RIDE! TODAY\'S DISASTER: A NAKED MAN!',
  ],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him on the backlot (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:hw_guide': {
    hurt: ['THE TOUR GUIDE HIT ME!', 'STOP POINTING AT ME!', 'OW! GET YOUR LANYARD OFF ME!'],
    death: ['BEATEN TO DEATH BY A TOUR GUIDE', 'ON YOUR LEFT: A CORPSE'],
  },
  'm2:hw_guide_blast': {
    hurt: ['MY EARS! THE MEGAPHONE!', 'STOP YELLING AT ME!', 'I CAN HEAR YOU! FUCK!'],
    death: ['YELLED TO DEATH', 'KILLED BY A MEGAPHONE'],
  },
  'm2:hw_cart': {
    hurt: ['RUN OVER BY A GOLF CART!', 'YOU HIT ME WITH A GOLF CART?!', 'GET OFF YOUR CART AND FIGHT!'],
    death: ['RUN OVER BY A GOLF CART', 'BACKLOT SECURITY GOT HIM'],
  },
  'm2:hw_legionary': {
    hurt: ['THE ROMAN HIT ME!', 'YOUR ARMOR IS CARDBOARD! THAT HURT ANYWAY!', 'GET BACK TO BACKGROUND!'],
    death: ['KILLED BY AN EXTRA', 'ET TU, EXTRA?'],
  },
  'm2:hw_legionary_spear': {
    hurt: ['I CHARGED RIGHT INTO HIS SPEAR!', 'THE PROP SPEAR IS REAL!', 'SPEAR IN MY GUT!'],
    death: ['RAN ONTO A SPEAR', 'SKEWERED BY AN EXTRA'],
  },
  'm2:hw_cowboy': {
    hurt: ['THE COWBOY KICKED ME!', 'GET YOUR SPURS OFF ME!', 'OW! HOWDY TO YOU TOO!'],
    death: ['KILLED BY A FAKE COWBOY', 'HE DIED WITH HIS BOOTS ON'],
  },
  'm2:hw_lasso': {
    hurt: [...LASSOED, 'ROPE BURN! MY NECK!'],
    death: ['HOG-TIED AND DEAD', 'ROPED'],
  },
  'm2:hw_rain': {
    hurt: ['THE LIGHTNING\'S REAL! THE RAIN\'S FAKE AND THE LIGHTNING\'S REAL!', 'ZAPPED IN A PUDDLE!', 'MY BALLS! WET AND ZAPPED!'],
    death: ['STRUCK BY FAKE LIGHTNING', 'ELECTROCUTED IN A PUDDLE'],
  },
  'm2:hw_flood': {
    hurt: ['THE FLOOD GOT ME! IT\'S FULL OF PEE!', 'FLASH FLOOD! IN MY MOUTH!', 'I SWALLOWED THE TOUR!'],
    death: ['DROWNED IN THE FLOOD TANK', 'THE TOUR\'S MOST BELOVED EFFECT'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ARRIVE, ...DUMPSTER_AGAIN, ...Object.values(GAG_LINES).flat(), ...FALL_SCREAM,
    ...Object.entries(HURT).flatMap(([k, h]) => (k === 'm2:hw_lasso' ? h.hurt.slice(LASSOED.length) : h.hurt)), ...LASSOED,
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  'm2.hollywood.pa': [...Object.values(PA_LOT).flat(), ...PA_RAIN, ...PA_FLOOD, ...PA_STEVE_LOT, ...Object.values(PA_DISASTER).flat()],
  [LOT_VOICES.guide]: Object.values(GUIDE_BARK).flat(),
  [LOT_VOICES.guidef]: Object.values(GUIDE_BARK).flat(),
  [LOT_VOICES.security]: Object.values(SECURITY_BARK).flat(),
  [LOT_VOICES.securityf]: Object.values(SECURITY_BARK).flat(),
  [LOT_VOICES.extra]: Object.values(EXTRA_BARK).flat(),
  [LOT_VOICES.extraf]: Object.values(EXTRA_BARK).flat(),
  [LOT_VOICES.gossip]: [...GOSSIP, ...Object.values(GOSSIP_HIM).flat()],
  [LOT_VOICES.gossipf]: [...GOSSIP, ...Object.values(GOSSIP_HIM).flat()],
};
