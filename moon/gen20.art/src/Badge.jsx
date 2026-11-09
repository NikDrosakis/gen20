// Badge.jsx — public carousel cubo
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Badge.css';

/**
 * Props:
 *  - badges:   optional array [{ id, level, title, icon, description }]
 *  - endpoint: optional URL to fetch badges (e.g. /api/badges?domain=foo)
 *  - domain:   current domain (used when endpoint is a gen20 proxy)
 *  - autoPlay: milliseconds between slides (0 = off)
 */
export default function Badge({
                                  badges: initialBadges,
                                  endpoint,
                                  domain = '*',
                                  autoPlay = 0,
                              }) {
    const [badges, setBadges] = useState(initialBadges || []);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(!initialBadges && !!endpoint);

    useEffect(() => {
        if (initialBadges || !endpoint) return;
        let cancelled = false;
        setLoading(true);
        fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}domain=${encodeURIComponent(domain)}`)
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((data) => { if (!cancelled) setBadges(Array.isArray(data) ? data : []); })
            .catch(() => { if (!cancelled) setBadges([]); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [endpoint, domain, initialBadges]);

    const total = badges.length;

    const go = useCallback((dir) => {
        if (total === 0) return;
        setIndex((i) => (i + dir + total) % total);
    }, [total]);

    useEffect(() => {
        if (!autoPlay || total <= 1) return;
        const t = setInterval(() => go(1), autoPlay);
        return () => clearInterval(t);
    }, [autoPlay, total, go]);

    const trackStyle = useMemo(
        () => ({ transform: `translateX(-${index * 100}%)` }),
        [index],
    );

    if (loading) {
        return <div className="badge-cubo-container"><p style={{ padding: 20 }}>Φόρτωση…</p></div>;
    }
    if (total === 0) {
        return <div className="badge-cubo-container"><p style={{ padding: 20 }}>Δεν υπάρχουν badges.</p></div>;
    }

    return (
        <div className="badge-cubo-container">
            <div className="badge-cubo" style={trackStyle}>
                {badges.map((b) => (
                    <div className="badge-card" key={b.id ?? b.level}>
                        <div className="badge-icon">{b.icon || '🏆'}</div>
                        <h4>Level {b.level} - {b.title}</h4>
                        <p>{b.description}</p>
                    </div>
                ))}
            </div>

            {total > 1 && (
                <>
                    <div className="badge-nav nav-left"  onClick={() => go(-1)} aria-label="Previous">&#10094;</div>
                    <div className="badge-nav nav-right" onClick={() => go(1)}  aria-label="Next">&#10095;</div>
                    <div className="badge-dots">
                        {badges.map((b, i) => (
                            <span
                                key={b.id ?? b.level}
                                className={`badge-dot${i === index ? ' active' : ''}`}
                                onClick={() => setIndex(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}