/*
#name: GoogleAnalytics
#title: Google Analytics 4 Tracker
#description: Tracks page views and events using GA4, stores all events in localStorage for analytics and statistics
#author: Niki Mourtzi
#version: 2.0.0
#type: component
#library: analytics
#independent: true
#standalone: true
#compatible_areas: h, f
#dependencies: react
#apimethods:
#   GET /api/v1/maria/f?q=select val from gen_admin.globs where name='MEASUREMENT_ID'
#methods:
#   - getAnalyticsData(): Retrieves all stored GA events from localStorage
#   - getPageViewsStats(): Returns page view statistics (total views, per page, top pages)
#   - getDailyViews(): Returns daily view counts for the last 30 days
#   - getActiveUsers(): Returns number of unique active users (last 30 days)
#   - getAvgEngagementTime(): Returns average time spent on site
#   - clearAnalyticsData(): Clears all stored analytics data from localStorage
#   - debugAnalytics(): Logs debugging information about stored analytics data
*/
import { useEffect, useState } from 'react';

const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

const GoogleAnalytics = () => {
    const [measurementId, setMeasurementId] = useState(null);

    useEffect(() => {
        const fetchMeasurementId = async () => {
            try {
                const response = await fetch(`/api/v1/maria/f?q=select val from gen_admin.globs where name = 'MEASUREMENT_ID' `);
                const data = await response.json();
                if (data.success && data.data && data.data.val) {
                    setMeasurementId(data.data.val);
                    console.log('Measurement ID loaded:', data.data.val);
                }
            } catch (error) {
                console.error('Error fetching measurement ID:', error);
            }
        };
        fetchMeasurementId();
    }, []);

    useEffect(() => {
        if (!measurementId) return;

        // Load GA script
        if (!window.gtag) {
            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            script.async = true;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function() {
                window.dataLayer.push(arguments);

                // Store ALL events with FULL path info
                const eventData = {
                    type: arguments[0],
                    action: arguments[1],
                    data: arguments,
                    fullUrl: window.location.href,
                    pathname: window.location.pathname,  // THIS is what we need
                    hostname: window.location.hostname,
                    page_title: document.title,
                    timestamp: new Date().toISOString(),
                    measurementId: measurementId
                };

                const events = JSON.parse(localStorage.getItem('ga_events_all') || '[]');
                events.push(eventData);
                if (events.length > 5000) events.shift();
                localStorage.setItem('ga_events_all', JSON.stringify(events));
                console.log('Event stored:', eventData.type, eventData.pathname); // Debug

                // Trigger event for real-time updates
                window.dispatchEvent(new CustomEvent('ga-data-updated'));
            };

            window.gtag('js', new Date());
            window.gtag('config', measurementId);
        }

        // Track page views with FULL path
        const trackPageView = () => {
            if (window.gtag) {
                window.gtag('config', measurementId, {
                    page_path: window.location.pathname + window.location.search,
                    page_title: document.title,
                    page_location: window.location.href
                });
            }
        };

        // Monitor URL changes (pathname, not hostname)
        let lastPath = window.location.pathname;
        const observer = new MutationObserver(() => {
            if (window.location.pathname !== lastPath) {
                lastPath = window.location.pathname;
                console.log('Path changed to:', lastPath); // Debug
                setTimeout(trackPageView, 100);
            }
        });

        observer.observe(document, { subtree: true, childList: true });
        window.addEventListener('popstate', trackPageView);

        // Initial track
        trackPageView();

        return () => {
            observer.disconnect();
            window.removeEventListener('popstate', trackPageView);
        };
    }, [measurementId]);

    return null;
};

// Get ALL page views from ALL pages (full site)
export const getAnalyticsData = () => {
    const eventsRaw = localStorage.getItem('ga_events_all');
    if (!eventsRaw) return null;

    try {
        return JSON.parse(eventsRaw);
    } catch {
        return null;
    }
};

