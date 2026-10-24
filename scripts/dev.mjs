import http from "node:http";
import path from "node:path";
import { readFile, realpath, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 5173);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a whole number between 1 and 65535.");
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function isInsideRoot(candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function reply(response, status, message) {
  response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

const server = http.createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    reply(response, 405, "Method not allowed.");
    return;
  }

  try {
    const url = new URL(request.url || "/", "http://localhost");
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname).replaceAll("\\", "/");
    } catch {
      reply(response, 400, "Invalid request path.");
      return;
    }

    const segments = pathname.split("/");
    if (
      pathname.includes("\0") ||
      segments.some((segment) => segment === ".." || segment.startsWith("."))
    ) {
      reply(response, 403, "Forbidden.");
      return;
    }

    let candidate = path.resolve(root, `.${pathname}`);
    if (!isInsideRoot(candidate)) {
      reply(response, 403, "Forbidden.");
      return;
    }

    const entry = await stat(candidate);
    if (entry.isDirectory()) candidate = path.join(candidate, "index.html");
    candidate = await realpath(candidate);

    if (!isInsideRoot(candidate)) {
      reply(response, 403, "Forbidden.");
      return;
    }

    const file = await stat(candidate);
    if (!file.isFile()) {
      reply(response, 404, "File not found.");
      return;
    }

    response.writeHead(200, {
      "Content-Type":
        mimeTypes[path.extname(candidate).toLowerCase()] ||
        "application/octet-stream",
      "Content-Length": file.size,
    });
    response.end(
      request.method === "HEAD" ? undefined : await readFile(candidate),
    );
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      reply(response, 404, "File not found.");
      return;
    }
    if (error.code === "EACCES" || error.code === "EPERM") {
      reply(response, 403, "Forbidden.");
      return;
    }
    console.error("Could not serve request:", error.message);
    if (!response.headersSent)
      reply(response, 500, "Unable to serve this file.");
    else response.destroy();
  }
});

server.on("error", (error) => {
  console.error(`Unable to start the local server: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Sai Baba Packers and Movers: http://${host}:${port}`);
  console.log("Press Ctrl+C to stop.");
});
