import React, { useState, useEffect } from 'react';
const targetDatetime='2024-08-01';
const targetDate = new Date(targetDatetime); // Set your target date here
const calculateTimeRemaining = () => {
    const currentTime = new Date();
    const timeDifference = targetDate - currentTime;

    if (timeDifference <= 0) {
        // Target date has passed
        return { hours: 0, seconds: 0 };
    }

    // Calculate remaining hours and seconds
    const remainingHours = Math.floor(timeDifference / (1000 * 60 * 60));
    const remainingSeconds = Math.floor((timeDifference % (1000 * 60 * 60)) / 1000);

    return { hours: remainingHours, seconds: remainingSeconds };
};
const Timer = () => {
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

    useEffect(() => {
        const timerId = setInterval(() => {
            // Calculate updated time remaining
            setTimeRemaining(calculateTimeRemaining());
        }, 1000);

        // Cleanup function to clear interval
        return () => clearInterval(timerId);
    }, []); // Empty dependency array (effect runs once on mount)


const { hours = 0, seconds = 0 } = timeRemaining || {};

    return (
        <div>
            <h1>{hours} hours {seconds} seconds from {targetDatetime}</h1>
        </div>
    );
};

export default Timer;
