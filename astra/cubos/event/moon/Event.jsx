import { useState } from "react";
import EventBoard from "./EventBoard";
import EventBooking from "./EventBooking";
import "./Event.css";

export const Event = ({ classificationid = 100, lang = "el" }) => {
    const [showBooking, setShowBooking] = useState(false);

    return (
        <div className="event-cubo">
            <EventBoard classificationid={classificationid} lang={lang} />

            <div className="event-booking-cta">
                {showBooking ? (
                    <EventBooking
                        classificationid={classificationid}
                        lang={lang}
                        onClose={() => setShowBooking(false)}
                    />
                ) : (
                    <button
                        type="button"
                        className="event-booking-open"
                        onClick={() => setShowBooking(true)}
                    >
                        🎟️ Κράτηση εισιτηρίων
                    </button>
                )}
            </div>
        </div>
    );
};

export default Event;
