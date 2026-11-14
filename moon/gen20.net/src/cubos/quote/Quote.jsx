import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Quote = ({ items: propItems }) => {
    const [quotes, setQuotes] = useState(propItems ?? []);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(!propItems?.length);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Αν έχουμε ήδη items από props, μη κάνεις fetch
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
                const query = "SELECT * FROM gen_gen20net.c_quote";
                const res = await fetch(
                    `/api/v1/maria/q?key=${encodeURIComponent(query)}`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                // προσαρμόζεται ανάλογα με το response shape του API σου
                const rows = Array.isArray(data) ? data : data?.rows ?? data?.data ?? [];
                setQuotes(rows);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error fetching quotes:", err);
                    setError(err.message);
                    setQuotes([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchQuotes();
        return () => controller.abort();
    }, [propItems]);

    if (loading) {
        return <div className="text-center text-gray-500 py-10">Loading quotes…</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">Error: {error}</div>;
    }

    if (!quotes.length) {
        return <div className="text-center text-gray-500 py-10">No quotes available.</div>;
    }

    const prev = () => setCurrent((i) => (i === 0 ? quotes.length - 1 : i - 1));
    const next = () => setCurrent((i) => (i === quotes.length - 1 ? 0 : i + 1));
    const quote = quotes[current];

    return (
        <div className="container">
            <div className="row">
                <div
                    className="relative max-w-[500px] mx-auto rounded-2xl border border-gray-300 shadow-2xl overflow-hidden"
                    style={{ minWidth: "200px", aspectRatio: "9 / 16" }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative w-full h-full bg-cover bg-center flex items-end"
                            style={{ backgroundImage: `url(/media/${quote.img})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                            <div className="relative z-10 w-full px-6 py-5 text-center backdrop-blur-sm bg-black/30">
                                <p className="text-xl italic leading-snug">“{quote.description}”</p>
                                <p className="text-sm mt-3 font-light">— {quote.userid || "Anonymous"}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

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
                </div>
            </div>
        </div>
    );
};

export default Quote;