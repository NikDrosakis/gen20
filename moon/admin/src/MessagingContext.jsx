// src/MessagingContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const MessagingContext = createContext(null);

export function MessagingProvider({ userID, domains = [], children }) {
    const wsRef = useRef(null);
    const [connection, setConnection] = useState("connecting");
    const [messages, setMessages] = useState([]);
    const listenersRef = useRef(new Set());

    const connect = useCallback(() => {
        setConnection("connecting");
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${proto}://${window.location.host}/god/v1/messaging/ws?userid=${encodeURIComponent(userID)}`;

        const ws = new WebSocket(url);
        wsRef.current = ws;
        window.ws = ws;

        ws.onopen = () => {
            setConnection("open");
            domains.forEach((d) => {
                ws.send(JSON.stringify({ type: "subscribe", domain: d }));
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

    const send = useCallback((msg) => {
        const ws = wsRef.current;
        if (ws?.readyState !== WebSocket.OPEN) return false;
        ws.send(JSON.stringify({ ...msg, uid: userID, modified: Math.floor(Date.now() / 1000) }));
        return true;
    }, [userID]);

    const subscribe = useCallback((fn) => {
        listenersRef.current.add(fn);
        return () => listenersRef.current.delete(fn);
    }, []);

    return (
        <MessagingContext.Provider value={{ connection, messages, send, subscribe, userID }}>
            {children}
        </MessagingContext.Provider>
    );
}

export const useMessaging = () => useContext(MessagingContext);