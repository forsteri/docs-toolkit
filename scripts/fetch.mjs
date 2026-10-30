// verified.json に記録した組み合わせを、記録した完全なSHAで取得する。依存なし、Node.js 20以上と git が必要。
//
// 使い方: node scripts/fetch.mjs --into <dir> [--set <確認日>] [--sample]
//   --into    取得先。<dir>/<リポジトリ名> に1つずつ取得する（空か、無いフォルダ）
//   --set     verified.json の verified の値。省略時は先頭（最新）の組み合わせ
//   --sample  確認に使った docs-toolkit-sample も <dir>/docs-toolkit-sample に取得する
//
// タグが記録されていれば、タグが同じコミットを指していることも確かめる。
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const verifiedFile = path.join(root, 'verified.json');

export function loadSet(name) {
  const {sets} = JSON.parse(readFileSync(verifiedFile, 'utf8'));
  const set = name ? sets.find((item) => item.verified === name) : sets[0];
  if (!set) throw new Error(`verified.json に ${name} の組み合わせがありません`);
  return set;
}

function git(args, cwd) {
  const result = spawnSync('git', args, {cwd, encoding: 'utf8'});
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.error?.message ?? result.stderr.trim()}`);
  return result.stdout.trim();
}

// 1つのリポジトリを取得し、記録したコミットに固定する。取得したフォルダを返す
export function fetchOne(name, {repo, commit, tag}, into) {
  const dir = path.join(into, name);
  if (existsSync(dir) && readdirSync(dir).length > 0) throw new Error(`${dir} は空ではありません`);
  git(['clone', '--quiet', '--no-checkout', repo, dir], into);
  git(['-c', 'advice.detachedHead=false', 'checkout', '--quiet', '--detach', commit], dir);
  if (git(['rev-parse', 'HEAD'], dir) !== commit) throw new Error(`${name}: ${commit} に固定できません`);
  if (tag) {
    const tagged = git(['rev-parse', `refs/tags/${tag}^{commit}`], dir);
    if (tagged !== commit) throw new Error(`${name}: タグ ${tag} は ${tagged.slice(0, 7)} を指し、記録の ${commit.slice(0, 7)} と違います`);
  }
  return dir;
}

export function fetchSet(set, into, {sample = false} = {}) {
  mkdirSync(into, {recursive: true});
  const dirs = {};
  for (const [name, entry] of Object.entries(set.repos)) dirs[name] = fetchOne(name, entry, into);
  if (sample) dirs['docs-toolkit-sample'] = fetchOne('docs-toolkit-sample', set.sample, into);
  return dirs;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const value = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
  const into = value('--into');
  if (!into) {
    console.error('使い方: node scripts/fetch.mjs --into <dir> [--set <確認日>] [--sample]');
    process.exit(2);
  }
  const set = loadSet(value('--set'));
  const dirs = fetchSet(set, path.resolve(into), {sample: args.includes('--sample')});
  console.log(`${set.verified} の組み合わせを取得しました`);
  for (const [name, dir] of Object.entries(dirs)) {
    const entry = set.repos[name] ?? set.sample;
    console.log(`  ${name.padEnd(20)} ${entry.commit.slice(0, 7)}${entry.tag ? ` ${entry.tag}` : ''}  ${dir}`);
  }
}
