import { createReadStream } from "node:fs";
import { lstat, realpath } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const rootPrefix = `${root}${sep}`;
const requestedPort = Number.parseInt(process.env.PORT ?? "4173", 10);
const port = Number.isInteger(requestedPort) && requestedPort >= 1024 && requestedPort <= 65535
  ? requestedPort
  : 4173;

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webm", "video/webm"]
]);

function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  response.end(body);
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    send(response, 405, "Method not allowed");
    return;
  }

  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    if (pathname.includes("\0") || pathname.split("/").includes("..")) throw new Error("unsafe path");

    const candidate = resolve(root, `.${pathname}`);
    if (candidate !== root && !candidate.startsWith(rootPrefix)) throw new Error("outside root");

    const before = await lstat(candidate);
    if (!before.isFile() || before.isSymbolicLink()) throw new Error("not a regular file");
    const canonical = await realpath(candidate);
    if (canonical !== root && !canonical.startsWith(rootPrefix)) throw new Error("outside root");

    response.writeHead(200, {
      "Content-Type": contentTypes.get(extname(canonical).toLowerCase()) ?? "application/octet-stream",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'self'; img-src 'self'; media-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff"
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(canonical).pipe(response);
  } catch {
    send(response, 404, "Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`LaunchLens: http://127.0.0.1:${port}/`);
});
