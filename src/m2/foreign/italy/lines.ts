// What's said in Italy (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  gondolier: { m: 'm2.foreign.gondolier', f: 'm2.foreign.gondolierf' },
  pizza: { m: 'm2.foreign.pizza', f: 'm2.foreign.pizzaf' },
  opera: { m: 'm2.foreign.opera', f: 'm2.foreign.operaf' },
  nonna: { m: 'm2.foreign.nonna', f: 'm2.foreign.nonna' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'BENVENUTO TO ITALY! HOME OF PIZZA, PASTA, AND THE PIZZA PASTA!',
      'NOW ENTERING VENICE, ITALY! THE CANALS ARE CHLORINATED FOR YOUR SAFETY!',
    ],
    shitty: [
      'WELCOME TO ITALY! SIR, THAT IS NOT WHAT WE MEAN BY THE SAUCE.',
      'NOW ENTERING VENICE! SIR, PLEASE DO NOT USE THE CANAL. FOR ANYTHING.',
    ],
    nude: [
      'WELCOME TO ITALY! SIR, YOU ARE NOT A STATUE. THE STATUES ARE ART. YOU ARE NOT.',
      'NOW ENTERING VENICE! SIR, PUT IT AWAY. THIS IS NOT THAT KIND OF ITALIAN.',
    ],
  },
  arrive: [
    'ITALY. BIRTHPLACE OF THE TACO. SURE, WHY NOT.',
    'VENICE. A CITY IN A SWIMMING POOL. WITH BOATS.',
  ],
  gags: [
    { from: 400, to: 1000, key: 'pizza', lines: ['THEY THROW THE PIZZA. THEY JUST THROW IT.', "THAT'S A PIZZA OVEN. IT'S A MICROWAVE IN A BOX."] },
    { from: 1000, to: 1800, key: 'gondola', lines: ['A GONDOLA. A CANOE WITH A GUY WHO SINGS.', "I'M NOT TIPPING THE BOAT GUY."] },
    { from: 1800, to: 2300, key: 'palace', lines: ['A PALACE. FOR A DOGE. LIKE THE DOG MEME?', 'SHE HIT A NOTE AND MY FILLINGS HURT.'] },
    { from: 3100, to: 3500, key: 'tower', lines: ['A BELL TOWER WITH A PIZZA NAILED TO IT. I GET IT. I HATE IT.', "THE BALCONIES DON'T EVEN LINE UP. WHO BUILT THIS? DOUG?"], minH: 200 },
    // (job 4b: il forno, the rooftops)
    { from: 4200, to: 4700, key: 'forno', lines: ["THE WORLD'S LONGEST PIZZA OVEN. I'M THE TOPPING.", "I'M WALKING THROUGH A PIZZA OVEN. MY MOM WAS RIGHT ABOUT THIS PLACE."] },
    { from: 5080, to: 5640, key: 'roofs', lines: ['ROOFTOPS. EVERY ROOF IN ITALY HAS A GRANDMA ON IT.', 'NICE VIEW. IT SMELLS LIKE GARLIC AND GUNPOWDER.'], minH: 160 },
  ],
};

/** A pizzaiolo working the oven, as the burners light (the pizza voices). */
export const FORNO: ByPants = {
  clean: ["PIZZA'S READY! YOU'RE THE PIZZA!", 'NINE HUNDRED DEGREES! I TOOK A FOOD SAFETY CLASS! ONLINE!', 'MAMMA MIA! I SAY THAT A LOT! IT MEANS HURRY UP!'],
  shitty: ["NOT IN MY OVEN! YOU'LL STINK UP THE PEPPERONI!", "THAT'S NOT A TOPPING! GET OUT OF THE OVEN!"],
  nude: ["NO SHIRT, NO SHOES, NO PANTS, NO PIZZA!", "THAT'S A HEALTH CODE VIOLATION! ALL OF YOU IS!"],
};

