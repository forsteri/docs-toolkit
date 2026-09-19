import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const slidevDirectory = path.resolve(scriptDirectory, "..");
const executable = path.join(slidevDirectory, "node_modules/.bin/slidev");
const patterns = [
  "proposal",
  "progress-report",
  "decision",
  "kickoff",
  "retrospective",
];

for (const pattern of patterns) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      executable,
      [
        "build",
        `patterns/${pattern}.md`,
        "--out",
        `../dist/pattern-${pattern}`,
      ],
      { cwd: slidevDirectory, stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Pattern build failed (${pattern}): exit ${code}`));
    });
  });
}
