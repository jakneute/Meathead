// Meathead 2's build leaves Meathead 1's own content out: its stages, its bosses (their logic and their art) and its
// cutscenes. The shared engine still names them (the stage list, the boss registry), so each of those modules is
// swapped for a stand-in with the same exports: a do-nothing that's never reached, since Meathead 2 never goes there.
// Only for `--mode m2`; Meathead 1's own build has the real thing.

import type { Plugin } from 'vite';
import * as fs from 'fs';
import ts from 'typescript';

const M1_ONLY = [
  /[\/]src[\/]game[\/]stages[\/](artie|barry|dale|ernie|finale|gym|hector|oscar|tommy|victor|whiteHouse)[\/]/,
  /[\/]src[\/]game[\/]bosses[\/](alien|alienDeath|artie|barry|dale|ernie|hector|oscar|tommy|victor)\.ts$/,
  /[\/]src[\/]game[\/]render[\/]bosses[\/](?!kit\.ts$|boulders\.ts$)/,
  /[\/]src[\/]game[\/]scenes[\/](ending|endingAlien|epilogue|faceOff|faceOffEgg|fastFood|grossUp|intro|radio|sewerNuke|sewerNukeDraw|volcanoFinale|volcanoFinaleDraw|victoryPee|victoryPeeDraw|weaponShot|weaponShotFx|bossFour|alienLook|titleArt)\.ts$/,
];

/** Every value a module exports (types are gone by then anyway), and its `export * from`s, read off its syntax tree. */
const exportsOf = (file: string, src: string) => {
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, false, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const names = new Set<string>(), stars: string[] = [];
  let hasDefault = false;
  const exported = (n: ts.Node) => !!(ts.getCombinedModifierFlags(n as ts.Declaration) & ts.ModifierFlags.Export);
  const bind = (b: ts.BindingName) => {
    if (ts.isIdentifier(b)) names.add(b.text);
    else for (const e of b.elements) if (!ts.isOmittedExpression(e)) bind(e.name);
  };
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st) && exported(st)) st.declarationList.declarations.forEach(d => bind(d.name));
    else if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isEnumDeclaration(st)) && exported(st)) {
      if (ts.getCombinedModifierFlags(st) & ts.ModifierFlags.Default) hasDefault = true;
      else if (st.name) names.add(st.name.text);
    } else if (ts.isExportDeclaration(st) && !st.isTypeOnly) {
      if (!st.exportClause && st.moduleSpecifier) stars.push(st.moduleSpecifier.getText(sf));
      else if (st.exportClause && ts.isNamedExports(st.exportClause)) for (const e of st.exportClause.elements) if (!e.isTypeOnly) names.add(e.name.text);
    } else if (ts.isExportAssignment(st)) hasDefault = true;
  }
  names.delete('default');
  return { names: [...names], stars, hasDefault };
};

const STUB = `const __m1 = new Proxy(function () {}, {
  get: (_t, k) => k === Symbol.toPrimitive ? () => 0 : k === Symbol.iterator ? function* () {} : k === 'then' ? undefined : __m1,
  apply: () => undefined,
  construct: () => ({}),
});`;

export const m2Stub = (): Plugin => ({
  name: 'm2-stub-m1-content',
  enforce: 'pre',
  load(id) {
    const file = id.split('?')[0];
    if (!M1_ONLY.some(r => r.test(file)) || !/\.tsx?$/.test(file)) return null;
    const { names, stars, hasDefault } = exportsOf(file, fs.readFileSync(file, 'utf8'));
    return [STUB, ...names.map(n => `export const ${n} = __m1;`), ...stars.map(s => `export * from ${s};`), hasDefault ? 'export default __m1;' : ''].join('\n');
  },
});
