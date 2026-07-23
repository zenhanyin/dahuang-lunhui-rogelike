import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const deployDir = path.join(root, "deploy-root");
const distDir = process.env.SITES_BUILD_STAGING || path.join(root, "dist");
const clientDir = path.join(distDir, "client");
const serverDir = path.join(distDir, "server");

const skipNames = new Set([
  ".git",
  ".agents",
  ".openai",
  "dist",
  "deploy-root",
  "node_modules",
  "visual-qa"
]);

function ensureInsideRoot(target) {
  const resolvedRoot = path.resolve(root).toLowerCase();
  const resolvedTarget = path.resolve(target).toLowerCase();
  if (!resolvedTarget.startsWith(resolvedRoot + path.sep)) {
    throw new Error(`Refusing to write outside project root: ${target}`);
  }
}

function shouldSkipName(name) {
  return skipNames.has(name)
    || name.endsWith(".tar.gz")
    || name.endsWith(".inspect.ndjson")
    || name.endsWith(".log");
}

function shouldSkipRelative(relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  return normalized.startsWith("assets/concepts/")
    || normalized.startsWith("assets/generated/")
    || normalized.startsWith("assets/sprites/")
    || normalized.startsWith("assets/ui/")
    || normalized === "assets/maps/qingqiu-final.webp"
    || normalized === "assets/maps/wilds-final.webp"
    || normalized.startsWith("assets/maps/v032_atlas/qingqiu/tile_qingqiu_ground_")
    || normalized.startsWith("assets/maps/v032_atlas/qingqiu/preview")
    || normalized.startsWith("assets/maps/v032_atlas/qingqiu/decals/preview")
    || normalized.startsWith("assets/maps/v032_atlas/qingqiu_seamless/preview");
}

function copyDir(from, to, base = from) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (shouldSkipName(entry.name)) continue;
    const source = path.join(from, entry.name);
    const relative = path.relative(base, source);
    if (shouldSkipRelative(relative)) continue;
    const destination = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, destination, base);
    } else if (entry.isFile()) {
      fs.copyFileSync(source, destination);
    }
  }
}

ensureInsideRoot(deployDir);
ensureInsideRoot(distDir);

fs.rmSync(deployDir, { recursive: true, force: true });
fs.rmSync(distDir, { recursive: true, force: true });

copyDir(root, deployDir);
copyDir(root, clientDir);
fs.mkdirSync(serverDir, { recursive: true });

const worker = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const assetRequest = new Request(url, request);
    let response = await env.ASSETS.fetch(assetRequest);

    if (response.status === 404 && !url.pathname.includes(".")) {
      url.pathname = "/index.html";
      response = await env.ASSETS.fetch(new Request(url, request));
    }

    const headers = new Headers(response.headers);
    if (url.pathname === "/" || url.pathname.endsWith(".html")) {
      headers.set("cache-control", "public, max-age=300");
    } else {
      headers.set("cache-control", "public, max-age=86400");
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
`;

fs.writeFileSync(path.join(serverDir, "index.js"), worker, "utf8");
console.log(`Built static preview: ${path.relative(root, deployDir)}`);
console.log(`Built Sites worker: ${path.relative(root, distDir)}`);
