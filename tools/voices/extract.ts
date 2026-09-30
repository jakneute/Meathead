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
// Writes tools/voices/manifest.json: [{ voice, text, from }], and lists anything it couldn't pin down.

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import * as dialogue from '../../src/content/dialogue';
import * as deaths from '../../src/content/deaths';

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
for (const t of allStrings(dialogue.VICTOR_LINES)) add('boss.victor', t, 'VICTOR_LINES');
for (const t of allStrings(dialogue.DALE_LINES)) add('boss.dale', t, 'DALE_LINES');
for (const t of allStrings(dialogue.BARRY_LINES)) add('boss.barry', t, 'BARRY_LINES');
for (const t of allStrings(dialogue.OSCAR_LINES)) add('boss.oscar', t, 'OSCAR_LINES');
// The death announcer: the plain death screen, and the one the sewer blows up with
add('death', 'YOU DIED', 'killPlayer');
for (const t of allStrings([deaths.DEATH_LINES, deaths.BOSS_DEATH_LINES, deaths.FALL_DEATH_LINES])) add('death', t, 'content/deaths');
add('death', 'YOU SET FIRE TO AN OIL-SOAKED TOXIC WASTE MONSTER IN A METHANE-FILLED SEWER. YOU BOTH DIED.', 'SEWER_NUKE_MESSAGE');
// The daycare: the kids and the grown-ups, and all the kids' chatter in each of their voices
for (const l of dialogue.DAYCARE_LINES.cheer) add(`hector.${l.who}`, l.text, 'DAYCARE_LINES');
for (const l of [dialogue.DAYCARE_LINES.ride, dialogue.DAYCARE_LINES.again]) add(`hector.${l.who}`, l.text, 'DAYCARE_LINES');
for (let k = 0; k < 5; k++) for (const t of dialogue.DAYCARE_LINES.chatter) add(`hector.kid${k}`, t, 'DAYCARE_LINES');
// The announcer calls out the kill callouts
for (const c of Object.values(dialogue.KILL_CALLOUTS)) for (const t of c.lines) add('announcer', t, 'KILL_CALLOUTS');
for (const byGround of Object.values(dialogue.SURFACE_CALLOUTS)) for (const lines of Object.values(byGround ?? {})) for (const t of lines ?? []) add('announcer', t, 'SURFACE_CALLOUTS');

// ---------------------------------------------------------------------------------------------------------------
// The code

/** Voice constants, by name, to who they are. */
const VOICE_CONSTS: Record<string, string> = {
  MEATHEAD_VOICE: 'meathead', MEATHEAD_INTRO_VOICE: 'meathead', MEATHEAD_MENU_VOICE: 'meathead',
  AGENT_VOICE: 'agent', SHADOW_VOICE: 'president', TRUMP_VOICE: 'president', REPORTER_VOICE: 'reporter', DOORMAN_VOICE: 'doorman',
  GUIDE_VOICE: 'guide', TOURIST_VOICE: 'tourist', HIPSTER_VOICE: 'hipster', SKIER_VOICE: 'skier', OLDMAN_VOICE: 'oldman',
  GOON_VOICE: 'dale.goon', GUEST_VOICE: 'guest', DISPATCH_VOICE: 'dispatch',
};
/** A stage's script voices (its VOICES table in script.ts): who, to the voice id the game actually plays them in. */
const stageVoices = new Map<string, Record<string, string>>();
const scriptVoices = (stage: string): Record<string, string> => {
  const known = stageVoices.get(stage);
  if (known) return known;
  const table: Record<string, string> = {};
  const f = path.join(ROOT, 'game', 'stages', stage, 'script.ts');
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

const files: string[] = [];
const walk = (d: string) => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(ts|tsx)$/.test(f)) files.push(p); } };
walk(ROOT);

