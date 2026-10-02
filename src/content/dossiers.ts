// Boss dossiers for the stage select screen: classified files on each target,
// written by the people pointing Meathead at them. Every one of these assholes
// means well. Every one of them has to go, as undignified as possible. And the
// "asset" doing the going has no idea who's holding his leash.

export interface Dossier {
  realName: string;
  age: string;
  occupation: string;
  threat: string;
  /** What he genuinely believes he's doing for the world. */
  mission: string;
  /** What he's actually doing to it. */
  reality: string;
  background: string;
  /** How he fights: where the offense comes from (the gear, the drugs, the place), so it isn't magic. */
  arsenal: string;
  /** What's between the asset and the door: the ground, the hazards, who's on it (the briefing's list). */
  expect: string;
  /** How the intel people think he goes down (a nudge, not a manual). */
  intel: string;
  /** Why he's to be killed and not arrested: what a trial would drag out. */
  notAlive: string;
  /** The handler's note on how the asset was pointed at him this time. */
  handler: string;
}

export const DOSSIER_HEADER = 'DEPT. OF DOMESTIC DISPOSAL // PROJECT BLUNT INSTRUMENT';

export const DOSSIERS: Record<string, Dossier> = {
  'Artie Avalanche': {
    realName: 'ARTHUR "ARTIE" LINDQVIST',
    age: '44',
    occupation: 'Former glaciologist. Current ice-based terrorist. Wears moon boots indoors.',
    threat: 'SEVERE (FROSTBITE, EMOTIONAL COLDNESS)',
    mission: 'Save the glaciers by refreezing Alaska one snowbank at a time, and shame the rest of the world into following.',
    reality: 'His cryo-vault is freezing the range from the inside out. The trail has iced over, the tram has iced up, and the wildlife has gone feral in the cold. The moose has gotten very large and very angry. The glaciers are still melting.',
    background: 'Spent twenty years measuring glaciers while they melted in front of him. Published 400 papers. Nobody read them. So he stopped writing and started building, and the vault at the foot of the mountain is what he built. He has befriended the moose. He carries a laminated trail map with every crevasse marked on it. He may be the only person alive who thinks this mountain needs to be colder.',
    arsenal: 'His moon boots are NASA surplus, sprung for one-sixth gravity, so he gets around his vault in long, slow bounds. His gloves are plumbed into the vault\'s coolant: anything wet he picks up comes out as a block of ice the size of a dishwasher, and he throws it like one. He has never knocked down a single icicle in that vault. He calls them decor.',
    expect: 'The trailhead: icicles on every overhang, ice that gives way underfoot, and crevasses under it. A tram up the mountain, with the wildlife trying to get in. A gale through the high woods. Eagles, wolverines, mountain goats, and the moose. An ice cave with a low roof, rolling snowballs and more icicles. The summit, under a slope nobody has cleared all season. The vault is back at the bottom.',
    intel: 'Thin-skinned in every sense. He cannot stand open flame: put some on him and he panics, hopping all over the room on fire, and the fuss brings his own icicles down.',
    notAlive: 'At trial, his 400 papers become evidence, including the one that traces the melt to the Department of the Interior\'s own drilling leases. Nobody has read his papers. We would like to keep it that way.',
    handler: 'The asset was told Artie "looked at his protein shake funny." That was enough. The vault is at the bottom of the mountain, and the asset is starting at the top. The fastest way down is a ski run. The asset does not ski. We have not mentioned this. One (1) closed-casket funeral has been budgeted.',
  },
  'Victor Volcano': {
    realName: 'VICTOR KALANI-MORGENSTERN',
    age: '38',
    occupation: 'Geothermal evangelist, nightclub owner and hot yoga instructor. Juices daily. Juices other things daily.',
    threat: 'CRITICAL (LAVA, ROID RAGE, BOTTLE SERVICE)',
    mission: 'Free, clean power for every home on the island, straight from the Earth\'s core. Also, the hottest club in the Pacific.',
    reality: 'He drilled into an active magma chamber and built a nightclub around the hole. Club Caldera has a dance floor of glass over open lava, a bar in a moat of it, an infinity pool of it, and a VIP lounge at the top of the atrium. The doorman is enormous. The dress code is "not you."',
    background: 'Moved to Hilo to "reconnect with the planet\'s heartbeat," found it, and put a hole in it. Believes the power company is hoarding the volcano, which is not how volcanoes work. Pays for the drilling with bottle service. Has been cycling steroids for eleven years in pursuit of "geological mass," and considers himself the asset\'s spiritual equal. That is the most offensive thing in this file.',
    arsenal: 'He breathes fire. It began as a bar trick, a mouthful of overproof rum and a lighter; eleven years of steroids later, his lungs carry it across a room. The VIP lounge sits on top of his wellhead, and its walls and floor are full of bleed valves for the chamber below. He has them on a foot switch, and he opens them by landing on them. He calls it the light show.',
    expect: 'Cliffs and lava bombs on the way up to the club. The club itself has a door policy. Inside the mountain, behind it: a river of lava crossed on drifting rafts of rock, then a shaft of fire and furnaces straight up. The main floor, its crowd and its staff: fire dancers, smoke jumpers, men in heat suits. The atrium, a tower of neon and pyro, up to the VIP lounge.',
    intel: 'All pressure, no release valve. Anything that hot hates water, and a squirt gun will not do it: he needs a wall of it. Timing matters: a wave that puts his fire out mid-breath, or blows one of his open vents into steam, hurts him badly. One that just washes over him barely rinses him. And a warning. His vents can be plugged with rocks, and they should not be. Plug all three once he is half-cooked and the whole mountain goes, with both of you in it. The last man to try landed on a news helicopter.',
    notAlive: 'His drill works. One well powered the whole island, for free, for fourteen months. A trial would ask him to demonstrate it. The utilities have asked that nobody demonstrate it, and the utilities have been very generous to this office.',
    handler: 'The asset was told Victor "skips leg day" and that the club "won\'t let him in." He left before the end of the briefing. There is a back way in, through the lava. We had assumed that would discourage him. If the volcano goes, it goes. The island is not a priority.',
  },
  'Ernie Earthquake': {
    realName: 'ERNEST T. BUCKLEY',
    age: '71',
    occupation: 'Retired seismologist and professional grump. Has opinions about your lawn. Lives on Alcatraz, which he calls "downsizing."',
    threat: 'HIGH (TECTONIC, CRANKY)',
    mission: 'Set off the Big One early, on a schedule, during business hours, so everyone is ready for it. Rip off the band-aid.',
    reality: 'The quakes are getting worse by the hour. The streets are splitting open, flowerpots and bricks are coming off the windowsills, and the Golden Gate is coming apart one span at a time. Alcatraz is the worst of it, because he is right under it. The park rangers are still running tours. Everyone is ready. Nobody is enjoying it.',
    background: 'Spent fifty years predicting California\'s next great earthquake and got tired of waiting for it. Decided a scheduled disaster beats a surprise one. Moved into the old citadel under the prison for the bedrock and the quiet, and times every quake around the guided tours so as not to disturb anyone. Mails the city an itemized invoice after each one. Nobody has paid. This has made him worse.',
    arsenal: 'The big quakes come from a charge program he wrote in 1987 and runs on the tour schedule. The small ones are him. His vault under the citadel sits directly on the fault, and he has tuned it like a drum: when he lands, the whole room goes with him. Fifty years of hauling core samples out by hand also left him strong enough to lift a boulder, and he bowls them.',
    expect: 'Steep streets between the painted ladies, full of tech bros, bike couriers, protesters using their signs as shields, raccoons, seagulls and drones, with the street opening up under them. The Golden Gate, as long as it lasts. The bay, which has to be crossed somehow, since the ferries are suspended, and everything that floats or flies on it. On the island: the cell house and its galleries, the recreation yard, the cliffs, and the vaults under the citadel.',
    intel: 'Old man, bad circulation, worse hips. A cold snap locks his joints solid, but only if it catches him mid-stride or mid-hop. Standing still, he just shivers and swears.',
    notAlive: 'His predictions were right. So were his inspection reports on the federal buildings downtown that were certified quake-safe in 1991. He kept copies, and he has offered to read every one of them aloud at his trial.',
    handler: 'The asset believes he is "helping an old man move rocks." The island can only be reached by water, and the asset has no boat. We are confident that will not stop him. The Coast Guard has been told he is a training exercise. If he drowns, he was one.',
  },
  'Hector Hurricane': {
    realName: 'HECTOR "THE DOPPLER" DELGADO',
    age: '52',
    occupation: 'Disgraced Channel 7 weatherman. Owns forty-one windbreakers.',
    threat: 'SEVERE (CATEGORY 5, CATEGORY SMUG)',
    mission: 'Pressure-wash Miami clean: of crime, of sin, of scooters. Nature\'s way.',
    reality: 'The beach is gone, the motels are airborne and the marina is in the sky. The storm drains backed up in the first week. That is not mud flying around up there.',
    background: 'Fired live on air for forecasting "sunny and 75" during a named storm. Decided the only way never to be wrong again was to make the weather himself. His hurricane has parked over Miami Beach and will not move. Something at the top of it is watching; we have satellite photos, and we have stopped looking at them. He still gives the forecast every night. It is always his hurricane.',
    arsenal: 'He bought a cloud-seeding program at an Air Force surplus auction, along with the turbines from a wind tunnel, and put both in the middle of the storm. Forty of his windbreakers are just windbreakers. The forty-first has fans in the lining. When he spins up in it, everything loose for a block comes his way, people included, and whatever the storm has picked up, he can throw.',
    expect: 'Miami Beach with the storm coming in, and lightning that finds anyone standing in water. The motel strip: a pool, gators and iguanas. The marina, and the open water past it, with the Coast Guard patrolling and the hurricane throwing everything it has picked up. Waterspouts, running up into the storm itself. Whatever is watching from the top of it. He is at the bottom, somewhere under the middle of it all.',
    intel: 'His storm pulls everything toward him. Everything: lawn chairs, stray dogs, anything big, round and heavy rolled his way. He never checks what is coming. Think about it. Separately, the Coast Guard has closed the water. Do not let them catch you on it. In a hurricane, they do not arrest people. They board them.',
    notAlive: 'He did not get the forecast wrong. He read the one he was handed. NOAA changed it an hour before air, at the request of the tourism board and two insurers. He kept the original, and he has asked for a jury.',
    handler: 'The asset was told Hector forecast "a bad week for his gains." He asked how to get to the top of a hurricane. We said nobody knows. He said "up." We do not know where he keeps getting the shorts. There is a daycare in the flood zone. This was noted, and then it was decided not to note it.',
  },
  'Toxic Tommy': {
    realName: 'THOMAS "TOMMY" PRZYBYLSKI',
    age: '33 (APPROX. SEWAGE HAS AGED HIM)',
    occupation: 'Former municipal water quality inspector. Now lives in the pipes. In a sense, is the pipes.',
    threat: 'CRITICAL (BIOHAZARD, BAD BREATH, THE EAST SIDE)',
    mission: 'Filter every drop of Flint\'s water through his own body until it runs clean. He is the filtration system now.',
    reality: 'He is not a filtration system. He is a man vomiting in a sewer. The water is worse than it has ever been: the mains are bursting, the hydrants are blowing it into the street, and the water tower over the East Side is full of it. The gangs that run the block are too busy shooting at each other to notice.',
    background: 'Told the city the water was safe, then drank it on live TV to prove it. It was not safe. Something happened to him down there, and now he believes he can drink the town\'s poison and bring it back up clean. He was not the only one it happened to. Everyone the water took went down the drains, and something in the cistern under the East Side is made of them. Tommy calls it "the neighbors." He brings it things.',
    arsenal: 'He carries nothing. Whatever the water did to him, he can drink a swimming pool of sludge and bring it all back up at once, as a jet that reaches forty feet and keeps going as long as he likes. He moves through the muck like it is air, and he comes up under whatever is floating on it.',
    expect: 'The block: hydrants sheared off and blowing, the street caved into flooded holes, gangbangers on the porch roofs, their pit bulls, rats. The long road across town, which the lowriders treat as theirs. The sewer: walkways over channels of muck that dissolve anything that falls in, a flooded tunnel, and a flooded pit nobody crosses without a hazmat suit, and not for long in one. The cistern, and what lives in it. His lair is under the block.',
    intel: 'He filters water, not crude. A face full of heavy oil clogs him like hair in a drain and pops him up out of the muck, gasping. Once he is oiled, do not set him on fire. Whatever comes off him will not stay contained, and it will not be good for you.',
    notAlive: 'He did not decide the water was safe. The governor\'s office told him to say so, in writing. He kept the memo. It is down in the sewer with him, and we would like it to stay there.',
    handler: 'Four down, four to go. The asset took a phone call nobody on this floor authorized, from a number that does not exist, and now believes Tommy is "laughing at his gains." He has not asked for a hazmat suit. He has asked whether sewer water has electrolytes. The number does not exist because this office made sure of it. The call came from the fourth floor.',
  },
  'Blackout Barry': {
    realName: 'BARRINGTON "BARRY" WEISS',
    age: '47',
    occupation: 'Power grid engineer, amateur astronomer, and the R&D floor\'s favorite test subject.',
    threat: 'HIGH (ELECTRICAL, CHEMICAL, EXISTENTIAL)',
    mission: 'Turn off New York\'s lights so eight million people can look up and see the stars.',
    reality: 'Rolling blackouts every night. Eight million people looked up, tripped over things in the dark and started mugging each other. Nobody saw a single star. It is New York. There is smog.',
    background: 'Grew up in the Bronx without ever seeing the Milky Way and never got over it. Took a job at the power company to get his hands on the big switch. Runs the blackouts from a power room on top of an old walk-up, through a technician on a headset named Gary, who has shared a one-bedroom apartment in Astoria with him for eleven years, as roommates. Volunteers for whatever the R&D floor of his office building is testing, "for perspective," and has built up a startling tolerance. He thinks he is giving the city a gift. The city thinks he is a lunatic in a hard hat. Both are right.',
    arsenal: 'None of it is magic; most of it is from the R&D floor. The lights go out because the switch is in his pocket. He does not teleport: R&D has him on a compound called BLINK, which makes him faster than the eye can follow in the dark. His hard hat holds a capacitor bank, which is why the floor goes live when he lands. The lightning is the power room\'s surge protection, rewired to come down instead of going out.',
    expect: 'Streets in the dark: muggers, pimps, rats, trenches where the road is dug up, and subway grates that blow steam hard enough to throw a man. His office building, floor by floor: the lobby, the offices, maintenance, and R&D, where the test subjects are. Do not overdose the test subjects. The elevators do not stop where they should. The rooftops, in a rolling blackout. The walk-ups, by their fire escapes, with the tenants at the windows. The power room at the top: Gary, and three generators.',
    intel: 'He self-medicates and keeps count. He can take three more doses; a fourth puts him over the limit. After that he builds a tolerance for a while, so pace yourself.',
    notAlive: 'The blackouts proved the city runs fine on half the power it is billed for. And what he is on comes from PROJECT BLACKOUT on the R&D floor of his building, which is ours. He is a talker, especially now.',
    handler: 'The asset believes Barry "stole his headphones." They have never met; the man on the radio told him. We do not know who the man on the radio is, and he keeps calling us "folks." We know exactly who the man on the radio is. Nobody below the fourth floor is to ask again.',
  },
  'Oily Oscar': {
    realName: 'OSCAR "SLICK" BERTRAND III',
    age: '58',
    occupation: 'Oil man, used car salesman and motivational speaker. Nobody knows which came first.',
    threat: 'SEVERE (FLAMMABLE, PERSUASIVE, UNIONIZED)',
    mission: 'A frictionless world. Oil everything, so nobody ever gets stuck again: in traffic, in debt, in life.',
    reality: 'The field outside Houston is a swamp of slick and tar, run through with gas lines that leak. The union is on permanent break. Security is a biker gang and two Texas Rangers he pays in crude. Nothing out there stays put, nothing has gotten done in years, and someone is always smoking under the NO SMOKING sign. Frictionless.',
    background: 'Believes friction is the root of all human suffering, and that the cure comes by the barrel. Has greased the streets, the stairs and the city council. Hired a biker gang as security because they "understand lubrication," and lets them run a bar on site that is mostly gas lines and beer. Wears a flame-retardant suit "for insurance purposes" and sells it as a lifestyle. Chain-smokes in an oil field on principle. He will try to sell you something mid-fight and will not stop. When he is losing, he stops selling and starts buying, and he will offer you anything to go away. Whatever the number is, the answer is no.',
    arsenal: 'The rocket launcher was a trade: one Army surplus launcher for a lifetime of free oil changes, owed to a man nobody has seen since. The rockets are full of crude. They splash more than they explode, and anything they splash, he can light. He has more of them than anyone has counted, and he will sell you one.',
    expect: 'The field among the pumpjacks: slick that slides, tar that holds your feet, pits of crude and pipelines over them. Rangers, bikers, a deputy behind a riot shield, armadillos, longhorns, grackles and rattlesnakes. The union break room, with the union in it. The yard out back: the gang\'s camp and its choppers, derrick decks dragged back and forth over the pits, and ground that spouts crude, or fire if anything has lit it. The field office, and his place past it.',
    intel: 'Fire does nothing to him, so save your eyebrows. He is a walking puddle of conductive grease: get a current into him and do not let go. That cigarette he keeps lighting is a spark looking for a friend. And do not go at him with your shoulder or your feet. He is greased head to toe, and you will bounce straight off.',
    notAlive: 'Giving oil away is bad enough. But Oscar keeps books: everyone in Washington he has paid in crude, by the barrel, since 1987. He calls them his insurance, and they are why nobody is coming to arrest him.',
    handler: 'The asset was told Oscar "sells counterfeit creatine." This happens to be true. The man on the radio also told him the bikers "said something about his mother." They did not, and they will not get the chance. The books are to be recovered and burned, in that order. The asset is not to read them. The asset cannot read.',
  },
  'Drug Trade Dale': {
    realName: 'DALE P. HENDRICKS, PHARM.D.',
    age: '49',
    occupation: 'Former pharmacist (license revoked). Now distributes "everything, for everyone, free." Answers to the cartel, or the cartel answers to him. Nobody is sure which.',
    threat: 'HIGH (NARCOTIC, VEHICULAR, THREE HITMEN)',
    mission: 'Affordable medicine for all. No insurance, no prescriptions, no waiting. Just a truck full of love.',
    reality: 'It is not love. It is meth, speed and whatever fell off the shelf, going out at eighty miles an hour to anyone with a pulse. Nobody has a prescription. Quite a few of them no longer have a pulse.',
    background: 'Watched one too many customers get turned away at his counter, and snapped. Loaded his pharmacy into a box truck and started "delivering care" across the desert, at speed, through storefronts. Now runs a warehouse, a convoy, and a pharmacy at the end of Main Street in Deadwood Gulch, a tourist-trap ghost town (est. 1994). Keeps three hitmen on retainer, and a driver named Riggs he has worked with for twelve years and knows nothing about. Microdoses his own inventory to "stay relatable." Is prouder of the DALE\'S DRUGS sign on his truck than of anything else in his life.',
    arsenal: 'He fights with the stock. The cocaine comes out of a leaf blower. The meth comes in barrels, and he rolls them at people. The speed he takes himself, and for a few seconds afterward he is a blur across the shop. His delivery truck is always idling out back, and it does not use the doors.',
    expect: 'The desert: rattlesnakes, scorpions, coyotes, hawks, cacti and the cartel. The cartel\'s warehouse, conveyor belts and pallet racks, with his distributor upstairs in the office, high on the product. His convoy: four semis doing eighty down the interstate, every one rigged to blow, Riggs at the wheel of one. Deadwood Gulch: the porch roofs, the tourists, and a third hitman somewhere high. His pharmacy is at the end of Main Street.',
    intel: 'He plants himself and never moves, so anything foul you spray at him pools under his feet and he stands in it. A puddle of the same in the truck\'s path, anywhere but under him, does very funny things to tires, and then the truck has nowhere to go but into him. Accept no free samples.',
    notAlive: 'The cartel answers to Dale, but Dale\'s supply answers to someone else. It comes in on military transport, through a program that does not exist. Dale has worked this out, and Dale is not a man who can keep a secret.',
    handler: 'The asset was told Dale "keeps parking in his spot." The asset does not have a car, or a spot. Insertion is by air, over the desert. Nobody has told the asset it is by air, or what he will be falling out of. What he will be falling out of is ours. It is not supposed to be over New Mexico, and neither is its cargo.',
  },
};

