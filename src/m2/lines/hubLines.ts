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

// (the owner's: one version each, whatever state his pants are in)
type Pooled = Record<'clean' | 'shitty' | 'nude', string[]>;
const same = (line: string): Pooled => ({ clean: [line], shitty: [line], nude: [line] });
/** Into the hub with all eight bosses dead and every one of the 24 hidden finds his (the owner's line). */
export const HUB_ALL_DONE = same("THAT'S EVERYTHING. MAYBE IT'S TIME TO GO HOME.");
/** ...all eight dead, but finds still out there (the owner's line). */
export const HUB_STUFF_LEFT = same("THERE'S STILL SHIT TO DO.");
/** Out through America USA with finds still out there: he won't, the first three times (each harder), the fourth he
 *  gives in (AMERICA_GIVE_IN) and the alpha's ending plays. */
export const AMERICA_RESIST: Pooled[] = [
  same("NOT YET. THERE'S STUFF IN THERE WITH MY NAME ON IT."),
  same('I SAID NOT YET. I DO NOT LEAVE SHIT BEHIND.'),
  same("I WALK OUT THAT GATE, I'M NOT COMING BACK FOR IT. EVER."),
];
/** ...the fourth time: fine (then the alpha's ending). */
export const AMERICA_GIVE_IN = same('FINE. FUCK IT. QUITTERS GET TO GO HOME EARLY.');