for (const file of files) {
  if (file.includes(`${path.sep}content${path.sep}`) || file.endsWith('speech.ts')) continue;
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const where = (n: ts.Node) => `${rel}:${sf.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;

  // Every declaration in the file, by name (consts, lets, params: the nearest one in scope wins, near enough)
  const decls = new Map<string, ts.Node[]>();
  const note = (name: string, n: ts.Node) => { const l = decls.get(name) ?? []; l.push(n); decls.set(name, l); };
  const functions = new Map<string, ts.SignatureDeclaration>();
  const visitDecl = (n: ts.Node) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
      note(n.name.text, n);
      if (n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) functions.set(n.name.text, n.initializer);
    }
    if (ts.isFunctionDeclaration(n) && n.name) functions.set(n.name.text, n);
    if (ts.isParameter(n) && ts.isIdentifier(n.name)) note(n.name.text, n);
    if (ts.isBindingElement(n) && ts.isIdentifier(n.name)) note(n.name.text, n);
    ts.forEachChild(n, visitDecl);
  };
  visitDecl(sf);

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

  const calls: ts.CallExpression[] = [];
  const findCalls = (n: ts.Node) => { if (ts.isCallExpression(n)) calls.push(n); ts.forEachChild(n, findCalls); };
  findCalls(sf);
  const calleeName = (c: ts.CallExpression) => ts.isIdentifier(c.expression) ? c.expression.text : ts.isPropertyAccessExpression(c.expression) ? c.expression.name.text : '';

  /** Every string a text expression could come out as (following names back through the file, and parameters to their callers). */
  const memo = new Map<ts.Node, string[]>();
  const inProgress = new Set<ts.Node>();
  const strings = (e: ts.Expression | undefined, depth = 0): string[] => {
    if (!e || depth > 40 || inProgress.has(e)) return [];
    const known = memo.get(e);
    if (known) return known;
    inProgress.add(e);
    const r = stringsOf(e, depth);
    inProgress.delete(e);
    memo.set(e, r);
    return r;
  };
  const stringsOf = (e: ts.Expression, depth: number): string[] => {
    const s = (x: ts.Expression | undefined) => strings(x, depth + 1);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return [e.text];
    if (ts.isTemplateExpression(e)) { unresolved.push(`${where(e)} template: ${e.getText().slice(0, 90)}`); return []; }
    if (ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e) || ts.isTypeAssertionExpression(e) || ts.isSatisfiesExpression(e)) return s(e.expression);
    if (ts.isConditionalExpression(e)) return [...s(e.whenTrue), ...s(e.whenFalse)];
    if (ts.isBinaryExpression(e) && (e.operatorToken.kind === ts.SyntaxKind.BarBarToken || e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)) return [...s(e.left), ...s(e.right)];
    if (ts.isArrayLiteralExpression(e)) return e.elements.flatMap(x => s(ts.isSpreadElement(x) ? x.expression : x as ts.Expression));
    if (ts.isSpreadElement(e)) return s(e.expression);
    if (ts.isObjectLiteralExpression(e)) {
      // (a line, { who, text }: just its text; any other table: everything in it)
      const text = e.properties.find(p => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'text');
      if (text && ts.isPropertyAssignment(text)) return s(text.initializer);
      return e.properties.flatMap(p => ts.isPropertyAssignment(p) ? s(p.initializer) : []);
    }
    if (ts.isCallExpression(e)) {
      const n = calleeName(e);
      // (picking one of a list: any of them)
      if (['pick', 'pickRandom', 'takeFreshLine', 'pickFreshLine'].includes(n) || /pick/i.test(n)) return e.arguments.flatMap(a => s(a));
      // (taking one off a list: `queue.shift()`)
      if (['shift', 'pop', 'at', 'slice', 'concat', 'filter', 'sort', 'reverse', 'find'].includes(n) && ts.isPropertyAccessExpression(e.expression)) return s(e.expression.expression);
      unresolved.push(`${where(e)} call: ${e.getText().slice(0, 90)}`);
      return [];
    }
    if (ts.isElementAccessExpression(e)) return s(e.expression);
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
      // A table in this file
      if (ts.isIdentifier(x)) {
        for (const d of scoped(x)) if (ts.isVariableDeclaration(d) && d.initializer && ts.isObjectLiteralExpression(d.initializer)) {
          const prop = d.initializer.properties.find(p => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === chain[0]);
          if (prop && ts.isPropertyAssignment(prop)) return s(prop.initializer);
        }
      }
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
      const out: string[] = [];
      const found = scoped(e);
      for (const d of found) {
        if (ts.isVariableDeclaration(d)) {
          out.push(...s(d.initializer));
          // (and whatever it's set to later: `let lines; ... lines = [...]`)
          const scope = d.parent?.parent?.parent;
          const look = (n: ts.Node) => { if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(n.left) && n.left.text === e.text) out.push(...s(n.right)); ts.forEachChild(n, look); };
          if (scope && ts.isVariableDeclarationList(d.parent) && !(d.parent.flags & ts.NodeFlags.Const)) look(scope);
        }
        else if (ts.isBindingElement(d)) {
          let q: ts.Node = d;
          while (q.parent && (ts.isArrayBindingPattern(q.parent) || ts.isObjectBindingPattern(q.parent) || ts.isBindingElement(q.parent))) q = q.parent;
          if (q.parent && ts.isVariableDeclaration(q.parent) && q.parent.initializer) out.push(...s(q.parent.initializer));
        }
        else if (ts.isParameter(d)) {
          // A parameter: whatever every caller passes in its place (a function's own name, or a callback's)
          const fn = d.parent as ts.SignatureDeclaration;
          const idx = fn.parameters.indexOf(d);
          const name = ts.isFunctionDeclaration(fn) && fn.name ? fn.name.text : ts.isVariableDeclaration(fn.parent) && ts.isIdentifier(fn.parent.name) ? fn.parent.name.text : null;
          if (name) for (const c of calls) if (calleeName(c) === name && c.arguments[idx]) out.push(...s(c.arguments[idx]));
          // (the parameter of a callback over a list: `lines.forEach(l => say(l...))`, `for (const [at, text] of LINES)`)
          if (!name && ts.isCallExpression(fn.parent) && ts.isPropertyAccessExpression(fn.parent.expression)) out.push(...s(fn.parent.expression.expression));
        }
      }
      // for (const [a, text] of LIST) / for (const x of LIST)
      for (const d of found) {
        let p: ts.Node | undefined = d.parent;
        while (p && !ts.isForOfStatement(p)) p = ts.isArrayBindingPattern(p) || ts.isVariableDeclaration(p) || ts.isVariableDeclarationList(p) || ts.isBindingElement(p) || ts.isObjectBindingPattern(p) ? p.parent : undefined;
        if (p && ts.isForOfStatement(p)) out.push(...s(p.expression));
      }
      if (!out.length && !found.length) unresolved.push(`${where(e)} name: ${e.text}`);
      return out;
    }
    unresolved.push(`${where(e)} expr: ${e.getText().slice(0, 90)}`);
    return [];
  };

  /** Who a voice expression is. */
  const voices = (e: ts.Expression | undefined): string[] => {
    if (!e) return [];
    if (ts.isIdentifier(e)) { if (VOICE_CONSTS[e.text]) return [VOICE_CONSTS[e.text]]; for (const d of scoped(e)) if (ts.isVariableDeclaration(d) && d.initializer) return voices(d.initializer); return []; }
    if (ts.isConditionalExpression(e)) return [...voices(e.whenTrue), ...voices(e.whenFalse)];
    if (ts.isParenthesizedExpression(e)) return voices(e.expression);
    if (ts.isObjectLiteralExpression(e)) {
      const id = e.properties.find(p => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'id');
      if (id && ts.isPropertyAssignment(id) && ts.isStringLiteral(id.initializer)) return [id.initializer.text];
    }
    return [];
  };

  // 1) say / speak / sayModulated, and the helpers around them
  for (const c of calls) {
    const n = calleeName(c);
    const a = c.arguments;
    if ((n === 'say' || n === 'speak' || n === 'sayModulated') && a.length >= 2) {
      // (a stage's own say/speak with the text further along: speak(tour, who, text, VOICE), say(state, talk, text))
      let ti = 0, vi = 1;
      if (a.length === 4 && n === 'speak') { ti = 2; vi = 3; }
      const vs = voices(a[vi]);
      if (!vs.length) { unresolved.push(`${where(c)} voice: ${a[vi]?.getText().slice(0, 60)}`); continue; }
      for (const v of vs) for (const t of strings(a[ti])) add(v, t, where(c));
    }
    // The big ones the announcer always calls: announceKill(text)
    if (n === 'announceKill' && a[0]) for (const t of strings(a[0])) add('announcer', t, where(c));
    // The death screen, read out by the death announcer: killPlayer(ctx, message)
    if (n === 'killPlayer' && a[1]) for (const t of strings(a[1])) add('death', t, where(c));
    if (n === 'speakAsBoss') {
      const bossNames = strings(a[0]);
      for (const b of bossNames) if (BOSS_ID[b]) for (const t of strings(a[1])) add(BOSS_ID[b], t, where(c));
    }
  }

  // 1b) the stages' death screens: whatever a ...DeathMessage function can return
  const deathFns = (n: ts.Node) => {
    let body: ts.Node | undefined;
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && /DeathMessage$/.test(n.name.text) && n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer))) body = n.initializer.body;
    if (ts.isFunctionDeclaration(n) && n.name && /DeathMessage$/.test(n.name.text)) body = n.body;
    if (body) {
      if (!ts.isBlock(body)) for (const t of strings(body as ts.Expression)) add('death', t, where(n));
      const rets = (m: ts.Node) => {
        if (ts.isReturnStatement(m) && m.expression) for (const t of strings(m.expression)) add('death', t, where(m));
        if (!ts.isFunctionLike(m)) ts.forEachChild(m, rets);
      };
      ts.forEachChild(body, rets);
    }
    ts.forEachChild(n, deathFns);
  };
  deathFns(sf);

  // 2) { who, text } and { voice, text }
  const visitObj = (n: ts.Node) => {
    if (ts.isObjectLiteralExpression(n)) {
      const prop = (name: string) => n.properties.find(p => (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) && ts.isIdentifier(p.name) && p.name.text === name);
      const text = prop('text');
      const textExpr = text && (ts.isPropertyAssignment(text) ? text.initializer : ts.isShorthandPropertyAssignment(text) ? text.name : undefined);
      const who = prop('who');
      const voice = prop('voice');
      if (textExpr && who && ts.isPropertyAssignment(who)) {
        for (const w of strings(who.initializer)) {
          const v = whoVoice(file, w);
          if (v) for (const t of strings(textExpr)) add(v, t, where(n));
          else unresolved.push(`${where(n)} who: ${w}`);
        }
      } else if (textExpr && voice && ts.isPropertyAssignment(voice)) {
        for (const v of voices(voice.initializer)) for (const t of strings(textExpr)) add(v, t, where(n));
      }
    }
    ts.forEachChild(n, visitObj);
  };
  visitObj(sf);
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
