// brand/ と各テンプレートの組み合わせを検査する。依存なし、Node.js 20以上。
// 6リポジトリを同じフォルダに並べて取得しておき、そのフォルダを --repos で渡す（省略時はこのリポジトリの親）。
//
// 使い方: node scripts/check.mjs [--repos <dir>]
//
// 1. 既定の brand/ を各テンプレートへ当てても何も変わらない（既定値の写しであること）
// 2. 既定の tokens.css を diagrams の build:themes --tokens に渡すと、themes/*.json と同じものができる
// 3. そこで作った neutral.json で one-pager の検査が通る
// 4. 別のブランド（ライトとダークが違う値）でも、diagrams にはライトの値だけが渡り、
//    one-pager の検査が通り、docusaurus のダーク側にだけダークの値が入る
import {spawnSync} from 'node:child_process';
import {cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reposIndex = process.argv.indexOf('--repos');
const repos = path.resolve(reposIndex >= 0 ? process.argv[reposIndex + 1] : path.join(root, '..'));
const apply = path.join(root, 'brand/apply.mjs');

// 各テンプレートでトークンブロックを持つファイル
const templates = {
  'pandoc-template': ['styles/document.css'],
  'docusaurus-template': ['src/css/custom.css'],
  'one-pager': ['theme.css'],
  'marp-theme': ['themes/forsteri/forsteri.css'],
  'slidev-theme': ['theme/styles/brand-tokens.css'],
  diagrams: ['tokens/neutral.css', 'tokens/forsteri.css'],
};

const work = mkdtempSync(path.join(tmpdir(), 'docs-toolkit-check-'));
let failures = 0;

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {cwd, encoding: 'utf8'});
  return {ok: result.status === 0, output: `${result.stdout}${result.stderr}`.trim()};
}

function report(ok, label, output = '') {
  console.log(`${ok ? 'ok  ' : 'NG  '} ${label}`);
  if (!ok) {
    failures++;
    if (output) console.log(output.replace(/^/gm, '     '));
  }
}

function buildThemes(tokensFile, outDir) {
  return run('node', [path.join(repos, 'diagrams/scripts/build-themes.mjs'), '--tokens', tokensFile, '--out', outDir]);
}

function onePagerCheck(themeCss, neutralJson) {
  const dir = path.join(work, `one-pager-${failures}-${Date.now()}`);
  cpSync(path.join(repos, 'one-pager'), dir, {recursive: true, filter: (src) => !src.includes(`${path.sep}.git`)});
  if (themeCss) cpSync(themeCss, path.join(dir, 'theme.css'));
  cpSync(neutralJson, path.join(dir, 'design/neutral.json'));
  const result = run('node', ['scripts/check.mjs'], dir);
  // 失敗した項目だけを残す
  return {...result, output: result.output.split('\n').filter((line) => /NG|失敗/.test(line)).join('\n')};
}

try {
  // 1. 既定値の写し
  const files = Object.entries(templates).flatMap(([repo, list]) => list.map((file) => path.join(repos, repo, file)));
  const defaults = run('node', [apply, '--check', ...files]);
  report(defaults.ok && !defaults.output.includes('警告'), '既定の brand/ を当てても各テンプレートは変わらない', defaults.output);

  // 2. diagrams に既定の tokens.css を渡す
  const defaultOut = path.join(work, 'default-themes');
  const built = buildThemes(path.join(root, 'brand/tokens.css'), defaultOut);
  report(built.ok, 'diagrams の build:themes が既定の tokens.css を読める', built.output);
  for (const theme of ['neutral', 'forsteri']) {
    const same = built.ok && readFileSync(path.join(defaultOut, `${theme}.json`), 'utf8')
      === readFileSync(path.join(repos, 'diagrams/themes', `${theme}.json`), 'utf8');
    report(same, `既定の tokens.css で作った ${theme}.json が diagrams の themes/ と一致する`);
  }

  // 3. one-pager
  if (built.ok) {
    const result = onePagerCheck(null, path.join(defaultOut, 'neutral.json'));
    report(result.ok, '既定の neutral.json で one-pager の検査が通る', result.output);
  }

  // 4. 別のブランド
  const brand = path.join(work, 'brand');
  cpSync(path.join(root, 'brand'), brand, {recursive: true});
  writeFileSync(path.join(brand, 'tokens.css'), [
    '--dt-accent: #4338ca;', '--dt-accent-strong: #3730a3;', '--dt-accent-soft: #eef2ff;',
    '--dt-accent-tint: #e0e7ff;', '--dt-on-accent: #ffffff;',
    '--dt-night-accent-rgb: 165 180 252;', '--dt-night-accent-deep: #1e1b4b;', '',
  ].join('\n'));
  writeFileSync(path.join(brand, 'tokens.dark.css'), '--dt-accent: #a5b4fc;\n--dt-accent-soft: #1e1b4b;\n');

  const copies = path.join(work, 'templates');
  const targets = {};
  for (const [repo, list] of Object.entries(templates)) {
    if (repo === 'diagrams') continue;
    for (const file of list) {
      targets[repo] = path.join(copies, repo, path.basename(file));
      cpSync(path.join(repos, repo, file), targets[repo]);
    }
  }
  const applied = run('node', [path.join(brand, 'apply.mjs'), ...Object.values(targets)]);
  report(applied.ok, '別のブランドを各テンプレートへ当てられる', applied.output);
  const again = run('node', [path.join(brand, 'apply.mjs'), '--check', ...Object.values(targets)]);
  report(again.ok, '当てたあとの --check で違いが無い', again.output);

  const brandOut = path.join(work, 'brand-themes');
  const brandBuilt = buildThemes(path.join(brand, 'tokens.css'), brandOut);
  report(brandBuilt.ok, 'diagrams の build:themes が別のブランドの tokens.css を読める', brandBuilt.output);
  if (brandBuilt.ok) {
    const vars = JSON.parse(readFileSync(path.join(brandOut, 'neutral.json'), 'utf8')).themeVariables;
    report(vars.primaryBorderColor === '#4338ca' && vars.primaryColor === '#eef2ff',
      `diagrams にはライトの値だけが渡る（primaryBorderColor ${vars.primaryBorderColor}、primaryColor ${vars.primaryColor}）`);
    const result = onePagerCheck(targets['one-pager'], path.join(brandOut, 'neutral.json'));
    report(result.ok, '別のブランドの theme.css と neutral.json で one-pager の検査が通る', result.output);
  }

  const css = readFileSync(targets['docusaurus-template'], 'utf8');
  const dark = css.slice(css.indexOf("[data-theme='dark'] {"));
  const light = css.slice(0, css.indexOf("[data-theme='dark'] {"));
  report(/--dt-accent:\s*#a5b4fc;/.test(dark) && /--dt-accent:\s*#4338ca;/.test(light),
    'docusaurus はライト側にライトの値、ダーク側にダークの値が入る');

  // 規則を含むブランド値は受け付けない（diagrams が同名を後勝ちで読むため）
  writeFileSync(path.join(brand, 'tokens.css'), "--dt-accent: #4338ca;\n[data-theme='dark'] { --dt-accent: #a5b4fc; }\n");
  const rejected = run('node', [path.join(brand, 'apply.mjs'), '--check', targets['pandoc-template']]);
  report(!rejected.ok && rejected.output.includes('規則'), '規則を含む tokens.css は apply.mjs がエラーにする');
} finally {
  rmSync(work, {recursive: true, force: true});
}

console.log(failures === 0 ? '\nすべて通りました' : `\n${failures}件が失敗しました`);
process.exit(failures === 0 ? 0 : 1);
