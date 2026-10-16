// What's said in Norway (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  viking: { m: 'm2.foreign.viking', f: 'm2.foreign.vikingf' },
  shield: { m: 'm2.foreign.shieldviking', f: 'm2.foreign.shieldvikingf' },
  lutefisk: { m: 'm2.foreign.lutefisk', f: 'm2.foreign.lutefisk' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'WELCOME TO NORWAY! HOME OF THE VIKINGS! THE FOOTBALL TEAM! AND ALSO SOME OLD ONES!',
      'NOW ENTERING NORWAY! TRY A FREE SAMPLE OF LUTEFISK! LEGALLY, WE HAVE TO OFFER IT.',
    ],
    shitty: [
      'WELCOME TO NORWAY! SIR, THE LUTEFISK USUALLY DOES THAT AFTER YOU EAT IT.',
      "NOW ENTERING NORWAY! SIR, WE'VE HAD A COMPLAINT ABOUT YOUR SMELL. FROM THE LUTEFISK.",
    ],
    nude: [
      'WELCOME TO NORWAY! IT IS VERY COLD HERE, SIR. WE CAN ALL TELL.',
      'NOW ENTERING NORWAY! SIR, THE VIKINGS WORE PANTS. WE LOOKED IT UP.',
    ],
  },
  arrive: [
    'NORWAY. CAPITAL OF SWEDEN. SURE.',
    "VIKINGS. THE HELMETS HAVE HORNS. THEY NEVER HAD HORNS. NOBODY HERE CARES.",
  ],
  gags: [
    { from: 1050, to: 1500, key: 'troll', lines: ['A TROLL. HE LOOKS LIKE MY UNCLE.', "TROLL CROSSING. I'LL CROSS HIS FACE."] },
    { from: 1550, to: 1900, key: 'lutefisk', lines: ['LUTEFISK. FISH JELLY. WHO DID THIS TO A FISH?', 'FREE SAMPLES. NO REFUNDS. NO SHIT.'] },
    { from: 1900, to: 2400, key: 'fjord', lines: ["THE FJORD. IT'S A WAVE POOL. THEY PUT A SIGN ON A WAVE POOL.", 'A VIKING SHIP. MADE IN TAIWAN.'] },
    { from: 2900, to: 3400, key: 'church', lines: ['A WOODEN CHURCH WITH DRAGONS ON IT. FINALLY, A RELIGION I GET.', "A STAVE CHURCH. I DON'T KNOW WHAT A STAVE IS."] },
  ],
};

export const VIKING: ByPants = {
  clean: ["SKOL! THAT'S ALL I KNOW! SKOL!", "I'M TYLER! MY GREAT-GRANDMA WAS NORWEGIAN! OR DUTCH!"],
  shitty: ["BY ODIN'S BEARD, YOU STINK! THAT'S A REAL SAYING!", 'EVEN THE LUTEFISK SMELLS BETTER THAN YOU!'],
  nude: ['A BERSERKER! THEY FOUGHT NAKED! I READ THAT ON A NAPKIN!', 'VALHALLA HAS A DRESS CODE, DUDE!'],
};
export const SHIELD: ByPants = {
  clean: ["SHIELD WALL! IT'S JUST ME! I'M THE WALL!", "THIS SHIELD'S FROM A PARTY STORE! IT STILL HURTS!"],
  shitty: ['SHIELD UP! NOT FOR YOU! FOR THE SMELL!', "I'M HIDING BEHIND THIS FROM YOUR PANTS!"],
  nude: ["I'M NOT LOWERING THIS SHIELD! I DON'T WANNA SEE IT!", 'CLOTHES! THE VIKINGS HAD CLOTHES!'],
};
export const LUTEFISK: ByPants = {
  clean: ['FREE SAMPLE! PLEASE! NOBODY EVER TAKES ONE!', "IT'S LUTEFISK! IT'S FISH SOAKED IN LYE! YUM!"],
  shitty: ['OH NO, HONEY, YOU ALREADY HAD SOME!', 'THE LUTEFISK DOES THAT TO EVERYBODY, SWEETIE!'],
  nude: ['SAMPLE? YOU LOOK LIKE YOU NEED TO WARM UP!', 'OH MY! WELL, THE LUTEFISK IS FIRMER THAN THAT!'],
};

export const HURT: HurtTable = {
  'm2:fl_viking': {
    hurt: ['THE VIKING HIT ME!', 'OW! YOU MINNESOTA FUCK!', 'QUIT SKOLING AT ME!'],
    death: ['PILLAGED', 'SENT TO VALHALLA, OHIO'],
  },
  'm2:fl_viking_axe': {
    hurt: ['AN AXE! A REAL AXE!', 'AXE TO THE HEAD!', 'WHO GIVES THE INTERN AN AXE?!'],
    death: ['AXED', 'SPLIT LIKE FIREWOOD'],
  },
  'm2:fl_viking_horns': {
    hurt: ['HORNS! RIGHT IN MY ASS!', 'I DIVE KICKED A HORN!', 'THE HELMET HAS POINTS!'],
    death: ['IMPALED ON A FAKE HELMET', 'HORNED'],
  },
  'm2:fl_shieldviking': {
    hurt: ['SHIELD BASH! RIGHT IN THE TEETH!', 'THE WALL HIT ME!', 'OW! PARTY STORE SHIELD!'],
    death: ['BASHED BY A SHIELD WALL OF ONE', 'WALLED IN'],
  },
  'm2:fl_lutefisk': {
    hurt: ['SHE HIT ME WITH THE TRAY!', "THE FISH LADY'S STRONG!", 'OW! SAMPLE TRAY!'],
    death: ['KILLED BY A SAMPLE LADY', 'FREE SAMPLE OF DEATH'],
  },
  'm2:fl_wave': {
    hurt: ['THE WAVE MACHINE! IN MY NOSE!', 'FUCKING WAVE POOL!', 'I SWALLOWED THE FJORD!'],
    death: ['DROWNED IN A WAVE POOL', 'THE FJORD TOOK HIM'],
  },
  'm2:fl_lutefisk_fish': {
    hurt: ['LUTEFISK! IN MY MOUTH!', "OH GOD, IT'S JELLY!", "I'M GONNA PUKE!"],
    death: ['DROWNED IN FISH JELLY', 'DIED OF LUTEFISK'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.viking, VIKING], [V.shield, SHIELD], [{ m: V.lutefisk.m, f: V.lutefisk.f }, LUTEFISK]]);