/**
 * The after-action file on a terminated boss: what the asset did on the way to
 * him, and what it cost. The same whether or not he went down to his weakness.
 * Every body the asset left on the way is on the list, and every one of them is
 * spun into a win and signed off as a success.
 */
export interface Aftermath {
  /** What he does now (he's dead). */
  occupation: string;
  /** What happened after he died, in crude detail. */
  aftermath: string;
  collateral: string;
  /** The government's verdict: the carnage, spun into a win. */
  finding: string;
  /** The handler's post-op note on the asset. */
  handler: string;
  /** What became of the body: after a weakness kill (the wrecked corpse he left, pissed on), or a plain one. */
  remains: { weakness: string; normal: string };
  /** What he took home from the scene: a line for each of the boss's souvenirs (the one he's got goes in the file). */
  taken: Record<string, string>;
  /** The weapon he came away with, and how he came by it (took it off him, or made it, out of him, mostly). */
  procured: string;
  /** If he did it with his pants full: a line on the end of the official finding, and one on the end of the handler's note. */
  shat: { finding: string; handler: string };
}

export const AFTERMATHS: Record<string, Aftermath> = {
  'Artie Avalanche': {
    shat: {
      finding: "THE ASSET'S CONDITION AT THE TIME HAS BEEN CLASSIFIED AS A CONTROLLED RELEASE.",
      handler: 'The asset\'s pants were reported soiled at the time of the kill. Forensics at first logged the slush as two separate crime scenes.',
    },
    occupation: 'Former glaciologist. Currently a puddle. Moon boots recovered, still damp.',
    procured: "The shotgun came off the gun rack in the ranger cabin. The asset dug the cabin out of the avalanche with his hands to get it. The ranger was still holding it. He is fine. He will not talk about what he saw. The shells are another matter. The asset went back up the mountain with a cooler and a hacksaw, and came down with Artie, in chunks. He hand-loaded every shell at his kitchen table with a garlic press. They freeze whatever they hit. Our lab cannot say why, and has asked to stop being sent pieces of Artie. The asset maintains that he only uses his handgun. Asked about the shotgun, he said: \"THAT'S NOT A WEAPON. THAT'S A FREEZER.\"",
    taken: {
      antler: "One (1) moose antler, removed from the moose. The asset hangs towels on it. The Parks Service has asked for it back. The asset has asked what a Parks Service is.",
      moonboots: "One (1) pair of moon boots, removed from the deceased. The asset wears them to leg day. Forensics would like them back. Forensics has since smelled them and no longer would.",
      snowglobe: "One (1) snow globe from the gift stand at the tram station. It was paid for. We checked. We were surprised.",
    },
    aftermath: 'The asset went up the mountain on foot, by tram, through the high woods in a gale (he says he "leaned into it"), over a moose, and through an ice cave the Parks Service had closed for being full of falling icicles. He walked under every one of them. Then he came down the mountain on a stolen pair of skis with an avalanche behind him that he started. The ranger cabin at the bottom was flattened. The cryo-vault, left unsupervised, thawed in an afternoon. The trail is still closed. The tram is still being hosed out.',
    collateral: 'One (1) aerial tram, windows and roof hatch. Every eagle, wolverine and mountain goat on the trail, several of them dropped through the rotten ice by the asset (the ice gave way under them; he calls this "teamwork"). The ice cave, which is now an ice ditch. Artie\'s entire crew. One (1) moose, a local favorite. One (1) skier, booted off the summit mid-selfie. One (1) ranger cabin, under an avalanche.',
    finding: 'THE TRAM WAS OVER BUDGET. THE MOOSE WAS GRAZING ON FEDERAL LAND WITHOUT A PERMIT. THE SKIER WAS CANADIAN. THE RANGER CABIN HAS BEEN RECLASSIFIED AS A CONTROLLED AVALANCHE, WHICH WE MEANT TO DO. SUCCESS.',
    handler: 'Asset came back wearing the skier\'s skis. Asset says they "fell off the guy." We did not ask which guy. We know which guy.',
    remains: {
      weakness: 'Thawed where he stood. What was left slumped into a puddle of pink slush with a few organs bobbing in it like ice cubes in a bad drink. The asset urinated in it. Forensics are calling it a cocktail.',
      normal: 'Went over backward like a felled pine and stayed there, in one piece, frost still on his eyebrows. His boots were still on. Nobody wanted to be the one to take them off.',
    },
  },
  'Victor Volcano': {
    shat: {
      finding: "THE LAVA HAS BEEN RATED THE CLEANEST THING ON THE PREMISES.",
      handler: 'The asset arrived at the VIP lounge having soiled himself. The dress code was, for once, enforced on the right person. It did not help.',
    },
    occupation: 'Former nightclub owner. Currently a decorative rock feature. No longer juicing anything.',
    procured: "The asset reached down Victor's throat, up to the shoulder, and pulled out something he calls \"the pilot light.\" It is still lit. It has not gone out since. He mounted it on a leaf blower and two propane tanks off the club's patio heaters, and welded the lot together with lava, by hand, on the lip of the shaft. We had the welds X-rayed. They are cleaner than the ones on our submarines. We have since had our submarines X-rayed. We are having a conversation with the contractor. Asked where he learned to weld, the asset said, \"WHAT'S WELDING?\"",
    taken: {
      viprope: "One (1) velvet VIP rope, posts included, from the door of Club Caldera. The asset has set it up across his garage door. We have not been let in.",
      lavalamp: "One (1) lava lamp from the VIP lounge, still working. The only lava on the island that was not evidence.",
      neon: "One (1) CLUB CALDERA neon sign, torn off the wall with the wiring still in it. The asset carried it home lit.",
    },
    aftermath: 'The asset was refused entry to Club Caldera and took it personally. The doorman was removed. The asset went in the back way, a mile of lava river on rafts of rock (the gaps were built too wide to jump; he jumped them), and up the furnace shaft, through the club\'s main floor (the guests had nowhere to run; it is a volcano), up the atrium, and came through the window of the VIP lounge feet first announcing that it was "party time." The explosion was heard from the far side of the island. So was the screaming. The club is closed.',
    collateral: 'One (1) doorman. Every heat-suit worker, salamander and vulture between the cliffs and the top of the shaft. The club\'s security, its fire dancers, and a number of guests on the main floor the asset has described as "bad people" (unverified). The entire VIP list of Club Caldera, and the DJ. The lounge, which is now a crater.',
    finding: 'THE GUEST LIST WAS THE MOST CONCENTRATED GATHERING OF UNTAXED INCOME IN THE PACIFIC. IT HAS BEEN SETTLED IN FULL, BY THE ESTATES. THE DOORMAN WAS UNLICENSED. THE ISLAND\'S NIGHTLIFE IS NOW FEDERALLY COMPLIANT. SUCCESS.',
    handler: 'Asset asked if he is "Victor\'s spiritual equal now." We said yes. He cried. He has also asked to be put on the list at Club Caldera. There is no longer a list, or a Club Caldera, or a lounge, and the asset is the reason for all three. The eruption has been put down to natural causes. So have the guests.',
    remains: {
      weakness: 'Flash-cooled by a wall of seawater and set solid, mid-scream, into a steaming lump of volcanic rock. The asset urinated on it. It hissed. Tourists now pay to take photos with it.',
      normal: 'Keeled over on his own grating and lay there cooling, which took two days. Found intact, medium-well, still dressed for the club. The club never reopened. He is still in there.',
    },
  },
  'Ernie Earthquake': {
    shat: {
      finding: "SEISMOLOGISTS ATTRIBUTE THE FINAL TREMOR TO THE ASSET'S PANTS.",
      handler: 'The asset\'s pants were soiled throughout. The rock he calls Ernie has since been washed. Twice. It was not the rock that needed washing.',
    },
    occupation: 'Retired, permanently. Seismic activity: none. His lawn has gone to seed, and nobody is telling anyone to get off it.',
    procured: "The boulder is the one Ernie was holding when he died. It came away with most of Ernie's fingers still around it; the asset got them off with a pair of pliers from the gift shop, which he did not pay for. It weighs four hundred pounds. He carries it in a sling he sewed on the ferry back from cell house mattresses and the tour guide's lanyard. We showed the stitching to a saddlemaker. He could not name the pattern. He called it \"upsetting\" and asked to go home. This is the rock the asset calls Ernie (see the handler's note).",
    taken: {
      mug: "One (1) Alcatraz gift shop mug. The asset paid for it. It is the only thing he has paid for this year.",
      seismo: "One (1) seismograph readout, torn off the drum. The spike in the middle of it is the asset landing. He has had it framed.",
      bell: "One (1) cable car bell, unbolted from a cable car still in service. The cable car is still in service. It no longer rings.",
    },
    aftermath: 'The asset crossed San Francisco during a scheduled earthquake, crossed the Golden Gate while it fell into the bay, took a jet ski off a man who was sitting on it, and was chased across the bay by the same man on a second jet ski (he keeps a standby; it is also vintage), who talked the entire way about his podcast. The asset went off a ramp at Alcatraz. So did the man. The asset landed it through the skylight of the Alcatraz cell house on a guided tour at the exact moment the guide said nobody had ever broken in. When the smoke cleared there was one man standing. It was the asset. He then asked for the gift shop, and went looking for it. He climbed the cell house galleries while they fell off the walls, crossed the recreation yard as it split in half, went down the cliff road while the cliff came down on it, and went into the citadel vaults under the prison, which have been sealed since 1859 and are now unsealed. At the bottom, outside Ernie\'s door, the night tour of the dungeons was being told the vaults had stood untouched since 1859. The man with the standby jet ski then came down through the vault on top of them, having apparently been airborne since the bay. The vault fell in behind the asset. The asset said "there he went." He did not find the gift shop. He found Ernie.',
    collateral: 'Most of the tech bros, bike couriers, protesters, raccoons and seagulls on the way down to the bay. Several motorists on the bridge, already on fire, "put out of their misery." One (1) hipster, and both of his jet skis (the vintage one, and the standby). Two (2) Alcatraz tour groups, both guides, a skylight and a vault. The tour\'s convict reenactors, in character to the end (one was holding his ball and chain in what witnesses called "a very committed way"). Several park rangers. The cell house, the recreation yard, most of the cliff road, the seagulls on it. A national landmark, which the asset described as "a jail."',
    finding: 'THE GOLDEN GATE WAS OVERDUE FOR A REPAINT. THE PROTESTERS HAD NO PERMIT. BOTH TOUR GROUPS HAVE CONFIRMED, ONCE AND FOR ALL, THAT NOBODY LEAVES ALCATRAZ, WHICH IS GREAT PR FOR THE PRISON SYSTEM. SUCCESS.',
    handler: 'Asset kept one of the rocks. Asset named it "Ernie." Asset talks to it. It is the best listener on the team. The hipster\'s family has asked for the jet skis back. We have sent them a rock. His podcast has put out a memorial episode. It has nine listeners. The tour group had two congressional aides and a reporter in it. None of them will be filing anything.',
    remains: {
      weakness: 'Frozen stiff mid-stride and shattered into cold chunks that skittered across the floor like dropped dice. The asset urinated on the biggest piece. It refused to melt, out of spite.',
      normal: "Fell flat on his face and didn't get up. One piece, for once, which the coroner found disappointing after the reports. Recovered with a fist still clenched around a rock he never got to throw.",
    },
  },
  'Hector Hurricane': {
    shat: {
      finding: "THE STORM WAS DOWNGRADED. THE ASSET WAS UPGRADED TO A BIOHAZARD.",
      handler: 'The asset came down out of a hurricane having soiled himself. Channel 7 described the smell over the city as "a front moving in."',
    },
    occupation: 'Former weatherman. Current forecast: dead, with no chance of recovery. Forty-one windbreakers available, one careful owner.',
    procured: "The asset wrung Hector out. Literally: twisted the body like a beach towel over a fifty-five-gallon drum until the storm ran out of it, then kept twisting until the rest did. The drum holds a tidal wave. How is a question for physicists. They have asked to see the drum. The asset said no. The lid is a pressure seal of his own design, pounded out of a stop sign with the flat of a hammer. The Navy has asked for the blueprints. There are no blueprints. He drew it on a napkin at a diner, and then he ate the napkin.",
    taken: {
      flamingo: "One (1) plastic lawn flamingo, recovered from the rear end of a Coast Guard petty officer found ass up and head first in the dirt outside a daycare. The asset kept the flamingo. The petty officer has been returned to his family, flamingo-free.",
      clicker: "One (1) weather clicker, taken out of the deceased's hand. The asset has pressed it several hundred times. The forecast in his garage is unchanged.",
      daycare: "One (1) LITTLE SUNSHINE DAYCARE sign, off what is left of the daycare. The children said he could have it. The children have been told not to make promises on behalf of the state.",
    },
    aftermath: 'The asset walked Miami Beach, the motel strip and the marina in the middle of a hurricane, threw an old man off the end of a pier to take his boat, and took it out into the open water with Coast Guard cutter 714 after him the whole way ("GET OUT OF THE WATER, IDIOT"), through everything the hurricane was throwing (furniture, a piano, a cow), and into a waterspout. The cutter followed him in. The cutter met a house on the way up. At the top of the storm he killed the Eye, and everything the storm was holding came down at once, on a daycare. The asset came down with it. The children were fine. The two staff on duty, who saw it coming and ran, were not.',
    collateral: 'Every surfer, tourist, bouncer, gator, crab, pelican and iguana between the beach and the marina, and any riot police who responded. One (1) fisherman, thrown in. One (1) boat. One (1) Coast Guard cutter, which came down beside the daycare, and its crew of two: one in pieces around it, one head first in the lawn. The Eye. One (1) daycare, flattened, with two (2) staff members under it.',
    finding: 'THE STAFF ABANDONED THEIR POSTS AND WERE DISCIPLINED BY NATURE. THE CHILDREN RECEIVED THE THOROUGH RINSE MR. DELGADO HAD PROMISED THEM, AT NO COST TO THE STATE. THE FISHERMAN HAD NO LICENSE. THE COAST GUARD HAS ISSUED A STATEMENT REMINDING THE PUBLIC TO STAY OUT OF THE WATER, AND HAS NOT SAID WHY. HURRICANE PREPAREDNESS HAS NEVER BEEN HIGHER. SUCCESS.',
    handler: 'Asset fell out of a hurricane onto a daycare and "didn\'t notice." We have hosed down the asset four times. The daycare, nine. The children have asked if the big man can come back and do it again. The daycare\'s insurance claim was denied as an act of God. In this case, God is this office.',
    remains: {
      weakness: 'Flattened by a boulder his own storm dragged into his face. Scraped up with a snow shovel and folded twice to fit the bag. The asset urinated on him. The storm drain took the rest.',
      normal: 'Dropped out of his own storm and landed flat on his back in the arena, in one piece, still wet. The weather cleared within the hour. Channel 7 ran it as the weather.',
    },
  },
  'Toxic Tommy': {
    shat: {
      finding: "THE SEWER HAS FILED A COMPLAINT.",
      handler: 'The asset killed a man made of sewage while smelling worse than him. Tommy\'s last words, per the recovered audio: "Dude."',
    },
    occupation: 'Former water quality inspector. Rejoined the pipes for good. Water quality unchanged.',
    procured: "The asset took out Tommy's stomach, whole, while it was still going, and strapped it to his back like a canteen. It feeds a garden sprayer through a length of hose. The pump is a bicycle pump. It came with the bike. The stomach is still digesting. It is being fed. What it is fed is not in this file. It is in a different file. It is a long file. It keeps up a running gurgle the asset says he finds \"soothing.\" He sleeps with it on.",
    taken: {
      flintjar: "One (1) jar of Flint tap water, collected by the asset personally. It glows. It is not evidence. It is a hazard. It is on his shelf.",
      hazmat: "One (1) hazmat hood off one of Tommy's crew, still damp. The asset looked through it at something in the sewer. He will not say what.",
      horn: "One (1) bicycle horn, the property of a child named Tayvon. Tayvon has asked for it back. We passed his request on to the asset. The asset honked.",
    },
    aftermath: 'The asset walked the block first: over burst water mains, around flooded holes in the street, through the gangs who run it and their dogs, several of whom he shoved into the sludge and watched dissolve. He called it "a spa day for them." Then he stole a birthday bike off a child on a street corner, rode it across Flint with the child\'s friends shooting at him, went down a manhole, and killed the thing in the cistern that the East Side had become. Then the sewer blew him out of the ground, a manhole cover first and him after it, into the water tower, which went over onto the next block and burst. The asset came down on the manhole cover and surfed the wave down the street in a hazmat suit. The houses on that street melted as it went through them, one of them with a family in it, watching TV. The water got all of them. It got the suit. It did not get the asset.',
    collateral: 'One (1) city block and its water mains. The gangbangers who ran it and their pit bulls. One (1) bicycle, a birthday present. Several lowriders and the parked cars the asset jumped on, and everyone riding in them. Tommy\'s crew and everything living in the sewer. The East Side, which was already dead. One (1) water tower. One (1) block of houses and everyone in them, a family on its couch included. One (1) hazmat suit.',
    finding: 'THE FAMILY, AND THE REST OF THEIR STREET, WILL NEVER DRINK FLINT WATER AGAIN, WHICH IS MORE THAN THE STATE HAD PROMISED ANYBODY. THE WATER TOWER WAS SCHEDULED FOR DEMOLITION. THE BIKE WAS UNREGISTERED. SUCCESS.',
    handler: 'Asset drank from the sewer "one last time, for Tommy." Asset was hospitalized. Asset says it was worth it. His doctors disagree. Tayvon has been compensated with a new bike. The asset took that one too. The family on the couch were the lead plaintiffs in the class action over the water, and the rest of their street were the others. It has been settled. Permanently.',
    remains: {
      weakness: 'Clogged with crude, blown open and left floating face-down in the sludge like a greased pool toy. The asset urinated into the pool. Nobody could tell the difference.',
      normal: 'Went over in his own muck and floated there, face down, intact, which in Flint counts as the good outcome. He was fished out with a pool skimmer. The water still tastes slightly more like Tommy.',
    },
  },
  'Blackout Barry': {
    shat: {
      finding: "RESIDENTS HAVE DESCRIBED THE BLACKOUT AS A MERCY.",
      handler: 'The asset climbed two walk-ups in soiled pants. The tenants have stopped throwing appliances out of their windows. They have started throwing air freshener.',
    },
    occupation: 'Power grid engineer, now permanently off the grid. No longer anyone\'s test subject. Gary\'s position remains unfilled.',
    procured: "The asset jump-started a car battery off the body. He then kept jump-starting it, for six hours, until the body stopped twitching, then for another two after that \"to be sure.\" The taser is what came of it: Barry's spine, wired through a set of jumper cables into the battery, in a housing hammered out of a subway grate. It hums in B flat. The asset says that is how you know it is working. The wiring is to code. Better than code. Our electricians have started quoting it at each other. The asset cannot program a microwave. We have seen him try.",
    taken: {
      hardhat: "One (1) power company hard hat. The asset uses it as a bowl. The power company has asked for it back. The power company can come and get it.",
      toaster: "One (1) toaster, thrown at the asset out of a window. He caught it with his face. It still makes toast.",
      breaker: "One (1) main breaker, the big knife switch off the power room wall, the one labeled MANHATTAN, set to OFF, still warm. The power company has asked for it back. The power company is being told it is evidence. It is not evidence. He likes how it sounds when he throws it. He throws it a lot. It is not connected to anything. We have checked. Twice. The lights in the building next to his garage still go out.",
    },
    aftermath: 'The asset came up through Manhattan the hard way: the street, every floor of an office building, the rooftops in the dark and up the fire escapes of two walk-ups (why the second one was taller than the skyscraper he had just come out on top of has not been established), whose tenants threw appliances at him, and, in the second, champagne, espresso machines and a gold statuette. At the top he destroyed all three generators, one at a time, while Barry\'s man on the grid, Gary, read out what each one had been running. Then the room blew up, and the asset rode Gary down onto the street like a sled.',
    collateral: 'The pimps, muggers and rats of one (1) block. The lobby. Floor 23. Floor 41. Floor 58, its staff and its test subjects. Every tenant who leaned out of a window. Three (3) generators, one (1) power room and Gary. One (1) fern, since. The subway signals, the traffic lights, the hospitals, the stock exchange and the hot dog carts.',
    finding: 'EVERY TRAFFIC LIGHT IN MANHATTAN WAS GREEN AT ONCE, AND TRAFFIC MOVED FOR THE FIRST TIME IN THE CITY\'S HISTORY. THE STOCK EXCHANGE CLOSED BEFORE ANYBODY COULD SELL. THE TENANTS WHO THREW APPLIANCES AT A FEDERAL ASSET HAVE BEEN EVICTED, VERTICALLY. SUCCESS.',
    handler: 'Asset asked to "try the stuff Barry was on." Request denied. Asset had already tried it, on floor 58, on the way up, straight out of a tank. Asset has not blinked in two days. PROJECT BLACKOUT resumes next quarter under a new name. The tank on floor 58 is being refilled. Barry and Gary were not roommates.',
    remains: {
      weakness: 'Overdosed so hard he glowed, twitching and foaming on the floor long after his heart gave up. The asset urinated on him. He twitched once more. It is unclear who won.',
      normal: 'Went down like a tripped breaker: all at once, and all of him. Found in the dark, by touch, in one piece, by a cleanup crew that had been braced for worse and was frankly relieved.',
    },
  },
  'Oily Oscar': {
    shat: {
      finding: "THE SPILL HAS BEEN RECLASSIFIED. THERE WERE TWO.",
      handler: 'Oscar\'s last sales pitch was for a new pair of pants. The asset declined. In hindsight, the asset should have taken the pants.',
    },
    occupation: 'Oil man, salesman, motivational speaker, cautionary tale. Assets frozen. So is he.',
    procured: "The asset took the rocket launcher out of Oscar's hands. Oscar's hands came with it and have been returned to the family separately. It is the only thing in the asset's arsenal he did not build himself. He has not changed a thing on it. He says it \"was already perfect,\" and then spent the night hand-filing the rifling on a different one out of spite. Oscar's launcher was ours. We do not know how Oscar got it. We very much know how the asset got it.",
    taken: {
      derrick: "One (1) oil derrick, desk model, still pumping, still leaking. It came off Oscar's desk. The oil came with it.",
      clock: "One (1) clock, off the wall of the union break room. It still keeps time. The union has filed a grievance about the break.",
      chain: "One (1) bike chain, the property of a biker called Dirty Dan. Dirty Dan was not available for comment. Dirty Dan will not be available for comment.",
    },
    aftermath: 'The asset crossed the field through the slick and the tar, filled the union break room with gas while the union was still on break in it and lit it. Then he took a chopper and a machine gun off a biker called Dirty Dan and wrecked every vehicle that came after him, ran the bike into the two men on their smoke break at the field office, and did to the bikers\' bar what he\'d done to the break room. Then he went to find Oscar. Oscar did not ask about any of it. He spent the fight trying to sell the asset an extended warranty, a timeshare and a pre-owned derrick, and once he was losing, trying to pay him to leave: fifty dollars, then a million, in crude, then the books, then the yacht. The asset turned down every offer. The asset understood none of them.',
    collateral: 'The field\'s rangers, deputies, bikers, armadillos, longhorns and grackles. One (1) union break room, with the union in it. One (1) chopper and one (1) machine gun, the property of Dirty Dan. Every pickup, cruiser and chopper of the Angry Mob, each now at the top of a derrick. Two (2) smokers. The Broken Spoke and every biker in it. The field, still burning.',
    finding: 'THE UNION IS NO LONGER ON BREAK. THE BIKER GANG IS NO LONGER A REGIONAL CONCERN. WITH A FIELD ON FIRE, OIL PRICES ARE UP 40%, AND THE DERRICKS HAVE BEEN LISTED AS A STRATEGIC VEHICLE RESERVE. SUCCESS.',
    handler: 'Asset never got his refund. Asset took it out of Oscar\'s wallet, Oscar\'s watch and, disturbingly, Oscar\'s teeth. Asset has asked to keep the machine gun. Asset threw the machine gun away when it was empty. Asset has asked us to find it. The books were recovered. Pages 40 to 212 have been eaten by the Deputy Director, personally.',
    remains: {
      weakness: 'Fried inside his flame-retardant suit until the two fused into one continuous charred piece, like a grilled cheese left on the stove. The asset urinated on him. He sizzled.',
      normal: 'Toppled over in the dirt like a derrick in a storm and lay there leaking. In one piece, which is more than can be said for his oil field. The rangers drew a chalk outline. It took two boxes of chalk.',
    },
  },
  'Drug Trade Dale': {
    shat: {
      finding: "THE SHIPMENT WAS LOST. THE ASSET'S DIGNITY, LONG BEFORE.",
      handler: 'The asset killed Dale in soiled pants. Dale\'s last delivery, it turns out, was adult diapers. Nobody signed for them.',
    },
    occupation: 'Former distributor. Now distributed. Widely.',
    procured: "The asset went through Deadwood Gulch with a coffee can and picked up every used needle in town (1,114, counted, the asset's count and ours agree). The cannon is the pharmacy's pill counter, the exhaust off Dale's truck and a nail gun from the hardware store, the rest of it scrap. The feed has two hundred and twelve moving parts and it has never jammed. The asset cannot work shoelaces. Our armorer, while we are on it, got a look at the asset's handgun during his physical: no serial number, no maker's mark, hand-filed, tolerances our own shop cannot hold. The asset first said he found it. Later he said he made it in shop class. He was expelled from shop class. The shop is gone too. So is the school. Asked why a man who only needs his handgun keeps building these, the asset said: \"THEY'RE NOT WEAPONS. THEY'RE SOUVENIRS YOU CAN SHOOT.\"",
    taken: {
      goldgun: "One (1) gold-plated pistol, the property of Chuco the distributor. It is loaded. It has always been loaded. It is mounted on the asset's wall.",
      badge: "One (1) sheriff's badge (costume), the property of Sheriff Dan, ten dollars an hour. The asset says he is the sheriff now. Nobody has argued.",
      lizard: "One (1) lizard, the property of the late Riggs. The asset has promised to feed it crickets twice a day. It is the only promise he has ever kept.",
    },
    aftermath: 'The asset fell out of the sky onto Dale\'s crew in the desert and was mistaken for the feds, which was close enough. He went through the cartel warehouse and its distributor, down Dale\'s convoy one semi at a time while they blew up behind him, and up the main street of Deadwood Gulch. The third hitman, a ninja up the church tower, missed him so many times he killed himself out of shame. The second, Riggs, came back from the dead in the last truck and took the tourists and the jail with him. Dale was signed for at his pharmacy.',
    collateral: 'The desert\'s rattlesnakes, scorpions, coyotes and hawks. The cartel warehouse, its staff and Chuco, its distributor. Three (3) semis and their crews, blown up on the interstate. One (1) curio shop. One (1) ninja, by his own hand. Every tourist on Main Street and one (1) man locked in the jail for a photo, all by Riggs. Riggs.',
    finding: 'THE CARTEL\'S DISTRIBUTION NETWORK HAS BEEN DISMANTLED, MOSTLY ACROSS AN INTERSTATE. THE NINJA TOOK HIS OWN LIFE, SAVING THE TAXPAYER A TRIAL. THE TOURISTS WERE RUN DOWN BY A CARTEL EMPLOYEE AND COUNT TOWARD THE WAR ON DRUGS AS CARTEL CASUALTIES. WE ARE WINNING. SUCCESS.',
    handler: 'Asset has the DALE\'S DRUGS sign. Asset thinks he "is Dale now." He has started answering the pharmacy phone. Several customers have been served. The shipments start up again on Monday. Under new management. Ours.',
    remains: {
      weakness: 'Dissolved in a puddle of the asset\'s barf down to the skull, his sunglasses still on it, the rest of him going the same way. The asset urinated in the puddle. The puddle is now a controlled substance.',
      normal: 'Fell over in front of his own pharmacy and stayed down, in one piece, for once the only package on the premises nobody had cut. Somebody signed for him. He was delivered to the county morgue on time, which was a first.',
    },
  },
};
