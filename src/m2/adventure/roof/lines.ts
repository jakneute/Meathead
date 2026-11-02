// What's said up on (and down off) the temple's roof, by voice (recorded with the rest: tools/voices). Where somebody
// reacts to him, three ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Safari Artie, on his back on the roof, the cart in bits round him. */
export const ARTIE_LANDED: Record<Dressed, string[]> = {
  clean: ['THAT. WAS NOT. ON THE TOUR.', 'SKIPPER OF THE YEAR. ON MY BACK. ON A ROOF. BECAUSE OF YOU.'],
  shitty: ['THAT WAS NOT ON THE TOUR. NEITHER IS YOUR ASS.', 'SKIPPER OF THE YEAR. ON A ROOF. DOWNWIND OF YOU.'],
  nude: ['THAT WAS NOT ON THE TOUR. I SAW EVERYTHING ON THE WAY UP.', "I'M WRITING YOU UP. FOR THE ROOF. AND YOUR BALLS. SEPARATE FORMS."],
};
/** Meathead, back on his feet. */
export const MEATHEAD_LANDED = ['BEST RIDE IN THE PARK.', 'TEN OUT OF TEN. I PISSED A LITTLE.', 'I THINK I BROKE MY ASS. WORTH IT.'];
/** Meathead, back on his feet, back after Artie's dead (nobody up through the roof after him). */
export const MEATHEAD_LANDED_ALONE: Record<Dressed, string[]> = {
  clean: ['NOBODY YELLING AT ME THIS TIME. BEST RIDE IN THE PARK.', 'NO ARTIE. TEN OUT OF TEN.'],
  shitty: ['NOBODY YELLING. JUST WARM PANTS. BEST RIDE IN THE PARK.', 'NO ARTIE. TEN OUT OF TEN. I SHAT A LITTLE.'],
  nude: ['NOBODY YELLING. JUST WIND ON MY BALLS. BEST RIDE IN THE PARK.', 'NO ARTIE. TEN OUT OF TEN. NAKED IS THE WAY TO RIDE.'],
};
/** Safari Artie, leaping off the roof as it goes, a gift-shop parachute popping open over him. */
export const ARTIE_CHUTE: Record<Dressed, string[]> = {
  clean: ['NINE NINETY-NINE AT THE GIFT SHOP, BITCH!', 'A PRO ALWAYS PACKS A CHUTE, BITCH!'],
  shitty: ["NINE NINETY-NINE AT THE GIFT SHOP! AND I'M UPWIND!", 'A PRO ALWAYS PACKS A CHUTE! AND CLEAN SHORTS!'],
  nude: ['NINE NINETY-NINE AT THE GIFT SHOP! THEY SELL PANTS TOO!', 'A PRO ALWAYS PACKS A CHUTE! AND PANTS!'],
};

/** The people in line outside, watching the roof come in (a woman, a man). */
export const GUEST_GASP = ['OH MY GOD! THE TEMPLE!', 'THE ROOF IS COMING IN!'];
export const GUEST2_HIM: Record<Dressed, string> = {
  clean: 'HE CAME OUT OF THE ROOF! IN A MINE CART!',
  shitty: 'HE CAME OUT OF THE ROOF! AND HE SHIT HIMSELF!',
  nude: "HE CAME OUT OF THE ROOF! AND HE'S NAKED!",
};
/** Meathead, to the line. */
export const MEATHEAD_TO_LINE = ['IT WAS LIKE THAT WHEN I GOT HERE.', "STRUCTURAL ISSUES. I WOULDN'T GO IN THERE.", 'UNION BUILT. WHAT DID YOU EXPECT?'];
/** ...and the line, after a moment. */
export const GUEST_AFTER = ['...SO IS THE WAIT GONNA BE LONGER?'];

/** ...back after Artie's dead: the roof they'd just fixed, going in again (the owner's: "they fixed the roof, now it
 *  collapsed again"). The woman, the man (by Meathead's pants), and the woman after. */
export const GUEST_GASP_BACK = ['THEY JUST FIXED THAT ROOF!', 'NOT AGAIN! THEY ONLY REOPENED IT TODAY!'];
export const GUEST2_HIM_BACK: Record<Dressed, string> = {
  clean: "IT'S THE SAME FAT GUY! IN THE SAME MINE CART!",
  shitty: "IT'S THE SAME GUY! HE SHIT HIMSELF AGAIN!",
  nude: "IT'S THE SAME GUY! AND NOW HE'S NAKED!",
};
export const GUEST_AFTER_BACK = ["...SO THE WAIT'S GONNA BE LONGER AGAIN?"];
/** What he says when the roof going in hurts him (it only ever kills him), and the death screen. */
export const HURT_ROOF = ['THE ROOF! THE ROOF IS GOING!'];
export const DEATH_ROOF = ['RAISED THE ROOF', 'BURIED IN A FAKE TEMPLE', 'CAVED IN'];

const all = (r: Record<Dressed, string[]>) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_LANDED, ...all(MEATHEAD_LANDED_ALONE), ...MEATHEAD_TO_LINE, ...HURT_ROOF],
  death: DEATH_ROOF,
  'm2.safari': [...all(ARTIE_LANDED), ...all(ARTIE_CHUTE)],
  'm2.guest': [...GUEST_GASP, ...GUEST_AFTER, ...GUEST_GASP_BACK, ...GUEST_AFTER_BACK],
  'm2.guest2': [...Object.values(GUEST2_HIM), ...Object.values(GUEST2_HIM_BACK)],
};
