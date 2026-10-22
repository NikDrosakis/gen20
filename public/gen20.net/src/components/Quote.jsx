import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DB from "../contexts/DB";

const Quote = ({ items: propItems }) => {
    const [quotes, setQuotes] = useState([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const fetchQuotes = async () => {
            try {
                if (!propItems || propItems.length === 0) {
                    const res = await DB.maria("fa", "SELECT * FROM gen_gen20net.c_quote");
                    setQuotes(Array.isArray(res) ? res : []);
                } else {
                    setQuotes(propItems);
                }
            } catch (err) {
                console.error("Error fetching quotes:", err);
                setQuotes([]);
            }
        };

        fetchQuotes();
    }, [propItems]);

    if (!quotes || quotes.length === 0) {
        return <div className="text-center text-gray-500 py-10">No quotes available.</div>;
    }

    const prev = () => setCurrent((prev) => (prev === 0 ? quotes.length - 1 : prev - 1));
    const next = () => setCurrent((prev) => (prev === quotes.length - 1 ? 0 : prev + 1));
    const quote = quotes[current];

    return (
        <div className="container">
            <div className="row">
                <div
                    className="max-w-[500px] mx-auto rounded-2xl border border-gray-300 shadow-2xl overflow-hidden"
                    style={{
                        minWidth: "200px",
                        aspectRatio: "9 / 16",
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{x: 300, opacity: 0}}
                            animate={{x: 0, opacity: 1}}
                            exit={{x: -300, opacity: 0}}
                            transition={{duration: 0.6}}
                            className="relative w-full h-full bg-cover bg-center flex items-end"
                            style={{backgroundImage: `url(/media/${quote.img})`}}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"/>
                            <div className="relative z-10 w-full px-6 py-5 text-center backdrop-blur-sm bg-black/30">
                                <p className="text-xl italic leading-snug">“{quote.description}”</p>
                                <p className="text-sm mt-3 font-light">— {quote.userid || "Anonymous"}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Arrows */}
                    <button
                        onClick={prev}
                        className="bare absolute top-1/2 left-3 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-md transition"
                    >
                        <ChevronLeft size={28}/>
                    </button>
                    <button
                        onClick={next}
                        className="bare absolute top-1/2 right-3 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-2 shadow-md transition"
                    >
                        <ChevronRight size={28}/>
                    </button>
                </div>
                </div>
                </div>

                );
                };

                export default Quote;
