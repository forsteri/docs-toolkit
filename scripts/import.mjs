// テンプレートをコピーで取り込み、取り込み元のコミットを記録し、記録をもとに取り込み直す。
// 依存なし、Node.js 20以上と git が必要。利用プロジェクトの Git 作業ツリーの中で実行する。
//
// 使い方:
//   node <docs-toolkit>/scripts/import.mjs add <置き場所> --repo <URL> [--path <サブフォルダ>] --to <コミット|タグ|ブランチ>
//   node <docs-toolkit>/scripts/import.mjs status [<置き場所>...]
//   node <docs-toolkit>/scripts/import.mjs update <置き場所> --to <コミット|タグ|ブランチ> [--dry-run]
//   共通: --record <file>  記録ファイル（省略時は作業ツリー直下の toolkit-imports.json）
//
// - add     取り込み元の --path 以下を置き場所へコピーし、完全なSHAを記録する。
// - status  記録のコミットと置き場所を突き合わせ、利用側で足した・変えた・消したファイルを表示する。
// - update  記録のコミットから --to への上流の変更（追加・変更・削除・移動）を、利用側の改変を残したまま当てる。
//           --to に古いコミットを渡せば撤回になる。両方が同じ箇所を変えたファイルは競合の印を残して一覧にする。
//
// 置き場所のファイルのうち、Gitが無視するもの（node_modules、生成物など）は扱わない。
// update は置き場所に未コミットの変更があると止まる（失敗したら git で戻せるように）。
import {spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, rmdirSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

const usage = `使い方:
  import.mjs add <置き場所> --repo <URL> [--path <サブフォルダ>] --to <ref>
  import.mjs status [<置き場所>...]
  import.mjs update <置き場所> --to <ref> [--dry-run]
  共通: --record <file>`;

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

const [command, ...rest] = process.argv.slice(2);
const options = {};
const positional = [];
for (let i = 0; i < rest.length; i++) {
  const arg = rest[i];
  if (arg === '--dry-run') options.dryRun = true;
  else if (['--repo', '--path', '--to', '--record'].includes(arg)) {
    if (rest[i + 1] === undefined || rest[i + 1].startsWith('--')) fail(`${arg} に値を指定してください`, 2);
    options[arg.slice(2)] = rest[++i];
  } else if (arg.startsWith('--')) fail(`不明な引数です: ${arg}\n${usage}`, 2);
  else positional.push(arg);
}
if (!['add', 'status', 'update'].includes(command)) fail(usage, 2);

function git(args, cwd, {allowFail = false} = {}) {
  const result = spawnSync('git', ['-c', 'user.name=import', '-c', 'user.email=import@localhost', ...args],
    {cwd, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024});
  if (result.status !== 0 && !allowFail) {
    fail(`git ${args.join(' ')} が失敗しました（${cwd}）\n${result.stderr.trim()}`);
  }
  return {ok: result.status === 0, out: result.stdout, err: result.stderr};
}

const top = git(['rev-parse', '--show-toplevel'], process.cwd(), {allowFail: true});
if (!top.ok) fail('利用プロジェクトの Git 作業ツリーの中で実行してください');
const root = top.out.trim();
const recordFile = path.resolve(options.record ?? path.join(root, 'toolkit-imports.json'));
const record = existsSync(recordFile) ? JSON.parse(readFileSync(recordFile, 'utf8')) : {imports: []};

// 置き場所は作業ツリー直下からの相対パスで扱う（末尾の / は落とす）
function destOf(arg) {
  const dest = path.relative(root, path.resolve(arg)).split(path.sep).join('/');
  if (dest === '' || dest.startsWith('..')) fail(`置き場所は作業ツリーの中のフォルダにしてください: ${arg}`);
  return dest;
}
function entryOf(dest) {
  const entry = record.imports.find((item) => item.dest === dest);
  if (!entry) fail(`${dest} は ${path.relative(process.cwd(), recordFile)} に記録がありません`);
  return entry;
}
function saveRecord() {
  record.imports.sort((a, b) => a.dest.localeCompare(b.dest));
  writeFileSync(recordFile, `${JSON.stringify(record, null, 2)}\n`);
}

const work = mkdtempSync(path.join(tmpdir(), 'toolkit-import-'));
const clones = new Map();

// 取り込み元を作業用に複製する。同じURLは1回だけ取得する
function upstream(url) {
  if (!clones.has(url)) {
    const dir = path.join(work, `clone-${clones.size}`);
    git(['clone', '--quiet', '--no-checkout', url, dir], work);
    clones.set(url, dir);
  }
  return clones.get(url);
}
function resolveCommit(clone, ref) {
  const result = git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], clone, {allowFail: true});
  if (result.ok) return result.out.trim();
  const remote = git(['rev-parse', '--verify', '--quiet', `origin/${ref}^{commit}`], clone, {allowFail: true});
  if (remote.ok) return remote.out.trim();
  fail(`取り込み元に ${ref} がありません`);
}
// コミットを指すタグがあれば記録に添える（目印。正本は commit）
function tagOf(clone, commit) {
  const tags = git(['tag', '--points-at', commit], clone).out.split('\n').filter(Boolean);
  return tags.sort().at(-1) ?? null;
}
// 取り込み元のコミットの --path 以下を、ルートにしたコミットを作る
function subtreeCommit(clone, commit, sub, parent) {
  const tree = git(['rev-parse', `${commit}:${sub}`], clone, {allowFail: true});
  if (!tree.ok) fail(`${commit.slice(0, 7)} に ${sub || '/'} がありません`);
  const args = ['commit-tree', tree.out.trim(), '-m', `${commit} ${sub}`];
  if (parent) args.push('-p', parent);
  return git(args, clone).out.trim();
}

