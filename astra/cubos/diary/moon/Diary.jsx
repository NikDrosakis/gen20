import React, { useState, useEffect, useRef } from 'react';
import "./Diary.css";

const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const todayLabel = () => {
    const d = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${days[d.getDay()]} ${dd}-${mm}-${d.getFullYear()}`;
};

export const Diary = () => {
    const [entries, setEntries] = useState([]);
    const [dates, setDates] = useState([]);
    const [activeDate, setActiveDate] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [pendingEntry, setPendingEntry] = useState(null);
    const inputRef = useRef(null);

    // Load today's entries on mount
    const loadTodayEntries = async () => {
        try {
            const res = await gs.api.db.fa(
                "SELECT * FROM c_diary WHERE DATE(created) = CURDATE() ORDER BY created ASC"
            );
            setEntries(res.data || []);
            if (res.data && res.data.length > 0) setIsEditing(false);
        } catch (err) {
            console.error('Error loading entries:', err);
        }
    };

    // Load distinct dates for the sidebar
    const loadDates = async () => {
        try {
            const res = await gs.api.admin.fa(
                "SELECT DISTINCT DATE(created) as entry_date FROM c_diary ORDER BY created DESC"
            );
            setDates(res.data || []);
        } catch (err) {
            console.error('Error fetching dates:', err);
        }
    };

    useEffect(() => {
        loadTodayEntries();
        loadDates();
    }, []);

    // Focus the pending input when it appears
    useEffect(() => {
        if (pendingEntry && inputRef.current) {
            inputRef.current.focus();
        }
    }, [pendingEntry]);

    const startDay = () => {
        setIsEditing(true);
        setPendingEntry({ time: formatTime(new Date()) });
    };

    const handlePendingKeyDown = async (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const description = e.target.value.trim();
        if (!description) return;

        const time = pendingEntry.time;
        const params = {
            time,
            description,
            created: new Date().toISOString(),
        };

        try {
            await gs.api.admin.inse('diary', params);
            // Append to visible entries
            setEntries((prev) => [...prev, params]);
            // Start a new pending entry with fresh time
            setPendingEntry({ time: formatTime(new Date()) });
            loadDates();
        } catch (err) {
            console.error('Error saving entry:', err);
        }
    };

    const handleDateClick = async (entryDate) => {
        setActiveDate(entryDate);
        setIsEditing(false);
        setPendingEntry(null);
        try {
            const res = await gs.api.db.fa(
                `SELECT * FROM c_diary WHERE DATE(created) = '${entryDate}' ORDER BY created ASC`
            );
            setEntries(res.data || []);
        } catch (err) {
            console.error('Error loading date entries:', err);
        }
    };

    return (
        <>
            <div className="diary-wrapper">
                <div className="diary-sidebar">
                    {dates.map((d) => (
                        <div
                            key={d.entry_date}
                            className={`date-entry ${activeDate === d.entry_date ? 'active' : ''}`}
                            onClick={() => handleDateClick(d.entry_date)}
                        >
                            {d.entry_date}
                        </div>
                    ))}
                </div>

                <div className="diary-container">
                    <h2>{todayLabel()}</h2>
                    <button onClick={startDay}>Act</button>

                    <div className="diary-list">
                        {entries.map((entry, i) => (
                            <div className="diary-entry-row" key={i}>
                                <div className="time">{entry.time}</div>
                                <div className="task-entry">{entry.description}</div>
                            </div>
                        ))}

                        {isEditing && pendingEntry && (
                            <div className="diary-entry-row">
                                <div className="time">{pendingEntry.time}</div>
                                <input
                                    ref={inputRef}
                                    className="task-entry"
                                    type="text"
                                    placeholder="Task description..."
                                    onKeyDown={handlePendingKeyDown}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
export default Diary;
