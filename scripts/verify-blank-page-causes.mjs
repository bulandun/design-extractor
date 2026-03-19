import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`✅ ${message}`);
}

const rootDir = process.cwd();
const indexPath = resolve(rootDir, "index.html");
const mainPath = resolve(rootDir, "src/main.jsx");

const indexHtml = readFileSync(indexPath, "utf8");
const mainSource = readFileSync(mainPath, "utf8");

const htmlRootIdMatch = indexHtml.match(/<div\s+id=["']([^"']+)["']/i);
const mountTargetIdMatch = mainSource.match(/getElementById\(\s*["']([^"']+)["']\s*\)/);

if (!htmlRootIdMatch) {
  fail("Could not find a root element id in index.html.");
} else if (!mountTargetIdMatch) {
  fail("Could not find React mount target id in src/main.jsx.");
} else if (htmlRootIdMatch[1] !== mountTargetIdMatch[1]) {
  fail(
    `Root id mismatch: index.html uses \"${htmlRootIdMatch[1]}\" but src/main.jsx mounts \"${mountTargetIdMatch[1]}\".`,
  );
} else {
  pass(
    `Root id matches (${htmlRootIdMatch[1]}): index.html and src/main.jsx are consistent.`,
  );
}

const viteEnvReferences = new Set();
const envRegex = /import\.meta\.env\.([A-Z0-9_]+)/g;
for (const match of mainSource.matchAll(envRegex)) {
  viteEnvReferences.add(match[1]);
}

const appPath = resolve(rootDir, "src/App.jsx");
if (existsSync(appPath)) {
  const appSource = readFileSync(appPath, "utf8");
  for (const match of appSource.matchAll(envRegex)) {
    viteEnvReferences.add(match[1]);
  }
}

if (viteEnvReferences.size === 0) {
  pass("No import.meta.env references found in app entry files, so undefined VITE_* production values are not a blank-page risk here.");
} else {
  const envProdPath = resolve(rootDir, ".env.production");
  const envProd = existsSync(envProdPath) ? readFileSync(envProdPath, "utf8") : "";

  const missingKeys = [...viteEnvReferences].filter(
    (key) => !new RegExp(`^${key}=`, "m").test(envProd),
  );

  if (missingKeys.length > 0) {
    fail(
      `import.meta.env keys referenced but missing in .env.production: ${missingKeys.join(", ")}`,
    );
  } else {
    pass(
      `All referenced import.meta.env keys are defined in .env.production: ${[
        ...viteEnvReferences,
      ].join(", ")}`,
    );
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}