// 置き場所にある、Gitが無視しないファイル（作業ツリーの内容）
function localFiles(dest) {
  return git(['ls-files', '-z', '-co', '--exclude-standard', '--', dest], root).out
    .split('\0').filter(Boolean).filter((file) => existsSync(path.join(root, file)))
    .map((file) => file.slice(dest.length + 1));
}

// base の上に置き場所の現状を積んだコミット（利用側の改変）を作る
function localCommit(clone, base, dest) {
  git(['checkout', '--quiet', '--force', '--detach', base], clone);
  git(['rm', '-r', '--quiet', '--cached', '--ignore-unmatch', '.'], clone);
  for (const name of readdirSync(clone)) if (name !== '.git') rmSync(path.join(clone, name), {recursive: true, force: true});
  for (const file of localFiles(dest)) {
    mkdirSync(path.dirname(path.join(clone, file)), {recursive: true});
    cpSync(path.join(root, dest, file), path.join(clone, file));
  }
  git(['add', '-A', '-f', '.'], clone);
  git(['commit', '--quiet', '--allow-empty', '--no-verify', '-m', 'local'], clone);
  return git(['rev-parse', 'HEAD'], clone).out.trim();
}

function changes(clone, from, to) {
  return git(['diff', '--name-status', '-M', from, to], clone).out.trim().split('\n').filter(Boolean)
    .map((line) => {
      const [status, ...files] = line.split('\t');
      const kind = {A: '追加', M: '変更', D: '削除', R: '移動', C: '複写', T: '種別変更'}[status[0]] ?? status;
      return `  ${kind}  ${files.join(' → ')}`;
    });
}

function printList(title, lines) {
  console.log(`${title}${lines.length === 0 ? ': なし' : ''}`);
  for (const line of lines) console.log(line);
}

