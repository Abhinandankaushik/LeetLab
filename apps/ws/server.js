import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";

/**
 * LeetLab real-time messaging server.
 *
 * A small, stateless WebSocket relay used by the problem-page discussion panel
 * and the discussion post page. Persistence stays in the main backend (REST);
 * this server only fans out live events to everyone viewing the same thread.
 *
 * Rooms are keyed by a discussion id (the same id the problem page and the
 * discuss post page already use). A socket is in at most one room at a time.
 *
 * Message protocol (JSON, both directions):
 *   client -> server
 *     { type: "join",           room }
 *     { type: "leave" }
 *     { type: "comment",        room, comment }       // a newly created comment
 *     { type: "delete_comment", room, commentId }
 *     { type: "vote",           room, commentId, votes }
 *     { type: "typing",         room, user }
 *   server -> client
 *     { type: "comment",        comment }
 *     { type: "delete_comment", commentId }
 *     { type: "vote",           commentId, votes }
 *     { type: "typing",         user }
 *     { type: "presence",       count }               // viewers in the room
 *     { type: "joined",         room, count }          // ack to the joiner
 */

const PORT = Number(process.env.WS_PORT) || 4001;

const wss = new WebSocketServer({ port: PORT });

/** room id -> Set<WebSocket> */
const rooms = new Map();

function joinRoom(ws, room) {
  if (!room || typeof room !== "string") return;
  if (ws.room === room) return;
  leaveRoom(ws);
  ws.room = room;
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(ws);
  const count = rooms.get(room).size;
  send(ws, { type: "joined", room, count });
  broadcastPresence(room);
}

function leaveRoom(ws) {
  const room = ws.room;
  if (room && rooms.has(room)) {
    const set = rooms.get(room);
    set.delete(ws);
    if (set.size === 0) rooms.delete(room);
    else broadcastPresence(room);
  }
  ws.room = null;
}

function send(ws, data) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
}

/** Send to everyone in a room, optionally skipping the originator. */
function broadcast(room, data, except) {
  const set = rooms.get(room);
  if (!set) return;
  const msg = JSON.stringify(data);
  for (const client of set) {
    if (client !== except && client.readyState === client.OPEN) client.send(msg);
  }
}

function broadcastPresence(room) {
  const count = rooms.get(room)?.size || 0;
  broadcast(room, { type: "presence", count });
}

wss.on("connection", (ws) => {
  ws.id = randomUUID();
  ws.room = null;
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!data || typeof data.type !== "string") return;

    switch (data.type) {
      case "join":
        joinRoom(ws, data.room);
        break;
      case "leave":
        leaveRoom(ws);
        break;
      case "comment":
        if (data.room && data.comment) {
          broadcast(data.room, { type: "comment", comment: data.comment }, ws);
        }
        break;
      case "delete_comment":
        if (data.room && data.commentId) {
          broadcast(data.room, { type: "delete_comment", commentId: data.commentId }, ws);
        }
        break;
      case "vote":
        if (data.room && data.commentId) {
          broadcast(data.room, { type: "vote", commentId: data.commentId, votes: data.votes }, ws);
        }
        break;
      case "typing":
        if (data.room && data.user) {
          broadcast(data.room, { type: "typing", user: data.user }, ws);
        }
        break;
      default:
        break;
    }
  });

  ws.on("close", () => leaveRoom(ws));
  ws.on("error", () => leaveRoom(ws));
});

// Heartbeat: drop sockets that stopped responding so room counts stay accurate.
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch {
      /* ignore */
    }
  }
}, 30000);

wss.on("close", () => clearInterval(heartbeat));

console.log(`🔌 LeetLab WS server listening on ws://localhost:${PORT}`);
