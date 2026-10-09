// What's said in the jungle, by voice (recorded with the rest: tools/voices). The hurt and death lines are registered
// against their sources in animals.ts (from these same lists, so the text can't drift).

/** Meathead, walking into Adventure Land (once, from the start). */
export const ARRIVE = [
  "A JUNGLE. A REAL ONE. IN A THEME PARK. WHO SIGNED OFF ON THIS?",
  'SMELLS LIKE A LOCKER ROOM IN HERE. I LIKE IT.',
];
/** ...his first vine. */
export const FIRST_VINE = ['AAAH-EE-AAAH-EE-AAAAAH!', 'ME MEATHEAD! YOU... SHUT UP!'];
/** ...his first look at the drop past the scenic overlook. */
export const GORGE = ["THAT'S A LONG WAY DOWN. GOOD THING I'M A NATURAL."];
/** ...on the way out, the Jungle Cruise in sight. */
export const LEAVING = ["JUNGLE CRUISE. A BOAT RIDE. NOW WE'RE TALKING."];

/** What hurts him in here (by source), and the death screen when it's what killed him. */
export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:monkey': {
    hurt: ['THE MONKEY BIT ME!', 'GET OFF MY FACE, YOU LITTLE SHIT!', "IT'S GOT MY EAR! IT'S GOT MY EAR!"],
    death: ['MAULED BY A MONKEY THE SIZE OF A HOUSECAT', 'THE MONKEY WEARS HIS HAT NOW'],
  },
  'm2:monkey_poo': {
    hurt: ["IS THAT... IT'S SHIT. IT'S MONKEY SHIT.", 'RIGHT IN THE MOUTH!', "THAT'S NOT MINE! FOR ONCE!", 'QUIT THROWING YOUR SHIT AT ME!'],
    death: ['PELTED TO DEATH WITH MONKEY SHIT', 'DIED OF EXPOSURE. TO MONKEY SHIT.'],
  },
  'm2:monkey_fruit': {
    hurt: ['OW! A MANGO!', 'FREE FRUIT! OW!', 'A BANANA TO THE FACE! WHO DOES THAT?!'],
    death: ['BEATEN TO DEATH WITH PART OF A BALANCED BREAKFAST', 'KILLED BY A MANGO'],
  },
  'm2:chimp': {
    hurt: ["THE CHIMP'S GOT A RIGHT HOOK!", 'HE PULLED MY HAIR! THAT CHIMP PULLED MY HAIR!', 'THAT CHIMP LIFTS!'],
    death: ["BEATEN UP BY A CHIMP. IT WASN'T CLOSE.", 'A CHIMP TORE HIS FACE OFF. IT HAPPENS.'],
  },
  'm2:jaguar': {
    hurt: ['BIG CAT! BIG CAT!', 'HE CLAWED MY ASS!', 'BAD KITTY! BAD! KITTY!'],
    death: ['EATEN BY A JAGUAR', 'THE JAGUAR ATE THE GOOD PARTS. ALL OF THEM.'],
  },
  'm2:boa': {
    hurt: ['SNAKE! FROM ABOVE!', 'IT BIT MY HEAD!', 'WHY ARE THE SNAKES IN THE TREES?!'],
    death: ['SWALLOWED WHOLE BY A BOA. TOOK THREE WEEKS.', 'HUGGED TO DEATH BY A SNAKE'],
  },
  'm2:macaw': {
    hurt: ['STUPID BIRD!', 'IT WENT FOR MY EYES!', 'PRETTY BIRD MY ASS!'],
    death: ['PECKED TO DEATH BY A PARROT', 'THE PARROT HAD THE LAST WORD'],
  },
  'm2:frog': {
    hurt: ["IT'S POISON! MY LIPS ARE NUMB!", 'WHY IS IT BLUE?! WHY DID I TOUCH IT?!', 'THE FROG! THE FROG GOT ME!'],
    death: ['LICKED A POISON FROG. ON PURPOSE.', 'KILLED BY A FROG THE SIZE OF A GRAPE'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...ARRIVE, ...FIRST_VINE, ...GORGE, ...LEAVING, ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
};
