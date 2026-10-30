// brand/ と各テンプレートの組み合わせ、版の記録、取り込みの道具を検査する。依存なし、Node.js 20以上と git が必要。
//
// 使い方: node scripts/check.mjs [--set <確認日> | --repos <dir>]
//   --set    verified.json の組み合わせを記録したSHAで取得して検査する（省略時は先頭＝最新の組み合わせ）
//   --repos  6リポジトリを並べたフォルダを検査する（各リポジトリの未マージの変更を試すとき）
//
// 0. verified.json の形と、README の「動作確認済みの組み合わせ」の先頭行が一致する。取得したSHAとタグが記録どおり
// 1. 既定の brand/ を各テンプレートへ当てても何も変わらない（既定値の写しであること）
// 2. 既定の tokens.css を diagrams の build:themes --tokens に渡すと、themes/*.json と同じものができる
// 3. そこで作った neutral.json で one-pager の検査が通る
// 4. 別のブランド（ライトとダークが違う値）を各テンプレートへ当て、各テンプレートの「当てたあとに実行する」手順と
//    依存なしの検査が通る。diagrams にはライトの値だけが渡り、docusaurus のダーク側にだけダークの値が入る。
//    スライド系（Marp・Slidev・diagrams forsteri）に既定のティール系の値が残らない
// 5. scripts/import.mjs の検査（scripts/test-import.mjs）が通る
import {spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {fetchSet, loadSet, verifiedFile} from './fetch.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);

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
let repos;
// 検査に使う brand/。組み合わせに docs-toolkit の brand/ が記録されていればそれを、無ければこのリポジトリのものを使う
let brandRoot = path.join(root, 'brand');

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

// 失敗した項目だけを残す
function onlyFailures(output) {
  return output.split('\n').filter((line) => /NG|失敗|Error|エラー/.test(line)).join('\n') || output;
}

function buildThemes(tokensFile, outDir) {
  return run('node', [path.join(repos, 'diagrams/scripts/build-themes.mjs'), '--tokens', tokensFile, '--out', outDir]);
}

// リポジトリを .git と node_modules を除いて写す
function copyRepo(repo, dir) {
  cpSync(path.join(repos, repo), dir, {
    recursive: true,
    filter: (src) => !/[\\/](\.git|node_modules)([\\/]|$)/.test(path.relative(repos, src)),
  });
  return dir;
}

function onePagerCheck(dir, neutralJson) {
  cpSync(neutralJson, path.join(dir, 'design/neutral.json'));
  const result = run('node', ['scripts/check.mjs'], dir);
  return {...result, output: onlyFailures(result.output)};
}

// 0. verified.json の形と README の表
function checkRecord() {
  const sha = /^[0-9a-f]{40}$/;
  const {sets} = JSON.parse(readFileSync(verifiedFile, 'utf8'));
  const problems = [];
  if (!Array.isArray(sets) || sets.length === 0) problems.push('sets が空です');
  for (const set of sets ?? []) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(set.verified ?? '')) problems.push(`verified が日付ではありません: ${set.verified}`);
    if (!sha.test(set.sample?.commit ?? '')) problems.push(`${set.verified}: sample.commit が完全なSHAではありません`);
    for (const name of Object.keys(templates)) {
      if (!set.repos?.[name]) problems.push(`${set.verified}: ${name} がありません`);
    }
    for (const [name, entry] of Object.entries(set.repos ?? {})) {
      if (!sha.test(entry.commit ?? '')) problems.push(`${set.verified}: ${name} の commit が完全なSHAではありません`);
      if (!/^https:\/\/.+\.git$/.test(entry.repo ?? '')) problems.push(`${set.verified}: ${name} の repo がURLではありません`);
      if (entry.tag !== null && typeof entry.tag !== 'string') problems.push(`${set.verified}: ${name} の tag は文字列か null です`);
    }
  }
  report(problems.length === 0, 'verified.json の形が正しい', problems.join('\n'));
  if (problems.length > 0) return;

  // README の表の先頭行（日付・サンプル・6リポジトリの短いSHA）が sets[0] と一致する
  const latest = sets[0];
  const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
  const section = readme.slice(readme.indexOf('## 動作確認済みの組み合わせ'));
  const header = section.split('\n').find((line) => line.startsWith('| 確認日'));
  const row = section.split('\n').find((line) => /^\| \d{4}-/.test(line));
  const columns = (line) => line.split('|').slice(1, -1).map((cell) => cell.trim().replace(/`/g, ''));
  const expected = Object.fromEntries([
    ['確認日', latest.verified], ['サンプル', latest.sample.commit.slice(0, 7)],
    ...Object.entries(latest.repos).map(([name, entry]) => [name, entry.commit.slice(0, 7)]),
  ]);
  const actual = header && row ? Object.fromEntries(columns(header).map((name, i) => [name, columns(row)[i].match(/^[^\s（(]*/)[0]])) : {};
  const diff = Object.entries(expected).filter(([name, cell]) => actual[name] !== cell)
    .map(([name, cell]) => `  ${name}: README ${actual[name] ?? '(列なし)'} / verified.json ${cell}`);
  report(diff.length === 0, 'README の表の先頭行が verified.json の最新の組み合わせと一致する', diff.join('\n'));
}

try {
  checkRecord();

  if (args.includes('--repos')) {
    repos = path.resolve(value('--repos'));
  } else {
    const set = loadSet(value('--set'));
    repos = path.join(work, 'repos');
    mkdirSync(repos);
    try {
      const dirs = fetchSet(set, repos);
      if (dirs['docs-toolkit']) brandRoot = path.join(dirs['docs-toolkit'], set.repos['docs-toolkit'].path ?? 'brand');
      report(true, `${set.verified} の組み合わせを記録したSHAで取得できる（タグがあればタグも一致）`);
    } catch (error) {
      report(false, `${set.verified} の組み合わせを記録したSHAで取得できる`, error.message);
      throw error;
    }
  }

  // 1. 既定値の写し
  const files = Object.entries(templates).flatMap(([repo, list]) => list.map((file) => path.join(repos, repo, file)));
  const defaults = run('node', [path.join(brandRoot, 'apply.mjs'), '--check', ...files]);
  report(defaults.ok && !defaults.output.includes('警告'), '既定の brand/ を当てても各テンプレートは変わらない', defaults.output);

  // 2. diagrams に既定の tokens.css を渡す
  const defaultOut = path.join(work, 'default-themes');
  const built = buildThemes(path.join(brandRoot, 'tokens.css'), defaultOut);
  report(built.ok, 'diagrams の build:themes が既定の tokens.css を読める', built.output);
  for (const theme of ['neutral', 'forsteri']) {
    const same = built.ok && readFileSync(path.join(defaultOut, `${theme}.json`), 'utf8')
      === readFileSync(path.join(repos, 'diagrams/themes', `${theme}.json`), 'utf8');
    report(same, `既定の tokens.css で作った ${theme}.json が diagrams の themes/ と一致する`);
  }

  // 3. one-pager
  if (built.ok) {
    const result = onePagerCheck(copyRepo('one-pager', path.join(work, 'one-pager-default')), path.join(defaultOut, 'neutral.json'));
    report(result.ok, '既定の neutral.json で one-pager の検査が通る', result.output);
  }

  // 4. 別のブランド
  const brand = path.join(work, 'brand');
  cpSync(brandRoot, brand, {recursive: true});
  writeFileSync(path.join(brand, 'tokens.css'), [
    '--dt-accent: #4338ca;', '--dt-accent-strong: #3730a3;', '--dt-accent-soft: #eef2ff;',
    '--dt-accent-tint: #e0e7ff;', '--dt-on-accent: #ffffff;',
    '--dt-series-1: #a5b4fc;', '--dt-series-3: #5eead4;',
    '--dt-night-accent-rgb: 165 180 252;', '--dt-night-accent-deep: #1e1b4b;',
    '--dt-night-bg: #0f1024;', '--dt-night-bg-deep: #07071a;', '--dt-night-surface: #1a1b3d;',
    '--dt-night-text: #f5f5fc;', '--dt-night-text-muted: #a3a6c9;', '--dt-night-text-soft: #c8cae6;', '',
  ].join('\n'));
  writeFileSync(path.join(brand, 'tokens.dark.css'), '--dt-accent: #a5b4fc;\n--dt-accent-soft: #1e1b4b;\n');

  const copies = {};
  const targets = [];
  for (const [repo, list] of Object.entries(templates)) {
    if (repo === 'diagrams') continue;
    copies[repo] = copyRepo(repo, path.join(work, 'templates', repo));
    targets.push(...list.map((file) => path.join(copies[repo], file)));
  }
  const applied = run('node', [path.join(brand, 'apply.mjs'), ...targets]);
  report(applied.ok, '別のブランドを各テンプレートへ当てられる', applied.output);
  const again = run('node', [path.join(brand, 'apply.mjs'), '--check', ...targets]);
  report(again.ok, '当てたあとの --check で違いが無い', again.output);
  const has = (repo, file, text) => readFileSync(path.join(copies[repo], file), 'utf8').includes(text);

  // pandoc-template: 当てたあとの検査
  const pandoc = run('node', ['scripts/check-tokens.mjs'], copies['pandoc-template']);
  report(pandoc.ok && has('pandoc-template', 'styles/document.css', '#4338ca'),
    'pandoc-template: 当てたあとに check-tokens が通る', onlyFailures(pandoc.output));

  // docusaurus-template: 派生色の計算 → Mermaid 設定の生成 → 検査。ティールの値が残らない
  const docusaurus = copies['docusaurus-template'];
  const derived = [
    run('node', ['scripts/derive-brand.mjs', '--write'], docusaurus),
    run('node', ['scripts/build-mermaid-theme.mjs'], docusaurus),
    run('node', ['scripts/check-tokens.mjs'], docusaurus),
  ];
  const teal = /#0f766e|#0a534d|#0d6b63|15 118 110/i;
  const docusaurusCss = readFileSync(path.join(docusaurus, 'src/css/custom.css'), 'utf8');
  report(derived.every((result) => result.ok) && !teal.test(docusaurusCss)
    && has('docusaurus-template', 'assets/mermaid/neutral.json', '#4338ca'),
  'docusaurus-template: brand:derive・build:mermaid・check が通り、主色系にティールが残らない',
  derived.map((result) => onlyFailures(result.output)).join('\n'));
  const dark = docusaurusCss.slice(docusaurusCss.indexOf("[data-theme='dark'] {"));
  const light = docusaurusCss.slice(0, docusaurusCss.indexOf("[data-theme='dark'] {"));
  report(/--dt-accent:\s*#a5b4fc;/.test(dark) && /--dt-accent:\s*#4338ca;/.test(light),
    'docusaurus-template: ライト側にライトの値、ダーク側にダークの値が入る');

  // slidev-theme: brand:sync で生成物を作り直し、brand:check が通る
  const slidev = copies['slidev-theme'];
  const synced = [run('node', ['theme/scripts/sync-brand.mjs'], slidev), run('node', ['theme/scripts/sync-brand.mjs', '--check'], slidev)];
  report(synced.every((result) => result.ok) && has('slidev-theme', 'theme/assets/mermaid-forsteri.json', '#4338ca'),
    'slidev-theme: brand:sync のあと brand:check が通り、Mermaid 設定に主色が入る',
    synced.map((result) => result.output).join('\n'));

  // marp-theme: 検査は Marp CLI が要るのでここでは値が入ったことだけを見る
  report(has('marp-theme', 'themes/forsteri/forsteri.css', '#4338ca') && has('marp-theme', 'themes/forsteri/forsteri.css', '165 180 252'),
    'marp-theme: 主色と Night の主色が入る（変換の検査は marp-theme の npm run check）');

  // diagrams と one-pager
  const brandOut = path.join(work, 'brand-themes');
  const brandBuilt = buildThemes(path.join(brand, 'tokens.css'), brandOut);
  report(brandBuilt.ok, 'diagrams の build:themes が別のブランドの tokens.css を読める', brandBuilt.output);
  if (brandBuilt.ok) {
    const vars = JSON.parse(readFileSync(path.join(brandOut, 'neutral.json'), 'utf8')).themeVariables;
    report(vars.primaryBorderColor === '#4338ca' && vars.primaryColor === '#eef2ff',
      `diagrams にはライトの値だけが渡る（primaryBorderColor ${vars.primaryBorderColor}、primaryColor ${vars.primaryColor}）`);
    const result = onePagerCheck(copies['one-pager'], path.join(brandOut, 'neutral.json'));
    report(result.ok, 'one-pager: 別のブランドの theme.css と neutral.json で検査が通る', result.output);
    const series = JSON.parse(readFileSync(path.join(brandOut, 'forsteri.json'), 'utf8')).themeVariables;
    report(series.cScale0 === '#a5b4fc' && series.activationBkgColor === '#a5b4fc',
      `diagrams forsteri の系列色1が差し替わる（cScale0 ${series.cScale0}、activationBkgColor ${series.activationBkgColor}）`);
  }

  // スライド系に既定のティール系の値が残らない。既定の tokens.css にある色（白を除く）をブロック内から探す
  const defaultColors = [...readFileSync(path.join(brandRoot, 'tokens.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/--dt-[\w-]+:\s*([^;]+);/g)]
    .map((match) => match[1].trim().toLowerCase())
    .filter((value) => value !== '#ffffff');
  const block = (text) => text.slice(text.indexOf('@brand-tokens-start'), text.indexOf('@brand-tokens-end'))
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const leftovers = (text, allowed = []) => [...block(text).matchAll(/(--dt-[\w-]+):\s*([^;]+);/g)]
    .filter(([, name, value]) => defaultColors.includes(value.trim().toLowerCase()) && !allowed.includes(name))
    .map(([, name, value]) => `${name}: ${value.trim()}`);
  // 系列色3は別のブランドで既定の系列色1（ティール）と入れ替えたので、残っていてよい
  for (const [repo, file] of [['marp-theme', templates['marp-theme'][0]], ['slidev-theme', templates['slidev-theme'][0]]]) {
    const rest = leftovers(readFileSync(path.join(copies[repo], file), 'utf8'), ['--dt-series-3']);
    report(rest.length === 0, `${repo} に既定のティール系の値が残らない`, rest.join('\n'));
  }

  // 規則を含むブランド値は受け付けない（diagrams が同名を後勝ちで読むため）
  writeFileSync(path.join(brand, 'tokens.css'), "--dt-accent: #4338ca;\n[data-theme='dark'] { --dt-accent: #a5b4fc; }\n");
  const rejected = run('node', [path.join(brand, 'apply.mjs'), '--check', targets[0]]);
  report(!rejected.ok && rejected.output.includes('規則'), '規則を含む tokens.css は apply.mjs がエラーにする');

  // 5. 取り込みの道具
  const imports = run('node', [path.join(root, 'scripts/test-import.mjs')]);
  report(imports.ok, 'scripts/import.mjs の検査（追加・変更・削除・移動・競合・撤回）が通る', onlyFailures(imports.output));
} catch (error) {
  if (failures === 0) report(false, '検査を最後まで実行できない', error.stack);
} finally {
  rmSync(work, {recursive: true, force: true});
}

console.log(failures === 0 ? '\nすべて通りました' : `\n${failures}件が失敗しました`);
process.exit(failures === 0 ? 0 : 1);
