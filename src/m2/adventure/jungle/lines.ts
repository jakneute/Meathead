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
  'm2:frog': {
    hurt: ['MY LIPS ARE NUMB!', 'WHY DID I TOUCH THE BLUE ONE?!', 'I CAN TASTE COLORS!'],
    death: ['LICKED A FROG. ON PURPOSE.', 'KILLED BY A GRAPE-SIZED FROG'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...ARRIVE, ...FIRST_VINE, ...GORGE, ...LEAVING, ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
};
