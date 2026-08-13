import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const allowedBranches = new Set(["main"]);
const forbiddenBranchFragments = ["0.3.2", "gh-pages", "deploy/"];
const forbiddenRuntimeTerms = ["神农丹徒", "丹徒", "alchemist", "shennong", "herb_marsh"];
const requiredVersion = "0.3.4b1-ui-pass2";

function runGit(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`[release-source] ${message}`);
  process.exitCode = 1;
}

function readIfExists(relativePath) {
  const file = path.join(root, relativePath);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

const topLevel = runGit(["rev-parse", "--show-toplevel"]).replaceAll("\\", "/");
const normalizedRoot = path.resolve(root).replaceAll("\\", "/");
if (topLevel !== normalizedRoot) {
  fail(`Run from project root only. got=${normalizedRoot} gitRoot=${topLevel}`);
}

if (normalizedRoot.endsWith("dahuang-lunhui-lu-gh-pages") || normalizedRoot.includes("-gh-pages")) {
  fail("This looks like an old gh-pages work directory. Do not release from it.");
}

const branch = runGit(["branch", "--show-current"]);
if (!allowedBranches.has(branch)) {
  fail(`Release must be cut from main. current=${branch}`);
}
if (forbiddenBranchFragments.some((fragment) => branch.includes(fragment))) {
  fail(`Release branch name is forbidden for publishing: ${branch}`);
}

const status = runGit(["status", "--porcelain"]);
if (status) {
  fail("Working tree is not clean. Commit or stash before publishing.");
}

const indexHtml = readIfExists("index.html");
if (!indexHtml.includes(requiredVersion)) {
  fail(`index.html does not reference current asset version ${requiredVersion}.`);
}

for (const relativePath of ["src/config.js", "deploy-root/src/config.js"]) {
  const text = readIfExists(relativePath);
  if (!text) continue;
  for (const term of forbiddenRuntimeTerms) {
    if (text.includes(term)) {
      fail(`${relativePath} still contains removed Shennong/runtime term: ${term}`);
    }
  }
}

if (!process.exitCode) {
  console.log(JSON.stringify({
    ok: true,
    branch,
    version: requiredVersion,
    root: normalizedRoot
  }, null, 2));
}
