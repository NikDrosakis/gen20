// src/cubos/rain/Rain.jsx
import { useEffect, useRef } from "react";
import { useG } from "../../GContext";
import "./Rain.css";

const DEFAULT_CHARS = "$Code is $Poetry";

export default function Rain({
                                 chars = DEFAULT_CHARS,
                                 fontSize = 15,
                                 color = "#007777",
                                 fade = "rgba(0, 0, 0, 0.05)",
                                 speed = 33,
                             }) {
    const { G } = useG(); // αν θες π.χ. G?.lang για κείμενο terminal
    const canvasRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let columns = 0;
        let drops = [];
        let raf = 0;
        let intervalId = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / fontSize);
            drops = Array.from({ length: columns }, () => 1);
        };

        const draw = () => {
            ctx.fillStyle = fade;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = color;
            ctx.font = `${fontSize}px arial`;

            const symbols = chars.split("");
            for (let i = 0; i < drops.length; i++) {
                const ch = symbols[Math.floor(Math.random() * symbols.length)];
                const y = drops[i] * fontSize;
                ctx.fillText(ch, i * fontSize, y);

                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        resize();
        window.addEventListener("resize", resize);
        intervalId = setInterval(draw, speed);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(raf);
        };
    }, [chars, fontSize, color, fade, speed]);

    // (προαιρετικό) typing effect στο terminal
    useEffect(() => {
        const el = textRef.current;
        if (!el) return;
        const full = "> welcome to the grid_";
        let i = 0;
        const id = setInterval(() => {
            el.textContent = full.slice(0, i++);
            if (i > full.length) clearInterval(id);
        }, 90);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <canvas id="bckgrnd" ref={canvasRef} />
            <section className="window">
                <main className="window-content">
                    <div className="window-cursor">
                        <span className="i-cursor-indicator">&gt;</span>
                        <span id="text" ref={textRef} className="terminal-text" />
                        <span className="i-cursor-underscore" />
                    </div>
                </main>
            </section>
            <div className="prompt-shortcut i-prompt hidden js-open" />
        </>
    );
}