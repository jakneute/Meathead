// What's said up on (and down off) the temple's roof, by voice (recorded with the rest: tools/voices). Where somebody
// reacts to him, three ways: clean pants, shitty ones, naked.

export type Dressed = 'clean' | 'shitty' | 'nude';

/** Safari Artie, on his back on the roof, the cart in bits round him. */
export const ARTIE_LANDED: Record<Dressed, string[]> = {
  clean: ['THAT. WAS NOT. ON THE TOUR.', "I'M WRITING YOU UP. I'M WRITING EVERYBODY UP."],
  shitty: ['THAT WAS NOT ON THE TOUR. NEITHER IS YOUR ASS.', "I'M WRITING YOU UP. THEN I'M BURNING THIS UNIFORM."],
  nude: ['THAT WAS NOT ON THE TOUR. I SAW EVERYTHING ON THE WAY UP.', "I'M WRITING YOU UP. FOR THE ROOF. AND YOUR BALLS. SEPARATE FORMS."],
};
/** Meathead, back on his feet. */
export const MEATHEAD_LANDED = ['BEST RIDE IN THE PARK.', 'TEN OUT OF TEN. I PISSED A LITTLE.', 'I THINK I BROKE MY ASS. WORTH IT.'];
/** Safari Artie, leaping off the roof as it goes, a gift-shop parachute popping open over him. */
export const ARTIE_CHUTE: Record<Dressed, string[]> = {
  clean: ['NINE NINETY-NINE AT THE GIFT SHOP, BITCH!'],
  shitty: ["NINE NINETY-NINE AT THE GIFT SHOP! AND I'M UPWIND!"],
  nude: ['NINE NINETY-NINE AT THE GIFT SHOP! THEY SELL PANTS TOO!'],
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

/** What he says when the roof going in hurts him (it only ever kills him), and the death screen. */
export const HURT_ROOF = ['THE ROOF! THE ROOF IS GOING!'];
export const DEATH_ROOF = ['RAISED THE ROOF', 'BURIED IN A FAKE TEMPLE', 'CAVED IN'];

const all = (r: Record<Dressed, string[]>) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_LANDED, ...MEATHEAD_TO_LINE, ...HURT_ROOF],
  death: DEATH_ROOF,
  'm2.safari': [...all(ARTIE_LANDED), ...all(ARTIE_CHUTE)],
  'm2.guest': [...GUEST_GASP, ...GUEST_AFTER],
  'm2.guest2': Object.values(GUEST2_HIM),
};
