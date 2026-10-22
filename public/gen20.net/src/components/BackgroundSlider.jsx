// components/BackgroundSlider.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BackgroundSliderProps = {
    images: string[];
    interval?: number;
};

export default function BackgroundSlider({
                                             images,
                                             interval = 5000,
                                         }: BackgroundSliderProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const slide = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, interval);
        return () => clearInterval(slide);
    }, [images.length, interval]);

    return (
        <div className="fixed top-0 left-0 w-screen h-screen z-0 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.img
                    key={current}
                    src={images[current]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute w-full h-full object-cover"
                />
            </AnimatePresence>
        </div>
    );
}
