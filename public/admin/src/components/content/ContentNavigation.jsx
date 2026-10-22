/*
#name: ContentNavigation
#title: Content Navigation Arrows Component
#description: Provides previous/next navigation arrows for content items (posts/pages) with circular navigation. Supports keyboard arrows (← →) for navigation. Fetches adjacent content IDs from the database.
#author: Niki Mourtzi
#version: 1.0.0
#type: component
#library: navigation
#independent: true
#standalone: true
#compatible_areas: m
#dependencies: react
#props:
#   - contentId: Current content ID for navigation context
#   - onNavigate: Callback function with next/prev content ID
#apimethods:
#   GET /api/v1/maria/f?query=SELECT id FROM gen_*.content WHERE id > ${contentId} ORDER BY id ASC LIMIT 1
#   GET /api/v1/maria/f?query=SELECT id FROM gen_*.content WHERE id < ${contentId} ORDER BY id DESC LIMIT 1
#   GET /api/v1/maria/f?query=SELECT id FROM gen_*.content ORDER BY id ASC LIMIT 1
#   GET /api/v1/maria/f?query=SELECT id FROM gen_*.content ORDER BY id DESC LIMIT 1
#methods:
#   - fetchNav(): Fetches next and previous content IDs with circular navigation fallback
#   - handleKey(): Keyboard event handler for arrow keys
#keyboard_shortcuts:
#   - ArrowLeft: Navigate to previous content
#   - ArrowRight: Navigate to next content
*/
import React, { useState, useEffect } from 'react';
import './ContentNavigation.css';

const ContentNavigation = ({ contentId, onNavigate }) => {
    const [prevId, setPrevId] = useState(null);
    const [nextId, setNextId] = useState(null);
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        if (!contentId) return;
console.log('running content navigation')
        const fetchNav = async () => {
            try {
                // Επόμενο (μεγαλύτερο id)
                const nextRes = await fetch(`/api/v1/maria/f?query=SELECT id FROM ${publicdb}.content WHERE id > ${contentId} ORDER BY id ASC LIMIT 1`);
                const nextData = await nextRes.json();
                if (nextData.success && nextData.data?.length) {
                    setNextId(nextData.data[0].id);
                } else {
                    const firstRes = await fetch(`/api/v1/maria/f?query=SELECT id FROM ${publicdb}.content ORDER BY id ASC LIMIT 1`);
                    const firstData = await firstRes.json();
                    if (firstData.success && firstData.data?.length) {
                        setNextId(firstData.data[0].id);
                    }
                }

                // Προηγούμενο (μικρότερο id)
                const prevRes = await fetch(`/api/v1/maria/f?query=SELECT id FROM ${publicdb}.content WHERE id < ${contentId} ORDER BY id DESC LIMIT 1`);
                const prevData = await prevRes.json();
                if (prevData.success && prevData.data?.length) {
                    setPrevId(prevData.data[0].id);
                } else {
                    const lastRes = await fetch(`/api/v1/maria/f?query=SELECT id FROM ${publicdb}.content ORDER BY id DESC LIMIT 1`);
                    const lastData = await lastRes.json();
                    if (lastData.success && lastData.data?.length) {
                        setPrevId(lastData.data[0].id);
                    }
                }
            } catch (err) {
                console.error('Navigation error:', err);
            }
        };

        fetchNav();
    }, [contentId]);

    // Keyboard arrows
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft' && prevId) onNavigate(prevId);
            if (e.key === 'ArrowRight' && nextId) onNavigate(nextId);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [prevId, nextId, onNavigate]);

    if (!prevId && !nextId) return null;

    return (
        <>
            {prevId && (
                <button
                    className="nav-arrow nav-arrow-left"
                    onClick={() => onNavigate(prevId)}
                    title="Previous"
                >
                    <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span className="nav-tooltip">Previous</span>
                </button>
            )}
            {nextId && (
                <button
                    className="nav-arrow nav-arrow-right"
                    onClick={() => onNavigate(nextId)}
                    title="Next"
                >
                    <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                    <span className="nav-tooltip">Next</span>
                </button>
            )}
        </>
    );
};

export default ContentNavigation;