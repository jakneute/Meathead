// What's said in the jungle, by voice (recorded with the rest: tools/voices). The hurt and death lines are registered
// against their sources in animals.ts (from these same lists, so the text can't drift).

/** Meathead, walking into Adventure Land (once, from the start). */
export const ARRIVE = [
  "SMELLS LIKE A WRESTLING MAT IN HERE. I'M HOME.",
  'A WHOLE JUNGLE. SOMEBODY GOT FIRED FOR THIS.',
];
/** ...his first vine. */
export const FIRST_VINE = ['AAAH-EE-AAAH-EE-AAAAAH!', 'ME TARZAN! YOU SHUT UP!'];
/** ...his first look at the drop past the scenic overlook. */
export const GORGE = ["THAT'S A LONG WAY DOWN. I'VE FALLEN FURTHER DRUNK."];
/** ...on the way out, the Jungle Cruise in sight. */
export const LEAVING = ['A BOAT RIDE. FINALLY, I CAN SIT DOWN.'];

/** What hurts him in here (by source), and the death screen when it's what killed him. */
export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:monkey': {
    hurt: ['THE MONKEY BIT ME!', 'GET OFF MY FACE, YOU LITTLE SHIT!', "IT'S GOT MY EAR!"],
    death: ['MAULED BY A MONKEY THE SIZE OF A CAT', 'THE MONKEY WEARS HIS HAT NOW'],
  },
  'm2:monkey_poo': {
    hurt: ["IT'S SHIT! IT'S MONKEY SHIT!", 'RIGHT IN THE MOUTH!', "THAT SHIT ISN'T MINE! FOR ONCE!", 'QUIT THROWING YOUR SHIT, YOU HAIRY BASTARD!'],
    death: ['PELTED TO DEATH WITH MONKEY SHIT', 'DIED OF MONKEY SHIT'],
  },
  'm2:monkey_fruit': {
    hurt: ['OW! A MANGO!', 'FRUIT! I HATE FRUIT!', 'A BANANA TO THE FACE!'],
    death: ['KILLED BY PART OF A BALANCED BREAKFAST', 'MANGOED'],
  },
  'm2:chimp': {
    hurt: ['THE CHIMP HITS LIKE MY DAD!', 'HE PULLED MY HAIR, THE BITCH!', 'THAT CHIMP LIFTS!'],
    death: ["BEATEN UP BY A CHIMP. IT WASN'T CLOSE.", 'A CHIMP TORE HIS FACE OFF'],
  },
  'm2:jaguar': {
    hurt: ['BIG CAT! BIG CAT!', 'HE CLAWED MY ASS!', 'BAD KITTY!'],
    death: ['EATEN BY A JAGUAR', 'THE JAGUAR ATE THE GOOD PARTS'],
  },
  'm2:boa': {
    hurt: ['SNAKE! FROM ABOVE!', 'IT BIT MY HEAD!', 'WHY ARE THE SNAKES IN THE TREES?!'],
    death: ['SWALLOWED WHOLE BY A BOA', 'HUGGED TO DEATH BY A SNAKE'],
  },
  'm2:macaw': {
    hurt: ['STUPID BIRD!', 'IT WENT FOR MY EYES!', 'PRETTY BIRD MY ASS!'],
    death: ['PECKED TO DEATH BY A PARROT', 'THE PARROT GOT THE LAST WORD'],
  },
  'm2:frog': {
    hurt: ['MY LIPS ARE NUMB!', 'WHY DID I TOUCH THE BLUE ONE?!', 'THE FROG GOT ME!'],
    death: ['LICKED A POISON FROG. ON PURPOSE.', 'KILLED BY A FROG THE SIZE OF A GRAPE'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...ARRIVE, ...FIRST_VINE, ...GORGE, ...LEAVING, ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
};
