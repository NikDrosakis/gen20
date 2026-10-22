import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the context with default value
const GContext = createContext({ G: null, setG: () => {} });

// 2. Custom hook for consuming the context
export const useG = () => useContext(GContext);

// 3. Provider Component
export const GProvider = ({ children }) => {
    const baseURL = process.env.REACT_APP_HTTP_API;
    const [G, setG] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const res = await fetch(`${baseURL}local`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const result = await res.json();  // ✅ parse JSON first

                if (!result?.data || typeof result.data !== 'object') {
                    throw new Error('Malformed response: missing data');
                }

                setG(result.data); // ✅ setG with data only
                if (process.env.NODE_ENV === 'development') {
                    console.log('Loaded G config:', result.data);
                }
            } catch (err) {
                console.error('Failed to load setup data:', err);
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [baseURL]);


    if (loading) return <div>Loading configuration...</div>;
    if (error) return <div>Error loading configuration: {error}</div>;

    return (
        <GContext.Provider value={{ G, setG }}>
            {children}
        </GContext.Provider>
    );
};
