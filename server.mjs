import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT) || 3000;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png"
};

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  const requestedPath = pathname === "/" ? "/game.html" : decodeURIComponent(pathname);
  const filePath = resolve(root, "." + requestedPath);

  if (filePath !== root && !filePath.startsWith(root + sep)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    const contentType = contentTypes[extname(filePath).toLowerCase()];
    if (!contentType) {
      response.writeHead(415, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Unsupported file type");
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(body);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }
    console.error("Could not serve the requested file:", error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Could not load the game.");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log("Starlit Wish is ready at http://localhost:" + port);
});

server.on("error", (error) => {
  console.error("Could not start Starlit Wish:", error);
  process.exitCode = 1;
});
