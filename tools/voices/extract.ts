// Finds every line anybody says in the game, and who says it, for the voice recordings (see README.md here).
//
// Two sources:
//   - the dialogue tables (content/dialogue.ts): Meathead's kill, hurt and death lines, the bosses' taunts and
//     reactions, read straight out of the module;
//   - the code: every say()/speak()/sayModulated() call, every { who, text } line in a stage's script, every
//     cutscene panel ({ voice, text }), and the helpers the stages wrap those in, read out of the syntax tree.
//     A line's text is followed back to where it comes from: a string, a pick from a list, a parameter (to every
//     call that passes it), a const in the file.
//
// Meathead 2's lines are recorded from its voice tables (each land's voices.ts, the intro's, the gym's: read above);
// its code is read the same way, caller by caller through its helpers and across files, only to check that everything
// it says is in a table in the voice it's said in (and isn't weeded out by m2/lines/consistency.ts). Anything that isn't
// is listed as "unrecorded" / "weeded out" in unresolved.txt: those lines play with no voice.
//
// Writes tools/voices/manifest.json: [{ voice, text, from }], and lists anything it couldn't pin down (unresolved.txt).

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as dialogue from '../../src/m1/content/dialogue';
import * as deaths from '../../src/m1/content/deaths';
import { GRAB_CALLOUTS } from '../../src/m2/moves/callouts';
import { FOR_A_WOMAN, FOR_AN_ANIMAL } from '../../src/m1/content/gender';
import { M2_KILL_LINES } from '../../src/m2/moves/killLines';
import { FULL_BAG_LINES, EMPTY_BAG_LINES, BULK_LINES, BULK_FAIL_LINES, DUCK_LINES, TOO_BIG_LINES, TOO_BIG_BY_KIND, GRAB_IMMUNE_LINES } from '../../src/m2/lines/weaponLines';
import { M2_GUT_LINES, M2_GUT_DEATH } from '../../src/m2/lines/gutLines';
import * as introLines from '../../src/m2/intro/lines';
import { ADV_VOICE_LINES } from '../../src/m2/adventure/voices';
import { SPOOKY_VOICE_LINES } from '../../src/m2/spooky/voices';
import { SPACE_VOICE_LINES } from '../../src/m2/space/voices';
import { HOLLYWOOD_VOICE_LINES } from '../../src/m2/hollywood/voices';
import { FOREIGN_VOICE_LINES } from '../../src/m2/foreign/voices';
import { FRONTIER_VOICE_LINES } from '../../src/m2/frontier/voices';
import { FANTASY_VOICE_LINES } from '../../src/m2/fantasy/voices';
import { CARTOON_VOICE_LINES } from '../../src/m2/cartoon/voices';
import { VOICE_LINES as GYM_VOICE_LINES } from '../../src/m2/intro/gym/lines';
import { AMERICA_DENY } from '../../src/m2/lines/hubLines';
import { fitsHappyLand } from '../../src/m2/lines/consistency';

const ROOT = path.resolve(__dirname, '../../src');
const out = new Map<string, { voice: string; text: string; from: string }>();
const unresolved: string[] = [];

const add = (voice: string, text: string, from: string) => {
  // (the death screen's line breaks are read as spaces)
  const t = (voice === 'death' ? text.replace(/\s*\n\s*/g, ' ') : text).trim();
  if (!t || !/[A-Za-z]/.test(t)) return;
  const key = `${voice}|${t}`;
  if (!out.has(key)) out.set(key, { voice, text: t, from });
};

// ---------------------------------------------------------------------------------------------------------------
// The tables

const BOSS_ID: Record<string, string> = {
  'Artie Avalanche': 'boss.artie', 'Victor Volcano': 'boss.victor', 'Ernie Earthquake': 'boss.ernie', 'Hector Hurricane': 'boss.hector',
  'Toxic Tommy': 'boss.tommy', 'Blackout Barry': 'boss.barry', 'Oily Oscar': 'boss.oscar', 'Drug Trade Dale': 'boss.dale',
  'Imposter Invasion': 'boss.alien',
};
const allStrings = (v: unknown): string[] => typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(allStrings) : v && typeof v === 'object' ? Object.values(v).flatMap(allStrings) : [];

for (const t of allStrings(dialogue.VULGARITIES)) add('meathead', t, 'VULGARITIES');
for (const t of allStrings(dialogue.KILL_LINES)) add('meathead', t, 'KILL_LINES');
for (const t of allStrings(dialogue.ENEMY_KILL_LINES)) add('meathead', t, 'ENEMY_KILL_LINES');
for (const t of allStrings(dialogue.GENERIC_KILL_LINES)) add('meathead', t, 'GENERIC_KILL_LINES');
for (const t of allStrings(dialogue.RANGE_KILL_LINES)) add('meathead', t, 'RANGE_KILL_LINES');
for (const t of allStrings(dialogue.BOSS_REBUKES)) add('meathead', t, 'BOSS_REBUKES');
for (const t of allStrings(dialogue.BOSS_DIALOGUE.HURT)) add('meathead', t, 'HURT');
for (const t of allStrings(dialogue.BOSS_DIALOGUE.SPECIFIC_HAZARD_HURT)) add('meathead', t, 'HAZARD_HURT');
for (const [boss, q] of Object.entries(dialogue.BOSS_DIALOGUE.INTRO_QUOTES)) {
  add('meathead', q[0], 'INTRO_QUOTES');
  if (BOSS_ID[boss] && q[1]) add(BOSS_ID[boss], q[1], 'INTRO_QUOTES');
}
for (const [boss, lines] of Object.entries(dialogue.BOSS_DIALOGUE.THRESHOLDS)) for (const t of allStrings(lines)) add(BOSS_ID[boss], t, 'THRESHOLDS');
for (const [boss, r] of Object.entries(dialogue.BOSS_WEAPON_REACTIONS)) if (BOSS_ID[boss]) for (const t of allStrings(r)) add(BOSS_ID[boss], t, 'REACTIONS');
for (const [boss, r] of Object.entries(dialogue.BOSS_OWN_WEAPON_LINES)) if (BOSS_ID[boss]) for (const t of allStrings(r)) add(BOSS_ID[boss], t, 'OWN_WEAPON');
for (const t of allStrings(dialogue.VICTOR_LINES)) add('boss.victor', t, 'VICTOR_LINES');
for (const [boss, r] of Object.entries(dialogue.BOSS_SHAT_LINES)) if (BOSS_ID[boss]) for (const t of allStrings(r)) add(BOSS_ID[boss], t, 'SHAT');
for (const t of allStrings(dialogue.GUT_LINES)) add('meathead', t, 'GUT');
// The announcer calling the finale's alien going, however he went
for (const c of Object.values(dialogue.ALIEN_DEATH_CALLOUTS)) add('announcer', c.text, 'ALIEN_DEATH_CALLOUTS');
for (const t of Object.values(dialogue.DOOR_KICK_LINES)) add('meathead', t, 'DOOR_KICK');
for (const t of allStrings(dialogue.DALE_LINES)) add('boss.dale', t, 'DALE_LINES');
for (const t of allStrings(dialogue.BARRY_LINES)) add('boss.barry', t, 'BARRY_LINES');
// The finale: the alien (his begging answered by Meathead, both ways), the Secret Service's radio, Meathead's guns running dry
for (const [k, v] of Object.entries(dialogue.ALIEN_LINES)) if (k !== 'PLEAS') for (const t of allStrings(v)) add('boss.alien', t, 'ALIEN_LINES');
for (const p of dialogue.ALIEN_LINES.PLEAS) { add('boss.alien', p.plea, 'ALIEN_LINES'); add('meathead', p.reply, 'ALIEN_LINES'); add('meathead', p.shat, 'ALIEN_LINES'); }
for (const [k, v] of Object.entries(dialogue.FINALE_LINES)) for (const t of allStrings(v)) add(k.startsWith('RADIO') ? 'finale.radio' : 'meathead', t, 'FINALE_LINES');
// (his sales talk; the _BACK tables are Meathead's answers to it)
for (const [k, v] of Object.entries(dialogue.OSCAR_LINES)) for (const t of allStrings(v)) add(k.endsWith('_BACK') ? 'meathead' : 'boss.oscar', t, 'OSCAR_LINES');
// The death announcer: the plain death screen, and the one the sewer blows up with
add('death', 'YOU DIED', 'killPlayer');
for (const t of allStrings([deaths.DEATH_LINES, deaths.BOSS_DEATH_LINES, deaths.FALL_DEATH_LINES, deaths.PLUCK_DEATH_LINES, deaths.ANIMAL_DEATH_LINES, deaths.BACKTRACK_DEATH_LINES])) add('death', t, 'content/deaths');
add('death', 'YOU SET FIRE TO AN OIL-SOAKED TOXIC WASTE MONSTER IN A METHANE-FILLED SEWER. YOU BOTH DIED.', 'SEWER_NUKE_MESSAGE');
// The daycare: the kids and the grown-ups, and all the kids' chatter in each of their voices
for (const l of dialogue.DAYCARE_LINES.cheer) add(`hector.${l.who}`, l.text, 'DAYCARE_LINES');
for (const l of [dialogue.DAYCARE_LINES.ride, dialogue.DAYCARE_LINES.again]) add(`hector.${l.who}`, l.text, 'DAYCARE_LINES');
for (let k = 0; k < 5; k++) for (const t of dialogue.DAYCARE_LINES.chatter) add(`hector.kid${k}`, t, 'DAYCARE_LINES');
for (const l of dialogue.DAYCARE_LINES.cheerShat) add(`hector.${l.who}`, l.text, 'DAYCARE_LINES');
for (let k = 0; k < 5; k++) for (const t of dialogue.DAYCARE_LINES.chatterShat) add(`hector.kid${k}`, t, 'DAYCARE_LINES');
// The announcer calls out the kill callouts
for (const c of Object.values(dialogue.KILL_CALLOUTS)) for (const t of c.lines) add('announcer', t, 'KILL_CALLOUTS');
// (and Meathead 2's grabs' own)
for (const c of Object.values(GRAB_CALLOUTS)) for (const t of c.lines) add('announcer', t, 'GRAB_CALLOUTS');
// (the other half of every line that says he or she about whoever was killed: Meathead's, the announcer's)
{
  const callouts = new Set([...Object.values(dialogue.KILL_CALLOUTS).flatMap(c => c.lines), ...Object.values(GRAB_CALLOUTS).flatMap(c => [...c.lines])]);
  for (const [m, f] of Object.entries(FOR_A_WOMAN)) add(callouts.has(m) ? 'announcer' : 'meathead', f, 'FOR_A_WOMAN');
  for (const [m, n] of Object.entries(FOR_AN_ANIMAL)) add(callouts.has(m) ? 'announcer' : 'meathead', n, 'FOR_AN_ANIMAL');
}

