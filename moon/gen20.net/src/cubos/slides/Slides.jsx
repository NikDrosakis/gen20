// Slides.jsx
import React, { useState, useEffect } from 'react';
import './Slides.css';

const Slides = ({ groupName = 'home' }) => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
    const hostname = window.location.hostname;

    useEffect(() => {
        fetchSlides();
    }, [groupName]);

    const fetchSlides = async () => {
        setLoading(true);
        try {
            // First, get the group ID by name
            const groupQuery = `SELECT id FROM ${publicdb}.c_slidergrp WHERE name = '${groupName}' LIMIT 1`;
            const groupResponse = await fetch(`/api/v1/maria/fa?q=${encodeURIComponent(groupQuery)}`);
            const groupResult = await groupResponse.json();

            if (!groupResult.success || !groupResult.data || groupResult.data.length === 0) {
                setError(`No slideshow group found for: ${groupName}`);
                setSlides([]);
                return;
            }

            const groupId = groupResult.data[0].id;

            // Then, get slides for that group
            const slidesQuery = `SELECT * FROM ${publicdb}.c_slides WHERE c_slidesgrpid = ${groupId} ORDER BY sort ASC`;
            const slidesResponse = await fetch(`/api/v1/maria/fa?q=${encodeURIComponent(slidesQuery)}`);
            const slidesResult = await slidesResponse.json();

            if (slidesResult.success && slidesResult.data) {
                // Filter only image files (by extension)
                const images = slidesResult.data.filter(slide =>
                    slide.name && /\.(jpg|jpeg|png|gif|webp)$/i.test(slide.name)
                );
                setSlides(images);
                setCurrentIndex(0);
            } else {
                setSlides([]);
            }
        } catch (err) {
            console.error('Error fetching slides:', err);
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [slides.length]);

    if (loading) return (
        <div className="slides-loading">
            <div className="slides-spinner"></div>
            <p>Loading slideshow...</p>
        </div>
    );

    if (error) return (
        <div className="slides-error">
            <p>⚠️ {error}</p>
            <button onClick={fetchSlides} className="slides-retry-btn">Retry</button>
        </div>
    );

    if (slides.length === 0) return (
        <div className="slides-empty">
            <p>📷 No slides found</p>
        </div>
    );

    return (
        <div className="slides-container">
            <div className="slides-viewer">
                <img
                    src={`/media/${slides[currentIndex].name}`}
                    alt={slides[currentIndex].caption || `Slide ${currentIndex + 1}`}
                    className="slides-image"
                />

                {slides[currentIndex].caption && (
                    <div className="slides-caption">
                        {slides[currentIndex].caption}
                    </div>
                )}

                <div className="slides-controls">
                    <button onClick={prevSlide} className="slides-btn prev-btn">
                        ❮
                    </button>
                    <span className="slides-counter">
                        {currentIndex + 1} / {slides.length}
                    </span>
                    <button onClick={nextSlide} className="slides-btn next-btn">
                        ❯
                    </button>
                </div>
            </div>

            <div className="slides-thumbnails">
                {slides.map((slide, idx) => (
                    <div
                        key={slide.id}
                        className={`slides-thumbnail-wrapper ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    >
                        <img
                            src={`/media/${slide.name}`}
                            alt={`Thumbnail ${idx + 1}`}
                            className="slides-thumbnail"
                            onError={(e) => {
                                e.target.src = '/assets/image-placeholder.jpg';
                            }}
                        />
                        {slide.caption && (
                            <span className="slides-thumbnail-caption">
                                {slide.caption.substring(0, 20)}
                                {slide.caption.length > 20 ? '...' : ''}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Slides;