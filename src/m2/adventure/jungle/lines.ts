// What's said in the jungle, by voice (recorded with the rest: tools/voices). The hurt and death lines are registered
// against their sources in animals.ts (from these same lists, so the text can't drift).

/** Meathead, walking into Adventure Land (once, from the start). */
export const ARRIVE = [
  "SMELLS LIKE A WRESTLING MAT IN HERE. I'M HOME.",
  "IT'S HUMID AS BALLS IN HERE. I LOVE IT.",
];
/** ...his first vine. */
export const FIRST_VINE = ['AAAH-EE-AAAH-EE-AAAAAH!', 'SWINGING! LIKE MY UNCLE AT A KEY PARTY!'];
/** ...his first look at the drop past the scenic overlook. */
export const GORGE = ["THAT'S A LONG WAY DOWN. I'VE FALLEN FURTHER DRUNK."];
/** ...on the way out, the Jungle Cruise in sight. */
export const LEAVING = ['A BOAT RIDE. FINALLY, SOMETHING I CAN DO DRUNK.'];

/** The hidden cave behind the gorge's falls (hidden.ts), three ways: clean, shitty pants, naked. In the cave's mouth
 *  the first time... */
export const CAVE_FOUND: Record<'clean' | 'shitty' | 'nude', string[]> = {
  clean: ["A SECRET CAVE. THAT'S WHERE THEY HIDE THE GOOD SHIT.", 'A CAVE UNDER THE CLIFF. NOBODY CHECKS UNDER THE CLIFF.'],
  shitty: ['A DARK CAVE. NOBODY CAN SMELL ME IN THERE.', 'A CAVE. FINALLY, SOMEWHERE PRIVATE TO DEAL WITH MY PANTS.'],
  nude: ['A DARK, DAMP HOLE. STORY OF MY LIFE.', 'A CAVE. MY BALLS COULD USE THE SHADE.'],
};
/** ...and the heart in the jar at the end of it, picked up (said as its card goes). */
export const HEART_GOT: Record<'clean' | 'shitty' | 'nude', string[]> = {
  clean: ['MY HEART JUST GOT BIGGER. LIKE A HORSE. A JACKED HORSE.', 'MORE HEART. I COULD TAKE A BEATING FROM A GORILLA NOW.'],
  shitty: ['I FEEL TOUGHER. STILL SHIT MYSELF, BUT TOUGHER.', 'A BIGGER HEART. SAME SHITTY PANTS.'],
  nude: ['MY HEART GOT BIGGER. AND IT WAS ALREADY THE SECOND BIGGEST THING ON ME.', 'TOUGHER THAN EVER. AND BUCK NAKED.'],
};

/** Into the gorge's plunge pool, and its piranhas (piranhas.ts), as they start on him. */
export const PIRANHA_SCREAM: Record<'clean' | 'shitty' | 'nude', string[]> = {
  clean: ['NOT MY CALVES! IT WAS LEG DAY!', 'PIRANHAS?! WHO STOCKS A WATERFALL WITH PIRANHAS?!'],
  shitty: ['EAT AROUND THE PANTS! AROUND THE PANTS!', "DON'T GO IN THE BACK! TRUST ME!"],
  nude: ['NOT THE BALLS FIRST!', 'THEY WENT STRAIGHT FOR MY DICK!'],
};

/** What hurts him in here (by source), and the death screen when it's what killed him. */
export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:monkey': {
    hurt: ['IT BIT MY NIPPLE!', 'GET OFF MY FACE, YOU LITTLE SHIT!', "IT'S GOT MY EAR!"],
    death: ['MAULED BY A CAT-SIZED MONKEY', 'THE MONKEY WEARS HIS HAT NOW'],
  },
  'm2:monkey_poo': {
    hurt: ["IT'S SHIT! IT'S MONKEY SHIT!", "IT'S STILL WARM!", "THAT SHIT ISN'T MINE! FOR ONCE!", 'QUIT THROWING YOUR SHIT, YOU HAIRY BASTARD!'],
    death: ['PELTED WITH MONKEY SHIT', 'SHAT ON TO DEATH BY A MONKEY'],
  },
  'm2:monkey_fruit': {
    hurt: ['OW! A MANGO!', 'FIBER! MY ONLY WEAKNESS!', 'A BANANA TO THE FACE!'],
    death: ['PART OF A BALANCED DEATH', 'MANGOED'],
  },
  'm2:chimp': {
    hurt: ['THE CHIMP HITS LIKE MY DAD!', 'HE PULLED MY HAIR, THE BITCH!', "THAT CHIMP DOESN'T SKIP LEG DAY!"],
    death: ["A CHIMP. IT WASN'T CLOSE.", 'A CHIMP TORE HIS FACE OFF'],
  },
  'm2:jaguar': {
    hurt: ["THE KITTY'S GOT MY TAINT!", 'HE CLAWED MY ASS!', 'BAD KITTY!'],
    death: ['EATEN BY A JAGUAR', 'THE JAGUAR ATE THE GOOD BITS'],
  },
  'm2:boa': {
    hurt: ['SNAKE! FROM ABOVE!', 'THE SNAKE FRENCHED ME!', 'WHY ARE THE SNAKES IN THE TREES?!'],
    death: ['SWALLOWED WHOLE BY A BOA', 'HUGGED TO DEATH BY A SNAKE'],
  },
  'm2:macaw': {
    hurt: ['FUCK YOU, POLLY!', 'IT WENT FOR MY EYES!', 'PRETTY BIRD MY ASS!'],
    death: ['PECKED TO DEATH BY A PARROT', 'THE PARROT GOT THE LAST WORD'],
  },
  // (the hidden cave's: caveTraps.ts)
  'm2:stalactite': {
    hurt: ['RIGHT IN THE SKULL!', "THE CAVE'S SHITTING ROCKS ON ME!", 'A ROCK! FROM THE CEILING! WHO DOES THAT?!'],
    death: ['THE CEILING GOT HIM', 'A STALACTITE TO THE DOME'],
  },
  'm2:thorns': {
    hurt: ['THORNS! IN MY TAINT!', 'OW! PRICKS!', 'THE ROOTS HAVE SPIKES, YOU BASTARD!'],
    death: ['DIED IN A PRICKER BUSH', 'TOO MANY PRICKS'],
  },
  // (the gorge's plunge pool: piranhas.ts)
  'm2:piranhas': {
    hurt: ['PIRANHAS!'],
    death: ['EATEN BY A MILLION TINY FISH', 'PIRANHA BUFFET', 'PICKED CLEAN'],
  },
  'm2:frog': {
    hurt: ['MY LIPS ARE NUMB!', 'WHY DID I TOUCH THE BLUE ONE?!', 'I CAN TASTE COLORS!'],
    death: ['LICKED A FROG. ON PURPOSE.', 'KILLED BY A GRAPE-SIZED FROG'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...ARRIVE, ...FIRST_VINE, ...GORGE, ...LEAVING, ...Object.values(HURT).flatMap(h => h.hurt), ...Object.values(CAVE_FOUND).flat(), ...Object.values(HEART_GOT).flat(), ...Object.values(PIRANHA_SCREAM).flat()],
  death: Object.values(HURT).flatMap(h => h.death),
};
