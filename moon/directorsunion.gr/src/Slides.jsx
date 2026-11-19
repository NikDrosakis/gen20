
import React, { useState, useEffect, useCallback } from 'react';
import './Slides.css';

const SLIDE_INTERVAL = 5000;

const Slides = ({ groupName = 'home' }) => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paused, setPaused] = useState(false);

    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    const fetchSlides = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const groupQuery =
                `SELECT id FROM ${publicdb}.c_slidergrp WHERE name = '${groupName.replace(/'/g, "''")}' LIMIT 1`;

            const groupResponse = await fetch(
                `/api/v1/maria/fa?q=${encodeURIComponent(groupQuery)}`
            );

            if (!groupResponse.ok) {
                throw new Error(`Group request failed: ${groupResponse.status}`);
            }

            const groupResult = await groupResponse.json();

            if (!groupResult.success || !groupResult.data?.length) {
                throw new Error(`No slideshow group found for: ${groupName}`);
            }

            const groupId = Number(groupResult.data[0].id);

            if (!Number.isSafeInteger(groupId) || groupId <= 0) {
                throw new Error('Invalid slideshow group ID');
            }

            const slidesQuery = `
                SELECT *
                FROM ${publicdb}.c_slides
                WHERE c_slidesgrpid = ${groupId}
                ORDER BY sort ASC, id ASC
            `;

            const slidesResponse = await fetch(
                `/api/v1/maria/fa?q=${encodeURIComponent(slidesQuery)}`
            );

            if (!slidesResponse.ok) {
                throw new Error(`Slides request failed: ${slidesResponse.status}`);
            }

            const slidesResult = await slidesResponse.json();

            if (!slidesResult.success || !Array.isArray(slidesResult.data)) {
                throw new Error('Unable to load slideshow images');
            }

            const images = slidesResult.data.filter(slide =>
                slide.name &&
                /\.(jpg|jpeg|png|gif|webp)$/i.test(slide.name)
            );

            setSlides(images);
            setCurrentIndex(0);

        } catch (err) {
            console.error('Error fetching slides:', err);
            setError(err.message);
            setSlides([]);
        } finally {
            setLoading(false);
        }
    }, [publicdb, groupName]);

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    // Move to next slide
    const nextSlide = useCallback(() => {
        setCurrentIndex(prev =>
            slides.length ? (prev + 1) % slides.length : 0
        );
    }, [slides.length]);

    // Move to previous slide
    const prevSlide = useCallback(() => {
        setCurrentIndex(prev =>
            slides.length ? (prev - 1 + slides.length) % slides.length : 0
        );
    }, [slides.length]);

    // Automatic slideshow
    useEffect(() => {
        if (loading || error || slides.length <= 1 || paused) return;

        const timer = window.setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, SLIDE_INTERVAL);

        return () => window.clearInterval(timer);
    }, [slides.length, loading, error, paused]);

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
    }, [nextSlide, prevSlide]);

    if (loading) {
        return (
            <div className="slides-loading">
                <div className="slides-spinner"></div>
                <p>Loading slideshow...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="slides-error">
                <p>⚠️ {error}</p>
                <button
                    onClick={fetchSlides}
                    className="slides-retry-btn"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!slides.length) {
        return (
            <div className="slides-empty">
                <p>No slides found</p>
            </div>
        );
    }

    const currentSlide = slides[currentIndex];

    return (
        <div
            className="slides-container"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setPaused(false);
                }
            }}
        >
            <div className="slides-viewer">

                <img
                    key={currentSlide.id}
                    src={`/media/${currentSlide.name}`}
                    alt={currentSlide.caption || `Slide ${currentIndex + 1}`}
                    className="slides-image"
                />

                {currentSlide.caption && (
                    <div className="slides-caption">
                        {currentSlide.caption}
                    </div>
                )}

                <div className="slides-controls">

                    <button
                        onClick={prevSlide}
                        className="slides-btn prev-btn"
                        aria-label="Previous slide"
                    >
                        ❮
                    </button>

                    <span className="slides-counter">
                        {currentIndex + 1} / {slides.length}
                    </span>

                    <button
                        onClick={nextSlide}
                        className="slides-btn next-btn"
                        aria-label="Next slide"
                    >
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
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/assets/image-placeholder.jpg';
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
