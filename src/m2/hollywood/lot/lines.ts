// What's said on the backlot, by voice (recorded with the rest: hollywood/voices.ts gathers these; tools/voices). In
// the user's voice (hollywood-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to
// him. The backlot's cast's and gear's hurt and death lines are here too (registered in kinds.ts and index.ts).

import type { ByPants } from '../blvd/lines';

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Out through the hole he made, past the dumpster (once, from the start). */
export const ARRIVE = [
  'THAT DUMPSTER IS FULL OF MOVIE STARS. BEST THING THEY EVER STARRED IN.',
  'I PARKED THE BULLDOZER IN A HANDICAPPED SPOT. I EARNED IT.',
];
/** Coming back past it later (the bodies still there). */
export const DUMPSTER_AGAIN = ['STILL THERE. NOBODY TAKES OUT THE TRASH IN THIS TOWN.', "THEY'RE STARTING TO SMELL LIKE A DIRECT-TO-VIDEO SEQUEL."];
export const GAG_LINES: Record<'merch' | 'gate' | 'newyork' | 'rain' | 'flood' | 'western' | 'tower' | 'pit' | 'suburb' | 'giftshop' | 'disaster' | 'steve', string[]> = {
  merch: [
    'THEY\'RE ALREADY SELLING SHIRTS OF THE SCRIPT I LEAKED. TEN MINUTES AGO.',
    "RESEMBLE. RESEMBLE WHAT? THAT'S NOT A WORD THAT MEANS SHIT.",
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
    "FAKE RAIN. REAL LIGHTNING. SOME LAWYER'S BUYING A BOAT.",
    'WET STREET, LIGHTNING. EVEN I KNOW. STAY OFF THE GROUND.',
  ],
  flood: [
    'FLASH FLOOD. A BATHTUB WITH A GRUDGE.',
    'A FLOOD TANK. I AIN\'T SWIMMING IN THAT. GUESTS PEE IN IT.',
  ],
  western: [
    "A COWBOY TOWN. THE SALOON'S A WALL. I CHECKED. NO BEER.",
    'THE OLD WEST. THE OLDEST THING HERE IS THE TOUR GUIDE.',
  ],
  tower: [
    'A WATER TOWER. SOMETHING SHINY UP TOP. MINE.',
    "A CAMERA DOLLY UP A TOWER. I'M RIDING IT. SUE ME.",
  ],
  pit: [
    'MAIN STREET COLLAPSE. STUNT SHOW CLOSED 1991. THE HOLE STAYED OPEN.',
    "A HOLE WHERE THE STUNT SHOW WAS. STEVE'S WHOLE CAREER, BASICALLY.",
  ],
  suburb: [
    'THE SAME HOUSE SIX TIMES. NO BACKS. LIKE MY SUBURB.',
    "FAKE SUBURB. NO BACKYARDS. JUST A PIT. LIKE MY DAD'S MARRIAGE.",
  ],
  giftshop: [
    "EXIT THROUGH THE GIFT SHOP. I'LL EXIT THROUGH THE WINDOW.",
    'A REVENGERS PLUSHIE. I KILLED HIM AN HOUR AGO. FORTY DOLLARS.',
  ],
  disaster: [
    'DISASTER: THE RIDE. FINALLY SOMETHING HONEST.',
    'DISASTER: THE RIDE. MY EX CALLED ME THAT.',
  ],
  steve: [
    "STUNTMAN STEVE AGAIN. I ALREADY HATE HIM. I'VE NEVER MET HIM.",
    'HE\'S ON EVERY WALL. STUNTMAN STEVE IS THE MOST FAMOUS NOBODY ALIVE.',
  ],
};
/** Grabbed and yanked by a lasso (sometimes). */
export const LASSOED = ['YEE-HAW MY ASS!', 'LET GO, YOU RHINESTONE DOUCHE!'];
/** Flung back out of the flood tank, gagging (if the sting didn't already get a hurt line out of him). */
export const TANK_GAG = [
  'BLEAGH! IT\'S WARM! WHY IS IT WARM?!',
  'NOPE! NOPE! NOT SWIMMING IN PISS!',
  'IT GOT IN MY MOUTH! IT TASTES LIKE A FANNY PACK!',
  "I'M OUT! THERE WAS A BAND-AID IN THERE!",
];
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
  clean: ['ON YOUR LEFT, A GUEST WHO LEFT THE TOUR! STAY ON THE TRAM!', 'SIR! THE BACKLOT IS TRAM ONLY! I WILL WRITE YOU UP!'],
  shitty: ['ON YOUR LEFT, FOLKS, A MAN WHO HAS SHAT HIMSELF! DON\'T LOOK!', 'SIR! THE TRAM HAS RESTROOMS! YOU WALKED PAST FOUR!'],
  nude: ['ON YOUR LEFT, A NAKED MAN! COVER THE CHILDREN\'S EYES!', 'SIR! THAT IS NOT PART OF THE TOUR! THAT IS NOT A LANDMARK!'],
};
/** Backlot security, gunning the golf cart at him. */
export const SECURITY_BARK: ByPants = {
  clean: ['STOP RIGHT THERE! I HAVE A GOLF CART!', "I'M ONE WEEK FROM MY PENSION! DON'T MAKE ME DO THIS!"],
  shitty: ['CODE BROWN ON THE BACKLOT!', 'HE SHIT IN FAKE NEW YORK! IT BLENDS IN!'],
  nude: ['CODE NUDE! CODE NUDE!', "PUT IT AWAY OR I RUN IT OVER! I'LL AIM!"],
};
/** An extra in costume (a centurion, a cowboy), staying in character. */
export const EXTRA_BARK: ByPants = {
  clean: ['I\'M BACKGROUND! I DON\'T HAVE LINES! THIS IS A LINE!', 'HALT! I\'M SAG ELIGIBLE!'],
  shitty: ["I'M A ROMAN! WE BATHED! YOU DON'T!", 'WARDROBE! HE SHAT IN WARDROBE!'],
  nude: ["NUDE SCENES ARE EXTRA! WHO'S PAYING?!", 'CLOSED SET! HE\'S NAKED! CLOSED SET!'],
};
/** The guests reading the leaked script's pages (spoiler gossip, as he passes): the leak's the story of the century;
 *  thirty dead stars a footnote. */
