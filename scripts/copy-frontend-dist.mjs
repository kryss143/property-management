import { cpSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { resolve } from "node:path";

const frontendDist = resolve("frontend", "dist");
const rootDist = resolve("dist");

if (!existsSync(frontendDist)) {
  throw new Error("frontend/dist missing after frontend build");
}

rmSync(rootDist, { recursive: true, force: true });
cpSync(frontendDist, rootDist, { recursive: true });

console.log(`Copied ${frontendDist} -> ${rootDist}`);
for (const entry of readdirSync(rootDist)) {
  const path = resolve(rootDist, entry);
  const stat = statSync(path);
  const type = stat.isDirectory() ? "dir " : "file";
  console.log(`${type} ${entry}`);
}
