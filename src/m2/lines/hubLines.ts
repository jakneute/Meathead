// What Meathead says in the hub. Recorded with the rest (tools/voices: extract.ts, m2pack.ts).

/** Trying to go back out the way he came, to America USA: no. In clean pants, shitty ones, or none. */
export const AMERICA_DENY: Record<'clean' | 'shitty' | 'nude', string[]> = {
  clean: ["I'M NOT WAITING IN THAT LINE AGAIN.", 'BACK THROUGH ALL THAT PATRIOTISM? FUCK NO.', "TRUCK'S IN A PILLAR. IT'S FINE.", 'I CAME HERE TO RIDE SHIT AND KILL SHIT.'],
  shitty: ["I'M NOT WALKING PAST THAT TICKET LADY LIKE THIS.", "I'M NOT SHITTING UP MY TRUCK SEATS.", 'WHAT HAPPENS IN HAPPY LAND STAYS IN MY PANTS.', "NOT SITTING IN THIS FOR THE DRIVE HOME."],
  nude: ["I'M NOT GOING OUT THERE WITH MY DICK OUT.", "TRUCK'S GOT LEATHER SEATS. NO.", 'THE PARKING GARAGE HAS CAMERAS.', 'NOT WITHOUT PANTS. NOT EVEN IN AMERICA.'],
};

/** The staff room's golden retrievers jumping up on him (pen/index.ts): in clean pants, shitty ones, or none. */
export const PEN_DOG_JUMP: Record<'clean' | 'shitty' | 'nude', string[]> = {
  clean: ['DOWN, BOY!', 'WHO BROUGHT A DOG TO WORK?', 'QUIT SNIFFING MY CROTCH!', "YOU'RE NOT A GOOD BOY. YOU'RE PRACTICE."],
  shitty: ["DON'T LICK THAT!", "IT'S NOT PEANUT BUTTER, DUMBASS!", 'QUIT SNIFFING MY ASS!', 'GREAT. NOW HE LIKES ME.'],
  nude: ['NOT THE BALLS!', 'COLD NOSE! COLD NOSE!', 'GET YOUR FACE OUT OF MY ASS!', "THAT'S NOT A CHEW TOY!"],
};

/** Into the hub with all eight bosses dead and every one of the 24 hidden finds his (the owner's line). */
export const HUB_ALL_DONE: Record<'clean' | 'shitty' | 'nude', string[]> = {
  clean: ["THAT'S EVERYTHING. MAYBE IT'S TIME TO GO HOME."],
  shitty: ["THAT'S EVERYTHING. MAYBE IT'S TIME TO GO HOME. AND CHANGE."],
  nude: ["THAT'S EVERYTHING. MAYBE IT'S TIME TO GO HOME. AND FIND MY PANTS."],
};
/** ...all eight dead, but finds still out there (the owner's line). */
export const HUB_STUFF_LEFT: Record<'clean' | 'shitty' | 'nude', string[]> = {
  clean: ["THERE'S STILL SHIT TO DO."],
  shitty: ["THERE'S STILL SHIT TO DO. BESIDES MY PANTS."],
  nude: ["THERE'S STILL SHIT TO DO. NAKED SHIT."],
};
/** Out through America USA with finds still out there: he won't, the first three times (each harder), the fourth he
 *  gives in (AMERICA_GIVE_IN) and the alpha's ending plays. */
export const AMERICA_RESIST: Record<'clean' | 'shitty' | 'nude', string[]>[] = [
  {
    clean: ["NOT YET. THERE'S STUFF IN THERE WITH MY NAME ON IT."],
    shitty: ["NOT YET. THERE'S STUFF IN THERE WITH MY NAME ON IT. AND MY SHIT ON IT."],
    nude: ["NOT YET. THERE'S STUFF IN THERE WITH MY NAME ON IT. I'M NOT LEAVING IT FOR THE NEXT NAKED GUY."],
  },
  {
    clean: ['I SAID NOT YET. I DO NOT LEAVE SHIT BEHIND.'],
    shitty: ['I SAID NOT YET. THE ONLY THING I LEAVE BEHIND IS IN MY PANTS.'],
    nude: ["I SAID NOT YET. I'VE COME THIS FAR WITH MY DICK OUT."],
  },
  {
    clean: ["I WALK OUT THAT GATE, I'M NOT COMING BACK FOR IT. EVER."],
    shitty: ["I WALK OUT THAT GATE, I'M NOT COMING BACK FOR IT. EVER. AND NEITHER IS THIS SMELL."],
    nude: ["I WALK OUT THAT GATE NAKED, I'M NOT COMING BACK FOR IT. EVER."],
  },
];
/** ...the fourth time: fine (then the alpha's ending). */
export const AMERICA_GIVE_IN: Record<'clean' | 'shitty' | 'nude', string[]> = {
  clean: ['FINE. FUCK IT. QUITTERS GET TO GO HOME EARLY.'],
  shitty: ['FINE. FUCK IT. I NEED A SHOWER ANYWAY.'],
  nude: ['FINE. FUCK IT. SOMEBODY GET ME A TOWEL.'],
};
