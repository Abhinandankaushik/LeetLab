# LeetLab WebSocket server

Lightweight real-time messaging relay for LeetLab discussions:

- **Problem page** discussion panel (`/problems/:id` → Discuss tab)
- **Discussion post** page (`/discuss/:postId`)

It does **not** store anything — persistence stays in the main backend (REST).
This server only fans out live events (new comments, deletes, votes, typing,
viewer presence) to everyone currently viewing the same thread.

## Run

```bash
cd ws
npm install
npm run start      # or: npm run dev  (auto-restart)
```

Defaults to `ws://localhost:4001`. Override the port with `WS_PORT`.

## Frontend

The frontend connects via `VITE_WS_URL` (see `frontend/.env.example`). If unset,
it falls back to `ws://<current-host>:4001`.

## Protocol

Rooms are keyed by a discussion id. Messages are JSON:

| Direction | Message |
| --- | --- |
| client → server | `{ type: "join", room }` |
| client → server | `{ type: "leave" }` |
| client → server | `{ type: "comment", room, comment }` |
| client → server | `{ type: "delete_comment", room, commentId }` |
| client → server | `{ type: "vote", room, commentId, votes }` |
| client → server | `{ type: "typing", room, user }` |
| server → client | `{ type: "comment", comment }` |
| server → client | `{ type: "delete_comment", commentId }` |
| server → client | `{ type: "vote", commentId, votes }` |
| server → client | `{ type: "typing", user }` |
| server → client | `{ type: "presence", count }` |
| server → client | `{ type: "joined", room, count }` |