// Get page view statistics from entire site
export const getPageViewsStats = () => {
    const events = getAnalyticsData();
    if (!events) return { totalViews: 0, pageViews: {}, topPages: [] };

    const pageViews = {};

    events.forEach(event => {
        // Count page views (config or page_view events)
        if (event.type === 'config' || event.type === 'page_view') {
            // Use pathname (NOT hostname)
            let page = event.pathname || event.page || '/';

            // Remove trailing slash for consistency
            if (page !== '/' && page.endsWith('/')) {
                page = page.slice(0, -1);
            }

            // If empty, set to homepage
            if (!page || page === '') page = '/';

            pageViews[page] = (pageViews[page] || 0) + 1;
        }
    });

    const totalViews = Object.values(pageViews).reduce((a, b) => a + b, 0);
    const topPages = Object.entries(pageViews)
        .map(([page, views]) => ({
            page: page === '/' ? 'Homepage' : page,
            views
        }))
        .sort((a, b) => b.views - a.views);

    console.log('Page views stats:', { totalViews, topPagesCount: topPages.length });
    return { totalViews, pageViews, topPages };
};

// Get daily views from entire site
export const getDailyViews = () => {
    const events = getAnalyticsData();
    if (!events) return [];

    const dailyViews = {};

    events.forEach(event => {
        if (event.type === 'config' || event.type === 'page_view') {
            const date = new Date(event.timestamp).toISOString().split('T')[0];
            dailyViews[date] = (dailyViews[date] || 0) + 1;
        }
    });

    const result = Object.entries(dailyViews)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date));

    console.log('Daily views:', result.length, 'days');
    return result;
};

// Get active users (unique sessions based on path visits)
export const getActiveUsers = () => {
    const events = getAnalyticsData();
    if (!events) return 0;

    const uniqueSessions = new Set();
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    events.forEach(event => {
        const eventDate = new Date(event.timestamp);
        if (eventDate > last30Days && (event.type === 'config' || event.type === 'page_view')) {
            // Use date + pathname as simple session identifier
            const sessionKey = `${event.timestamp.split('T')[0]}_${event.pathname || event.page}`;
            uniqueSessions.add(sessionKey);
        }
    });

    return uniqueSessions.size;
};

// Get average engagement time
export const getAvgEngagementTime = () => {
    const events = getAnalyticsData();
    if (!events || events.length === 0) return '0m 0s';

    let totalTime = 0;
    let timeCount = 0;

    for (let i = 1; i < events.length; i++) {
        if ((events[i].type === 'config' || events[i].type === 'page_view') &&
            (events[i-1].type === 'config' || events[i-1].type === 'page_view')) {
            const timeDiff = new Date(events[i].timestamp) - new Date(events[i-1].timestamp);
            if (timeDiff > 0 && timeDiff < 3600000) { // Less than 1 hour
                totalTime += timeDiff;
                timeCount++;
            }
        }
    }

    const avgSeconds = Math.floor(totalTime / (timeCount || 1) / 1000);
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = avgSeconds % 60;

    return `${minutes}m ${seconds}s`;
};

// Clear all stored analytics data
export const clearAnalyticsData = () => {
    localStorage.removeItem('ga_events_all');
    console.log('Analytics data cleared');
    window.dispatchEvent(new CustomEvent('ga-data-updated'));
};

// Debug function to see what's stored
export const debugAnalytics = () => {
    const events = getAnalyticsData();
    if (!events) {
        console.log('No analytics data stored');
        return;
    }

    console.log('=== ANALYTICS DEBUG ===');
    console.log('Total events:', events.length);

    const paths = {};
    events.forEach(event => {
        if (event.type === 'config') {
            const path = event.pathname || event.page;
            paths[path] = (paths[path] || 0) + 1;
        }
    });

    console.log('Paths tracked:', paths);
    console.log('First event:', events[0]);
    console.log('Last event:', events[events.length - 1]);
};

export default GoogleAnalytics;