for (const v of Object.values(M2_KILL_LINES)) for (const t of v) add('meathead', t, 'M2_KILL_LINES');
for (const t of FULL_BAG_LINES) add('meathead', t, 'FULL_BAG_LINES');
for (const t of EMPTY_BAG_LINES) add('meathead', t, 'EMPTY_BAG_LINES');
for (const t of BULK_LINES) add('meathead', t, 'BULK_LINES');
for (const t of Object.values(BULK_FAIL_LINES).flat()) add('meathead', t, 'BULK_FAIL_LINES');
for (const t of DUCK_LINES) add('meathead', t, 'DUCK_LINES');
for (const t of [...TOO_BIG_LINES, ...Object.values(TOO_BIG_BY_KIND).flat(), ...Object.values(GRAB_IMMUNE_LINES).flat()]) add('meathead', t, 'TOO_BIG_LINES');
for (const t of Object.values(M2_GUT_LINES).flat()) add('meathead', t, 'M2_GUT_LINES');
for (const t of M2_GUT_DEATH) add('death', t, 'M2_GUT_DEATH');
// (Meathead 2's intro: who says what)
for (const t of allStrings([introLines.MEATHEAD_TICKET, introLines.MEATHEAD_PARKED, introLines.MEATHEAD_BACK_LOT, introLines.MEATHEAD_REENTRY, introLines.MEATHEAD_REENTRY_BACK])) add('meathead', t, 'INTRO');
for (const t of allStrings([introLines.TICKET_LADY, introLines.TICKET_NEXT, introLines.TICKET_ALARM, introLines.TICKET_CUT, introLines.TICKET_REENTRY])) add('m2.ticket', t, 'INTRO');
for (const t of allStrings([introLines.GUARD_ALERT, introLines.GUARD_BARK, introLines.GUARD_IDLE, introLines.GUARD_WELCOME, introLines.GUARD_WELCOME_BACK])) { add('m2.guard', t, 'INTRO'); add('m2.guardf', t, 'INTRO'); }
for (const t of introLines.PA_LINES) add('m2.pa', t, 'INTRO');
for (const t of introLines.PA_ALPHA_END) add('m2.pa', t, 'INTRO');
// (Adventure Land: every section's, by voice)
for (const byVoice of ADV_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) for (const t of lines) add(v, t, 'ADVENTURE');
// (Spooky Land: every section's, by voice)
for (const byVoice of SPOOKY_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) for (const t of lines) add(v, t, 'SPOOKY');
// (Space Land: every section's, by voice)
for (const byVoice of SPACE_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) for (const t of lines) add(v, t, 'SPACE');
// (Hollywood Land: every section's, by voice)
for (const byVoice of HOLLYWOOD_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) for (const t of lines) add(v, t, 'HOLLYWOOD');
// (Foreign Lands: every section's, by voice)
for (const byVoice of FOREIGN_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) for (const t of lines) add(v, t, 'FOREIGN');
// (Wilderness Land: every section's, by voice)
for (const byVoice of FRONTIER_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) for (const t of lines) add(v, t, 'FRONTIER');
// (Fairy Land: every section's, by voice)
for (const byVoice of FANTASY_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) for (const t of lines) add(v, t, 'FANTASY');
// (Cartoon Land: every section's, by voice)
for (const byVoice of CARTOON_VOICE_LINES) for (const [v, lines] of Object.entries(byVoice)) for (const t of lines) add(v, t, 'CARTOON');
// (the Iron Pit, the opening: by voice)
for (const [v, lines] of Object.entries(GYM_VOICE_LINES)) for (const t of lines) add(v, t, 'GYM');
for (const t of allStrings(AMERICA_DENY)) add('meathead', t, 'HUB');
for (const t of allStrings([introLines.GUEST_HURRY, introLines.GUEST_CUT, introLines.GUEST_HIT, introLines.GUEST_REACT, introLines.GUEST_REACT_NOW])) { add('m2.guest', t, 'INTRO'); add('m2.guest2', t, 'INTRO'); }
for (const byGround of Object.values(dialogue.SURFACE_CALLOUTS)) for (const lines of Object.values(byGround ?? {})) for (const t of lines ?? []) add('announcer', t, 'SURFACE_CALLOUTS');

// ---------------------------------------------------------------------------------------------------------------
// The code

