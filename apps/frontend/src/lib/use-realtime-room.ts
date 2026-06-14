import * as React from "react";

/**
 * Real-time discussion room hook (WebSocket).
 *
 * Connects to the LeetLab WS relay, joins a room (a discussion id) and invokes
 * the provided handlers for live events. Auto-reconnects on drop. Persistence
 * still happens through the REST API — this only mirrors live activity between
 * everyone viewing the same thread.
 */

const WS_URL: string =
  (import.meta as any).env?.VITE_WS_URL ||
  `${typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws"}://${
    typeof window !== "undefined" ? window.location.hostname : "localhost"
  }:4001`;

export interface RealtimeHandlers {
  onComment?: (comment: any) => void;
  onDeleteComment?: (commentId: string) => void;
  onVote?: (commentId: string, votes: { upvotes: number; downvotes: number }) => void;
  onPresence?: (count: number) => void;
  onTyping?: (user: { id?: string; name?: string }) => void;
}

export interface RealtimeRoom {
  connected: boolean;
  sendComment: (comment: any) => void;
  sendDeleteComment: (commentId: string) => void;
  sendVote: (commentId: string, votes: { upvotes: number; downvotes: number }) => void;
  sendTyping: (user: { id?: string; name?: string }) => void;
}

export function useRealtimeRoom(
  room: string | null | undefined,
  handlers: RealtimeHandlers
): RealtimeRoom {
  const wsRef = React.useRef<WebSocket | null>(null);
  const handlersRef = React.useRef(handlers);
  handlersRef.current = handlers;
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    if (!room) return;
    let closedByUs = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      let ws: WebSocket;
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        reconnectTimer = setTimeout(connect, 2500);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({ type: "join", room }));
      };

      ws.onmessage = (e) => {
        let d: any;
        try {
          d = JSON.parse(e.data);
        } catch {
          return;
        }
        const h = handlersRef.current;
        switch (d?.type) {
          case "comment":
            h.onComment?.(d.comment);
            break;
          case "delete_comment":
            h.onDeleteComment?.(d.commentId);
            break;
          case "vote":
            h.onVote?.(d.commentId, d.votes);
            break;
          case "presence":
          case "joined":
            h.onPresence?.(d.count ?? 0);
            break;
          case "typing":
            h.onTyping?.(d.user ?? {});
            break;
          default:
            break;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!closedByUs) reconnectTimer = setTimeout(connect, 2500);
      };

      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          /* ignore */
        }
      };
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      const ws = wsRef.current;
      if (ws) {
        try {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "leave" }));
        } catch {
          /* ignore */
        }
        try {
          ws.close();
        } catch {
          /* ignore */
        }
      }
      wsRef.current = null;
    };
  }, [room]);

  const post = React.useCallback(
    (payload: Record<string, unknown>) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN && room) {
        ws.send(JSON.stringify({ ...payload, room }));
      }
    },
    [room]
  );

  return React.useMemo<RealtimeRoom>(
    () => ({
      connected,
      sendComment: (comment) => post({ type: "comment", comment }),
      sendDeleteComment: (commentId) => post({ type: "delete_comment", commentId }),
      sendVote: (commentId, votes) => post({ type: "vote", commentId, votes }),
      sendTyping: (user) => post({ type: "typing", user }),
    }),
    [connected, post]
  );
}
