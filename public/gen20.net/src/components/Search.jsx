// components/Search.jsx
import { useState, useEffect } from "react";

export default function Search({ onSearch, initialValue = "" }) {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // Debounce search to avoid too many updates
        const timer = setTimeout(() => {
            if (onSearch) {
                onSearch(searchTerm);
            }
            setIsTyping(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    const handleClear = () => {
        setSearchTerm("");
        if (onSearch) {
            onSearch("");
        }
    };

    return (
        <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsTyping(true);
                }}
                className="search-input"
            />
            {searchTerm && (
                <button className="clear-search" onClick={handleClear}>
                    ✕
                </button>
            )}
            {isTyping && (
                <span className="search-typing-indicator">...</span>
            )}
        </div>
    );
}