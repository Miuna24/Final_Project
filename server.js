const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = Number(process.env.PORT) || 3000;
const MAX_DRAWINGS = 200;
const MAX_MESSAGE_BYTES = 5 * 1024 * 1024;
const indexPath = path.join(__dirname, "index.html");
const drawPath = path.join(__dirname, "draw.html");
const drawings = [];

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname.replace(/\/+$/, "") || "/";
  const pagePath = pathname === "/"
    ? indexPath
    : pathname === "/draw" || pathname === "/draw.html"
      ? drawPath
      : null;
  if (!pagePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  fs.readFile(pagePath, (error, content) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Could not load the page.");
      console.error("Failed to read page:", error);
      return;
    }
    response.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(content);
  });
});

const websocketServer = new WebSocketServer({
  server,
  path: "/ws",
  maxPayload: MAX_MESSAGE_BYTES
});

function broadcast(message) {
  const payload = JSON.stringify(message);
  websocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });
}

websocketServer.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "gallery", drawings }));

  socket.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (error) {
      socket.send(JSON.stringify({ type: "error", message: "That drawing couldn't be read. Please try again." }));
      return;
    }

    if (message.type !== "add" ||
        typeof message.image !== "string" ||
        !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(message.image) ||
        message.image.length > MAX_MESSAGE_BYTES - 1024) {
      socket.send(JSON.stringify({ type: "error", message: "That drawing is invalid or too large. Please try again." }));
      return;
    }

    const drawing = {
      name: typeof message.name === "string" && message.name.trim()
        ? message.name.trim().slice(0, 24)
        : "Anonymous artist",
      image: message.image,
      createdAt: new Date().toISOString()
    };
    drawings.push(drawing);
    if (drawings.length > MAX_DRAWINGS) drawings.shift();
    socket.send(JSON.stringify({ type: "added" }));
    broadcast({ type: "gallery", drawings });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Little Big Gallery is running at http://localhost:${PORT}`);
  console.log("On the same Wi-Fi, participants can open http://<this-computer-ip>:" + PORT + "/draw");
});

server.on("error", (error) => {
  console.error("Could not start the gallery server:", error);
  process.exitCode = 1;
});
