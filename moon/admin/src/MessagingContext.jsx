// src/MessagingContext.jsx
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const MessagingContext = createContext(null);

const WS_TOKEN = 'Z2VuMjAubmV0fDF8YWRtaW58MjExMDQ5MzYyOA.8762a97b55218c757c5fce3604c3e21b10a47b2ff98c2f8228af2746a3d690b5';   // pre-minted admin token (gen20.net:1)

export function MessagingProvider({ userID, domains = [], children }) {
    const wsRef = useRef(null);
    const [connection, setConnection] = useState("connecting");
    const [messages, setMessages] = useState([]);
    const listenersRef = useRef(new Set());

    const connect = useCallback(async () => {
        setConnection("connecting");

        // per-user token (identity = domain:GENUID) — fallback στο pre-minted
        let token = WS_TOKEN;
        try {
            const host = window.location.host;
            const r = await fetch(`/api/v1/local/mintToken?domain=${encodeURIComponent(host)}`);
            const d = await r.json();
            if (d?.data?.token) token = d.data.token;
        } catch (err) {
            console.warn("[messaging] mintToken fetch failed, using fallback", err);
        }

        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${proto}://${window.location.host}/god/v1/messaging/ws?token=${token}`;

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