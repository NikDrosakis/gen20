import React, { useEffect, useState } from "react";
import VideoPlayer from '../modules/VideoPlayer';
import "./EventBoard.css"; // Import the CSS file

const EventBoard = ({ postgrpid, lang }) => {
    const [events, setEvents] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                // Using fetch API instead of DB import
                const response = await fetch(
                    `/api/v1/maria/fa?folder=select * from gen_gen20net.post WHERE postgrpid = ${postgrpid} ORDER BY id DESC`
                );
                const result = await response.json();
                setEvents(result.data || []);
            } catch (err) {
                console.error("Error fetching events:", err);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [postgrpid]);

    if (loading) return <div className="event-board-loading">Loading...</div>;
    if (events.length === 0) return <div className="event-board-empty">No events found.</div>;

    const activeEvent = events[activeIndex];

    return (
        <section className="event-board-section">
            <div className="event-board-container">
                <div className="event-board-main">
                    {/* Main Content Area (70%) */}
                    <div className="event-board-content">
                        {/* Main Image/Video */}
                        <div className="event-board-media">
                            {activeEvent.type === 'video' ? (
                                <VideoPlayer
                                    currentVideo={activeEvent.uri}
                                    currentPoster={activeEvent.img}
                                    autoPlay={true}
                                />
                            ) : (
                                <img
                                    src={`/media/${activeEvent.img}`}
                                    alt={activeEvent.title || "Event Image"}
                                    className="event-board-image"
                                />
                            )}
                        </div>

                        {/* Event Text */}
                        <div className="event-board-text">
                            <h2 className="event-board-title">
                                📢{" "}
                                <a
                                    href={activeEvent.uri}
                                    className="event-board-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {activeEvent.title}
                                </a>
                            </h2>
                            <p className="event-board-description">
                                {activeEvent.description}
                            </p>
                            <div
                                className="event-board-content-text"
                                dangerouslySetInnerHTML={{ __html: activeEvent[`content_${lang}`] }}
                            />
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
                                    <img
                                        src={`/media/${event.img}`}
                                        alt={event.title}
                                        className="event-board-thumbnail-image"
                                    />
                                    <div className="event-board-thumbnail-title">{event.title}</div>
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