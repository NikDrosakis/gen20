// src/MessagingContext.jsx
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

const MessagingContext = createContext(null);

/* ---------------------------------------------------------------
 * ULID-like generator (sortable, μονοτονικό, Couch-friendly)
 * Χρησιμοποιείται για το _id του message: msg:<cid>:<ULID>
 * ------------------------------------------------------------- */
function ulid(now = Date.now()) {
    const t = now.toString(36).toUpperCase().padStart(10, "0");
    const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let r = "";
    for (let i = 0; i < 16; i++) {
        r += alphabet[(Math.random() * 32) | 0];
    }
    return t + r;
}

export function MessagingProvider({ userID, domains = [], children }) {
    const wsRef = useRef(null);
    const [connection, setConnection] = useState("connecting");
    const [messages, setMessages] = useState([]);
    const listenersRef = useRef(new Set());

    /* ---------------------------------------------------------------
     * Connect / reconnect
     * ------------------------------------------------------------- */
    const connect = useCallback(() => {
        setConnection("connecting");
        console.log("[messaging] connecting…");

        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${proto}://${window.location.host}/god/v1/messaging/ws?userid=${encodeURIComponent(
            userID
        )}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;
        window.ws = ws;

        ws.onopen = () => {
            setConnection("open");
            console.log("[messaging] open…");
            // Subscribe στα domains
            domains.forEach((d) => {
                ws.send(JSON.stringify({ type: "subscribe", domaffect: d }));
            });
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                setMessages((prev) => [...prev.slice(-199), msg]);
                listenersRef.current.forEach((fn) => fn(msg));
            } catch (err) {
                console.warn("[messaging] bad message", err);
            }
        };

        ws.onclose = () => {
            setConnection("closed");
            console.log("[messaging] closed…");
            setTimeout(() => {
                if (wsRef.current === ws) connect();
            }, 3000);
        };

        ws.onerror = () => setConnection("error");
    }, [userID, domains.join(",")]);

    useEffect(() => {
        connect();
        return () => wsRef.current?.close(1000, "unmount");
    }, [connect]);

    /* ---------------------------------------------------------------
     * Low-level send
     * ------------------------------------------------------------- */
    const send = useCallback(
        (msg) => {
            const ws = wsRef.current;
            if (ws?.readyState !== WebSocket.OPEN) return false;
            ws.send(JSON.stringify({ ...msg, userid: userID }));
            return true;
        },
        [userID]
    );

    /* ---------------------------------------------------------------
     * System notifications
     * ------------------------------------------------------------- */
    const sendSystem = useCallback(
        (verba, domaffect = "*") => {
            return send({
                system: "god",
                domaffect,
                type: "notify",
                verba,
                to: "*",
                cast: "system",
            });
        },
        [send]
    );

    /* ---------------------------------------------------------------
     * Chat — Couch-ready schema:
     * {
     *   _id: "msg:<cid>:<ULID>",
     *   type: "message",
     *   uid: "<userID>",
     *   c:   "<text>",
     *   t:   <unix seconds>,
     *   // routing / envelope:
     *   to, cid, system: "chat", cast: "one", domaffect
     * }
     * ------------------------------------------------------------- */
    const sendChat = useCallback(
        (to, text, cid) => {
            if (!cid) {
                console.warn("[messaging] sendChat: cid required");
                return false;
            }
            if (!text || !text.trim()) return false;

            const msg = {
                _id: `msg:${cid}:${ulid()}`,
                type: "message",
                uid: userID,
                c: text,
                t: Math.floor(Date.now() / 1000),

                // routing / envelope
                to,
                cid,
                system: "chat",
                cast: "one",
                domaffect: "*",
            };

            return send(msg);
        },
        [send, userID]
    );

    /* ---------------------------------------------------------------
     * Selector: μηνύματα για ένα cid
     * ------------------------------------------------------------- */
    const getChatMessages = useCallback(
        (cid) => {
            if (!cid) return [];
            return messages.filter(
                (m) =>
                    m.type === "message" &&
                    (m.cid === cid || m._id?.startsWith(`msg:${cid}:`))
            );
        },
        [messages]
    );

    /* ---------------------------------------------------------------
     * External subscription
     * ------------------------------------------------------------- */
    const subscribe = useCallback((fn) => {
        listenersRef.current.add(fn);
        return () => listenersRef.current.delete(fn);
    }, []);

    return (
        <MessagingContext.Provider
            value={{
                connection,
                messages,
                send,
                sendSystem,
                sendChat,
                subscribe,
                getChatMessages,
            }}
        >
            {children}
        </MessagingContext.Provider>
    );
}

export const useMessaging = () => useContext(MessagingContext);