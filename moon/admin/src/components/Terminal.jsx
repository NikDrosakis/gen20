import React, { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";
import "./Terminal.css";

const MSG = { DATA: 0x30, RESIZE: 0x31, TITLE: 0x32 };
const WS_PATH = "/god/v1/ws";   // ← απευθείας στον Go daemon

export default function TerminalPTY() {
    const [connection, setConnection] = useState("connecting");
    const [lastError, setLastError] = useState(null);

    const containerRef = useRef(null);
    const termRef = useRef(null);
    const fitRef = useRef(null);
    const wsRef = useRef(null);

    const sendFrame = useCallback((type, payload) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const len = payload ? payload.length : 0;
        const frame = new Uint8Array(1 + len);
        frame[0] = type;
        if (payload) frame.set(payload, 1);
        ws.send(frame);
    }, []);

    const sendResize = useCallback(() => {
        const term = termRef.current;
        if (!term) return;
        const payload = new TextEncoder().encode(
            JSON.stringify({ cols: term.cols, rows: term.rows })
        );
        sendFrame(MSG.RESIZE, payload);
    }, [sendFrame]);

    const connect = useCallback(() => {
        setConnection("connecting");
        setLastError(null);

        // Απευθείας WebSocket στον Go daemon — χωρίς token, χωρίς PHP.
        // Ο browser στέλνει αυτόματα το session cookie στο upgrade.
        const proto = window.location.protocol === "https:" ? "wss" : "ws";
        const url = `${proto}://${window.location.host}${WS_PATH}`;

        let ws;
        try {
            ws = new WebSocket(url);
        } catch (e) {
            setConnection("error");
            setLastError(e && e.message ? e.message : "WS open failed");
            return;
        }

        ws.binaryType = "arraybuffer";
        wsRef.current = ws;

        ws.onopen = () => {
            setConnection("open");
            sendResize();
            if (termRef.current) termRef.current.focus();
        };

        ws.onmessage = (event) => {
            // Το υπάρχον /god/v1/ws κάνει echo — δηλαδή ό,τι στέλνεις, το παίρνεις πίσω.
            // Μόλις αλλάξει ο Go σε PTY mode, θα είναι raw bytes του shell.
            if (typeof event.data === "string") {
                // Echo mode: string
                if (termRef.current) termRef.current.write(event.data);
                return;
            }
            const buf = new Uint8Array(event.data);
            if (!buf.length) return;
            const type = buf[0];
            const payload = buf.subarray(1);
            switch (type) {
                case MSG.DATA:
                    if (termRef.current) termRef.current.write(payload);
                    break;
                case MSG.TITLE:
                    document.title = new TextDecoder().decode(payload);
                    break;
                default:
                    // Άγνωστο frame type — γράψε το ως raw bytes (fallback)
                    if (termRef.current) termRef.current.write(buf);
                    break;
            }
        };

        ws.onclose = (ev) => {
            setConnection("closed");
            if (ev.code !== 1000 && termRef.current) {
                termRef.current.writeln(
                    `\r\n\x1b[33mDisconnected (code ${ev.code})\x1b[0m`
                );
            }
        };

        ws.onerror = () => {
            setConnection("error");
            setLastError("WebSocket error");
        };
    }, [sendResize]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close(1000, "user");
            wsRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        const term = new Terminal({
            cursorBlink: true,
            fontFamily: 'ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace',
            fontSize: 13,
            scrollback: 8000,
            theme: {
                background: "#0b0f14",
                foreground: "#d7e1ea",
                cursor: "#4ade80",
                selectionBackground: "#264f78",
                black: "#1e2329",
                red: "#ef4444",
                green: "#4ade80",
                yellow: "#facc15",
                blue: "#60a5fa",
                magenta: "#c084fc",
                cyan: "#22d3ee",
                white: "#d7e1ea",
            },
        });

        const fit = new FitAddon();
        term.loadAddon(fit);
        term.loadAddon(new WebLinksAddon());
        term.open(containerRef.current);
        fit.fit();

        termRef.current = term;
        fitRef.current = fit;

        const dataSub = term.onData((data) => {
            sendFrame(MSG.DATA, new TextEncoder().encode(data));
        });

        const resizeSub = term.onResize(() => sendResize());

        const obs = new ResizeObserver(() => {
            try { fit.fit(); } catch (_) { /* container 0x0 */ }
        });
        obs.observe(containerRef.current);

        connect();

        return () => {
            dataSub.dispose();
            resizeSub.dispose();
            obs.disconnect();
            disconnect();
            term.dispose();
            termRef.current = null;
            fitRef.current = null;
        };
    }, [connect, disconnect, sendFrame, sendResize]);

    const clearTerminal = () => {
        if (termRef.current) {
            termRef.current.clear();
            termRef.current.focus();
        }
    };

    const copySelection = async () => {
        const sel = termRef.current ? termRef.current.getSelection() : "";
        if (sel) await navigator.clipboard.writeText(sel);
    };

    const sendCtrlC = () => {
        sendFrame(MSG.DATA, new TextEncoder().encode("\x03"));
        if (termRef.current) termRef.current.focus();
    };

    const statusLabel =
        connection === "open" ? "CONNECTED"
            : connection === "connecting" ? "CONNECTING"
                : connection === "error" ? "ERROR"
                    : "DISCONNECTED";

    return (
        <div className="pty-terminal">
            <header className="pty-terminal-header">
                <div>
                    <div className="pty-terminal-title">
                        <span className={`pty-terminal-dot ${connection}`} />
                        GEN20 SHELL
                    </div>
                    <div className="pty-terminal-subtitle">
                        {window.location.hostname} · {WS_PATH}
                        {lastError ? ` · ${lastError}` : ""}
                    </div>
                </div>

                <div className="pty-terminal-actions">
                    {connection !== "open" ? (
                        <button type="button" onClick={connect}>
                            {connection === "connecting" ? "Connecting…" : "Reconnect"}
                        </button>
                    ) : (
                        <button type="button" onClick={disconnect}>
                            Disconnect
                        </button>
                    )}
                    <button type="button" onClick={sendCtrlC} title="Send SIGINT">
                        Ctrl+C
                    </button>
                    <button type="button" onClick={copySelection} title="Copy selection">
                        Copy
                    </button>
                    <button type="button" onClick={clearTerminal}>
                        Clear
                    </button>
                </div>
            </header>

            <div className="pty-terminal-console" ref={containerRef} />

            <footer className="pty-terminal-footer">
                <span className={connection}>{statusLabel}</span>
                <span>Ctrl+C interrupt · Ctrl+D EOF · mouse select to copy</span>
                <span>↑ ↓ history · Tab completion</span>
            </footer>
        </div>
    );
}