/** Voice constants, by name, to who they are. */
const VOICE_CONSTS: Record<string, string> = {
  MEATHEAD_VOICE: 'meathead', MEATHEAD_INTRO_VOICE: 'meathead', MEATHEAD_MENU_VOICE: 'meathead',
  AGENT_VOICE: 'agent', SHADOW_VOICE: 'president', TRUMP_VOICE: 'president', REPORTER_VOICE: 'reporter', DOORMAN_VOICE: 'doorman',
  GUIDE_VOICE: 'guide', TOURIST_VOICE: 'tourist', HIPSTER_VOICE: 'hipster', SKIER_VOICE: 'skier', OLDMAN_VOICE: 'oldman',
  ALIEN_VOICE: 'boss.alien', GOON_VOICE: 'dale.goon', GUEST_VOICE: 'guest', DISPATCH_VOICE: 'dispatch', BOXER_VOICE: 'boxer', BALLOON_VOICE: 'balloon',
};
/** A stage's script voices (its VOICES table in script.ts): who, to the voice id the game actually plays them in. */
const stageVoices = new Map<string, Record<string, string>>();
const scriptVoices = (stage: string): Record<string, string> => {
  const known = stageVoices.get(stage);
  if (known) return known;
  const table: Record<string, string> = {};
  const f = path.join(ROOT, 'm1', 'game', 'stages', stage, 'script.ts');
  if (fs.existsSync(f)) {
    const body = fs.readFileSync(f, 'utf8').match(/export const VOICES[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? '';
    for (const m of body.matchAll(/^\s*(\w+):\s*\{\s*id:\s*'([^']+)'/gm)) table[m[1]] = m[2];
    for (const m of body.matchAll(/^\s*(\w+):\s*(\w+_VOICE)\b/gm)) if (VOICE_CONSTS[m[2]]) table[m[1]] = VOICE_CONSTS[m[2]];
  }
  stageVoices.set(stage, table);
  return table;
};
/** A `who` in a stage's script, to who they are. */
const whoVoice = (file: string, who: string): string | null => {
  if (who === 'meathead') return 'meathead';
  const own = file.match(/stages[\\/](\w+)[\\/]/)?.[1];
  if (own && scriptVoices(own)[who]) return scriptVoices(own)[who];
  const stage = file.match(/stages[\\/](\w+)[\\/]/)?.[1];
  if (!stage) return null;
  if (['dale', 'barry', 'tommy', 'oscar'].includes(stage)) return `${stage}.${who}`;
  if (who === 'hipster') return 'hipster';
  if (who === 'goon') return 'goon';
  return null;
};

/** Everyone with a voice (cast.json): a voice expression only ever comes out as one of these. */
const CAST = new Set(Object.keys(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'cast.json'), 'utf8'))).filter(k => !k.startsWith('_')));
/** Everything Meathead 2 has a recording of a line for, so far (the tables above): what its own code says is checked against it. */
const known = new Set(out.keys());
/** What Meathead 2's code says, by voice (checked against the tables once everything's read, below). */
const m2Said = new Map<string, string>();
/** ...and what it says in a voice that can't be told here (one off an enemy's look, a seeded guest's): by text alone. */
const m2SaidSomehow = new Map<string, string>();

const files: string[] = [];
const walk = (d: string) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx)$/.test(f)) files.push(p); } };
walk(ROOT);

/** A table key being tried (by its text: `m.id`), and the ones a voice came up against that nobody settles (to try). */
let fixedKeys: Map<string, string> | null = null;
let missedKeys: Map<string, string[]> | null = null;
let fixedMiss = false;
/** A table key by its last name (`q.id`, `id`, `m.id`: all 'id'): one helper's `SPECS[q.id]` is its caller's `SPECS[id]`. */
const keyName = (x: ts.Expression) => x.getText().replace(/^[\s\S]*\./, '');
/** ...and a string compared in a ?: or an if that nobody settles (`e.kind === 'm2:hwc_janitor' ? ...`), with what it's compared to (to try). */
let missedConds: Map<string, Set<string>> | null = null;
/** Parameters bound to what one caller passed (followed caller by caller, so a voice and a line passed together stay together). */
type Env = Map<ts.Node, { an: Analysis; e: ts.Expression; env?: Env }>;
/** One source file, read: what any of its expressions could come out as (a line's text, a voice). */
interface Analysis {
  file: string;
  imports: Map<string, { file: string; name: string }>;
  sf: ts.SourceFile;
  rel: string;
  where: (n: ts.Node) => string;
  calls: ts.CallExpression[];
  strings: (e: ts.Expression | undefined, env?: Env) => string[];
  voices: (e: ts.Expression | undefined, env?: Env) => string[];
  /** A top-level name in this file (declared here, or imported and followed there): its initializer, in the file it's in. */
  exported: (name: string, seen?: Set<string>) => { an: Analysis; e: ts.Expression } | null;
  /** Is this somewhere a caller's values rule out (in an `if (who === 'tucker')` with who bound to 'op')? */
  skipped: (node: ts.Node, env: Env | undefined) => boolean;
  deref: (e: ts.Expression, env: Env | undefined, n?: number) => { an: Analysis; e: ts.Expression; env?: Env } | null;
}
const analyses = new Map<string, Analysis>();
/** An import's file (`./lines`, `../section`): the .ts/.tsx it names, if it's one of ours. */
const resolveImport = (from: string, spec: string): string | null => {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(from), spec);
  for (const f of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) if (fs.existsSync(f)) return f;
  return null;
};

