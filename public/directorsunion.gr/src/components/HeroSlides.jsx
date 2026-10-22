// /components/Slides.jsx
import { useState, useEffect } from 'react';
import './HeroSlides.css';

const HeroSlides = () => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSlides();
    }, []);

    // Auto-play slides
    useEffect(() => {
        if (slides.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 8000); // 8 δευτερόλεπτα για να προλάβει να ολοκληρωθεί το zoom

        return () => clearInterval(interval);
    }, [slides.length]);

    const fetchSlides = async () => {
        try {
            const response = await fetch(
                '/api/v1/local/getMedia?folder=/var/www/gs/media/directorsunion.gr/slides&limit=100'
            );
            const data = await response.json();

            if (data.success && data.data && data.data.files) {
                const images = data.data.files.filter(file =>
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
                );
                setSlides(images);
            } else {
                setError('Failed to load slides');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="slides-loading">
            <div className="slides-spinner"></div>
        </div>
    );

    if (error) return (
        <div className="slides-error">
            <p>⚠️ {error}</p>
        </div>
    );

    if (slides.length === 0) return (
        <div className="slides-empty">
            <img src="/bg.jpg" alt="Default cover" className="cover-image" />
        </div>
    );

    return (
        <div className="hero-slideshow">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`slide ${index === currentIndex ? 'active' : ''}`}
                >
                    <div
                        className="slide-zoom"
                        style={{
                            backgroundImage: `url(https://directorsunion.gr/media/slides/${slide})`
                        }}
                    ></div>
                    <div className="slide-overlay"></div>
                </div>
            ))}

            {/* Dots indicator */}
            <div className="slide-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlides;