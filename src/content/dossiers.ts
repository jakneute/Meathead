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
  disposal: string;
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
    disposal: 'Thaw him like a Costco chicken left in the sink. Then shatter whatever is left.',
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
    disposal: 'Steam him like a dumpling. DO NOT PLUG HIS VENTS WITH ROCKS. PLUG ALL THREE ONCE HE\'S HALF-COOKED AND THE WHOLE MOUNTAIN GOES, WITH BOTH OF YOU IN IT. THE LAST GUY LANDED ON A NEWS CHOPPER.',
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
    disposal: 'Knock him on his ass mid-stride. He\'ll break a hip. Do not help him up.',
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
    disposal: 'Let his own storm drag something enormous into his face. Film it. Send it to Channel 7.',
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
    disposal: 'Plug him up like a backed-up toilet and flush. DO NOT, UNDER ANY CIRCUMSTANCES, SET AN OILED SUBJECT ON FIRE. WE MEAN IT. THE PAPERWORK ALONE.',
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
    disposal: 'Push him over the edge. Keep pushing. Stop when he\'s talking to the ceiling.',
    handler: 'Asset believes Barry "stole his headphones." Barry has never met the asset. The man on the radio told him so. We do not know who the man on the radio is, and he keeps calling us "folks."',
  },
  'Oily Oscar': {
    realName: 'OSCAR "SLICK" BERTRAND III',
    age: '58',
    occupation: 'Oil man, used car salesman, motivational speaker. Nobody knows which came first.',
    threat: 'SEVERE (FLAMMABLE, PERSUASIVE, UNIONIZED)',
    mission: 'A frictionless world. Oil everything, so nobody ever gets stuck again: in traffic, in debt, in life.',
    reality: 'The field outside Houston is a swamp of slick and tar. The union is on permanent break. The site security is a biker gang and two Texas Rangers he pays in crude. Somebody is always smoking under the NO SMOKING sign.',
    background: 'Believes friction is the root of all human suffering and that the cure comes by the barrel. Greased the streets, the stairs and the city council. Hired the Hell\'s Angels as security because they "understand lubrication," and lets them run a bar on site, which is mostly gas lines and beer. Wears a flame-retardant suit "for insurance purposes" and sells it as a lifestyle. Chain-smokes in an oil field on principle. Will try to sell you something mid-fight. Do not buy it. It\'s oil.',
    intel: 'Fire does nothing to him, so save your eyebrows. He\'s a walking puddle of conductive grease: get a current into him and DON\'T LET GO. And that cigarette he keeps lighting is a spark looking for a friend.',
    disposal: 'Electrocute him until his fillings sing. Leave him face-down in his own product.',
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
    disposal: 'Hose him down with something foul and let his own delivery arrive. Sign for it on his behalf.',
    handler: 'Asset has been told Dale "keeps parking in his spot." Asset does not have a car. Or a spot. Dale saw the asset fall out of the sky and assumed it was the feds. We have no idea what the asset was falling out of.',
  },
};

/**
 * The after-action file on a terminated boss: what happened once he was gone.
 * The same whether or not he went down to his weakness. Every entry reads as if
 * the operation made things worse, and every entry is signed off as a success.
 */
export interface Aftermath {
  /** What happened after he died, in crude detail. */
  aftermath: string;
  collateral: string;
  /** The government's verdict: completely, utterly justified. */
  finding: string;
  /** The handler's post-op note on the asset. */
  handler: string;
  /** What became of the body: after a weakness kill (the wrecked corpse he left, pissed on), or a plain one. */
  remains: { weakness: string; normal: string };
}