const analyze = (file: string): Analysis => {
  const already = analyses.get(file);
  if (already) return already;
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const where = (n: ts.Node) => `${rel}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;

  // Every declaration in the file, by name (consts, lets, params: the nearest one in scope wins, near enough)
  const decls = new Map<string, ts.Node[]>();
  const note = (name: string, n: ts.Node) => { const l = decls.get(name) ?? []; l.push(n); decls.set(name, l); };
  const visitDecl = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) note(n.name.text, n);
    if (ts.isParameter(n) && ts.isIdentifier(n.name)) note(n.name.text, n);
    if (ts.isBindingElement(n) && ts.isIdentifier(n.name)) note(n.name.text, n);
    ts.forEachChild(n, visitDecl);
  };
  visitDecl(sf);

  // What it imports: a name from a file (`import { X as Y }`, `export { X } from`), or a whole file (`import * as L`)
  const imports = new Map<string, { file: string; name: string }>();
  const namespaces = new Map<string, string>();
  for (const st of sf.statements) {
    if ((ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
      const target = resolveImport(file, st.moduleSpecifier.text);
      if (!target) continue;
      if (ts.isImportDeclaration(st)) {
        const b = st.importClause?.namedBindings;
        if (b && ts.isNamespaceImport(b)) namespaces.set(b.name.text, target);
        if (b && ts.isNamedImports(b)) for (const el of b.elements) imports.set(el.name.text, { file: target, name: (el.propertyName ?? el.name).text });
      } else if (st.exportClause && ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) imports.set(el.name.text, { file: target, name: (el.propertyName ?? el.name).text });
      }
    }
  }

  const calls: ts.CallExpression[] = [];
  const findCalls = (n: ts.Node) => { if (ts.isCallExpression(n)) calls.push(n); ts.forEachChild(n, findCalls); };
  findCalls(sf);

  /** The declarations of a name as seen from where it's used: the nearest enclosing function's parameter, or a const in an enclosing block, or anything in the file with that name as a last resort. */
  const bindingNames = (b: ts.BindingName): ts.Identifier[] => ts.isIdentifier(b) ? [b] : b.elements.flatMap(el => ts.isOmittedExpression(el) ? [] : bindingNames(el.name));
  const scoped = (id: ts.Identifier): ts.Node[] => {
    for (let p: ts.Node | undefined = id.parent; p; p = p.parent) {
      if (ts.isFunctionLike(p)) {
        for (const prm of (p as ts.SignatureDeclaration).parameters) for (const n of bindingNames(prm.name)) if (n.text === id.text) return [ts.isIdentifier(prm.name) ? prm : n.parent];
      }
      if (ts.isBlock(p) || ts.isSourceFile(p) || ts.isCaseClause(p)) {
        for (const st of (p as ts.Block).statements) if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && d.name.text === id.text) return [d];
          for (const n of bindingNames(d.name)) if (n.text === id.text) return [n.parent];
        }
      }
      if (ts.isForOfStatement(p) && ts.isVariableDeclarationList(p.initializer)) {
        for (const d of p.initializer.declarations) for (const n of bindingNames(d.name)) if (n.text === id.text) return [n.parent];
      }
    }
    return decls.get(id.text) ?? [];
  };

  const an: Analysis = { file, imports, sf, rel, where, calls, strings: () => [], voices: () => [], exported: () => null, deref: () => null, skipped: () => false };
  analyses.set(file, an);

  an.exported = (name, seen = new Set()) => {
    const key = `${file}|${name}`;
    if (seen.has(key)) return null;
    seen.add(key);
    for (const st of sf.statements) if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === name && d.initializer) return { an, e: d.initializer };
    }
    const imp = imports.get(name);
    return imp ? analyze(imp.file).exported(imp.name, seen) : null;
  };

  /** A name followed out of this file (imported): its initializer where it's declared. */
  const importedName = (name: string) => { const imp = imports.get(name); return imp ? analyze(imp.file).exported(imp.name) : null; };
  /**
   * What a name or `a.b.c` comes to: through consts (here or imported), a whole imported file (`L.LINES`), a
   * parameter bound to what its caller passed, and tables' fields. Null if `a.b.c` can't be followed to the end.
   */
  const deref = (e: ts.Expression, env: Env | undefined, n = 0): { an: Analysis; e: ts.Expression; env?: Env } | null => {
    while (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isSatisfiesExpression(e) || ts.isNonNullExpression(e)) e = e.expression;
    if (n > 24) return null;
    if (ts.isIdentifier(e)) {
      const found = scoped(e);
      for (const d of found) {
        if (ts.isVariableDeclaration(d) && ts.isIdentifier(d.name) && d.initializer) return deref(d.initializer, env, n + 1);
        if (ts.isParameter(d) && env?.has(d)) { const b = env.get(d)!; return b.an.deref(b.e, b.env, n + 1); }
      }
      if (!found.length) { const at = importedName(e.text); if (at) return at.an.deref(at.e, undefined, n + 1); }
      return { an, e, env };
    }
    if (ts.isPropertyAccessExpression(e)) {
      if (ts.isIdentifier(e.expression) && namespaces.has(e.expression.text) && !scoped(e.expression).length) {
        const at = analyze(namespaces.get(e.expression.text)!).exported(e.name.text);
        return at ? at.an.deref(at.e, undefined, n + 1) : null;
      }
      const base = deref(e.expression, env, n + 1);
      if (!base || !ts.isObjectLiteralExpression(base.e)) return null;
      const prop = base.e.properties.find(p => (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === e.name.text);
      if (prop && ts.isPropertyAssignment(prop)) return base.an.deref(prop.initializer, base.env, n + 1);
      if (prop && ts.isShorthandPropertyAssignment(prop)) return base.an.deref(prop.name, base.env, n + 1);
      return null;
    }
    // (`VOICES[who]`, with who settled by a caller: that one)
    if (ts.isElementAccessExpression(e)) {
      const k = deref(e.argumentExpression, env, n + 1);
      let key = k && (ts.isStringLiteral(k.e) || ts.isNumericLiteral(k.e) || ts.isNoSubstitutionTemplateLiteral(k.e)) ? k.e.text : undefined;
      if (key === undefined) {
        // (a key nobody settles (`MECH_VOICE[m.id]`): one being tried, or noted as one to try (the table's keys))
        let kx: ts.Expression = k ? k.e : e.argumentExpression, kEnv = k ? k.env : env;
        for (let i = 0; i < 8 && ts.isIdentifier(kx); i++) {
          const d = scoped(kx)[0];
          const b = d && ts.isParameter(d) ? kEnv?.get(d) : undefined;
          if (!b) break;
          kx = b.e; kEnv = b.env;
        }
        const txt = keyName(kx);
        key = fixedKeys?.get(kx.getText()) ?? fixedKeys?.get(txt);
        if (key === undefined) {
          const base = missedKeys ? deref(e.expression, env, n + 1) : null;
          // (the keys to try: the ones it's picked from, if it's a pick out of a list (`(['mom', 'sis'] as const)[i]`), else the table's)
          let pickFrom: string[] | null = null;
          const kd = ts.isIdentifier(kx) ? scoped(kx).find(v => ts.isVariableDeclaration(v) && v.initializer) as ts.VariableDeclaration | undefined : undefined;
          let ki = kd?.initializer;
          while (ki && (ts.isAsExpression(ki) || ts.isParenthesizedExpression(ki))) ki = ki.expression;
          if (ki && ts.isElementAccessExpression(ki)) {
            let arr = ki.expression;
            while (ts.isAsExpression(arr) || ts.isParenthesizedExpression(arr)) arr = arr.expression;
            if (ts.isArrayLiteralExpression(arr) && arr.elements.every(x => ts.isStringLiteral(x))) pickFrom = arr.elements.map(x => (x as ts.StringLiteral).text);
          }
          if (base && ts.isObjectLiteralExpression(base.e)) missedKeys!.set(txt, pickFrom ?? base.e.properties.flatMap(p => p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? [p.name.text] : []));
          return null;
        }
      }
      const base = deref(e.expression, env, n + 1);
      if (!base) return null;
      if (ts.isArrayLiteralExpression(base.e)) { const x = base.e.elements[Number(key)]; return x && !ts.isSpreadElement(x) ? base.an.deref(x, base.env, n + 1) : null; }
      if (!ts.isObjectLiteralExpression(base.e)) return null;
      const prop = base.e.properties.find(p => (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) || ts.isNumericLiteral(p.name)) && p.name.text === key);
      if (prop && ts.isPropertyAssignment(prop)) return base.an.deref(prop.initializer, base.env, n + 1);
      if (prop && ts.isShorthandPropertyAssignment(prop)) return base.an.deref(prop.name, base.env, n + 1);
      // (a key being tried that this table hasn't got: nothing out of it)
      if (fixedKeys) fixedMiss = true;
      return null;
    }
    return { an, e, env };
  };
  an.deref = deref;
  const fanOut = (e: ts.PropertyAccessExpression, env: Env | undefined): string[] | null => {
    let x: ts.Expression = e.expression;
    for (let n = 0; n < 8 && ts.isIdentifier(x); n++) {
      const d = scoped(x).find(v => ts.isVariableDeclaration(v) && ts.isIdentifier(v.name) && v.initializer) as ts.VariableDeclaration | undefined;
      if (!d) break;
      x = d.initializer!;
    }
    while (ts.isParenthesizedExpression(x) || ts.isNonNullExpression(x) || ts.isAsExpression(x)) x = x.expression;
    if (!ts.isElementAccessExpression(x)) return null;
    const tbl = deref(x.expression, env);
    if (!tbl || !(ts.isObjectLiteralExpression(tbl.e) || ts.isArrayLiteralExpression(tbl.e))) return null;
    const entries = ts.isObjectLiteralExpression(tbl.e) ? tbl.e.properties.flatMap(p => ts.isPropertyAssignment(p) ? [p.initializer] : []) : tbl.e.elements.filter(v => !ts.isSpreadElement(v));
    const res: string[] = [];
    let found = false;
    for (const v of entries) {
      const o = tbl.an.deref(v, tbl.env);
      if (!o || !ts.isObjectLiteralExpression(o.e)) continue;
      const prop = o.e.properties.find(p => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === e.name.text);
      if (prop && ts.isPropertyAssignment(prop)) { found = true; res.push(...o.an.strings(prop.initializer, o.env)); }
    }
    return found ? res : null;
  };
  /** A condition settled by what a caller passed (`who === 'queen'`, with who bound to 'booth'): true, false, or undefined if it can't be told. */
  const literal = (e: ts.Expression, env: Env | undefined) => {
    const at = deref(e, env);
    if (at && (ts.isStringLiteral(at.e) || ts.isNoSubstitutionTemplateLiteral(at.e))) return at.e.text;
    return fixedKeys?.get((at ? at.e : e).getText()) ?? fixedKeys?.get(e.getText());
  };
  const decided = (c: ts.Expression, env: Env | undefined): boolean | undefined => {
    while (ts.isParenthesizedExpression(c)) c = c.expression;
    if ((!env?.size && !fixedKeys && !missedConds) || !ts.isBinaryExpression(c)) return undefined;
    const op = c.operatorToken.kind;
    if (op !== ts.SyntaxKind.EqualsEqualsEqualsToken && op !== ts.SyntaxKind.ExclamationEqualsEqualsToken) return undefined;
    const l = literal(c.left, env), r = literal(c.right, env);
    // (one side a string nobody settles: noted, to try each string it's compared with)
    if (missedConds && (l === undefined) !== (r === undefined)) {
      const txt = (l === undefined ? c.left : c.right).getText();
      if (!missedConds.has(txt)) missedConds.set(txt, new Set());
      missedConds.get(txt)!.add((l ?? r)!);
    }
    if (l === undefined || r === undefined) return undefined;
    return (l === r) === (op === ts.SyntaxKind.EqualsEqualsEqualsToken);
  };
  an.skipped = (node, env) => {
    for (let p: ts.Node = node; p.parent && !ts.isFunctionLike(p); p = p.parent) {
      const up = p.parent;
      if (ts.isIfStatement(up) && up.expression !== p) { const k = decided(up.expression, env); if ((up.thenStatement === p && k === false) || (up.elseStatement === p && k === true)) return true; }
      if (ts.isConditionalExpression(up) && up.condition !== p) { const k = decided(up.condition, env); if ((up.whenTrue === p && k === false) || (up.whenFalse === p && k === true)) return true; }
    }
    return false;
  };
  const calleeName = (c: ts.CallExpression) => ts.isIdentifier(c.expression) ? c.expression.text : ts.isPropertyAccessExpression(c.expression) ? c.expression.name.text : '';

  /** Every string a text expression could come out as (following names back through the file, and parameters to their callers). */
  const memo = new Map<ts.Node, string[]>();
  const inProgress = new Set<ts.Node>();
  const strings = (e: ts.Expression | undefined, depth = 0, env?: Env): string[] => {
    if (!e || depth > 40 || inProgress.has(e)) return [];
    const bound = !!env?.size || !!fixedKeys;
    const k = bound ? undefined : memo.get(e);
    if (k) return k;
    inProgress.add(e);
    const r = stringsOf(e, depth, env);
    inProgress.delete(e);
    if (!bound) memo.set(e, r);
    return r;
  };
  /** A bound parameter's value, where its caller is. */
  const boundStrings = (b: { an: Analysis; e: ts.Expression; env?: Env }, depth: number) => (b.an === an ? strings(b.e, depth + 1, b.env) : b.an.strings(b.e, b.env));
  const stringsOf = (e: ts.Expression, depth: number, env?: Env): string[] => {
    const s = (x: ts.Expression | undefined) => strings(x, depth + 1, env);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
    if (ts.isTemplateExpression(e)) {
      // (a template made of names that each come to one string: `THIS IS ${MOVIE}!`)
      const parts = [e.head.text];
      for (const sp of e.templateSpans) {
        const v = s(sp.expression);
        if (v.length !== 1) { unresolved.push(`${where(e)} template: ${e.getText().slice(0, 90)}`); return []; }
        parts.push(v[0], sp.literal.text);
      }
      return [parts.join('')];
    }
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e) || ts.isTypeAssertionExpression(e) || ts.isSatisfiesExpression(e)) return s(e.expression);
    if (ts.isConditionalExpression(e)) { const k = decided(e.condition, env); return k === true ? s(e.whenTrue) : k === false ? s(e.whenFalse) : [...s(e.whenTrue), ...s(e.whenFalse)]; }
    if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.BarBarToken || e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)) return [...s(e.left), ...s(e.right)];
    if (ts.isArrayLiteralExpression(e)) return e.elements.flatMap(x => s(ts.isSpreadElement(x) ? x.expression : x as ts.Expression));
    if (ts.isSpreadElement(e)) return s(e.expression);
    if (ts.isObjectLiteralExpression(e)) {
      // (a line, { who, text }: just its text; any other table: everything in it)
      const text = e.properties.find(p => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'text');
      if (text && ts.isPropertyAssignment(text)) return s(text.initializer);
      return e.properties.flatMap(p => ts.isPropertyAssignment(p) ? s(p.initializer) : ts.isSpreadAssignment(p) ? s(p.expression) : []);
    }
    if (ts.isCallExpression(e)) {
      const n = calleeName(e);
      // (picking one of a list: any of them)
      if (['pick', 'pickRandom', 'takeFreshLine', 'pickFreshLine'].includes(n) || /pick/i.test(n)) return e.arguments.flatMap(a => s(a));
      // (taking one off a list: `queue.shift()`)
      if (['shift', 'pop', 'at', 'slice', 'concat', 'filter', 'sort', 'reverse', 'find', 'flat'].includes(n) && ts.isPropertyAccessExpression(e.expression)) return s(e.expression.expression);
      // (the one for the state he's in: byPants(state, pool), pants(pool), lineOf(state, pool))
      if (['byPants', 'pants', 'lineOf', 'dressedPool'].includes(n)) return e.arguments.flatMap(a => s(a));
      unresolved.push(`${where(e)} call: ${e.getText().slice(0, 90)}`);
      return [];
    }
    if (ts.isElementAccessExpression(e)) { fixedMiss = false; const at = env?.size || fixedKeys ? deref(e, env) : null; if (!at && fixedMiss) { fixedMiss = false; return []; } return at && at.e !== e ? (at.an === an ? strings(at.e, depth + 1, at.env) : at.an.strings(at.e, at.env)) : s(e.expression); }
    if (ts.isPropertyAccessExpression(e)) {
      // A table imported from the dialogue module
      const chain: string[] = [];
      let x: ts.Expression = e;
      while (ts.isPropertyAccessExpression(x)) { chain.unshift(x.name.text); x = x.expression; }
      if (ts.isIdentifier(x) && x.text in dialogue) {
        let v: unknown = (dialogue as Record<string, unknown>)[x.text];
        for (const k of chain) v = v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined;
        return allStrings(v);
      }
      // A table in this file, or imported (or a whole imported file's: `L.LINES`), or passed in (`t.pa`, by a caller)
      const at = deref(e, env);
      if (at && at.e !== e) return at.an === an ? strings(at.e, depth + 1, at.env) : at.an.strings(at.e, at.env);
      // One field of whichever entry of a table (`st.lines`, st = STORIES[id]): that field of every entry, not the lot
      const fanned = fanOut(e, env);
      if (fanned) return fanned;
      // A field something's been set to somewhere in this file (`fight.hintQueue = lines`, `{ hintQueue: [...] }`)
      const field = chain[chain.length - 1];
      const set: string[] = [];
      const look = (n: ts.Node) => {
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isPropertyAccessExpression(n.left) && n.left.name.text === field) set.push(...s(n.right));
        if (ts.isPropertyAssignment(n) && ts.isIdentifier(n.name) && n.name.text === field && n.parent !== e.parent) set.push(...s(n.initializer));
        ts.forEachChild(n, look);
      };
      if (!['text', 'length'].includes(field)) look(sf);
      return set.length ? set : s(x as ts.Expression);
    }
    if (ts.isIdentifier(e)) {
      if (e.text in dialogue) return allStrings((dialogue as Record<string, unknown>)[e.text]);
      const found: ts.Node[] = scoped(e);
      const res: string[] = [];
      for (const d of found) {
        if (ts.isVariableDeclaration(d)) {
          res.push(...s(d.initializer));
          // (and whatever it's set to later: `let lines; ... lines = [...]`)
          const scope = d.parent?.parent?.parent;
          const look = (n: ts.Node) => { if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(n.left) && n.left.text === e.text) res.push(...s(n.right)); ts.forEachChild(n, look); };
          if (scope && ts.isVariableDeclarationList(d.parent) && !(d.parent.flags & ts.NodeFlags.Const)) look(scope);
        }
        else if (ts.isBindingElement(d)) {
          let q: ts.Node = d;
          while (q.parent && (ts.isArrayBindingPattern(q.parent) || ts.isObjectBindingPattern(q.parent) || ts.isBindingElement(q.parent))) q = q.parent;
          if (q.parent && ts.isVariableDeclaration(q.parent) && q.parent.initializer) res.push(...s(q.parent.initializer));
        }
        else if (ts.isParameter(d) && env?.has(d)) res.push(...boundStrings(env.get(d)!, depth));
        else if (ts.isParameter(d)) {
          // A parameter: whatever every caller passes in its place (a function's own name, or a callback's)
          const fn = d.parent as ts.SignatureDeclaration;
          const idx = fn.parameters.indexOf(d);
          const name = ts.isFunctionDeclaration(fn) && fn.name ? fn.name.text : ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name) ? fn.parent.name.text : null;
          if (name) for (const c of calls) if (calleeName(c) === name && c.arguments[idx]) res.push(...s(c.arguments[idx]));
          // (the parameter of a callback over a list: `lines.forEach(l => say(l...))`, `for (const [at, text] of LINES)`)
          if (!name && ts.isCallExpression(fn.parent) && ts.isPropertyAccessExpression(fn.parent.expression)) res.push(...s(fn.parent.expression.expression));
        }
      }
      // for (const [a, text] of LIST) / for (const x of LIST)
      for (const d of found) {
        let p: ts.Node | undefined = d.parent;
        while (p && !ts.isForOfStatement(p)) p = ts.isArrayBindingPattern(p) || ts.isVariableDeclaration(p) || ts.isVariableDeclarationList(p) || ts.isBindingElement(p) || ts.isObjectBindingPattern(p) ? p.parent : undefined;
        if (p && ts.isForOfStatement(p)) res.push(...s(p.expression));
      }
      // (imported: where it's declared)
      if (!found.length) {
        const at = importedName(e.text);
        if (at) return at.an.strings(at.e);
        unresolved.push(`${where(e)} name: ${e.text}`);
      }
      return res;
    }
    unresolved.push(`${where(e)} expr: ${e.getText().slice(0, 90)}`);
    return [];
  };
  an.strings = (e, env) => strings(e, 0, env);

  /** Who a voice expression is (only ever someone in cast.json). */
  const vMemo = new Set<ts.Node>();
  const voicesIn = (e: ts.Expression | undefined, env?: Env): string[] => {
    if (!e || vMemo.has(e)) return [];
    vMemo.add(e);
    try { return [...new Set(voicesOf(e, env))].filter(v => CAST.has(v)); } finally { vMemo.delete(e); }
  };
  const voicesOf = (e: ts.Expression, env?: Env): string[] => {
    const voices = (x: ts.Expression | undefined) => voicesIn(x, env);
    // (Meathead 1's code, whose lines are all recorded: read as it always was, so nothing of it is re-recorded)
    if (!rel.startsWith('m2/')) {
      if (ts.isIdentifier(e)) { if (VOICE_CONSTS[e.text]) return [VOICE_CONSTS[e.text]]; for (const d of scoped(e)) if (ts.isVariableDeclaration(d) && d.initializer) return voices(d.initializer); return []; }
      if (ts.isConditionalExpression(e)) return [...voices(e.whenTrue), ...voices(e.whenFalse)];
      if (ts.isParenthesizedExpression(e)) return voices(e.expression);
      if (ts.isObjectLiteralExpression(e)) {
        const id = e.properties.find(p => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'id');
        if (id && ts.isPropertyAssignment(id) && ts.isStringLiteral(id.initializer)) return [id.initializer.text];
      }
      return [];
    }
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e) || ts.isSatisfiesExpression(e)) return voices(e.expression);
    if (ts.isConditionalExpression(e)) { const k = decided(e.condition, env); return k === true ? voices(e.whenTrue) : k === false ? voices(e.whenFalse) : [...voices(e.whenTrue), ...voices(e.whenFalse)]; }
    if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.BarBarToken || e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)) return [...voices(e.left), ...voices(e.right)];
    if (ts.isArrayLiteralExpression(e)) return e.elements.flatMap(x => ts.isSpreadElement(x) ? voices(x.expression) : voices(x as ts.Expression));
    if (ts.isObjectLiteralExpression(e)) {
      // ({ id, pitch, rate }: that id; a table of voices: any of them)
      const id = e.properties.find(p => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'id');
      if (id && ts.isPropertyAssignment(id)) return voices(id.initializer);
      return e.properties.flatMap(p => ts.isPropertyAssignment(p) ? voices(p.initializer) : []);
    }
    // (voice('m2.rex'), voiceOf(who): the voice of the id)
    if (ts.isCallExpression(e) && /^voice(Of)?$/.test(calleeName(e)) && e.arguments[0]) return voices(e.arguments[0]);
    if (ts.isElementAccessExpression(e)) { const at = deref(e, env); return at && at.e !== e ? (at.an === an ? voicesIn(at.e, at.env) : at.an.voices(at.e, at.env)) : voices(e.expression); }
    if (ts.isPropertyAccessExpression(e)) {
      const chain: string[] = [];
      let x: ts.Expression = e;
      while (ts.isPropertyAccessExpression(x)) { chain.unshift(x.name.text); x = x.expression; }
      const at = deref(e, env);
      if (at && at.e !== e) return at.an === an ? voicesIn(at.e, at.env) : at.an.voices(at.e, at.env);
      return [];
    }
    if (ts.isIdentifier(e)) {
      if (VOICE_CONSTS[e.text]) return [VOICE_CONSTS[e.text]];
      const found = scoped(e);
      const res: string[] = [];
      for (const d of found) {
        if (ts.isVariableDeclaration(d) && d.initializer) res.push(...voices(d.initializer));
        else if (ts.isParameter(d) && env?.has(d)) { const b = env.get(d)!; res.push(...(b.an === an ? voicesIn(b.e, b.env) : b.an.voices(b.e, b.env))); }
        else if (ts.isParameter(d)) {
          // (a parameter: whatever its callers in this file pass)
          const fn = d.parent as ts.SignatureDeclaration;
          const idx = fn.parameters.indexOf(d);
          const name = ts.isFunctionDeclaration(fn) && fn.name ? fn.name.text : ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name) ? fn.parent.name.text : null;
          if (name) for (const c of calls) if (calleeName(c) === name && c.arguments[idx]) res.push(...voices(c.arguments[idx]));
        }
      }
      if (!found.length) { const at = importedName(e.text); if (at) return at.an.voices(at.e); }
      return res;
    }
    return [];
  };
  an.voices = voicesIn;
  return an;
};

// (every file read first: a helper's callers can be anywhere)
for (const file of files) analyze(file);
const fnName = (f: ts.Node): string | null => ts.isFunctionDeclaration(f) && f.name ? f.name.text : (ts.isArrowFunction(f) || ts.isFunctionExpression(f)) && ts.isVariableDeclaration(f.parent) && ts.isIdentifier(f.parent.name) ? f.parent.name.text : null;
/** Where a name imported into a file really comes from (through re-exports). */
const origin = (file: string, name: string, n = 0): { file: string; name: string } => {
  const a = analyze(file);
  const declared = a.sf.statements.some(st => (ts.isVariableStatement(st) && st.declarationList.declarations.some(d => ts.isIdentifier(d.name) && d.name.text === name)) || (ts.isFunctionDeclaration(st) && st.name?.text === name));
  const imp = a.imports.get(name);
  return declared || !imp || n > 8 ? { file, name } : origin(imp.file, imp.name, n + 1);
};
const calleeOf = (c: ts.CallExpression) => ts.isIdentifier(c.expression) ? c.expression.text : ts.isPropertyAccessExpression(c.expression) ? c.expression.name.text : '';
/** Somewhere ruled out, here or at any of the calls that got here (the call sites are in env, as themselves). */
const skippedAll = (an: Analysis, node: ts.Node, env: Env | undefined, n = 0): boolean =>
  an.skipped(node, env) || (n < 8 && [...(env ?? [])].some(([k, b]) => k === b.e && ts.isCallExpression(k) && skippedAll(b.an, k, b.env, n + 1)));
/** What the ifs (and ?:s) a node is under settle, here and at the calls that got here: `if (m.id === 'moai')` -> m.id is 'moai'. */
const impliedAll = (an: Analysis, node: ts.Node, env: Env | undefined, out = new Map<string, string>(), n = 0): Map<string, string> => {
  const lit = (x: ts.Expression) => ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x) ? x.text : undefined;
  for (let p: ts.Node = node; p.parent && !ts.isSourceFile(p.parent); p = p.parent) {
    const up = p.parent;
    let cond: ts.Expression | undefined, yes = false;
    if (ts.isIfStatement(up) && up.expression !== p) { cond = up.expression; yes = up.thenStatement === p; }
    if (ts.isConditionalExpression(up) && up.condition !== p) { cond = up.condition; yes = up.whenTrue === p; }
    while (cond && ts.isParenthesizedExpression(cond)) cond = cond.expression;
    if (!cond || !ts.isBinaryExpression(cond)) continue;
    const eq = cond.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken, ne = cond.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken;
    if (!((eq && yes) || (ne && !yes))) continue;
    const l = lit(cond.left), r = lit(cond.right);
    if (r !== undefined && l === undefined && !out.has(cond.left.getText())) out.set(cond.left.getText(), r);
    if (l !== undefined && r === undefined && !out.has(cond.right.getText())) out.set(cond.right.getText(), l);
  }
  if (n < 8) for (const [k, b] of env ?? []) if (k === b.e && ts.isCallExpression(k)) impliedAll(b.an, k, b.env, out, n + 1);
  return out;
};
/** Every call of a function (by its name in its file): in its own file, and in every file that imports it. */
const callersCache = new Map<string, { an: Analysis; c: ts.CallExpression }[]>();
const callersOf = (an: Analysis, name: string) => {
  const key = `${an.file}|${name}`;
  const k = callersCache.get(key);
  if (k) return k;
  const res: { an: Analysis; c: ts.CallExpression }[] = an.calls.filter(c => calleeOf(c) === name).map(c => ({ an, c }));
  for (const b of analyses.values()) {
    if (b === an) continue;
    for (const [local, imp] of b.imports) {
      const o = origin(imp.file, imp.name);
      if (o.file === an.file && o.name === name) for (const c of b.calls) if (ts.isIdentifier(c.expression) && c.expression.text === local) res.push({ an: b, c });
    }
  }
  callersCache.set(key, res);
  return res;
};
/**
 * The ways a line said inside a helper can go: one per call of the helper (and of the helper that calls it, a few deep),
 * each with the helper's parameters bound to what that call passed. So a voice and the line passed with it stay
 * together, not every voice with every line.
 */
const contexts = (an: Analysis, node: ts.Node, depth = 0): (Env | undefined)[] => {
  let f: ts.Node | undefined = node.parent;
  while (f && !(ts.isFunctionLike(f) && fnName(f))) f = f.parent;
  if (!f || depth > 4) return [undefined];
  const fn = f as ts.SignatureDeclaration;
  if (!fn.parameters.length) return contexts(an, fn, depth);
  const callers = callersOf(an, fnName(fn)!);
  if (!callers.length) return [undefined];
  const res: Env[] = [];
  for (const { an: b, c } of callers) {
    for (const outer of contexts(b, c, depth + 1)) {
      const env: Env = new Map();
      fn.parameters.forEach((p, i) => {
        const arg = c.arguments[i] ?? p.initializer;
        if (arg) env.set(p, { an: c.arguments[i] ? b : an, e: arg, env: c.arguments[i] ? outer : undefined });
      });
      // (and where it was called from, to check that too: skippedAll)
      env.set(c, { an: b, e: c, env: outer });
      res.push(env);
      if (res.length > 4000) return [undefined];
    }
  }
  return res;
};

for (const file of files) {
  if (file.includes(`${path.sep}content${path.sep}`) || file.endsWith('speech.ts')) continue;
  const an = analyze(file);
  const { sf, rel, where, calls, strings, voices, skipped } = an;
  const m2 = rel.startsWith('m2/');
  // (Meathead 1's code: straight into the recordings. Meathead 2's: its lines are all in its voice tables, by voice (the
  // lands' voices.ts, read above); what its code says is only checked against them, below)
  const said = (voice: string, text: string, from: string) => {
    if (!m2) return add(voice, text, from);
    const t = (voice === 'death' ? text.replace(/\s*\n\s*/g, ' ') : text).trim();
    if (t && /[A-Za-z]/.test(t) && !m2Said.has(`${voice}|${t}`)) m2Said.set(`${voice}|${t}`, from);
  };
  const calleeName = (c: ts.CallExpression) => ts.isIdentifier(c.expression) ? c.expression.text : ts.isPropertyAccessExpression(c.expression) ? c.expression.name.text : '';
  const saidSomehow = (text: string, from: string) => { const t = text.trim(); if (t && /[A-Za-z]/.test(t) && !m2SaidSomehow.has(t)) m2SaidSomehow.set(t, from); };
  /**
   * A voice and what it says, together. In Meathead 2's code, a voice out of a table by a key nobody settles
   * (`speak(MECH_VOICE[m.id], pickLine(MECH_TALK[m.id].hurt))`) is tried key by key, so each says only its own lines.
   */
  let voiced = false;
  const pairs = (vExpr: ts.Expression | undefined, tExpr: ts.Expression | undefined, env: Env | undefined): [string, string][] => {
    if (!vExpr || skippedAll(an, vExpr, env)) return [];
    // (what the ifs it's under settle: `if (m.id === 'moai') ...` has m.id as 'moai' in there)
    const implied = impliedAll(an, vExpr, env);
    const under = (extra?: [string, string]) => { fixedKeys = implied.size || extra ? new Map([...implied, ...(extra ? [extra] : [])]) : null; };
    try {
      under();
      missedKeys = m2 ? new Map() : null;
      missedConds = m2 ? new Map() : null;
      const vs = voices(vExpr, env);
      if (vs.length) voiced = true;
      const missed = missedKeys, conds = missedConds;
      missedKeys = null; missedConds = null;
      // (or one compared with strings in a chain of ?:s nobody settles: each of them, and none of them)
      const tries: [string, string[]] | undefined = missed?.size === 1 ? [...missed][0] : !missed?.size && conds?.size === 1 ? [[...conds][0][0], [...[...conds][0][1], '(none of them)']] : undefined;
      if (m2 && vs.length !== 1 && tries) {
        const [txt, keys] = tries;
        const res: [string, string][] = [];
        for (const k of keys) {
          under([txt, k]);
          if (skippedAll(an, vExpr, env)) continue;
          const kv = voices(vExpr, env);
          if (kv.length) voiced = true;
          for (const v of kv) for (const t of strings(tExpr, env)) res.push([v, t]);
        }
        return res;
      }
      return vs.flatMap(v => strings(tExpr, env).map(t => [v, t] as [string, string]));
    } finally { fixedKeys = null; missedKeys = null; missedConds = null; }
  };

  // 1) say / speak / sayModulated, and the helpers around them
  const localFns = new Set<string>();
  const findFns = (x: ts.Node) => { if (ts.isFunctionLike(x) && fnName(x)) localFns.add(fnName(x)!); ts.forEachChild(x, findFns); };
  findFns(sf);
  for (const c of calls) {
    const n = calleeName(c);
    const a = c.arguments;
    // (Meathead 2's own helpers by those names (say(state, q, text), speak(voice, text, set) in the intro): not the
    // engine's; what they say is read where they call the engine, caller by caller)
    const ownHelper = m2 && ts.isIdentifier(c.expression) && localFns.has(n);
    if ((n === 'say' || n === 'speak' || n === 'sayModulated') && a.length >= 2 && !ownHelper) {
      // (a stage's own say/speak with the text further along: speak(tour, who, text, VOICE), say(state, talk, text));
      // Meathead 2's speak is speak(voiceId, text, ...)
      let ti = 0, vi = 1;
      if (m2 && n === 'speak') { ti = 1; vi = 0; }
      else if (a.length === 4 && n === 'speak') { ti = 2; vi = 3; }
      // (Meathead 2's: caller by caller)
      let any = false;
      for (const env of m2 ? contexts(an, c) : [undefined]) for (const [v, t] of pairs(a[vi], a[ti], env)) said(v, t, where(c));
      any = voiced; voiced = false;
      if (!any) unresolved.push(`${where(c)} voice: ${a[vi]?.getText().slice(0, 60)}`);
      if (!any && m2) for (const env of contexts(an, c)) if (!skippedAll(an, c, env)) for (const t of strings(a[ti], env)) saidSomehow(t, where(c));
    }
    // The big ones the announcer always calls: announceKill(text)
    if (n === 'announceKill' && a[0]) for (const t of strings(a[0])) said('announcer', t, where(c));
    // The death screen, read out by the death announcer: killPlayer(ctx, message)
    if (n === 'killPlayer' && a[1]) for (const t of strings(a[1])) said('death', t, where(c));
    if (n === 'speakAsBoss') {
      const bossNames = strings(a[0]);
      for (const b of bossNames) if (BOSS_ID[b]) for (const t of strings(a[1])) said(BOSS_ID[b], t, where(c));
    }
  }

  // 1b) the stages' death screens: whatever a ...DeathMessage function can return
  const deathFns = (n: ts.Node) => {
    let body: ts.Node | undefined;
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && /DeathMessage$/.test(n.name.text) && n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) body = n.initializer.body;
    if (ts.isFunctionDeclaration(n) && n.name && /DeathMessage$/.test(n.name.text)) body = n.body;
    if (body) {
      if (!ts.isBlock(body)) for (const t of strings(body as ts.Expression)) said('death', t, where(n));
      const rets = (m: ts.Node) => {
        if (ts.isReturnStatement(m) && m.expression) for (const t of strings(m.expression)) said('death', t, where(m));
        if (!ts.isFunctionLike(m)) ts.forEachChild(m, rets);
      };
      ts.forEachChild(body, rets);
    }
    ts.forEachChild(n, deathFns);
  };
  deathFns(sf);

  // 2) { who, text } and { voice, text } (a voice, if it says, before a who: { who: 'NEWS', voice: ANCHOR_VOICE, text })
  const visitObj = (n: ts.Node) => {
    if (ts.isObjectLiteralExpression(n)) {
      const prop = (name: string) => n.properties.find(p => (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && ts.isIdentifier(p.name) && p.name.text === name);
      const text = prop('text');
      const textExpr = text && (ts.isPropertyAssignment(text) ? text.initializer : ts.isShorthandPropertyAssignment(text) ? text.name : undefined);
      const who = prop('who');
      const voice = prop('voice');
      const voiceExpr = voice && (ts.isPropertyAssignment(voice) ? voice.initializer : ts.isShorthandPropertyAssignment(voice) ? voice.name : undefined);
      let spoken = false;
      if (textExpr && voiceExpr) for (const env of m2 ? contexts(an, n) : [undefined]) for (const [v, t] of pairs(voiceExpr, textExpr, env)) said(v, t, where(n));
      spoken = voiced; voiced = false;
      if (!spoken && m2 && textExpr && voiceExpr) for (const env of contexts(an, n)) for (const t of strings(textExpr, env)) saidSomehow(t, where(n));
      // (Meathead 2's { who, text } with no voice: what's on screen, said somewhere else)
      if (spoken || m2) { /* (said, or not a line) */ } else if (textExpr && who && ts.isPropertyAssignment(who)) {
        for (const w of strings(who.initializer)) {
          const v = whoVoice(file, w);
          if (v) for (const t of strings(textExpr)) said(v, t, where(n));
          else unresolved.push(`${where(n)} who: ${w}`);
        }
      } else if (textExpr && voiceExpr && !m2) unresolved.push(`${where(n)} voice: ${voiceExpr.getText().slice(0, 60)}`);
    }
    ts.forEachChild(n, visitObj);
  };
  visitObj(sf);
}

// Meathead 2: anything its code says that isn't in its tables, in that voice, has no recording (or is weeded out as
// Meathead 1's by consistency.ts, unless it's in a table)
for (const [k, from] of m2Said) {
  const t = k.slice(k.indexOf('|') + 1);
  if (!known.has(k)) unresolved.push(`${from} unrecorded (in no Meathead 2 voice table): ${k}`);
  else if (!fitsHappyLand(t)) unresolved.push(`${from} weeded out (names Meathead 1, in no Meathead 2 table): ${k}`);
}
{
  const knownTexts = new Set([...known].map(k => k.slice(k.indexOf('|') + 1)));
  for (const [t, from] of m2SaidSomehow) {
    if (!knownTexts.has(t)) unresolved.push(`${from} unrecorded (in no Meathead 2 voice table, in any voice): ${t}`);
    else if (!fitsHappyLand(t)) unresolved.push(`${from} weeded out (names Meathead 1, in no Meathead 2 table): ${t}`);
  }
}

// ---------------------------------------------------------------------------------------------------------------

const list = [...out.values()].sort((a, b) => a.voice.localeCompare(b.voice) || a.text.localeCompare(b.text));
fs.writeFileSync(path.resolve(__dirname, 'manifest.json'), JSON.stringify(list, null, 1));
const byVoice: Record<string, number> = {};
for (const l of list) byVoice[l.voice] = (byVoice[l.voice] ?? 0) + 1;
console.log(`${list.length} lines`);
console.log(Object.entries(byVoice).map(([v, n]) => `${v} ${n}`).join(', '));
fs.writeFileSync(path.resolve(__dirname, 'unresolved.txt'), [...new Set(unresolved)].join('\n'));
console.log(`${new Set(unresolved).size} unresolved (see unresolved.txt)`);
