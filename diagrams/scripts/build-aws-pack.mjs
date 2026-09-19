import {readdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const diagramsDir = path.resolve(scriptDir, '..');
const releaseDir = path.join(diagramsDir, 'assets/aws/2026-q3');
const manifestFile = path.join(releaseDir, 'manifest.json');
const iconPackFile = path.join(releaseDir, 'aws-iconify.json');
const sourceUrl =
  'https://d1.awsstatic.com/onedam/marketing-channels/website/public/shared/architecture-icon-release/Icon-package_07312026.5846e92413caa21490223536cc97f1269e44fa92.zip';

async function walk(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(entryPath)));
    else if (entry.isFile() && entry.name.endsWith('.svg')) files.push(entryPath);
  }

  return files;
}

function slugify(value) {
  return value
    .replace(/^(Arch|Res)_/, '')
    .replace(/_(64|48)$/, '')
    .replace(/&/g, '-and-')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function parseSvg(svg, sourcePath) {
  const opening = svg.match(/<svg\b([^>]*)>/i);
  const body = svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/i);
  const viewBox = opening?.[1].match(/viewBox="([^"]+)"/i)?.[1];

  if (!opening || !body || !viewBox) {
    throw new Error(`SVGを解析できません: ${sourcePath}`);
  }

  const numbers = viewBox.trim().split(/\s+/).map(Number);
  if (numbers.length !== 4 || numbers.some((number) => !Number.isFinite(number))) {
    throw new Error(`不正なviewBoxです: ${sourcePath}`);
  }

  const title = body[1].match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  const iconBody = body[1]
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .trim();

  return {
    title,
    body: iconBody,
    width: numbers[2],
    height: numbers[3],
    viewBox,
  };
}

async function createOutputs() {
  const sourceFiles = [
    ...(await walk(path.join(releaseDir, 'service'))),
    ...(await walk(path.join(releaseDir, 'resource'))),
  ];
  const icons = {};
  const manifestIcons = {};

  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(releaseDir, sourceFile).split(path.sep).join('/');
    const [kind, category] = relativePath.split('/');
    const baseName = path.basename(sourceFile, '.svg');
    const normalizedCategory = slugify(category.replace(/^(Arch|Res)_/, ''));
    const name = `${kind}-${normalizedCategory}-${slugify(baseName)}`;

    if (icons[name]) {
      throw new Error(`Iconify名が重複しています: ${name}`);
    }

    const parsed = parseSvg(await readFile(sourceFile, 'utf8'), sourceFile);
    icons[name] = {
      body: parsed.body,
      width: parsed.width,
      height: parsed.height,
    };
    manifestIcons[name] = {
      path: relativePath,
      category,
      kind,
      title: parsed.title,
      viewBox: parsed.viewBox,
    };
  }

  const manifest = {
    release: '2026-q3',
    source: sourceUrl,
    selection: {
      service: '全カテゴリの64サイズSVG',
      resource: '全カテゴリの48サイズSVG',
      excluded: ['PNG', '16/32/48サイズのService SVG', '重複サイズ'],
    },
    iconCount: Object.keys(icons).length,
    icons: manifestIcons,
  };
  const iconPack = {
    prefix: 'aws',
    icons,
  };

  return {
    manifest: `${JSON.stringify(manifest, null, 2)}\n`,
    iconPack: `${JSON.stringify(iconPack)}\n`,
  };
}

export async function buildAwsPack({check = false} = {}) {
  const expected = await createOutputs();

  if (check) {
    const [manifest, iconPack] = await Promise.all([
      readFile(manifestFile, 'utf8').catch(() => ''),
      readFile(iconPackFile, 'utf8').catch(() => ''),
    ]);
    if (manifest !== expected.manifest || iconPack !== expected.iconPack) {
      throw new Error('AWS manifest/Iconifyパックが公式SVGと同期していません。npm run build:awsを実行してください。');
    }
    return {manifestFile, iconPackFile};
  }

  await Promise.all([
    writeFile(manifestFile, expected.manifest),
    writeFile(iconPackFile, expected.iconPack),
  ]);
  return {manifestFile, iconPackFile};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  await buildAwsPack({check});
  console.log(`${check ? 'Verified' : 'Generated'}: ${manifestFile}`);
  console.log(`${check ? 'Verified' : 'Generated'}: ${iconPackFile}`);
}
