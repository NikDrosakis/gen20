import { useEffect, useRef, useState } from "react";
import "./PoetaNote.css";

const API = "/poetanote";
const newLine = (text = "") => ({ id: crypto.randomUUID(), text });

export default function PoetaNote() {
    const [lines, setLines] = useState([newLine()]);
    const [activeId, setActiveId] = useState(lines[0].id);
    const [references, setReferences] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const editorRefs = useRef({});
    const debounce = useRef(null);

    const activeIndex = lines.findIndex(line => line.id === activeId);
    const activeLine = lines[activeIndex];

    const focusLine = (id, position = null) => {
        setActiveId(id);
        requestAnimationFrame(() => {
            const node = editorRefs.current[id];
            if (!node) return;
            node.focus();
            if (position !== null) node.setSelectionRange(position, position);
        });
    };

    const resize = node => {
        if (!node) return;
        node.style.height = "auto";
        node.style.height = `${node.scrollHeight}px`;
    };

    const changeLine = (id, text) => {
        setLines(current => current.map(line =>
            line.id === id ? { ...line, text } : line
        ));
    };

    const handleKeyDown = (event, index) => {
        const line = lines[index];
        const node = event.currentTarget;
        const start = node.selectionStart;
        const end = node.selectionEnd;

        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            const before = line.text.slice(0, start);
            const after = line.text.slice(end);
            const next = newLine(after);

            setLines(current => [
                ...current.slice(0, index),
                { ...line, text: before },
                next,
                ...current.slice(index + 1)
            ]);
            focusLine(next.id, 0);
            return;
        }

        if (event.key === "Backspace" && start === 0 && end === 0 && index > 0) {
            event.preventDefault();
            const previous = lines[index - 1];
            const cursor = previous.text.length;
            setLines(current => current
                .filter(item => item.id !== line.id)
                .map(item => item.id === previous.id
                    ? { ...item, text: item.text + line.text }
                    : item));
            focusLine(previous.id, cursor);
            return;
        }

        if (event.key === "Delete" && start === line.text.length &&
            end === line.text.length && index < lines.length - 1) {
            event.preventDefault();
            const next = lines[index + 1];
            setLines(current => current
                .filter(item => item.id !== next.id)
                .map(item => item.id === line.id
                    ? { ...item, text: item.text + next.text }
                    : item));
            focusLine(line.id, line.text.length);
        }
    };

    useEffect(() => {
        const text = activeLine?.text?.trim() || "";
        clearTimeout(debounce.current);

        if (text.length < 3) {
            setReferences([]);
            setError("");
            return;
        }

        const controller = new AbortController();
        debounce.current = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API}/context`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, limit: 8 }),
                    signal: controller.signal
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || "Αποτυχία αναζήτησης.");
                setReferences(data.results || []);
                setError("");
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 350);

        return () => {
            clearTimeout(debounce.current);
            controller.abort();
        };
    }, [activeLine?.text, activeId]);

    const uploadCorpus = async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        const form = new FormData();
        form.append("file", file);
        setLoading(true);
        setNotice("");
        setError("");

        try {
            const response = await fetch(`${API}/upload`, {
                method: "POST",
                body: form
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Αποτυχία εισαγωγής.");
            setNotice(`Ευρετηριάστηκαν ${data.lines_indexed} στίχοι από «${data.poem}».`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            event.target.value = "";
        }
    };

    return (
        <section className="poetanote">
            <header className="poetanote-toolbar">
                <strong>PoetaNote</strong>
                <label className="poetanote-upload">
                    Προσθήκη ποιημάτων
                    <input type="file" accept=".txt,.md" onChange={uploadCorpus} />
                </label>
            </header>

            <div className="poetanote-workspace">
                <main className="poetanote-editor" aria-label="Ποιητικό σημειωματάριο">
                    {lines.map((line, index) => (
                        <div
                            key={line.id}
                            className={`poetanote-line ${line.id === activeId ? "active" : ""}`}
                        >
                            <span className="poetanote-number">{index + 1}</span>
                            <textarea
                                ref={node => {
                                    editorRefs.current[line.id] = node;
                                    if (node) resize(node);
                                }}
                                rows={1}
                                value={line.text}
                                aria-label={`Στίχος ${index + 1}`}
                                onFocus={() => setActiveId(line.id)}
                                onChange={event => {
                                    changeLine(line.id, event.target.value);
                                    resize(event.target);
                                }}
                                onKeyDown={event => handleKeyDown(event, index)}
                            />
                        </div>
                    ))}
                </main>

                <aside className="poetanote-context">
                    <h3>Στίχοι από το έργο σου</h3>
                    {loading && <small>Αναζήτηση…</small>}
                    {notice && <p className="poetanote-notice">{notice}</p>}
                    {error && <p role="alert">{error}</p>}
                    {!loading && !error && references.length === 0 && (
                        <small>Οι εσωτερικές αναφορές θα εμφανιστούν εδώ.</small>
                    )}
                    {references.map(item => (
                        <article className="poetanote-result" key={item.id}>
                            <p>{item.text}</p>
                            <small>{item.poem} · στίχος {item.line}</small>
                        </article>
                    ))}
                </aside>
            </div>
        </section>
    );
}
