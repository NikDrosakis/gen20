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
    const NODE_ENV = import.meta.env.VITE_HTTP_API;
    const [G, setG] = useState(null);
    const [lang, setLangState] = useState(Cookies.get('lang') || 'el');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const setLang = (newLang) => {
        Cookies.set('lang', newLang);
        setLangState(newLang);
    };

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Check if G is already available from server (injected script)
            if (typeof window !== "undefined" && window.G) {
                setG(window.G);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${baseURL}local?lang=en`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const result = await res.json();
                console.log(result.data);

                if (!result?.data || typeof result.data !== 'object') {
                    throw new Error('Malformed response: missing data');
                }

                setG(result.data);
                if (NODE_ENV === 'development') {
                    console.log('Loaded G config from fetch:', result.data);
                }
            } catch (err) {
                console.error('Failed to load setup data:', err);
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, [baseURL, lang]);


    if (loading) return <div>Loading configuration...</div>;
    if (error) return <div>Error loading configuration: {error}</div>;

    return (
        <GContext.Provider value={{ G, setG, lang, setLang }}>
            {children}
        </GContext.Provider>
    );
};
