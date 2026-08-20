import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, sep } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestName = "PUBLIC-MANIFEST.sha256";
const ignoredDirectories = new Set([".artifacts", ".git", "node_modules"]);

async function publicFiles(directory = projectRoot) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symbolic link: ${join(directory, entry.name)}`);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await publicFiles(join(directory, entry.name)));
      continue;
    }
    const path = relative(projectRoot, join(directory, entry.name)).split(sep).join("/");
    if (path !== manifestName) files.push(path);
  }
  return files;
}

const manifest = await readFile(join(projectRoot, manifestName), "utf8");
const expected = new Map(manifest.trim().split(/\r?\n/).map((line) => {
  const match = line.match(/^([a-f0-9]{64})  (.+)$/);
  assert.ok(match, `Malformed manifest line: ${line}`);
  return [match[2], match[1]];
}));

const files = (await publicFiles()).sort();
assert.deepEqual([...expected.keys()].sort(), files, "Manifest paths do not match the public project files");

for (const path of files) {
  const digest = createHash("sha256").update(await readFile(join(projectRoot, path))).digest("hex");
  assert.equal(digest, expected.get(path), `Manifest hash mismatch: ${path}`);
}

console.log(`Public manifest verified for ${files.length} files.`);
