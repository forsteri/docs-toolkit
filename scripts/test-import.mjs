// scripts/import.mjs の検査。依存なし、Node.js 20以上と git が必要。
// 一時フォルダに取り込み元と利用プロジェクトのリポジトリを作り、追加・変更・削除・移動・競合・撤回を確かめる。
//
// 使い方: node scripts/test-import.mjs
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const importer = path.join(path.dirname(fileURLToPath(import.meta.url)), 'import.mjs');
const work = mkdtempSync(path.join(tmpdir(), 'test-import-'));
const upstream = path.join(work, 'upstream');
const consumer = path.join(work, 'consumer');
let failures = 0;

function report(ok, label, output = '') {
  console.log(`${ok ? 'ok  ' : 'NG  '} ${label}`);
  if (!ok) {
    failures++;
    if (output) console.log(output.replace(/^/gm, '     '));
  }
}
function run(command, args, cwd) {
  const result = spawnSync(command, args, {cwd, encoding: 'utf8'});
  return {ok: result.status === 0, output: `${result.stdout}${result.stderr}`.trim()};
}
function git(cwd, ...args) {
  const result = run('git', ['-c', 'user.name=test', '-c', 'user.email=test@localhost', ...args], cwd);
  if (!result.ok) throw new Error(`git ${args.join(' ')}: ${result.output}`);
  return result.output;
}
function write(dir, files) {
  for (const [file, text] of Object.entries(files)) {
    const target = path.join(dir, file);
    if (text === null) rmSync(target, {force: true});
    else {
      mkdirSync(path.dirname(target), {recursive: true});
      writeFileSync(target, text);
    }
  }
}
function read(file) {
  return existsSync(path.join(consumer, file)) ? readFileSync(path.join(consumer, file), 'utf8') : null;
}
function commit(dir, message, files) {
  write(dir, files);
  git(dir, 'add', '-A');
  git(dir, 'commit', '--quiet', '-m', message);
  return git(dir, 'rev-parse', 'HEAD');
}
function importTool(...args) {
  return run('node', [importer, ...args], consumer);
}
function record() {
  return JSON.parse(readFileSync(path.join(consumer, 'toolkit-imports.json'), 'utf8')).imports[0];
}

