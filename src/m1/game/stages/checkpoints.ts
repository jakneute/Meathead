// Every stage's checkpoints by name, in order: for the skip-level cheat's picker (start anywhere in a stage, or at the boss).

import { CP as ARTIE } from './artie/course';
import { CP as VICTOR } from './victor/course';
import { CP as ERNIE } from './ernie/course';
import { CP as HECTOR } from './hector/course';
import { CP as TOMMY } from './tommy/course';
import { CP as BARRY } from './barry/course';
import { CP as OSCAR } from './oscar/course';
import { CP as DALE } from './dale/course';

const BY_STAGE: Record<string, Record<string, number>> = {
  'Artie Avalanche': ARTIE, 'Victor Volcano': VICTOR, 'Ernie Earthquake': ERNIE, 'Hector Hurricane': HECTOR,
  'Toxic Tommy': TOMMY, 'Blackout Barry': BARRY, 'Oily Oscar': OSCAR, 'Drug Trade Dale': DALE,
};

/** What each checkpoint's called in the picker (in words, where its code name doesn't say enough on its own). */
const LABELS: Record<string, Record<string, string>> = {
  'Artie Avalanche': { TRAILHEAD: 'THE TRAILHEAD', STATION: 'THE TRAM STATION', TOP: 'THE SUMMIT', CLEARING: 'THE CLEARING', AFTER_MOOSE: 'AFTER THE MOOSE', CAVE: 'THE ICE CAVE', SKI: 'THE SKI RUN' },
  'Victor Volcano': { TRAIL: 'THE TRAIL', BOMBS: 'THE LAVA BOMBS', CLUB: 'OUTSIDE THE CLUB', RIVER: 'THE LAVA RIVER', RIVER_MID: 'THE LAVA RIVER (HALFWAY)', SHAFT: 'THE SHAFT', FLOOR: 'THE DANCE FLOOR', ATRIUM: 'THE ATRIUM', LOUNGE: 'THE VIP LOUNGE' },
  'Ernie Earthquake': { STREETS: 'THE STREETS', QUAKES: 'THE QUAKES', BRIDGE: 'THE BRIDGE', DOCK: 'THE DOCK', SKI: 'THE JET SKI', ALCATRAZ: 'ALCATRAZ', YARD: 'THE PRISON YARD', CITADEL: 'THE CITADEL' },
  'Hector Hurricane': { BEACH: 'THE BEACH', STORM: 'THE STORM', MOTEL: 'THE MOTEL', MARINA: 'THE MARINA', CHASE: 'THE COAST GUARD CHASE', TOWER: 'THE STORM TOWER', EYE: 'THE EYE' },
  'Toxic Tommy': { HOOD: 'THE HOOD', BLOCK: 'THE BLOCK', ROAD: 'THE BIKE RIDE', ROAD_MID: 'THE BIKE RIDE (HALFWAY)', SEWER: 'THE SEWER', SUIT: 'THE HAZMAT SUIT', CLIMB: 'THE FLOODGATE', SUIT2: 'THE HAZMAT SUIT (FURTHER IN)', CISTERN: 'THE CISTERN', RUINS: 'THE RUINS' },
  'Blackout Barry': { STREET: 'THE STREET', AVENUE: 'THE AVENUE', LOBBY: 'THE LOBBY', OFFICE: 'FLOOR 23', MAINTENANCE: 'FLOOR 41', LAB: 'FLOOR 58 (THE LAB)', ROOFS: 'THE ROOFTOPS', CLIMB: 'THE WALK-UPS', CLIMB2: 'THE WALK-UPS (HIGHER)', POWER: 'THE POWER ROOM' },
  'Oily Oscar': { FIELD: 'THE OIL FIELD', FIELD_MID: 'THE OIL FIELD (HALFWAY)', FIELD_MID2: 'THE OIL FIELD (FURTHER ON)', BUNKER: 'THE BREAK ROOM', YARD: 'THE YARD', CHASE: 'THE CHASE', END: 'THE FIELD OFFICE', END_MID: 'THE VENTS', BAR: "THE BIKERS' BAR" },
  'Drug Trade Dale': { LANDING: 'THE LANDING', DUNES: 'THE DESERT', WAREHOUSE: 'THE WAREHOUSE', OFFICE: "CHUCO'S OFFICE", HIGHWAY: 'THE CONVOY (TRUCK 1)', TRUCK2: 'TRUCK 2', TRUCK3: 'TRUCK 3', TRUCK4: 'TRUCK 4', TOWN: 'DEADWOOD GULCH', ROOFTOPS: 'THE ROOFTOPS', JAIL: "RIGGS'S SECOND WIND" },
};

/** Ones left off the picker: the stretch right outside the boss's door (THE BOSS covers it), or the boss himself. */
const HIDDEN: Record<string, string[]> = {
  'Artie Avalanche': ['DOOR'], 'Ernie Earthquake': ['DOOR'], 'Hector Hurricane': ['DOOR'], 'Blackout Barry': ['LANDING'], 'Oily Oscar': ['BOSS'],
};

/** A stage's checkpoints, first to last: their names (as words) and numbers. */
export const stageCheckpoints = (stageId: string): { name: string; cp: number }[] =>
  Object.entries(BY_STAGE[stageId] ?? { START: 0 })
    .filter(([k]) => !HIDDEN[stageId]?.includes(k))
    .map(([k, cp]) => ({ name: LABELS[stageId]?.[k] ?? k.replace(/_/g, ' '), cp }))
    .sort((a, b) => a.cp - b.cp);