try {
  if (command === 'add') {
    if (positional.length !== 1 || !options.repo || !options.to) fail(usage, 2);
    const dest = destOf(positional[0]);
    if (record.imports.some((item) => item.dest === dest)) fail(`${dest} はすでに記録があります。update を使ってください`);
    if (localFiles(dest).length > 0) fail(`${dest} にファイルがあります。空のフォルダへ取り込んでください`);
    const clone = upstream(options.repo);
    const sub = (options.path ?? '').replace(/^\/+|\/+$/g, '');
    const commit = resolveCommit(clone, options.to);
    const base = subtreeCommit(clone, commit, sub);
    git(['checkout', '--quiet', '--force', '--detach', base], clone);
    mkdirSync(path.join(root, dest), {recursive: true});
    for (const file of git(['ls-files', '-z'], clone).out.split('\0').filter(Boolean)) {
      mkdirSync(path.dirname(path.join(root, dest, file)), {recursive: true});
      cpSync(path.join(clone, file), path.join(root, dest, file));
    }
    record.imports.push({dest, repo: options.repo, path: sub, commit, tag: tagOf(clone, commit)});
    saveRecord();
    console.log(`${dest}: ${options.repo} ${sub ? `の ${sub}/ ` : ''}を ${commit.slice(0, 7)} で取り込みました`);
  }

  if (command === 'status') {
    const targets = positional.length > 0 ? positional.map((arg) => entryOf(destOf(arg))) : record.imports;
    if (targets.length === 0) console.log('記録がありません');
    for (const entry of targets) {
      const clone = upstream(entry.repo);
      const base = subtreeCommit(clone, resolveCommit(clone, entry.commit), entry.path);
      const local = localCommit(clone, base, entry.dest);
      const tag = entry.tag ? `（${entry.tag}）` : '';
      printList(`${entry.dest}: ${entry.repo} ${entry.path ? `${entry.path}/ ` : ''}${entry.commit.slice(0, 7)}${tag} からの利用側の改変`,
        changes(clone, base, local));
    }
  }

  if (command === 'update') {
    if (positional.length !== 1 || !options.to) fail(usage, 2);
    const entry = entryOf(destOf(positional[0]));
    const dirty = git(['status', '--porcelain', '--', entry.dest], root).out.trim();
    if (dirty && !options.dryRun) fail(`${entry.dest} に未コミットの変更があります。コミットしてから実行してください\n${dirty}`);

    const clone = upstream(entry.repo);
    const from = resolveCommit(clone, entry.commit);
    const to = resolveCommit(clone, options.to);
    const base = subtreeCommit(clone, from, entry.path);
    const next = subtreeCommit(clone, to, entry.path, base);
    const local = localCommit(clone, base, entry.dest);
    printList(`上流の変更 ${from.slice(0, 7)} → ${to.slice(0, 7)}`, changes(clone, base, next));
    printList('利用側の改変', changes(clone, base, local));

    // 上流の新しい版に、利用側の改変を3方向マージで重ねる（移動は Git の検出に任せる）
    git(['checkout', '--quiet', '--force', '--detach', next], clone);
    git(['merge', '--no-ff', '--no-commit', '--quiet', local], clone, {allowFail: true});
    const notes = [];
    const conflicts = [];
    const entries = git(['status', '--porcelain', '-z'], clone).out.split('\0').filter(Boolean);
    for (let i = 0; i < entries.length; i++) {
      const code = entries[i].slice(0, 2);
      const file = entries[i].slice(3);
      if (/[RC]/.test(code[0])) i++; // 移動・複写は次の項目が元の名前
      if (code === 'UD') {
        // 上流が変え、利用側が消したファイル: 消したままにする
        git(['rm', '--quiet', '--', file], clone);
        notes.push(`  利用側で削除済みのまま（上流で変更あり）  ${file}`);
      } else if (code === 'DU') {
        // 上流が消し、利用側が変えたファイル: 利用側の内容を残す
        git(['add', '--', file], clone);
        conflicts.push(`  上流で削除、利用側で変更（残した）  ${file}`);
      } else if (code.includes('U') || code === 'AA' || code === 'DD') {
        conflicts.push(`  競合（両方が変更）  ${file}`);
      }
    }
    printList('注記', notes);
    printList('手で確かめるファイル', conflicts);

    if (options.dryRun) {
      console.log('\n--dry-run のため、置き場所と記録は変えていません');
    } else {
      // マージ結果で置き場所を置き換える（Gitが無視するファイルには触らない）
      const result = new Set(git(['ls-files', '-z'], clone).out.split('\0').filter(Boolean));
      for (const file of localFiles(entry.dest)) {
        if (!result.has(file)) rmSync(path.join(root, entry.dest, file), {force: true});
      }
      for (const file of result) {
        const source = path.join(clone, file);
        if (!existsSync(source)) continue;
        mkdirSync(path.dirname(path.join(root, entry.dest, file)), {recursive: true});
        cpSync(source, path.join(root, entry.dest, file));
      }
      removeEmptyDirs(path.join(root, entry.dest));
      entry.commit = to;
      entry.tag = tagOf(clone, to);
      saveRecord();
      console.log(`\n${entry.dest}: ${from.slice(0, 7)} → ${to.slice(0, 7)} に取り込み直しました。差分は git diff で確かめてください`);
      if (conflicts.length > 0) process.exitCode = 1;
    }
  }
} finally {
  rmSync(work, {recursive: true, force: true});
}

function removeEmptyDirs(dir) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    if (entry.isDirectory() && entry.name !== 'node_modules') removeEmptyDirs(path.join(dir, entry.name));
  }
  if (readdirSync(dir).length === 0) rmdirSync(dir);
}
