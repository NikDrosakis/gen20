
import React, { useEffect, useState } from "react";
import VideoPlayer from './VideoPlayer';
import "./EventBoard.css";

const EventBoard = ({ classificationid = 100, lang = "el" }) => {
    const [events, setEvents] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchEvents = async () => {
            try {
                setLoading(true);
                setActiveIndex(0);

                const id = Number(classificationid);

                if (!Number.isInteger(id) || id <= 0) {
                    setEvents([]);
                    return;
                }

                const query = `
                    SELECT *
                    FROM gen_gen20net.content
                    WHERE classificationid = ${id}
                    ORDER BY sort ASC, id DESC
                `;

                const response = await fetch(
                    `/api/v1/maria/fa?key=${encodeURIComponent(query)}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();
                setEvents(result.data || []);

            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error fetching events:", err);
                    setEvents([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchEvents();

        return () => controller.abort();
    }, [classificationid]);

    if (loading) {
        return <div className="event-board-loading">Loading...</div>;
    }

    if (events.length === 0) {
        return <div className="event-board-empty">No events found.</div>;
    }

    const activeEvent = events[activeIndex] || events[0];

    return (
        <section className="event-board-section">
            <div className="event-board-container">
                <div className="event-board-main">

                    {/* Main Content Area (70%) */}
                    <div className="event-board-content">

                        {/* Main Image/Video */}
                        <div className="event-board-media">
                            {activeEvent.type === 'video' && activeEvent.url ? (
                                <VideoPlayer
                                    currentVideo={activeEvent.url}
                                    currentPoster={activeEvent.img ? `/media/${activeEvent.img}` : null}
                                    autoPlay={true}
                                />
                            ) : activeEvent.img ? (
                                <img
                                    src={`/media/${activeEvent.img}`}
                                    alt={activeEvent.title || "Event Image"}
                                    className="event-board-image"
                                />
                            ) : (
                                <div className="event-board-no-media">
                                    <span>GEN20</span>
                                    <span>{activeEvent.title}</span>
                                </div>
                            )}
                        </div>

                        {/* Event Text */}
                        <div className="event-board-text">
                            <h2 className="event-board-title">
                                {activeEvent.url ? (
                                    <a
                                        href={activeEvent.url}
                                        className="event-board-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {activeEvent.title}
                                    </a>
                                ) : (
                                    activeEvent.title
                                )}
                            </h2>

                            {(activeEvent.subtitle || activeEvent.excerpt) && (
                                <p className="event-board-description">
                                    {activeEvent.subtitle || activeEvent.excerpt}
                                </p>
                            )}

                            <div className="event-board-content-text">
                                {activeEvent.description || ""}
                            </div>
                        </div>
                    </div>

                    {/* Thumbnails Area (30%) */}
                    <div className="event-board-thumbnails">
                        <div className="event-board-thumbnails-list">
                            {events.map((event, index) => (
                                <button
                                    type="button"
                                    key={event.id}
                                    onClick={() => setActiveIndex(index)}
                                    className={`event-board-thumbnail ${
                                        index === activeIndex ? 'active' : ''
                                    }`}
                                >
                                    {event.img ? (
                                        <img
                                            src={`/media/${event.img}`}
                                            alt={event.title}
                                            className="event-board-thumbnail-image"
                                        />
                                    ) : (
                                        <div className="event-board-thumbnail-placeholder">
                                            GEN20
                                        </div>
                                    )}

                                    <div className="event-board-thumbnail-title">
                                        {event.title}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default EventBoard;
