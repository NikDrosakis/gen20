// components/content/ContentNavigation.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './ContentNavigation.css';

const ContentNavigation = ({ contentId, onNavigate }) => {
    const [prevId, setPrevId] = useState(null);
    const [nextId, setNextId] = useState(null);
    const [loading, setLoading] = useState(false);

    const publicdb =
        "gen_" + window.location.hostname.replace(/\./g, '');

    const normalizeId = (value) => {
        if (value === null || value === undefined) return null;
        return String(value);
    };

    const fetchFirstLast = async () => {
        const query = `
SELECT
(SELECT id FROM ${publicdb}.content ORDER BY id ASC LIMIT 1) AS firstId,
    (SELECT id FROM ${publicdb}.content ORDER BY id DESC LIMIT 1) AS lastId
    `;

        const response = await fetch(
            `/api/v1/maria/f?query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error(`Navigation API error: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error('Unable to retrieve navigation boundaries');
        }

        const row = Array.isArray(result.data)
            ? result.data[0]
            : result.data;

        return {
            firstId: normalizeId(row?.firstId),
            lastId: normalizeId(row?.lastId)
        };
    };

    const fetchAdjacent = async () => {
        if (!contentId) return;

        setLoading(true);

        try {
            const currentId = Number(contentId);

            if (!Number.isInteger(currentId) || currentId <= 0) {
                throw new Error('Invalid content ID');
            }

            const nextQuery = `
SELECT id
FROM ${publicdb}.content
WHERE id > ${currentId}
ORDER BY id ASC
LIMIT 1
    `;

            const prevQuery = `
SELECT id
FROM ${publicdb}.content
WHERE id < ${currentId}
ORDER BY id DESC
LIMIT 1
    `;

            const [nextResponse, prevResponse] = await Promise.all([
                fetch(`/api/v1/maria/f?query=${encodeURIComponent(nextQuery)}`),
                fetch(`/api/v1/maria/f?query=${encodeURIComponent(prevQuery)}`)
            ]);

            if (!nextResponse.ok || !prevResponse.ok) {
                throw new Error('Navigation request failed');
            }

            const [nextData, prevData] = await Promise.all([
                nextResponse.json(),
                prevResponse.json()
            ]);

            if (!nextData.success || !prevData.success) {
                throw new Error('Invalid navigation API response');
            }

            let newNextId = normalizeId(
                Array.isArray(nextData.data)
                    ? nextData.data[0]?.id
                    : nextData.data?.id
            );

            let newPrevId = normalizeId(
                Array.isArray(prevData.data)
                    ? prevData.data[0]?.id
                    : prevData.data?.id
            );

            // Circular navigation
            if (!newNextId || !newPrevId) {
                const { firstId, lastId } = await fetchFirstLast();

                if (!newNextId) newNextId = firstId;
                if (!newPrevId) newPrevId = lastId;
            }

            // Prevent self-navigation when only one content exists
            if (newNextId === normalizeId(contentId)) newNextId = null;
            if (newPrevId === normalizeId(contentId)) newPrevId = null;

            setNextId(newNextId);
            setPrevId(newPrevId);

            console.log('Content Navigation:', {
                current: contentId,
                previous: newPrevId,
                next: newNextId
            });

        } catch (error) {
            console.error('Content navigation error:', error);
            setPrevId(null);
            setNextId(null);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = useCallback((event) => {
        // Don't navigate while typing or editing
        const tag = event.target?.tagName?.toLowerCase();

        if (
            tag === 'input' ||
            tag === 'textarea' ||
            tag === 'select' ||
            event.target?.isContentEditable
        ) {
            return;
        }

        if (event.key === 'ArrowLeft' && prevId) {
            event.preventDefault();
            onNavigate?.(prevId);
        }

        if (event.key === 'ArrowRight' && nextId) {
            event.preventDefault();
            onNavigate?.(nextId);
        }
    }, [prevId, nextId, onNavigate]);

    useEffect(() => {
        fetchAdjacent();
    }, [contentId]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);

        return () => {
            window.removeEventListener('keydown', handleKey);
        };
    }, [handleKey]);

    if (!contentId || (!prevId && !nextId && !loading)) {
        return null;
    }

    return (
        <div className="content-navigation">

            <button
                type="button"
                className="nav-arrow nav-arrow-left"
                onClick={() => prevId && onNavigate?.(prevId)}
                disabled={!prevId || loading}
                title="Previous content (←)"
                aria-label="Previous content"
            >
                <svg
                    className="arrow-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M15 18l-6-6 6-6" />
                </svg>
                <span className="nav-tooltip">Previous</span>
            </button>

            <button
                type="button"
                className="nav-arrow nav-arrow-right"
                onClick={() => nextId && onNavigate?.(nextId)}
                disabled={!nextId || loading}
                title="Next content (→)"
                aria-label="Next content"
            >
                <svg
                    className="arrow-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
                <span className="nav-tooltip">Next</span>
            </button>

        </div>
    );
};

export default ContentNavigation;