try {
  // 取り込み元: テンプレートは template/ の下にある
  mkdirSync(upstream);
  git(upstream, 'init', '--quiet', '-b', 'main');
  const v1 = commit(upstream, 'v1', {
    'README.md': '取り込み元のREADME\n',
    'template/theme.css': '/* @brand-tokens-start */\n--dt-accent: #0f766e;\n/* @brand-tokens-end */\nbody { margin: 0; }\n',
    'template/scripts/old-name.mjs': 'export const name = 1;\n',
    'template/gone.txt': '上流で消える\n',
    'template/LICENSE': 'MIT\n',
  });

  // 利用プロジェクト
  mkdirSync(consumer);
  git(consumer, 'init', '--quiet', '-b', 'main');
  write(consumer, {'.gitignore': 'node_modules/\n'});
  let result = importTool('add', 'tools/template', '--repo', upstream, '--path', 'template', '--to', 'main');
  report(result.ok && read('tools/template/theme.css')?.includes('#0f766e') && read('tools/template/README.md') === null,
    'add: --path のサブフォルダだけを取り込む', result.output);
  report(record().commit === v1 && record().path === 'template', 'add: 完全なSHAとサブフォルダを記録する');

  // 利用側の改変: ブランド値を変え、LICENSE を外し、自分のファイルを足す。無視されるファイルも置く
  write(consumer, {
    'tools/template/theme.css': read('tools/template/theme.css').replace('#0f766e', '#4338ca'),
    'tools/template/LICENSE': null,
    'tools/template/local.md': '利用側のメモ\n',
    'tools/template/node_modules/pkg/index.js': '// 無視されるファイル\n',
  });
  git(consumer, 'add', '-A');
  git(consumer, 'commit', '--quiet', '-m', '取り込み');

  result = importTool('status');
  report(result.ok && /変更\s+theme\.css/.test(result.output) && /削除\s+LICENSE/.test(result.output)
    && /追加\s+local\.md/.test(result.output) && !result.output.includes('node_modules'),
  'status: 利用側の変更・削除・追加を表示し、無視されるファイルは数えない', result.output);

  // 上流の v2: 本体を変え、ファイルを移動・削除・追加し、利用側が外した LICENSE を変える
  const v2 = commit(upstream, 'v2', {
    'template/theme.css': '/* @brand-tokens-start */\n--dt-accent: #0f766e;\n/* @brand-tokens-end */\nbody { margin: 0; padding: 0; }\n',
    'template/scripts/old-name.mjs': null,
    'template/scripts/new-name.mjs': 'export const name = 1;\n',
    'template/gone.txt': null,
    'template/added.txt': '上流で増えた\n',
    'template/LICENSE': 'MIT License\n',
  });
  git(upstream, 'tag', 'v0.2.0');

  result = importTool('update', 'tools/template', '--to', 'v0.2.0', '--dry-run');
  report(result.ok && read('tools/template/gone.txt') !== null && record().commit === v1,
    'update --dry-run: 置き場所と記録を変えない', result.output);

  result = importTool('update', 'tools/template', '--to', 'v0.2.0');
  const theme = read('tools/template/theme.css') ?? '';
  report(result.ok && theme.includes('#4338ca') && theme.includes('padding: 0;'),
    'update: 上流の変更と利用側のブランド値の両方が残る', result.output);
  report(read('tools/template/scripts/new-name.mjs') !== null && read('tools/template/scripts/old-name.mjs') === null,
    'update: 上流での移動が反映される');
  report(read('tools/template/gone.txt') === null && read('tools/template/added.txt') !== null,
    'update: 上流での削除と追加が反映される');
  report(read('tools/template/LICENSE') === null && result.output.includes('利用側で削除済みのまま'),
    'update: 利用側で外したファイルは、上流で変わっても外したまま（注記する）');
  report(read('tools/template/local.md') !== null && read('tools/template/node_modules/pkg/index.js') !== null,
    'update: 利用側で足したファイルと、無視されるファイルに触らない');
  report(record().commit === v2 && record().tag === 'v0.2.0', 'update: 記録を新しい完全なSHAとタグにする');
  git(consumer, 'add', '-A');
  git(consumer, 'commit', '--quiet', '-m', 'v2 へ');

  // 撤回: v1 に戻すと、v1 で取り込んで改変した状態と同じになる
  result = importTool('update', 'tools/template', '--to', v1);
  git(consumer, 'add', '-A');
  const back = git(consumer, 'diff', '--cached', '--stat', 'HEAD~1', '--', 'tools/template');
  report(result.ok && back === '' && record().commit === v1 && record().tag === null,
    'update で旧版へ撤回すると、取り込み直す前と同じになる', `${result.output}\n${back}`);
  git(consumer, 'reset', '--quiet', '--hard');

  // 競合: 上流がブランド値の行を変えると、競合として一覧にし、終了コード1にする
  commit(upstream, 'v3', {
    'template/theme.css': '/* @brand-tokens-start */\n--dt-accent: #0d9488;\n/* @brand-tokens-end */\nbody { margin: 0; padding: 0; }\n',
    'template/scripts/new-name.mjs': null,
  });
  write(consumer, {'tools/template/scripts/new-name.mjs': 'export const name = 2; // 利用側で変更\n'});
  git(consumer, 'commit', '--quiet', '-am', '利用側で変更');
  result = importTool('update', 'tools/template', '--to', 'main');
  report(!result.ok && /競合（両方が変更）\s+theme\.css/.test(result.output)
    && (read('tools/template/theme.css') ?? '').includes('<<<<<<<'),
  'update: 両方が変えた行は競合の印を残して一覧にし、失敗にする', result.output);
  report(/上流で削除、利用側で変更（残した）\s+scripts\/new-name\.mjs/.test(result.output)
    && read('tools/template/scripts/new-name.mjs') !== null,
  'update: 上流が消し利用側が変えたファイルは残して一覧にする');
  git(consumer, 'reset', '--quiet', '--hard');
  git(consumer, 'clean', '--quiet', '-fd');

  // 未コミットの変更があると止まる
  write(consumer, {'tools/template/local.md': '書きかけ\n'});
  result = importTool('update', 'tools/template', '--to', 'main');
  report(!result.ok && result.output.includes('未コミット'), 'update: 置き場所に未コミットの変更があると止まる', result.output);
} finally {
  rmSync(work, {recursive: true, force: true});
}

console.log(failures === 0 ? '\nすべて通りました' : `\n${failures}件が失敗しました`);
process.exit(failures === 0 ? 0 : 1);