export const GOSSIP = [
  'PAGE FORTY! THE CAPTAIN GUY DIES ON THE TOILET!',
  'THEY ALL RESEMBLE AT THE END! THAT\'S THE TWIST!',
  'THE TALKING RACCOON FUCKS THE TREE! PAGE SIXTY!',
  'NO WAY. THE VILLAIN IS THEIR ACCOUNTANT. I KNEW IT.',
  'THE CAST DIED? WHO CARES. THEY\'LL JUST AI THEM.',
  'THIRTY DEAD STARS AND I\'M HOLDING PAGE NINETY. BEST DAY OF MY LIFE.',
  "THE ACTORS ARE IN A DUMPSTER. THE SCRIPT'S ONLINE. SO SAD. FOR THE STUDIO.",
  "MY SISTER WORKS AT THE STUDIO. THEY OWN THE FACES. THEY'RE THRILLED.",
];
/** The guests, seeing him go past. */
export const GOSSIP_HIM: ByPants = {
  clean: ['THAT\'S HIM! HE LEAKED REVENGERS!', "HE LEAKED IT! I'D LET HIM DO ME!", 'HE KILLED THE WHOLE CAST. WHATEVER. HE LEAKED THE SCRIPT!'],
  shitty: ['THAT\'S HIM! HE SMELLS LIKE THE DUMPSTER!', 'HE LEAKED THE SCRIPT! AND OUT HIS ASS!', 'HE SHIT HIMSELF AND KILLED THIRTY STARS. NOBODY CARES. HE LEAKED IT!'],
  nude: ["THAT'S HIM! NAKED! HE'S HUNG LIKE A PAPERCLIP!", 'IS THAT IN THE SCRIPT? IS HE IN THE SCRIPT?', 'THE NAKED GUY LEAKED IT! THE DEAD GUYS? WHO?'],
};

