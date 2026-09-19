import { mkdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const slidevDirectory = path.resolve(scriptDirectory, "..");
const repositoryDirectory = path.resolve(slidevDirectory, "..");
const outputDirectory = path.join(repositoryDirectory, "output", "pdf");
const outputFile = path.join(outputDirectory, "forsteri-slidev-showcase.pdf");
const slidevCli = path.join(
  slidevDirectory,
  "node_modules",
  "@slidev",
  "cli",
  "bin",
  "slidev.mjs",
);

await mkdir(outputDirectory, { recursive: true });

const child = spawn(
  process.execPath,
  [
    slidevCli,
    "export",
    "examples/showcase.md",
    "--output",
    outputFile,
    "--timeout",
    "120000",
    "--wait",
    "500",
  ],
  { cwd: slidevDirectory, stdio: "inherit" },
);

child.on("error", (error) => {
  throw error;
});

const exitCode = await new Promise((resolve) => child.on("close", resolve));
if (exitCode !== 0) {
  throw new Error(`Slidev export failed with exit code ${exitCode}.`);
}

console.log(`Exported ${outputFile}`);
