import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 4177);
const host = "127.0.0.1";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png"
};

function send(res, status, body) {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const target = normalize(join(root, pathname === "/" ? "index.html" : pathname));
  if (!target.startsWith(root) || !existsSync(target) || !statSync(target).isFile()) {
    send(res, 404, "Not found");
    return;
  }
  res.writeHead(200, {
    "content-type": types[extname(target).toLowerCase()] || "application/octet-stream",
    "cache-control": "no-store"
  });
  createReadStream(target).pipe(res);
}).listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}/`);
});