// ---------------------------------------------------------------------------------------------------------------
// The PA (the same Happywood announcer as the boulevard's: the trailer voice)

export const PA_LOT: ByPants = {
  clean: [
    'WELCOME TO THE HAPPYWOOD BACKLOT! WHERE THE MAGIC HAPPENED! ONCE!',
    'IN A WORLD... WHERE NOTHING HAS BEEN FILMED SINCE 1987... ONE BACKLOT... STILL CHARGES SIXTY BUCKS.',
  ],
  shitty: [
    'ATTENTION. A GUEST HAS SOILED THE BACKLOT. PLEASE STAY ON THE TRAM.',
    'IN A WORLD... WHERE ONE MAN... STILL HASN\'T CHANGED HIS PANTS.',
  ],
  nude: [
    'ATTENTION. A NUDE GUEST IS ON THE BACKLOT. THIS IS NOT AN ATTRACTION. IT IS A MAN.',
    'IN A WORLD... WHERE ONE MAN... SHOWS EVERYONE EVERYTHING.',
  ],
};
/** Once, down the lot: mourning the script; nothing for the stars. */
export const PA_LEAK = [
  'ATTENTION, GUESTS. A MOMENT OF SILENCE FOR THE SCRIPT. NOT THE ACTORS. THE SCRIPT.',
  'TODAY HAPPYWOOD LOST SOMETHING IRREPLACEABLE: THE REVENGERS SCRIPT. THE CAST WILL BE REPLACED.',
  'IF YOU ARE HOLDING A PAGE OF THE REVENGERS SCRIPT, PLEASE EAT IT.',
];
export const PA_RAIN = ['ENJOY OUR FAMOUS RAINSTORM! THE LIGHTNING IS REAL! LEGAL SAYS STAY OFF THE PAVEMENT!'];
export const PA_FLOOD = ['FLASH FLOOD! THE TOUR\'S MOST BELOVED EFFECT! ALL GUESTS IN THE TANK WILL BE REIMBURSED!'];
export const PA_STEVE_LOT = [
  'STUNTMAN STEVE\'S STUPENDOUS STUNTERY! HE WAS IN A REAL MOVIE! YOU CAN SEE HIS HAND!',
  'STUNTMAN STEVE! NINETEEN EIGHTY-SIX! THE ONE WHERE THE CAR GOES BY! THAT WAS NEAR HIM!',
];
export const PA_DISASTER: ByPants = {
  clean: [
    'DISASTER: THE RIDE! FEEL THE FURY OF NATURE! MILDLY!',
    'NOW BOARDING: DISASTER: THE RIDE! NOBODY HAS DIED SINCE TUESDAY!',
  ],
  shitty: [
    'SIR, DISASTER: THE RIDE IS NOT A DISASTER YOU BRING WITH YOU.',
    'DISASTER: THE RIDE! SIR, YOU ARE ALREADY A DISASTER!',
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
    hurt: ['THE TOUR GUIDE HIT ME!', 'QUIT NARRATING ME!', 'OW! GET YOUR LANYARD OFF ME!'],
    death: ['BEATEN BY A TOUR GUIDE', 'ON YOUR LEFT: A CORPSE'],
  },
  'm2:hw_guide_blast': {
    hurt: ['MY EARS! THE MEGAPHONE!', 'NOBODY TIPS YOU, LADY!', 'I CAN HEAR YOU! FUCK!'],
    death: ['YELLED TO DEATH', 'KILLED BY A MEGAPHONE'],
  },
  'm2:hw_cart': {
    hurt: ['RUN OVER BY A GOLF CART!', 'YOU HIT ME WITH A GOLF CART?!', 'IT DOES NINE MILES AN HOUR! HOW?!'],
    death: ['RUN OVER BY A GOLF CART', 'KILLED BY A MALL COP'],
  },
  'm2:hw_legionary': {
    hurt: ['THE ROMAN HIT ME!', 'YOUR ARMOR IS CARDBOARD! THAT HURT ANYWAY!', 'GO BACK TO BEING BACKGROUND, NOBODY!'],
    death: ['KILLED BY AN EXTRA', 'ET TU, EXTRA?'],
  },
  'm2:hw_legionary_spear': {
    hurt: ['I CHARGED RIGHT INTO HIS SPEAR!', 'THE PROP SPEAR IS REAL!', 'A SPEAR IN MY GUT! FOR SCALE!'],
    death: ['RAN ONTO A SPEAR', 'SKEWERED BY AN EXTRA'],
  },
  'm2:hw_cowboy': {
    hurt: ['THE COWBOY KICKED ME!', 'GET YOUR SPURS OFF ME!', "OW! YOU'RE A DENTIST FROM ENCINO!"],
    death: ['KILLED BY A FAKE COWBOY', 'HE DIED WITH HIS BOOTS ON'],
  },
  'm2:hw_lasso': {
    hurt: [...LASSOED, 'ROPE BURN! LIKE MY LAST GIRLFRIEND!'],
    death: ['HOG-TIED AND DEAD', 'LASSOED LIKE A HEIFER'],
  },
  'm2:hw_rain': {
    hurt: ['THE LIGHTNING\'S REAL! THE RAIN\'S FAKE AND THE LIGHTNING\'S REAL!', 'ZAPPED IN A PUDDLE! MY TOES ARE COOKING!', 'MY BALLS! WET AND ZAPPED!'],
    death: ['STRUCK BY FAKE LIGHTNING', 'ELECTROCUTED IN A PUDDLE'],
  },
  'm2:hw_flood': {
    hurt: ['THE FLOOD GOT ME! IT\'S FULL OF PEE!', 'FLASH FLOOD! I SWALLOWED A DIAPER!', 'I SWALLOWED THE TOUR!'],
    death: ['DROWNED IN THE FLOOD TANK', 'THE TOUR\'S BEST EFFECT'],
  },
  'm2:hw_tank': {
    hurt: ['TOURIST PEE! IN MY EYES!', 'I FELL IN THE PISS TANK!', 'GET ME OUT! IT\'S CHUNKY!'],
    death: ['DIED IN THE PEE TANK', 'DROWNED IN TOURIST PISS'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ARRIVE, ...DUMPSTER_AGAIN, ...Object.values(GAG_LINES).flat(), ...FALL_SCREAM, ...TANK_GAG,
    ...Object.entries(HURT).flatMap(([k, h]) => (k === 'm2:hw_lasso' ? h.hurt.slice(LASSOED.length) : h.hurt)), ...LASSOED,
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  'm2.hollywood.pa': [...Object.values(PA_LOT).flat(), ...PA_LEAK, ...PA_RAIN, ...PA_FLOOD, ...PA_STEVE_LOT, ...Object.values(PA_DISASTER).flat()],
  [LOT_VOICES.guide]: Object.values(GUIDE_BARK).flat(),
  [LOT_VOICES.guidef]: Object.values(GUIDE_BARK).flat(),
  [LOT_VOICES.security]: Object.values(SECURITY_BARK).flat(),
  [LOT_VOICES.securityf]: Object.values(SECURITY_BARK).flat(),
  [LOT_VOICES.extra]: Object.values(EXTRA_BARK).flat(),
  [LOT_VOICES.extraf]: Object.values(EXTRA_BARK).flat(),
  [LOT_VOICES.gossip]: [...GOSSIP, ...Object.values(GOSSIP_HIM).flat()],
  [LOT_VOICES.gossipf]: [...GOSSIP, ...Object.values(GOSSIP_HIM).flat()],
};
