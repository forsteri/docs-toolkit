import {access, mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import os from 'node:os';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const diagramsDir = path.resolve(scriptDir, '..');
const supportedThemes = new Set(['neutral', 'forsteri']);

async function exists(filePath) {
  return access(filePath).then(() => true, () => false);
}

async function findChrome() {
  const candidates = [
    process.env.MERMAID_CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }

  return null;
}

async function runCommand(command, args, cwd) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {cwd, stdio: 'inherit'});
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`mmdcが失敗しました (code=${code}, signal=${signal ?? 'none'})`));
    });
  });
}

async function serveIconPack(iconPackFile) {
  const server = createServer(async (request, response) => {
    if (request.url !== '/aws-iconify.json') {
      response.writeHead(404).end();
      return;
    }

    try {
      const {readFile} = await import('node:fs/promises');
      const body = await readFile(iconPackFile);
      response.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json; charset=utf-8',
      });
      response.end(body);
    } catch (error) {
      response.writeHead(500).end(String(error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}/aws-iconify.json`,
    close: () => new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    ),
  };
}

export async function renderDiagram({input, output, theme = 'neutral'}) {
  if (!supportedThemes.has(theme)) {
    throw new Error(`テーマはneutralまたはforsteriを指定してください: ${theme}`);
  }

  const inputPath = path.resolve(input);
  const outputPath = path.resolve(output);
  const configFile = path.join(diagramsDir, `themes/${theme}.json`);
  const iconPackFile = path.join(diagramsDir, 'assets/aws/2026-q3/aws-iconify.json');
  const mmdc = path.join(diagramsDir, 'node_modules/.bin/mmdc');
  const temporaryDir = await mkdtemp(path.join(os.tmpdir(), 'docs-toolkit-mermaid-'));
  let iconServer = null;

  try {
    if (!(await exists(inputPath))) throw new Error(`入力ファイルがありません: ${inputPath}`);
    if (!(await exists(configFile))) throw new Error(`テーマがありません: ${configFile}`);
    if (!(await exists(mmdc))) throw new Error('Mermaid CLIが未導入です。diagrams/でnpm installを実行してください。');

    await mkdir(path.dirname(outputPath), {recursive: true});
    const args = [
      '--input', inputPath,
      '--output', outputPath,
      '--configFile', configFile,
      '--backgroundColor', 'transparent',
    ];

    if (await exists(iconPackFile)) {
      iconServer = await serveIconPack(iconPackFile);
      args.push('--iconPacksNamesAndUrls', `aws#${iconServer.url}`);
    }

    const chromePath = await findChrome();
    if (chromePath) {
      const puppeteerConfigFile = path.join(temporaryDir, 'puppeteer.json');
      await writeFile(
        puppeteerConfigFile,
        `${JSON.stringify({executablePath: chromePath, args: ['--no-sandbox']}, null, 2)}\n`,
      );
      args.push('--puppeteerConfigFile', puppeteerConfigFile);
    }

    await runCommand(mmdc, args, diagramsDir);
    return outputPath;
  } finally {
    if (iconServer) await iconServer.close();
    await rm(temporaryDir, {recursive: true, force: true});
  }
}

function parseArguments(argv) {
  const positional = [];
  let theme = 'neutral';

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--theme') {
      theme = argv[index + 1];
      index += 1;
    } else {
      positional.push(argv[index]);
    }
  }

  if (positional.length !== 2) {
    throw new Error('Usage: node scripts/render.mjs <input.mmd> <output.svg> [--theme neutral|forsteri]');
  }

  return {input: positional[0], output: positional[1], theme};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const output = await renderDiagram(parseArguments(process.argv.slice(2)));
  console.log(`Rendered: ${output}`);
}
