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
    mission: 'Save the glaciers. Save the polar bears. Refreeze the planet one hostile snowbank at a time.',
    reality: 'Froze a daycare, a Wendy\'s and the entire Anchorage municipal bus fleet. The polar bears have filed a complaint.',
    background: 'Spent twenty years measuring glaciers while they melted in front of him. Nobody listened. Published 400 papers. Nobody read them. One day he stopped writing papers and started building a cryo-vault under the city, and suddenly everybody was listening. He sincerely believes that if he can make Alaska cold enough, the rest of the world will follow his example. It will not. It will just be cold, and angry about it.',
    intel: 'Thin-skinned in every sense. A man made of freezer burn cannot stand open flame. Put some on him and he jumps clean across the room, and he lands hard enough to shake his own ceiling loose.',
    disposal: 'Thaw him like a Costco chicken left in the sink. Then shatter whatever is left.',
    handler: 'Asset was told Artie "looked at his protein shake funny." That was sufficient. Asset has since asked if he can keep the moon boots.',
  },
  'Victor Volcano': {
    realName: 'VICTOR KALANI-MORGENSTERN',
    age: '38',
    occupation: 'Geothermal energy evangelist. Hot yoga instructor. Juices daily. Juices other things daily.',
    threat: 'CRITICAL (LAVA, ROID RAGE, WELLNESS ADVICE)',
    mission: 'Free, clean, renewable power for every island home, straight from the earth\'s core.',
    reality: 'Drilled into an active magma chamber under a resort. The resort is now a lava lamp. The guests are now part of the resort.',
    background: 'Moved to Hilo to "reconnect with the planet\'s heartbeat." Found it. Put a hole in it. Believes the island\'s power company has been hoarding the volcano for profit, which is, technically, not how volcanoes work. Has been steroid-cycling for eleven years in pursuit of "geological levels of mass." Considers himself Meathead\'s spiritual equal. This is the most offensive thing in his file.',
    intel: 'He\'s all pressure and no release valve. Anything that hot really, really hates water. Not a squirt gun. A wall of it.',
    disposal: 'Steam him like a dumpling. DO NOT PLUG HIS VENTS WITH ROCKS. PLUG ALL THREE ONCE HE\'S HALF-COOKED AND THE WHOLE MOUNTAIN GOES, WITH BOTH OF YOU IN IT. THE LAST GUY LANDED ON A NEWS CHOPPER.',
    handler: 'Asset was informed that Victor "skips leg day." Asset did not wait for the rest of the briefing. We have since stopped finishing briefings.',
  },
  'Ernie Earthquake': {
    realName: 'ERNEST T. BUCKLEY',
    age: '71',
    occupation: 'Retired seismologist. Professional grump. Has opinions about your lawn.',
    threat: 'HIGH (TECTONIC, CRANKY)',
    mission: 'Set off "The Big One" early, on a Tuesday, during business hours, so everyone is ready for it. Rip the band-aid off.',
    reality: 'Ripped off the band-aid, the arm and most of the Marina District.',
    background: 'Spent fifty years predicting California\'s next great earthquake and got tired of waiting for it. Figured a controlled disaster beats a surprise disaster, and got to work throwing boulders at the fault line to "loosen it up." Honestly thinks he is doing a public service. Mails the city an itemised invoice after every quake. Nobody has paid him. This has made him worse.',
    intel: 'Old man, bad circulation, worse hips. A cold snap locks his joints solid, but only when it catches him mid-stride or mid-hop. Standing still, he just shivers and swears.',
    disposal: 'Knock him on his ass mid-stride. He\'ll break a hip. Do not help him up.',
    handler: 'Asset believes he is "helping an old man move rocks." Asset has not asked why the old man keeps dying. Asset does not ask things.',
  },
  'Hector Hurricane': {
    realName: 'HECTOR "THE DOPPLER" DELGADO',
    age: '52',
    occupation: 'Disgraced Channel 7 weatherman. Owns forty-one windbreakers.',
    threat: 'SEVERE (CATEGORY 5, CATEGORY SMUG)',
    mission: 'Pressure-wash Miami clean. Of crime, of sin, of scooters. Nature\'s way.',
    reality: 'The storm drains backed up in week one. That is not mud flying around in there.',
    background: 'Was fired live on air for forecasting "sunny and 75" during a named storm. Decided the only way to never be wrong again was to make the weather himself. Now controls a stationary hurricane from inside a wind tunnel and genuinely believes a good hard rinse is exactly what this city needs. Doesn\'t understand why everyone keeps screaming. Keeps giving the forecast anyway. It is always his hurricane.',
    intel: 'His storm pulls everything toward him. EVERYTHING. Lawn chairs, stray dogs, anything big, round and heavy you roll his way. He never checks what\'s coming. Think about it.',
    disposal: 'Let his own storm drag something enormous into his face. Film it. Send it to Channel 7.',
    handler: 'Asset was told Hector predicted "a bad forecast for his gains." Asset put on his angry shorts. We don\'t know where he keeps getting the shorts.',
  },
  'Toxic Tommy': {
    realName: 'THOMAS "TOMMY" PRZYBYLSKI',
    age: '33 (APPROX. SEWAGE HAS AGED HIM)',
    occupation: 'Former municipal water quality inspector. Now lives in the pipes. Is, in a sense, the pipes.',
    threat: 'CRITICAL (BIOHAZARD, BAD BREATH)',
    mission: 'Filter every drop of Flint\'s water through his own body until it runs clean. He is the filtration system now.',
    reality: 'He is not a filtration system. He is a man vomiting in a sewer. The water is worse.',
    background: 'Told the city the water was safe, then drank it on live TV to prove it. It was not safe. Something happened to him down there, and now Tommy genuinely believes he can drink the town\'s poison and puke it back out purified. Surfaces under your feet to "check your water pressure." Waves at the kids from the storm grates. The kids do not wave back.',
    intel: 'He filters water, not crude. A face full of heavy oil clogs his whole system like a hairball in a drain and pops him right up out of the muck, gasping.',
    disposal: 'Plug him up like a backed-up toilet and flush. DO NOT, UNDER ANY CIRCUMSTANCES, SET AN OILED SUBJECT ON FIRE. WE MEAN IT. THE PAPERWORK ALONE.',
    handler: 'Asset was told Tommy "called protein powder a scam." Asset has asked twice whether he can drink the sewer water "for the minerals." Request denied. Asset drank it anyway.',
  },
  'Blackout Barry': {
    realName: 'BARRINGTON "BARRY" WEISS',
    age: '47',
    occupation: 'Power grid engineer. Amateur astronomer. Professional user.',
    threat: 'HIGH (ELECTRICAL, CHEMICAL, EXISTENTIAL)',
    mission: 'Turn off New York\'s lights so eight million people can look up and see the stars again.',
    reality: 'Eight million people looked up, tripped over things in the dark and started looting. Nobody saw a single star. It\'s New York. There\'s smog.',
    background: 'Grew up in the Bronx without ever seeing the Milky Way and never got over it. Took a job at the power company specifically to get his hands on the big switch. Rolling blackouts every night now, "for everyone\'s wonder." Handles the stress with an increasingly creative pharmaceutical routine and, at this point, a startling tolerance. Sincerely thinks he\'s giving the city a gift. The city thinks he\'s a lunatic in a hard hat. Both are right.',
    intel: 'Subject self-medicates heavily and keeps count. He can take three more doses. The fourth sends him clean over the limit. Afterwards he builds a tolerance, so pace yourself.',
    disposal: 'Push him over the edge. Keep pushing. Stop when he\'s talking to the ceiling.',
    handler: 'Asset believes Barry "stole his headphones." Barry has never met the asset. Asset remains confident.',
  },
  'Oily Oscar': {
    realName: 'OSCAR "SLICK" BERTRAND III',
    age: '58',
    occupation: 'Oil executive, used car salesman, motivational speaker. Nobody knows which came first.',
    threat: 'SEVERE (FLAMMABLE, PERSUASIVE)',
    mission: 'A frictionless world. Oil everything, so nobody ever gets stuck again: in traffic, in debt, in life.',
    reality: 'Everybody in Houston is stuck. On the floor. Slipping. Covered in crude. And now there\'s a guy flicking cigarettes at them.',
    background: 'Believes friction is the root of all human suffering and that the cure comes by the barrel. Greased the streets, the stairs and the city council. Wears a flame-retardant suit "for insurance purposes" and sells it as a lifestyle. Chain-smokes in a refinery on principle. Will try to sell you something mid-fight. Do not buy it. It\'s oil.',
    intel: 'Fire does nothing to him, so save your eyebrows. He\'s a walking puddle of conductive grease: get a current into him and DON\'T LET GO. And that cigarette he keeps lighting is a spark looking for a friend.',
    disposal: 'Electrocute him until his fillings sing. Leave him face-down in his own product.',
    handler: 'Asset was told Oscar "sells counterfeit creatine." This is actually true. Asset has requested a refund. From Oscar. Mid-fight.',
  },
  'Drug Trade Dale': {
    realName: 'DALE P. HENDRICKS, PHARM.D.',
    age: '49',
    occupation: 'Former pharmacist (license revoked). Current delivery driver of "everything, for everyone, free."',
    threat: 'HIGH (NARCOTIC, VEHICULAR)',
    mission: 'Affordable medicine for all. No insurance, no prescriptions, no waiting. Just a truck full of love.',
    reality: 'It is not love. It is meth, speed and whatever fell off the shelf. The truck has no brakes. The truck has never had brakes.',
    background: 'Watched one too many customers turned away at his counter and snapped. Loaded his pharmacy into a box truck and started "delivering care" across the desert, at speed, through storefronts. Stays in one spot and has the truck come to him. Microdoses his own inventory to "stay relatable." Keeps a laminated sign that reads DALE\'S DRUGS on the side of the truck, and is prouder of that sign than of anything else in his life.',
    intel: 'Plants himself and never moves, so anything foul you spray at him pools under his feet and he marinates in it. A puddle of the same in the truck\'s path, early, does very funny things to tires.',
    disposal: 'Hose him down with something foul and let his own delivery arrive. Sign for it on his behalf.',
    handler: 'Asset has been told Dale "keeps parking in his spot." Asset does not have a car. Or a spot. Asset is very upset about the spot.',
  },
};
