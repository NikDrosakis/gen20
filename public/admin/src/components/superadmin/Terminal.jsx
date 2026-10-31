
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Terminal.css";

const API = {
    catalog: "/api/v1/terminal/catalog",
    execute: "/api/v1/terminal/execute",
    cancel: "/api/v1/terminal/cancel",
};

// Fallback catalogue. Το backend catalogue θα υπερισχύει.
const DEFAULT_COMMANDS = [
    { command: "help", description: "Available commands", category: "System" },
    { command: "status", description: "Platform status", category: "System" },
    { command: "ports", description: "Listening ports", category: "System" },
    { command: "top", description: "Top processes", category: "System" },
    { command: "performance", description: "System performance", category: "System" },
    { command: "tree", description: "Project directory tree", category: "System" },
    { command: "domain:nginx", description: "Nginx domains", category: "Domain" },
    { command: "domain:ssl", description: "SSL certificates", category: "Domain", dangerous: true },
    { command: "gaia status", description: "Gaia status", category: "Gaia" },
    { command: "god status", description: "God status", category: "Services" },
    { command: "kronos status", description: "Kronos status", category: "Services" },
    { command: "ermis status", description: "Ermis status", category: "Services" },
    { command: "mars status", description: "Mars status", category: "Services" },
    { command: "cubos", description: "Cubos commands", category: "Cubos" },
    { command: "git status", description: "Git working tree", category: "Git" },
    { command: "composer", description: "Composer commands", category: "Development" },
    { command: "setup", description: "Platform setup", category: "Setup", dangerous: true },
    { command: "maria:dump", description: "Database backup", category: "Database", dangerous: true },
];

const DANGEROUS = [
    /^setup(?:\s|$)/i,
    /^domain:ssl(?:\s|$)/i,
    /^sql(?:\s|$)/i,
    /^db(?:\s|$)/i,
    /^maria:dump(?:\s|$)/i,
    /^(start|stop|restart|reload)\s/i,
    /^permissions(?:\s|$)/i,
    /^kill(?:\s|$)/i,
];

function isDangerous(command) {
    return DANGEROUS.some((pattern) => pattern.test(command.trim()));
}

function getPromptPath() {
    return window.location.hostname;
}

