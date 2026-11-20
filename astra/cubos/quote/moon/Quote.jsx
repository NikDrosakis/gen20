
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Quote.css";

const Quote = ({ items: propItems }) => {
    const [quotes, setQuotes] = useState(propItems ?? []);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(!propItems?.length);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (propItems?.length) {
            setQuotes(propItems);
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchQuotes = async () => {
            setLoading(true);
            setError(null);

            try {
                const query = `
                    SELECT content.*
                    FROM content
                    INNER JOIN classification
                        ON classification.id = content.classificationid
                    WHERE classification.name = 'quotes'
                    ORDER BY content.id DESC
                `;

                const res = await fetch(
                    `/api/v1/maria/q?key=${encodeURIComponent(query)}`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                const rows = Array.isArray(data)
                    ? data
                    : data?.rows ?? data?.data ?? [];

                setQuotes(rows);
                setCurrent(0);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error fetching quotes:", err);
                    setError(err.message);
                    setQuotes([]);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchQuotes();
        return () => controller.abort();
    }, [propItems]);

    useEffect(() => {
        setCurrent(0);
    }, [quotes.length]);

    if (loading) {
        return <div className="text-center py-10">Loading quotes…</div>;
    }

    if (error) {
        return <div className="text-center py-10">Error: {error}</div>;
    }

    if (!quotes.length) {
        return <div className="text-center py-10">No quotes available.</div>;
    }

    const prev = () =>
        setCurrent(i => i === 0 ? quotes.length - 1 : i - 1);

    const next = () =>
        setCurrent(i => i === quotes.length - 1 ? 0 : i + 1);

    const quote = quotes[current];
    const background = quote.img
        ? `url(/media/${quote.img})`
        : "none";

    return (
        <div className="container">
            <div className="row">
                <div
                    className="relative w-full max-w-[500px] mx-auto rounded-2xl border border-gray-300 shadow-2xl overflow-hidden"
                    style={{
                        aspectRatio: "9 / 16",
                        background: "var(--bg2)",
                        color: "var(--text)"
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative w-full h-full bg-cover bg-center flex items-end"
                            style={{
                                backgroundImage: background,
                                backgroundColor: "var(--bg2)"
                            }}
                        >
                            {quote.img && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                            )}

                            <div
                                className="relative z-10 w-full px-6 py-5 text-center"
                                style={{
                                    backdropFilter: "blur(8px)",
                                    background: quote.img
                                        ? "rgba(0,0,0,.3)"
                                        : "var(--bg3)"
                                }}
                            >
                                <p className="text-xl italic leading-snug">
                                    “{quote.description}”
                                </p>

                                <p className="text-sm mt-3 font-light">
                                    — {quote.title || ""}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {quotes.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                aria-label="Previous quote"
                                className="bare absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-md transition"
                            >
                                <ChevronLeft size={28} />
                            </button>

                            <button
                                onClick={next}
                                aria-label="Next quote"
                                className="bare absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-md transition"
                            >
                                <ChevronRight size={28} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quote;
