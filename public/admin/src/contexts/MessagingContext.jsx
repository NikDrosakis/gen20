import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const MessagingContext = createContext(null);

export function MessagingProvider({ userID, domains = [], children }) {
    const wsRef = useRef(null);
    const [connection, setConnection] = useState("connecting");
    const [messages, setMessages] = useState([]);
    const listenersRef = useRef(new Set());

    const connect = useCallback(() => {
        setConnection("connecting");
        console.log("[messaging] connecting…");
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${proto}://${window.location.host}/god/v1/messaging/ws?userid=${encodeURIComponent(userID)}`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

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
            } catch {}
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

    const send = useCallback((msg) => {
        const ws = wsRef.current;
        if (ws?.readyState !== WebSocket.OPEN) return false;
        ws.send(JSON.stringify({ ...msg, userid: userID }));
        return true;
    }, [userID]);

    const sendSystem = useCallback((verba, domaffect = "*") => {
        return send({
            system: "god",
            domaffect,
            type: "notify",
            verba,
            to: "*",
            cast: "system",
        });
    }, [send]);

    const sendChat = useCallback((to, verba, domaffect = "*") => {
        return send({
            system: "chat",
            domaffect,
            type: "message",
            verba,
            to,
            cast: "one",
        });
    }, [send]);

    const subscribe = useCallback((fn) => {
        listenersRef.current.add(fn);
        return () => listenersRef.current.delete(fn);
    }, []);

    return (
        <MessagingContext.Provider value={{
            connection, messages, send, sendSystem, sendChat, subscribe,
        }}>
            {children}
        </MessagingContext.Provider>
    );
}

export const useMessaging = () => useContext(MessagingContext);