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
  /** How the intel people think he goes down (a nudge, not a manual). */
  intel: string;
  /** The approved method, as undignified as the budget allows. */
  /** The office's do's and don'ts for the job (how to beat him is the field intel's). */
  rules: string;
  /** Why he's to be killed and not arrested: what a trial would drag out. [[Double brackets]] are blacked out. */
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
    mission: 'Save the glaciers. Refreeze Alaska one hostile snowbank at a time, and the rest of the world will follow its example.',
    reality: 'The trail up the mountain is a death trap of icicles and crevasses, the tram is under attack by the local wildlife, and the moose has gotten very large and very angry. The glaciers are still melting.',
    background: 'Spent twenty years measuring glaciers while they melted in front of him. Published 400 papers. Nobody read them. So he stopped writing papers and started building a cryo-vault at the bottom of the mountain, and now the whole range is freezing over from the inside. He has personally befriended the moose. He has a laminated trail map with every crevasse on it. He is the only person on Earth who would think this mountain needs to be colder.',
    intel: 'Thin-skinned in every sense. A man made of freezer burn cannot stand open flame. Put some on him and he jumps clean across the room, and he lands hard enough to shake his own ceiling loose.',
    rules: "Keep it off the news: ski season opens in a month. The moose is a protected species. Nobody is to tell the asset that.",
    notAlive: 'Taken alive, he gets a trial, and a trial puts his 400 papers into evidence, including the one tracing the melt back to the Department of the [[Interior\'s]] own drilling leases. Nobody has read his papers. Let\'s keep it that way.',
    handler: 'Asset was told Artie "looked at his protein shake funny." That was sufficient. The quickest way down from the summit is a ski run. The asset does not ski. We have not told him this is a problem, because it is not a problem for him.',
  },
  'Victor Volcano': {
    realName: 'VICTOR KALANI-MORGENSTERN',
    age: '38',
    occupation: 'Geothermal energy evangelist. Nightclub owner. Hot yoga instructor. Juices daily. Juices other things daily.',
    threat: 'CRITICAL (LAVA, ROID RAGE, BOTTLE SERVICE)',
    mission: 'Free, clean, renewable power for every island home, straight from the earth\'s core. Also, the hottest club in the Pacific.',
    reality: 'Drilled into an active magma chamber and built a nightclub around the hole. CLUB CALDERA. VIP lounge at the top of the furnace shaft. The doorman is enormous, and the dress code is "not you."',
    background: 'Moved to Hilo to "reconnect with the planet\'s heartbeat." Found it. Put a hole in it. Believes the power company has been hoarding the volcano for profit, which is, technically, not how volcanoes work. Funds the drilling with bottle service. Has been steroid-cycling for eleven years in pursuit of "geological levels of mass." Considers himself Meathead\'s spiritual equal. This is the most offensive thing in his file.',
    intel: 'He\'s all pressure and no release valve. Anything that hot really, really hates water. Not a squirt gun. A wall of it.',
    rules: "DO NOT PLUG HIS VENTS WITH ROCKS. PLUG ALL THREE ONCE HE'S HALF-COOKED AND THE WHOLE MOUNTAIN GOES, WITH BOTH OF YOU IN IT. THE LAST GUY LANDED ON A NEWS CHOPPER.",
    notAlive: 'His drill works. One well powered the whole island, for free, for fourteen months. A trial would ask him to demonstrate it. [[The utilities]] have asked that nobody demonstrate it, and [[the utilities]] have been very generous to [[this office]].',
    handler: 'Asset was informed that Victor "skips leg day" and that the club "won\'t let him in." Asset did not wait for the rest of the briefing. There is a back way in, through the lava. We had assumed that would be a deterrent.',
  },
  'Ernie Earthquake': {
    realName: 'ERNEST T. BUCKLEY',
    age: '71',
    occupation: 'Retired seismologist. Professional grump. Has opinions about your lawn. Lives on Alcatraz, which he calls "downsizing."',
    threat: 'HIGH (TECTONIC, CRANKY)',
    mission: 'Set off "The Big One" early, on a schedule, during business hours, so everyone is ready for it. Rip the band-aid off.',
    reality: 'The quakes are getting worse by the hour. The streets are splitting open, the bricks are coming off the windowsills and the Golden Gate is coming apart one span at a time. Everyone is ready for it. Nobody is enjoying it.',
    background: 'Spent fifty years predicting California\'s next great earthquake and got tired of waiting for it. Figured a controlled disaster beats a surprise disaster. Moved into the old cell house on Alcatraz for the bedrock and the quiet, and schedules every quake around the guided tours so as not to disturb anybody. Mails the city an itemized invoice after every one. Nobody has paid him. This has made him worse.',
    intel: 'Old man, bad circulation, worse hips. A cold snap locks his joints solid, but only when it catches him mid-stride or mid-hop. Standing still, he just shivers and swears.',
    rules: "Alcatraz is a national park. Try not to break it. Try harder than that.",
    notAlive: 'His predictions were right. So were his inspection reports on the federal buildings [[downtown]] certified quake-safe in [[1991]], which he kept copies of and has offered to read aloud at any trial. Every one of them.',
    handler: 'Asset believes he is "helping an old man move rocks." The island is only reachable by water. The asset has no boat. We are confident he will not let that stop him, and we have pre-apologized to the Coast Guard.',
  },
  'Hector Hurricane': {
    realName: 'HECTOR "THE DOPPLER" DELGADO',
    age: '52',
    occupation: 'Disgraced Channel 7 weatherman. Owns forty-one windbreakers.',
    threat: 'SEVERE (CATEGORY 5, CATEGORY SMUG)',
    mission: 'Pressure-wash Miami clean. Of crime, of sin, of scooters. Nature\'s way.',
    reality: 'The beach is gone, the motels are airborne and the marina is in the sky. The storm drains backed up in week one. That is not mud flying around up there.',
    background: 'Was fired live on air for forecasting "sunny and 75" during a named storm. Decided the only way to never be wrong again was to make the weather himself. His hurricane has parked over Miami Beach and will not leave. Something at the top of it is watching. We have satellite photos. We have stopped looking at the satellite photos. He genuinely believes a good hard rinse is exactly what this city needs, and gives the forecast every night anyway. It is always his hurricane.',
    intel: 'His storm pulls everything toward him. EVERYTHING. Lawn chairs, stray dogs, anything big, round and heavy you roll his way. He never checks what\'s coming. Think about it.',
    rules: "If there's a camera up there, the footage belongs to this office. Channel 7 has already made an offer. So has his mother.",
    notAlive: 'He did not get the forecast wrong. He read the one he was handed. [[NOAA]] changed it an hour before air, at the request of [[the tourism board and two insurers]]. He kept the original. He has asked for a jury.',
    handler: 'Asset was told Hector predicted "a bad forecast for his gains." Asset asked how to get to the top of a hurricane. We said nobody knows. Asset said "up." We don\'t know where he keeps getting the shorts.',
  },
  'Toxic Tommy': {
    realName: 'THOMAS "TOMMY" PRZYBYLSKI',
    age: '33 (APPROX. SEWAGE HAS AGED HIM)',
    occupation: 'Former municipal water quality inspector. Now lives in the pipes. Is, in a sense, the pipes.',
    threat: 'CRITICAL (BIOHAZARD, BAD BREATH, THE EAST SIDE)',
    mission: 'Filter every drop of Flint\'s water through his own body until it runs clean. He is the filtration system now.',
    reality: 'He is not a filtration system. He is a man vomiting in a sewer. The water is worse. The water tower over the East Side is full of it.',
    background: 'Told the city the water was safe, then drank it on live TV to prove it. It was not safe. Something happened to him down there, and now he believes he can drink the town\'s poison and puke it back out purified. He was not the only one it happened to. Everyone the water took over the years went down the drains, and something in the cistern under the East Side is made of them. Tommy calls it "the neighbors." He brings it things.',
    intel: 'He filters water, not crude. A face full of heavy oil clogs his whole system like a hairball in a drain and pops him right up out of the muck, gasping.',
    rules: "DO NOT, UNDER ANY CIRCUMSTANCES, SET AN OILED SUBJECT ON FIRE. WE MEAN IT. THE PAPERWORK ALONE.",
    notAlive: 'He did not decide the water was safe. He was told to say so, in writing, by the [[governor\'s]] office. He kept the memo. It is down in the sewer with him, and we would prefer it stayed there.',
    handler: 'Four down, four to go. The asset has taken a phone call nobody on this floor authorized, from a number that does not exist, and now believes Tommy is "laughing at his gains." He has not asked for a hazmat suit. He has asked whether the sewer water has "electrolytes."',
  },
  'Blackout Barry': {
    realName: 'BARRINGTON "BARRY" WEISS',
    age: '47',
    occupation: 'Power grid engineer. Amateur astronomer. Professional user. R&D\'s favorite test subject.',
    threat: 'HIGH (ELECTRICAL, CHEMICAL, EXISTENTIAL)',
    mission: 'Turn off New York\'s lights so eight million people can look up and see the stars again.',
    reality: 'Rolling blackouts every night. Eight million people looked up, tripped over things in the dark and started mugging each other. Nobody saw a single star. It\'s New York. There\'s smog.',
    background: 'Grew up in the Bronx without ever seeing the Milky Way and never got over it. Took a job at the power company to get his hands on the big switch, and runs the blackouts from a power room on top of an old walk-up, through a guy on a headset who thinks he\'s very important. Volunteers for whatever the R&D floor of his office building is cooking up, for "perspective." Has, at this point, a startling tolerance. Sincerely thinks he\'s giving the city a gift. The city thinks he\'s a lunatic in a hard hat. Both are right.',
    intel: 'Subject self-medicates heavily and keeps count. He can take three more doses. The fourth sends him clean over the limit. Afterwards he builds a tolerance, so pace yourself.',
    rules: "Nothing on the R&D floor is to be drunk, eaten, huffed or rubbed on. The asset has been told. The asset nodded.",
    notAlive: 'The blackouts proved the city runs fine on half the power it\'s billed for. And what he\'s on comes from the R&D floor of his building, [[PROJECT BLACKOUT]], which is ours. He is a talker. Especially now.',
    handler: 'Asset believes Barry "stole his headphones." Barry has never met the asset. The man on the radio told him so. We do not know who the man on the radio is, and he keeps calling us "folks."',
  },
  'Oily Oscar': {
    realName: 'OSCAR "SLICK" BERTRAND III',
    age: '58',
    occupation: 'Oil man, used car salesman, motivational speaker. Nobody knows which came first.',
    threat: 'SEVERE (FLAMMABLE, PERSUASIVE, UNIONIZED)',
    mission: 'A frictionless world. Oil everything, so nobody ever gets stuck again: in traffic, in debt, in life.',
    reality: 'The field outside Houston is a swamp of slick and tar. The union is on permanent break. The site security is a biker gang and two Texas Rangers he pays in crude. Somebody is always smoking under the NO SMOKING sign.',
    background: 'Believes friction is the root of all human suffering and that the cure comes by the barrel. Greased the streets, the stairs and the city council. Hired a biker gang as security because they "understand lubrication," and lets them run a bar on site, which is mostly gas lines and beer. Wears a flame-retardant suit "for insurance purposes" and sells it as a lifestyle. Chain-smokes in an oil field on principle. Will try to sell you something mid-fight. Do not buy it. It\'s oil.',
    intel: 'Fire does nothing to him, so save your eyebrows. He\'s a walking puddle of conductive grease: get a current into him and DON\'T LET GO. And that cigarette he keeps lighting is a spark looking for a friend.',
    rules: "Do not buy anything from him. Not the suit, not the oil, not the seminar. The asset has a history.",
    notAlive: 'Giving oil away is bad enough. But Oscar keeps books: everyone in Washington he\'s paid in crude, by the barrel, since [[1987]]. He calls it his insurance. It is why nobody is coming to arrest him.',
    handler: 'Asset was told Oscar "sells counterfeit creatine." This is actually true. The man on the radio also told the asset the bikers "said something about his mother." They did not. They will not get the chance to.',
  },
  'Drug Trade Dale': {
    realName: 'DALE P. HENDRICKS, PHARM.D.',
    age: '49',
    occupation: 'Former pharmacist (license revoked). Current distributor of "everything, for everyone, free." Answers to the cartel. The cartel answers to him. Nobody is sure.',
    threat: 'HIGH (NARCOTIC, VEHICULAR, THREE HITMEN)',
    mission: 'Affordable medicine for all. No insurance, no prescriptions, no waiting. Just a truck full of love.',
    reality: 'It is not love. It is meth, speed and whatever fell off the shelf, out of a cartel warehouse in the desert, on a convoy of semis doing eighty down the interstate. Every one of them is rigged to blow if it gets stopped.',
    background: 'Watched one too many customers turned away at his counter and snapped. Loaded his pharmacy into a box truck and started "delivering care" across the desert, at speed, through storefronts. Now runs a warehouse, a convoy and a pharmacy at the end of Main Street in Deadwood Gulch, a tourist-trap ghost town (est. 1994). Has three hitmen on retainer and a driver named Riggs he has worked with for twelve years and knows nothing about. Microdoses his own inventory to "stay relatable." Is prouder of the DALE\'S DRUGS sign on his truck than of anything else in his life.',
    intel: 'Plants himself and never moves, so anything foul you spray at him pools under his feet and he marinates in it. A puddle of the same in the truck\'s path, early, does very funny things to tires.',
    rules: "Accept no free samples. The asset has already accepted several. Do not sign for anything addressed to Dale.",
    notAlive: 'The cartel answers to Dale. Dale\'s supply answers to someone else: it comes in on military transport, through [[a program that does not exist]]. Dale has worked this out. Dale is not a man who can keep a secret.',
    handler: 'Asset has been told Dale "keeps parking in his spot." Asset does not have a car. Or a spot. Dale saw the asset fall out of the sky and assumed it was the feds. We have no idea what the asset was falling out of.',
  },
};