export const GONDOLIER: ByPants = {
  clean: ["O SOLE MIO! THAT'S ALL I GOT! O SOLE MIO!", "I'M BRAYDEN! I ROW! I'M ON THE CREW TEAM! THIS IS CREW!", 'NO TIPPING THE BOAT! TIPPING THE GONDOLIER IS FINE!'],
  shitty: ["YOU'RE NOT GETTING IN MY BOAT LIKE THAT!", 'O SOLE MIO! OH NO! OH GOD!'],
  nude: ["NO PANTS, NO GONDOLA! THAT'S THE RULE!", 'THIS IS A ROMANTIC RIDE, BRO! NOT LIKE THAT!'],
};
export const PIZZA: ByPants = {
  clean: ["MAMMA MIA! THAT'S A SPICY... I DON'T KNOW THE REST!", "I'M KAYLEE! I WORK AT A PIZZA HUT! THIS IS THE SAME JOB!", 'EXTRA CHEESE! TO THE FACE!'],
  shitty: ["THAT'S NOT A TOPPING! THAT'S NOT A TOPPING!", "NOBODY'S EATING THE PIZZA NOW! THANKS!"],
  nude: ['PUT A PIZZA OVER IT! I HAVE EXTRA!', "THAT'S NOT A SAUSAGE! I'M NOT LOOKING!"],
};
export const OPERA: ByPants = {
  clean: ['LA LA LAAAAA! I WAS IN SHOW CHOIR!', "I'M MADISON! I DO MUSICALS! THIS IS AN OPERA! SAME!", 'FIGARO! FIGARO! I FORGET THE REST!'],
  shitty: ['THE SMELL! IT HURTS MORE THAN MY HIGH C!', 'LAAAA... OH GOD... LAAAA!'],
  nude: ["IT'S NOT OVER TILL THE NAKED GUY'S DEAD!", 'SHATTER! SHATTER, YOU NAKED FREAK!'],
};
export const NONNA: ByPants = {
  clean: ['MANGIA! MANGIA! YOU ARE TOO SKINNY! I MEAN FAT!', "I'M NONNA! I'M TWENTY-TWO! THEY GAVE ME A WIG!", 'COME HERE! I HIT YOU WITH THE SPOON!'],
  shitty: ['YOU MAKE IN YOUR PANTS?! AT YOUR AGE?!', 'SHAME! SHAME ON YOUR FAMILY!'],
  nude: ['WHERE ARE YOUR CLOTHES?! YOUR MOTHER WOULD DIE!', 'PUT ON SOME PANTS! I GET THE SPOON!'],
};

export const HURT: HurtTable = {
  'm2:fl_gondolier': {
    hurt: ['THE BOAT GUY HIT ME WITH THE STICK!', 'OW! THE OAR! THE POLE! WHATEVER!', 'GONDOLA GUY! FUCK YOU!'],
    death: ['POLED', 'ROWED TO DEATH'],
  },
  'm2:fl_pizzaiolo': {
    hurt: ['THE PIZZA KID PUNCHED ME!', 'OW! FLOUR IN MY EYES!', 'QUIT KNEADING ME!'],
    death: ['KILLED BY A PIZZA GUY', 'DELIVERED'],
  },
  'm2:fl_pizza_pie': {
    hurt: ['HOT CHEESE! ON MY FACE!', 'A WHOLE PIZZA! IN MY MOUTH! NOT LIKE THIS!', 'PEPPERONI IN MY EYE!'],
    death: ['DEATH BY PIZZA', 'FACE FULL OF PIE'],
  },
  'm2:fl_opera': {
    hurt: ['THE OPERA SINGER SHOVED ME!', 'OW! BIG LUNGS, BIG ARMS!', 'GET OFF ME, PAVAROTTI!'],
    death: ['THE FAT LADY SANG', 'CURTAIN CALL'],
  },
  'm2:fl_opera_note': {
    hurt: ['MY EARS! MY EARS ARE BLEEDING!', 'THAT NOTE BROKE MY TEETH!', 'SHUT UP! SHUT UP!'],
    death: ['SHATTERED BY A HIGH C', 'IT WAS OVER WHEN SHE SANG'],
  },
  'm2:fl_nonna': {
    hurt: ['GRANDMA HIT ME!', 'OW! THE SPOON! THE SPOON!', 'NOT THE SPOON!'],
    death: ['SPOONED TO DEATH', 'KILLED BY GRANDMA'],
  },
  'm2:fl_nonna_spoon': {
    hurt: ['SHE THREW THE SPOON!', 'A WOODEN SPOON! IN MY HEAD!', 'SPOON! WHO THROWS A SPOON?!'],
    death: ['SPOONED', 'HIT BY A FLYING SPOON'],
  },
  'm2:fl_oven_fire': {
    hurt: ['MY ASS! IT BAKED MY ASS!', 'THE OVEN! I WAS IN THE OVEN!', 'NINE HUNDRED DEGREES! FUCK!'],
    death: ['BAKED AT 900 DEGREES', 'CRISPY CRUST'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.gondolier, GONDOLIER], [V.pizza, PIZZA], [V.opera, OPERA], [V.nonna, NONNA], [{ m: V.pizza.m, f: V.pizza.m }, FORNO]]);
