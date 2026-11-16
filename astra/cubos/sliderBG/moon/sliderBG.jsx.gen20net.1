import { useEffect, useState } from 'react';
import './SliderBG.css';

export default function SliderBG({
                                     images = [],
                                     interval = 5000,
                                     overlay = 0.35,     // 0..1 σκούρο overlay για αναγνωσιμότητα κειμένου
                                     kenBurns = true,    // αργό zoom
                                     dots = false,       // δείκτες κάτω-δεξιά
                                 }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (images.length < 2) return;
        const id = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, interval);
        return () => clearInterval(id);
    }, [images.length, interval]);

    if (!images.length) return null;

    return (
        <div className={`bg-slider${kenBurns ? ' has-kenburns' : ''}`} aria-hidden="true">
            {images.map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt=""
                    className={`bg-slider__img ${i === current ? 'is-active' : ''}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    draggable="false"
                />
            ))}

            <div className="bg-slider__overlay" style={{ opacity: overlay }} />
            <div className="bg-slider__vignette" />

            {dots && (
                <div className="bg-slider__dots">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`bg-slider__dot ${i === current ? 'is-active' : ''}`}
                            onClick={() => setCurrent(i)}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}