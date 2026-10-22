import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const GContext = createContext({
    G: null,
    setG: () => {},
    lang: 'el',
    setLang: () => {}
});

export const useG = () => useContext(GContext);

export const GProvider = ({ children }) => {
    const baseURL = import.meta.env.VITE_HTTP_API;
    const [G, setG] = useState(null);
    const [lang, setLangState] = useState(Cookies.get('lang') || 'el');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const setLang = (newLang) => {
        localStorage.setItem('lang', newLang);
        setLangState(newLang);
    };

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const res = await fetch(`${baseURL}local/?lang=${lang}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const result = await res.json();
                if (!result?.data || typeof result.data !== 'object') {
                    throw new Error('Malformed response: missing data');
                }

                setG(result.data);
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
    }, [baseURL, lang]); // refresh when lang changes

    if (loading) return <div>Loading configuration...</div>;
    if (error) return <div>Error loading configuration: {error}</div>;

    return (
        <GContext.Provider value={{ G, setG, lang, setLang }}>
            {children}
        </GContext.Provider>
    );
};