/**
 * The after-action file on a terminated boss: what the asset did on the way to
 * him, and what it cost. The same whether or not he went down to his weakness.
 * Every body the asset left on the way is on the list, and every one of them is
 * spun into a win and signed off as a success.
 */
export interface Aftermath {
  /** What happened after he died, in crude detail. */
  aftermath: string;
  collateral: string;
  /** The government's verdict: the carnage, spun into a win. */
  finding: string;
  /** The handler's post-op note on the asset. */
  handler: string;
  /** What became of the body: after a weakness kill (the wrecked corpse he left, pissed on), or a plain one. */
  remains: { weakness: string; normal: string };
}

export const AFTERMATHS: Record<string, Aftermath> = {
  'Artie Avalanche': {
    aftermath: 'The asset went up the mountain on foot, by tram and over a moose, and came down it on a stolen pair of skis with an avalanche behind him that he started. The ranger cabin at the bottom was flattened. The cryo-vault, left unsupervised, thawed in an afternoon. The trail is still closed. The tram is still being hosed out.',
    collateral: 'One (1) aerial tram, windows and roof hatch. Every eagle, wolverine and mountain goat on the trail. Artie\'s entire crew. One (1) moose, a local favorite. One (1) skier, booted off the summit mid-selfie. One (1) ranger cabin, under an avalanche.',
    finding: 'THE TRAM WAS OVER BUDGET. THE MOOSE WAS GRAZING ON FEDERAL LAND WITHOUT A PERMIT. THE SKIER WAS CANADIAN. THE RANGER CABIN HAS BEEN RECLASSIFIED AS A CONTROLLED AVALANCHE, WHICH WE MEANT TO DO. SUCCESS.',
    handler: 'Asset came back wearing the moon boots and the skier\'s skis. Asset says they "fell off the guy." We did not ask which guy. We know which guy.',
    remains: {
      weakness: 'Thawed where he stood. What was left slumped into a puddle of pink slush with a few organs bobbing in it like ice cubes in a bad drink. The asset urinated in it. Forensics are calling it a cocktail.',
      normal: 'Went over backward like a felled pine and stayed there, in one piece, frost still on his eyebrows. The moon boots were still on. Nobody wanted to be the one to take them off.',
    },
  },
  'Victor Volcano': {
    aftermath: 'The asset was refused entry to Club Caldera and took it personally. The doorman was removed. The asset went in the back way, across the lava and up the furnace shaft, and came through the window of the VIP lounge feet first announcing that it was "party time." The explosion was heard from the far side of the island. So was the screaming. The club is closed.',
    collateral: 'One (1) doorman. Every heat-suit worker, salamander and vulture between the cliffs and the top of the shaft. The entire VIP list of Club Caldera, and the DJ. The lounge, which is now a crater with a velvet rope around it.',
    finding: 'THE GUEST LIST WAS THE MOST CONCENTRATED GATHERING OF UNTAXED INCOME IN THE PACIFIC. IT HAS BEEN SETTLED IN FULL, BY THE ESTATES. THE DOORMAN WAS UNLICENSED. THE ISLAND\'S NIGHTLIFE IS NOW FEDERALLY COMPLIANT. SUCCESS.',
    handler: 'Asset asked if he is "Victor\'s spiritual equal now." We said yes. He cried. He has also asked to be put on the list at Club Caldera. There is no longer a list, or a Club Caldera, or a lounge, and the asset is the reason for all three.',
    remains: {
      weakness: 'Flash-cooled by a wall of seawater and set solid, mid-scream, into a steaming lump of volcanic rock. The asset urinated on it. It hissed. Tourists now pay to take photos with it.',
      normal: 'Keeled over on his own grating and lay there cooling, which took two days. Found intact, medium-well, still dressed for the club. The club reopened around him.',
    },
  },
  'Ernie Earthquake': {
    aftermath: 'The asset crossed San Francisco during a scheduled earthquake, crossed the Golden Gate while it fell into the bay, took a jet ski off a man who was sitting on it, and landed it through the skylight of the Alcatraz cell house on a guided tour at the exact moment the guide said nobody had ever broken in. When the smoke cleared there was one man standing. It was the asset.',
    collateral: 'Most of the tech bros, bike couriers, protesters, raccoons and seagulls on the way down to the bay. Several motorists on the bridge, already on fire, "put out of their misery." One (1) hipster, one (1) jet ski. The Alcatraz tour group, the tour guide and the skylight.',
    finding: 'THE GOLDEN GATE WAS OVERDUE FOR A REPAINT. THE PROTESTERS HAD NO PERMIT. THE TOUR GROUP HAS CONFIRMED, ONCE AND FOR ALL, THAT NOBODY LEAVES ALCATRAZ, WHICH IS GREAT PR FOR THE PRISON SYSTEM. SUCCESS.',
    handler: 'Asset kept one of the rocks. Asset named it "Ernie." Asset talks to it. It is the best listener on the team. The hipster\'s family has asked for the jet ski back. We have sent them the rock.',
    remains: {
      weakness: 'Frozen stiff mid-stride and shattered into cold chunks that skittered across the floor like dropped dice. The asset urinated on the biggest piece. It refused to melt, out of spite.',
      normal: "Fell flat on his face and didn't get up. One piece, for once, which the coroner found disappointing after the reports. Recovered with a fist still clenched around a rock he never got to throw.",
    },
  },
  'Hector Hurricane': {
    aftermath: 'The asset walked Miami Beach, the motel strip and the marina in the middle of a hurricane, threw an old man off the end of a pier to take his boat, and drove it into a waterspout. At the top of the storm he killed the Eye, and everything the storm was holding came down at once, on a daycare. The asset came down with it. The children were fine. The two staff on duty, who saw it coming and ran, were not.',
    collateral: 'Every surfer, tourist, bouncer, gator, crab, pelican and iguana between the beach and the marina, and any riot police who responded. One (1) fisherman, thrown in. One (1) boat. The Eye. One (1) daycare, flattened, with two (2) staff members under it.',
    finding: 'THE STAFF ABANDONED THEIR POSTS AND WERE DISCIPLINED BY NATURE. THE CHILDREN RECEIVED THE THOROUGH RINSE MR. DELGADO HAD PROMISED THEM, AT NO COST TO THE STATE. THE FISHERMAN HAD NO LICENSE. HURRICANE PREPAREDNESS HAS NEVER BEEN HIGHER. SUCCESS.',
    handler: 'Asset fell out of a hurricane onto a daycare and "didn\'t notice." We have hosed down the asset four times. The daycare, nine. The children have asked if the big man can come back and do it again.',
    remains: {
      weakness: 'Flattened by a boulder his own storm dragged into his face. Scraped up with a snow shovel and folded twice to fit the bag. The asset urinated on him. The storm drain took the rest.',
      normal: 'Dropped out of his own storm and landed flat on his back in the arena, in one piece, still wet. The weather cleared within the hour. Channel 7 ran it as the weather.',
    },
  },
  'Toxic Tommy': {
    aftermath: 'The asset stole a birthday bike off a child on a street corner, rode it across Flint with the child\'s friends shooting at him, went down a manhole, and killed the thing in the cistern that the East Side had become. Then the sewer blew him out of the ground, through the water tower, which came down through the roof of a house where a family was watching TV. The water got them. It did not get the asset.',
    collateral: 'One (1) bicycle, the property of Tayvon, a birthday present. Several lowriders, their occupants and their pit bulls. Tommy\'s crew and everything living in the sewer. The East Side, which was already dead. One (1) water tower. One (1) house. One (1) family, on the couch.',
    finding: 'THE FAMILY WILL NEVER DRINK FLINT WATER AGAIN, WHICH IS MORE THAN THE STATE HAD PROMISED ANYBODY. THE EAST SIDE HAS BEEN PERMANENTLY REMOVED FROM THE CLASS ACTION. THE BIKE WAS UNREGISTERED. SUCCESS.',
    handler: 'Asset drank from the sewer "one last time, for Tommy." Asset was hospitalized. Asset says it was worth it. His doctors disagree. Tayvon has been compensated with a new bike. The asset took that one too.',
    remains: {
      weakness: 'Clogged with crude, blown open and left floating face-down in the sludge like a greased pool toy. The asset urinated into the pool. Nobody could tell the difference.',
      normal: 'Went over in his own muck and floated there, face down, intact, which in Flint counts as the good outcome. He was fished out with a pool skimmer. The water still tastes slightly more like Tommy.',
    },
  },
  'Blackout Barry': {
    aftermath: 'The asset came up through Manhattan the hard way: the street, every floor of an office building, the rooftops in the dark and up the fire escape of a walk-up whose tenants threw appliances at him. At the top he destroyed all three generators, one at a time, while Barry\'s man on the grid read out what each one had been running. Then the room blew up, and the asset rode Barry\'s man down onto the street like a sled.',
    collateral: 'The pimps, muggers and rats of one (1) block. The lobby. Floor 23. Floor 41. Floor 58, its staff and its test subjects. Every tenant who leaned out of a window. Three (3) generators, one (1) power room and Barry\'s man. The subway signals, the traffic lights, the hospitals, the stock exchange and the hot dog carts.',
    finding: 'EVERY TRAFFIC LIGHT IN MANHATTAN WAS GREEN AT ONCE, AND TRAFFIC MOVED FOR THE FIRST TIME IN THE CITY\'S HISTORY. THE STOCK EXCHANGE CLOSED BEFORE ANYBODY COULD SELL. THE TENANTS WHO THREW APPLIANCES AT A FEDERAL ASSET HAVE BEEN EVICTED, VERTICALLY. SUCCESS.',
    handler: 'Asset asked to "try the stuff Barry was on." Request denied. Asset had already tried it, on floor 58, on the way up, straight out of a tank. Asset has not blinked in two days.',
    remains: {
      weakness: 'Overdosed so hard he glowed, twitching and foaming on the floor long after his heart gave up. The asset urinated on him. He twitched once more. It is unclear who won.',
      normal: 'Went down like a tripped breaker: all at once, and all of him. Found in the dark, by touch, in one piece, by a cleanup crew that had been braced for worse and was frankly relieved.',
    },
  },
  'Oily Oscar': {
    aftermath: 'The asset crossed the field through the slick and the tar, filled the union break room with gas while the union was still on break in it and lit it. Then he took a chopper and a machine gun off a biker called Dirty Dan and wrecked every vehicle that came after him, ran the bike into the two men on their smoke break at the field office, and did to the bikers\' bar what he\'d done to the break room. Then he went to find Oscar.',
    collateral: 'The field\'s rangers, deputies, bikers, armadillos, longhorns and grackles. One (1) union break room, with the union in it. One (1) chopper and one (1) machine gun, the property of Dirty Dan. Every pickup, cruiser and chopper of the Angry Mob, each now at the top of a derrick. Two (2) smokers. The Broken Spoke and every biker in it. The field, still burning.',
    finding: 'THE UNION IS NO LONGER ON BREAK. THE BIKER GANG IS NO LONGER A REGIONAL CONCERN. WITH A FIELD ON FIRE, OIL PRICES ARE UP 40%, AND THE DERRICKS HAVE BEEN LISTED AS A STRATEGIC VEHICLE RESERVE. SUCCESS.',
    handler: 'Asset never got his refund. Asset took it out of Oscar\'s wallet, Oscar\'s watch and, disturbingly, Oscar\'s teeth. Asset has asked to keep the machine gun. Asset threw the machine gun away when it was empty. Asset has asked us to find it.',
    remains: {
      weakness: 'Fried inside his flame-retardant suit until the two fused into one continuous charred piece, like a grilled cheese left on the stove. The asset urinated on him. He sizzled.',
      normal: 'Toppled over in the dirt like a derrick in a storm and lay there leaking. In one piece, which is more than can be said for his oil field. The rangers drew a chalk outline. It took two boxes of chalk.',
    },
  },
  'Drug Trade Dale': {
    aftermath: 'The asset fell out of the sky onto Dale\'s crew in the desert and was mistaken for the feds, which was close enough. He went through the cartel warehouse and its distributor, down Dale\'s convoy one semi at a time while they blew up behind him, and up the main street of Deadwood Gulch. The third hitman, a ninja up the church tower, missed him so many times he killed himself out of shame. The second, Riggs, came back from the dead in the last truck and took the tourists and the jail with him. Dale was signed for at his pharmacy.',
    collateral: 'The desert\'s rattlesnakes, scorpions, coyotes and hawks. The cartel warehouse, its staff and Chuco, its distributor. Three (3) semis and their crews, blown up on the interstate. One (1) curio shop. One (1) ninja, by his own hand. Every tourist on Main Street and one (1) man locked in the jail for a photo, all by Riggs. Riggs.',
    finding: 'THE CARTEL\'S DISTRIBUTION NETWORK HAS BEEN DISMANTLED, MOSTLY ACROSS AN INTERSTATE. THE NINJA TOOK HIS OWN LIFE, SAVING THE TAXPAYER A TRIAL. THE TOURISTS WERE RUN DOWN BY A CARTEL EMPLOYEE AND COUNT TOWARD THE WAR ON DRUGS AS CARTEL CASUALTIES. WE ARE WINNING. SUCCESS.',
    handler: 'Asset has the DALE\'S DRUGS sign. Asset thinks he "is Dale now." Somebody had to feed Sir Reginald, and the asset volunteered. We did not know what Sir Reginald was. We know now. We wish we did not.',
    remains: {
      weakness: 'Dissolved in a puddle of the asset\'s barf until only half a skull and a belt buckle remained. The asset urinated in the puddle. The puddle is now a controlled substance.',
      normal: 'Fell over in front of his own pharmacy and stayed down, in one piece, for once the only package on the premises nobody had cut. Somebody signed for him. He was delivered to the county morgue on time, which was a first.',
    },
  },
};
