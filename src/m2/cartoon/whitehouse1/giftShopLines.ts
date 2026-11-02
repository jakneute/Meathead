// What's said in the White House's GIFT SHOP STOCKROOM (giftShop.ts: the hidden max health find off the Rose Garden).
// Pure data (tools/voices bundles it in node; lines.ts spreads it into the section's VOICE_LINES, so it's recorded).
//
// MEATHEAD (still Socks the cat in here: it's the show's White House): blunt, short, vulgar. The place is a souvenir
// stockroom over a bottomless RETURNS chute: towers of unsold junk that lean under him. Talk less.

import { allOf, type ByPants, type HurtTable } from '../talk';

/** Down the drop, on his feet in there the first time this life: what this place is. */
export const STOCK_IN: ByPants = {
  clean: ['A GIFT SHOP UNDER THE WHITE HOUSE. OF COURSE.', 'TOWERS OF SOUVENIRS OVER A BOTTOMLESS PIT. GREAT DESIGN.', 'NOBODY BUYS THIS SHIT. SO THEY STACK IT.'],
  shitty: ["A GIFT SHOP. I'LL TAKE A PAIR OF SOUVENIR PANTS.", 'NOBODY BUYS THIS SHIT. I KNOW HOW IT FEELS.'],
  nude: ['A GIFT SHOP. GOT ANY T-SHIRTS? ANY SIZE.', 'A WHOLE STOCKROOM AND NOT ONE PAIR OF SOUVENIR PANTS.'],
};
/** On the first tower as it leans (once a life). */
export const STOCK_LEAN: ByPants = {
  clean: ['THE BOBBLEHEADS ARE BOBBLING. NOT GOOD.', 'IT LEANS. THE GIFT SHOP LEANS.'],
  shitty: ["IT'S LEANING. DON'T CLENCH. TOO LATE.", 'IT LEANS WHERE THE SHIT GOES. WHICH IS EVERYWHERE.'],
  nude: ['IT LEANS. MY BALLS LEAN WITH IT.', "IT'S TIPPING. SO AM I. ALL OF ME."],
};
/** Over the edge into the RETURNS chute: one yell on the way down (the death screen cuts it off). */
export const STOCK_FALL: ByPants = {
  clean: ['NO REFUNDS?!', 'NOT THE RETURNS!', 'I DIDN\'T EVEN BUY ANYTHING!'],
  shitty: ['RETURN TO SENDERRR!', 'ALL SALES FINAAAL!'],
  nude: ['NOT LIKE THIIIS!', 'NO PANTS, NO SERVIIICE!'],
};
/** He's got it (after the card): the max health heart, priced FREE. */
export const STOCK_GOT: ByPants = {
  clean: ['MY HEART GREW. LIKE THE GRINCH. BUT MEANER.', 'FREE? BEST THING I EVER STOLE.', 'MORE HEART. STILL NO CLUE WHY I CARE.'],
  shitty: ['MORE HEART. SAME SHITTY PANTS.', 'FREE HEART. I PAID WITH MY DIGNITY.'],
  nude: ['A BIGGER HEART. I WISH IT WAS SOMETHING ELSE.', 'FREE. LIKE ME. ALL OF ME.'],
};
/** Into the cannon, on his way out. */
export const STOCK_BYE: ByPants = {
  clean: ['A CANNON IN A GIFT SHOP. FINE.', 'SHOOT ME OUT OF HERE.'],
  shitty: ['FIRE. I\'M READY TO LEAVE A TRAIL.', 'SHOOT ME. IT CAN\'T SMELL WORSE.'],
  nude: ['FIRE ME OUT. NAKED. AGAIN.', 'MY ASS IS IN THE BARREL. DO IT.'],
};

/** The RETURNS chute (the death screen: 28 characters at most). He's never hurt by it, only killed: the hurt lines are
 *  the engine's requirement, said if a hit ever lands without killing him. */
export const PIT_SRC = 'm2:ct_giftshop_pit';
export const STOCK_HURT: HurtTable = {
  [PIT_SRC]: { hurt: ['THE RETURNS CHUTE!', 'OW! NO REFUNDS!'], death: ['NO REFUNDS', 'RETURNED TO SENDER', 'ALL SALES FINAL'] },
};

export const STOCK_VOICE = {
  meathead: [
    ...allOf(STOCK_IN), ...allOf(STOCK_LEAN), ...allOf(STOCK_FALL), ...allOf(STOCK_GOT), ...allOf(STOCK_BYE),
    ...Object.values(STOCK_HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(STOCK_HURT).flatMap(h => h.death),
};
