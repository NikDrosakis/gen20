import React, { useState, useEffect, useRef } from 'react';

const styles = `
.diary-wrapper {
    display: flex;
}

.diary-sidebar {
    width: 200px;
    padding: 10px;
    border-right: 1px solid #ddd;
    height: 100vh;
    overflow-y: auto;
    background-color: #f4f4f4;
    box-sizing: border-box;
}

.diary-sidebar .date-entry {
    padding: 10px;
    cursor: pointer;
    text-align: center;
    border-radius: 4px;
}

.diary-sidebar .date-entry:hover {
    background-color: #e0e0e0;
}

.diary-sidebar .date-entry.active {
    background-color: #4CAF50;
    color: white;
}

.diary-container {
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 70%;
    margin: 20px;
    box-sizing: border-box;
}

.diary-container h2 {
    float: left;
    margin: 0 0 10px 0;
}

.diary-container button {
    padding: 12px 24px;
    cursor: pointer;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    margin-bottom: 20px;
    width: 100%;
    transition: background-color 0.3s;
    clear: both;
    margin-top: 40px;
}

.diary-container button:hover {
    background-color: #45a049;
}

.diary-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    clear: both;
}

.diary-entry-row {
    display: flex;
    margin-bottom: 10px;
    align-items: center;
}

.diary-entry-row .time {
    width: 80px;
    text-align: center;
    padding-right: 10px;
    font-weight: bold;
    font-size: 16px;
    color: #333;
}

.diary-entry-row .task-entry {
    flex-grow: 1;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-left: 10px;
    box-sizing: border-box;
}

.diary-entry-row input.task-entry {
    font-size: 16px;
    outline: none;
}

.diary-entry-row input.task-entry:focus {
    border-color: #4CAF50;
}
`;

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
            <style>{styles}</style>
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