export default function TerminalTab() {
    const [commands, setCommands] = useState(DEFAULT_COMMANDS);
    const [input, setInput] = useState("");
    const [output, setOutput] = useState([
        {
            type: "system",
            text: "GEN20 Terminal initialized.",
            time: new Date(),
        },
        {
            type: "system",
            text: "Type 'help' or use the command buttons below.",
            time: new Date(),
        },
    ]);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    const inputRef = useRef(null);
    const outputRef = useRef(null);
    const abortRef = useRef(null);

    const addOutput = useCallback((type, text) => {
        setOutput((prev) => [
            ...prev,
            { type, text: String(text ?? ""), time: new Date() },
        ]);
    }, []);

    // Load command catalogue from the server.
    useEffect(() => {
        let active = true;

        fetch(API.catalog, {
            method: "GET",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
        })
            .then(async (response) => {
                if (!response.ok) throw new Error("Catalogue unavailable");
                return response.json();
            })
            .then((data) => {
                if (!active || !Array.isArray(data.commands)) return;
                setCommands(data.commands);
            })
            .catch(() => {
                // Keep the local fallback catalogue.
            });

        return () => {
            active = false;
            abortRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const categories = useMemo(
        () => ["All", ...new Set(commands.map((item) => item.category || "Other"))],
        [commands]
    );

    const filteredCommands = useMemo(() => {
        if (activeCategory === "All") return commands;
        return commands.filter((item) => item.category === activeCategory);
    }, [commands, activeCategory]);

    const suggestions = useMemo(() => {
        const query = input.trim().toLowerCase();
        if (!query) return [];

        return commands
            .filter((item) => {
                const command = item.command.toLowerCase();
                return command.startsWith(query) || command.includes(` ${query}`);
            })
            .slice(0, 8);
    }, [commands, input]);

    const appendCommand = (command) => {
        setInput(command + " ");
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const executeCommand = async (rawCommand = input) => {
        const command = rawCommand.trim();
        if (!command || loading) return;

        if (isDangerous(command)) {
            const confirmed = window.confirm(
                `This command requires elevated privileges:\n\n${command}\n\nContinue?`
            );
            if (!confirmed) return;
        }

        setInput("");
        setShowSuggestions(false);
        setHistory((prev) => [...prev, command]);
        setHistoryIndex(-1);

        addOutput("command", `gen $ ${command}`);
        setLoading(true);

        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await fetch(API.execute, {
                method: "POST",
                credentials: "same-origin",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                body: JSON.stringify({
                    command,
                    session_id: sessionId,
                    domain: getPromptPath(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            if (data.session_id) setSessionId(data.session_id);

            if (data.stdout) addOutput("stdout", data.stdout);
            if (data.stderr) addOutput("stderr", data.stderr);

            addOutput(
                data.exit_code === 0 ? "success" : "error",
                `Process finished with exit code ${data.exit_code ?? "unknown"}`
            );
        } catch (error) {
            if (error.name === "AbortError") {
                addOutput("system", "Execution interrupted.");
            } else {
                addOutput("error", error.message || "Terminal request failed.");
            }
        } finally {
            setLoading(false);
            abortRef.current = null;
            inputRef.current?.focus();
        }
    };

    const cancelExecution = async () => {
        if (abortRef.current) abortRef.current.abort();

        // Backend cancellation is separate from aborting the HTTP request.
        if (sessionId) {
            try {
                await fetch(API.cancel, {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId }),
                });
            } catch {
                // The local request has already been interrupted.
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();

            if (showSuggestions && suggestions.length > 0) {
                appendCommand(suggestions[suggestionIndex]?.command || suggestions[0].command);
                return;
            }

            executeCommand();
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!history.length) return;

            const next = historyIndex < 0
                ? history.length - 1
                : Math.max(0, historyIndex - 1);

            setHistoryIndex(next);
            setInput(history[next]);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (historyIndex < 0) return;

            const next = historyIndex + 1;
            if (next >= history.length) {
                setHistoryIndex(-1);
                setInput("");
            } else {
                setHistoryIndex(next);
                setInput(history[next]);
            }
            return;
        }

        if (event.key === "Tab") {
            event.preventDefault();

            if (suggestions.length) {
                appendCommand(
                    suggestions[suggestionIndex]?.command || suggestions[0].command
                );
            }
            return;
        }

        if (event.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    const clearTerminal = () => {
        setOutput([]);
        inputRef.current?.focus();
    };

    const copyOutput = async () => {
        const text = output.map((item) => item.text).join("\n");
        await navigator.clipboard.writeText(text);
    };

    return (
        <div className="gen-terminal">
            <header className="gen-terminal-header">
                <div>
                    <div className="gen-terminal-title">
                        <span className="gen-terminal-indicator" />
                        GEN20 TERMINAL
                    </div>
                    <div className="gen-terminal-subtitle">
                        {getPromptPath()} · CLI Gateway
                    </div>
                </div>

                <div className="gen-terminal-actions">
                    <button type="button" onClick={copyOutput} title="Copy output">
                        Copy
                    </button>
                    <button type="button" onClick={clearTerminal} title="Clear terminal">
                        Clear
                    </button>
                    {loading && (
                        <button
                            type="button"
                            className="gen-terminal-stop"
                            onClick={cancelExecution}
                        >
                            Stop
                        </button>
                    )}
                </div>
            </header>

            <section className="gen-terminal-console" ref={outputRef}>
                {output.map((item, index) => (
                    <div className={`gen-terminal-line ${item.type}`} key={index}>
                        <pre>{item.text}</pre>
                    </div>
                ))}

                {loading && (
                    <div className="gen-terminal-line system">
                        <pre>Executing command...</pre>
                    </div>
                )}
            </section>

            <div className="gen-terminal-input-wrap">
                <span className="gen-terminal-prompt">gen $</span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => {
                        setInput(event.target.value);
                        setSuggestionIndex(0);
                        setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type a command..."
                    autoComplete="off"
                    spellCheck="false"
                    disabled={loading}
                />
                <button
                    type="button"
                    onClick={() => executeCommand()}
                    disabled={loading || !input.trim()}
                >
                    Run ↵
                </button>

                {showSuggestions && suggestions.length > 0 && !loading && (
                    <div className="gen-terminal-suggestions">
                        {suggestions.map((item, index) => (
                            <button
                                type="button"
                                key={item.command}
                                className={index === suggestionIndex ? "active" : ""}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => appendCommand(item.command)}
                            >
                                <strong>{item.command}</strong>
                                <span>{item.description}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <section className="gen-terminal-command-panel">
                <div className="gen-terminal-panel-title">COMMANDS</div>

                <nav className="gen-terminal-categories">
                    {categories.map((category) => (
                        <button
                            type="button"
                            key={category}
                            className={activeCategory === category ? "active" : ""}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </nav>

                <div className="gen-terminal-command-grid">
                    {filteredCommands.map((item) => (
                        <button
                            type="button"
                            key={item.command}
                            className={item.dangerous ? "dangerous" : ""}
                            title={item.description}
                            onClick={() => appendCommand(item.command)}
                        >
                            <span>{item.command}</span>
                            {item.dangerous && <small>PRIVILEGED</small>}
                        </button>
                    ))}
                </div>
            </section>

            <footer className="gen-terminal-footer">
                <span>{loading ? "RUNNING" : "READY"}</span>
                <span>{history.length} commands in session</span>
                <span>↑ ↓ history · Tab autocomplete · Enter execute</span>
            </footer>
        </div>
    );
}