export const AFTERMATHS: Record<string, Aftermath> = {
  'Artie Avalanche': {
    aftermath: 'With the subject gone, his cryo-vault, left unsupervised, thawed in one afternoon. Anchorage recorded its first flash flood, its first mudslide and, briefly, its first "meat slush." The avalanche is still being dug out. The moose has been stuffed and mounted in the tram station. It has already been voted the town\'s most popular attraction.',
    collateral: 'One (1) aerial tram. One (1) moose. One (1) ranger cabin, flattened. One (1) skier, last seen leaving the summit in a direction skiers do not go. Regional glacier loss is up 300%.',
    finding: 'GLACIERS ARE NOT A MATTER OF NATIONAL SECURITY. MR. LINDQVIST WAS. SUCCESS.',
    handler: 'Asset came back wearing the moon boots and the skier\'s skis. Asset says they "fell off the guy." We did not ask which guy.',
    remains: {
      weakness: 'Thawed where he stood. What was left slumped into a puddle of pink slush with a few organs bobbing in it like ice cubes in a bad drink. The asset urinated in it. Forensics are calling it a cocktail.',
      normal: 'Burst like a frozen water main. Pieces were recovered from three separate rooms and one ceiling fan. The moon boots were intact. The feet inside them were not.',
    },
  },
  'Victor Volcano': {
    aftermath: 'With nobody left to stir it, the magma chamber settled into a steady ooze. Club Caldera is closed until further notice. The VIP lounge is now, technically, part of the volcano, and so is everyone who was on the guest list.',
    collateral: 'One (1) nightclub. One (1) doorman. The entire VIP list, including two (2) state senators and a DJ nobody will miss. The Hilo power grid, which it turns out ran entirely off his drill. The island has no electricity and a brand new beach made of glass.',
    finding: 'ENERGY INDEPENDENCE WAS NEVER THE GOAL. THE ISLAND IS QUIET. THE ISLAND IS COMPLIANT. SUCCESS.',
    handler: 'Asset asked if he is "Victor\'s spiritual equal now." We said yes. He cried. He has also asked to be put on the list at Club Caldera. There is no longer a list, or a Club Caldera.',
    remains: {
      weakness: 'Flash-cooled by a wall of seawater and set solid, mid-scream, into a steaming lump of volcanic rock. The asset urinated on it. It hissed. Tourists now pay to take photos with it.',
      normal: 'Ruptured like an overfilled protein shaker. Most of him ended up on the ceiling of his own lair, where it continues to sizzle. The rest was mopped up by a very brave intern.',
    },
  },
  'Ernie Earthquake': {
    aftermath: 'Subject went down hard and stayed down. With nobody loosening the fault on a schedule, the pressure has nowhere to go. Seismologists now call the next quake "a when, not an if, and the when is soon." Alcatraz has suspended its guided tours, for reasons unrelated to the earthquake.',
    collateral: 'The Golden Gate Bridge, most of it. One (1) jet ski, delivered through a skylight. One (1) guided tour of the cell house, all of it. The hipster who owned the jet ski is suing us. His invoices have since been paid in full, to his estate, by the city, out of guilt.',
    finding: 'UNSCHEDULED EARTHQUAKES ARE ACTS OF GOD. SCHEDULED EARTHQUAKES ARE TERRORISM. THE DISTINCTION MATTERS TO US. SUCCESS.',
    handler: 'Asset kept one of the rocks. Asset named it "Ernie." Asset talks to it. It is the best listener on the team.',
    remains: {
      weakness: 'Frozen stiff mid-stride and shattered into cold chunks that skittered across the floor like dropped dice. The asset urinated on the biggest piece. It refused to melt, out of spite.',
      normal: 'Came apart at the hips first, then everywhere else. The remains were collected in a single shoebox. He would have mailed the city an invoice for the shoebox.',
    },
  },
  'Hector Hurricane': {
    aftermath: 'The Eye went first, and the storm went with it. Everything it had been holding came down at once, on a daycare. The kids were fine. The kids want to do it again. Hector\'s last forecast aired on Channel 7 that night, prerecorded: sunny and 75. For once, he was right.',
    collateral: 'Miami Beach. A strip of motels, now a strip of rubble. One (1) boat, stolen. One (1) daycare, flattened (no children harmed; two (2) staff members who tried to run). Every scooter in Dade County.',
    finding: 'THE STORM WAS AN ACCEPTABLE LOSS. MR. DELGADO\'S FORECASTS WERE NOT. CHANNEL 7 HAS ISSUED A CORRECTION. SUCCESS.',
    handler: 'Asset fell out of a hurricane onto a daycare and "didn\'t notice." We have hosed down the asset four times. The daycare, nine.',
    remains: {
      weakness: 'Flattened by a boulder his own storm dragged into his face. Scraped up with a snow shovel and folded twice to fit the bag. The asset urinated on him. The storm drain took the rest.',
      normal: 'Torn apart and scattered by his own wind. Parts of him were reported in three counties. Channel 7 ran it as the weather.',
    },
  },
  'Toxic Tommy': {
    aftermath: 'With the "filter" gone, Flint\'s water has returned to its natural state. Officials say it now tastes "less like a man." The thing in the cistern is gone too. The East Side is at rest. Nobody in city government will say what that means, and every one of them sleeps better for it.',
    collateral: 'One (1) water tower, now lying across the house it landed on. One (1) bicycle, the property of a local youth, who would like it back. Three (3) miles of sewer main, permanently clogged with Tommy. The water is still not safe. It is, however, no longer being vomited.',
    finding: 'THE WATER WAS NEVER OUR PROBLEM. A CIVILIAN FIXING IT WITHOUT A PERMIT WAS. SUCCESS.',
    handler: 'Asset drank from the sewer "one last time, for Tommy." Asset was hospitalized. Asset says it was worth it. His doctors disagree. The local youth has been compensated with a new bike. The asset took that one too.',
    remains: {
      weakness: 'Clogged with crude, blown open and left floating face-down in the sludge like a greased pool toy. The asset urinated into the pool. Nobody could tell the difference.',
      normal: 'Burst in the sewer and was absorbed into it. For all practical purposes he is still down there. The water tastes slightly more like Tommy.',
    },
  },
  'Blackout Barry': {
    aftermath: 'Subject spent his final moments describing the stars to a ceiling fan. With the power room gone, the city stayed dark for a week, and on the third night the smog lifted. Eight million people looked up. Barry was right. Nobody will ever tell him.',
    collateral: 'Three (3) generators, one (1) power room and the man on the headset. Every train on the A line, still going, to Far Rockaway. Every traffic light in Manhattan, green, at once. The R&D floor has "no comment" and has asked for the body.',
    finding: 'THE PUBLIC DOES NOT NEED TO SEE THE STARS. THE PUBLIC NEEDS TO SEE THE BILLBOARDS. POWER RESTORED. SUCCESS.',
    handler: 'Asset asked to "try the stuff Barry was on." Request denied. Asset had already tried it, on the R&D floor, on the way up. Asset has not blinked in two days.',
    remains: {
      weakness: 'Overdosed so hard he glowed, twitching and foaming on the floor long after his heart gave up. The asset urinated on him. He twitched once more. It is unclear who won.',
      normal: 'Popped like a fuse box. The remains were located in the dark, by touch, by a cleanup crew that has since requested counseling.',
    },
  },
  'Oily Oscar': {
    aftermath: 'With nobody greasing it, the field seized up in a day and then burned for three more. The union has filed a grievance over the break room. The Hell\'s Angels have not filed anything, because there are no Hell\'s Angels left in Texas.',
    collateral: 'One (1) union break room, with the union in it. One (1) chopper, one (1) machine gun, property of a "Dirty Dan." Every pickup, cruiser and motorcycle within fifty miles, each now at the top of a derrick. One (1) biker bar, the Broken Spoke, redecorated. The field.',
    finding: 'OIL IS A STRATEGIC NATIONAL RESOURCE. GIVING IT AWAY IS NOT. PRICES RESTORED. SUCCESS.',
    handler: 'Asset never got his refund. Asset took it out of Oscar\'s wallet, Oscar\'s watch and, disturbingly, Oscar\'s teeth. Asset has asked to keep the machine gun. Asset threw the machine gun away when it was empty. Asset has asked us to find it.',
    remains: {
      weakness: 'Fried inside his flame-retardant suit until the two fused into one continuous charred piece, like a grilled cheese left on the stove. The asset urinated on him. He sizzled.',
      normal: 'Burst open across his own oil field, where he was indistinguishable from the product. He was accidentally refined. Some of him is in your car.',
    },
  },
  'Drug Trade Dale': {
    aftermath: 'Subject was signed for, in full, on his own behalf. The warehouse has been seized, the convoy is scattered over forty miles of interstate and Deadwood Gulch has been renamed Deadwood Gulch Memorial. Albuquerque\'s pharmacies have resumed turning people away at the counter. Order has been restored.',
    collateral: 'One (1) cartel warehouse. Four (4) semis, all of which blew. One (1) gift shop. One (1) church tower. One (1) jail, with Riggs in it. Every tourist on Main Street, mostly Riggs\'s doing. The nation\'s supply of generic insulin, which was in the truck. One (1) laminated DALE\'S DRUGS sign, now hanging in the asset\'s bunk.',
    finding: 'AFFORDABLE MEDICINE WAS NEVER AUTHORIZED. UNAUTHORIZED KINDNESS IS STILL A CRIME. SUCCESS.',
    handler: 'Asset has the sign. Asset thinks he "is Dale now." Somebody has to feed Sir Reginald; the asset has volunteered. We did not know what Sir Reginald was. We know now. We wish we did not.',
    remains: {
      weakness: 'Dissolved in a puddle of the asset\'s barf until only half a skull and a belt buckle remained. The asset urinated in the puddle. The puddle is now a controlled substance.',
      normal: 'Scattered along his own delivery route. Some of him was signed for. Some of him is still out for delivery.',
    },
  },
};
