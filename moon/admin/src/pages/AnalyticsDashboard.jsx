// /pages/AnalyticsDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    getPageViewsStats,
    getDailyViews,
    getActiveUsers,
    getAvgEngagementTime
} from '../GoogleAnalytics';

import ClassificationModal from '../components/ClassificationModal';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalViews: 0,
        activeUsers: 0,
        avgEngagementTime: '0m 0s',
        totalPages: 0
    });

    const [topPages, setTopPages] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showClassificationModal, setShowClassificationModal] =
        useState(false);

    const loadAnalytics = useCallback(() => {
        try {
            const result = getPageViewsStats() || {};
            const pages = Array.isArray(result.topPages)
                ? result.topPages
                : [];

            const totalViews = Number(result.totalViews) || 0;
            const activeUsers = Number(getActiveUsers()) || 0;
            const avgTime = getAvgEngagementTime() || '0m 0s';
            const daily = getDailyViews() || [];

            setStats({
                totalViews,
                activeUsers,
                avgEngagementTime: avgTime,
                totalPages: pages.length
            });

            setTopPages(pages.slice(0, 10));
            setDailyData(
                Array.isArray(daily) ? daily.slice(-30) : []
            );

            setError(null);
        } catch (err) {
            console.error('Analytics loading error:', err);
            setError('Unable to load analytics data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnalytics();

        const handleUpdate = () => loadAnalytics();

        window.addEventListener('ga-data-updated', handleUpdate);
        window.addEventListener('ga-frontend-event', handleUpdate);

        const interval = setInterval(loadAnalytics, 30000);

        return () => {
            window.removeEventListener('ga-data-updated', handleUpdate);
            window.removeEventListener('ga-frontend-event', handleUpdate);
            clearInterval(interval);
        };
    }, [loadAnalytics]);

    const handleQuickAction = (actionName) => {
        if (window.trackEvent) {
            window.trackEvent(
                'click',
                'Button Click',
                `${actionName} clicked on Admin Panel`
            );
        }

        switch (actionName) {
            case 'Add Content':
                window.location.hash = 'add-content';
                break;

            case 'Add User':
                window.location.hash = 'add-user';
                break;

            case 'Media Toolbox':
                window.location.hash = 'media-toolbox';
                break;

            case 'Add Classification':
                setShowClassificationModal(true);
                break;

            default:
                break;
        }
    };

    const handleStatClick = (title, value) => {
        window.trackEvent?.(
            'click',
            'Statistics',
            `${title}: ${value} clicked`
        );
    };

    const statCards = [
        {
            title: 'Total Views',
            value: stats.totalViews,
            icon: '👁️',
            color: '#f59e0b'
        },
        {
            title: 'Active Users',
            value: stats.activeUsers,
            icon: '👥',
            color: '#3b82f6'
        },
        {
            title: 'Avg Engagement',
            value: stats.avgEngagementTime,
            icon: '⏱️',
            color: '#10b981'
        },
        {
            title: 'Total Pages',
            value: stats.totalPages,
            icon: '📄',
            color: '#8b5cf6'
        }
    ];

    const maxDailyViews = Math.max(
        1,
        ...dailyData.map(day => Number(day.views) || 0)
    );

    return (
        <div className="analytics-container">

            {/* HEADER */}
            {window.location.pathname.includes('/admin/analytics') && (
            <div className="analytics-header">
                <h1>Analytics</h1>
                <p>Website activity and performance</p>
            </div>
                 )}

            {/* LOADING / ERROR */}
            {loading && (
                <div className="analytics-message">
                    Loading analytics data...
                </div>
            )}

            {error && (
                <div className="analytics-message analytics-error">
                    {error}
                    <button type="button" onClick={loadAnalytics}>
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && stats.totalViews === 0 && (
                <div className="analytics-message">
                    No analytics data available yet.
                </div>
            )}

            {/* STAT CARDS */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="stat-card"
                        style={{ borderTopColor: stat.color }}
                        onClick={() =>
                            handleStatClick(stat.title, stat.value)
                        }
                    >
                        <div className="stat-icon">
                            {stat.icon}
                        </div>

                        <div className="stat-info">
                            <h3>{stat.title}</h3>

                            <p className="stat-value">
                                {typeof stat.value === 'number'
                                    ? stat.value.toLocaleString()
                                    : stat.value}
                            </p>

                            <span className="stat-change positive">
                                +0%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* RECENT ACTIVITY + QUICK ACTIONS */}
            <div className="content-grid">

                <div className="recent-activity">
                    <h2>Recent Activity</h2>

                    <div className="activity-list">

                        <div className="activity-item">
                            <div className="activity-icon">📊</div>
                            <div className="activity-details">
                                <div className="activity-title">
                                    Total views: {stats.totalViews.toLocaleString()}
                                </div>
                                <div className="activity-time">
                                    Active users: {stats.activeUsers}
                                </div>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-icon">⏱️</div>
                            <div className="activity-details">
                                <div className="activity-title">
                                    Average engagement time
                                </div>
                                <div className="activity-time">
                                    {stats.avgEngagementTime}
                                </div>
                            </div>
                        </div>

                        <div className="activity-item">
                            <div className="activity-icon">📄</div>
                            <div className="activity-details">
                                <div className="activity-title">
                                    Unique pages viewed
                                </div>
                                <div className="activity-time">
                                    {stats.totalPages} pages
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>

                    <div className="actions-grid">
                        <button
                            className="action-btn"
                            onClick={() => handleQuickAction('Add Content')}
                        >
                            📝 Add Content
                        </button>

                        <button
                            className="action-btn"
                            onClick={() => handleQuickAction('Add User')}
                        >
                            👥 Add User
                        </button>

                        <button
                            className="action-btn"
                            onClick={() => handleQuickAction('Media Toolbox')}
                        >
                            🖼️ Media Toolbox
                        </button>

                        <button
                            className="action-btn"
                            onClick={() => handleQuickAction('Add Classification')}
                        >
                            🏷️ New Classification
                        </button>
                    </div>
                </div>

            </div>

            {/* DAILY VIEWS */}
            <div className="analytics-section">
                <h2>📈 Daily Views (Last 30 Days)</h2>

                {dailyData.length > 0 ? (
                    <div className="chart-container">
                        <div className="bar-chart">

                            {dailyData.map((day, index) => {
                                const views = Number(day.views) || 0;
                                const height =
                                    (views / maxDailyViews) * 200;

                                const date = new Date(day.date);

                                return (
                                    <div
                                        key={`${day.date}-${index}`}
                                        className="bar-item"
                                    >
                                        <div
                                            className="bar"
                                            style={{ height: `${height}px` }}
                                            title={`${views} views`}
                                        >
                                            {views > 0 && (
                                                <span className="bar-value">
                                                    {views}
                                                </span>
                                            )}
                                        </div>

                                        <div className="bar-label">
                                            {date.getDate()}/{date.getMonth() + 1}
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    </div>
                ) : (
                    <p>No daily views recorded yet.</p>
                )}
            </div>

            {/* TOP PAGES */}
            <div className="analytics-section">
                <h2>📊 Top Pages</h2>

                {topPages.length > 0 ? (
                    <div className="table-container">
                        <table className="analytics-table">
                            <thead>
                            <tr>
                                <th>Page</th>
                                <th>Views</th>
                                <th>% of Total</th>
                            </tr>
                            </thead>

                            <tbody>
                            {topPages.map((page, index) => (
                                <tr key={`${page.page}-${index}`}>
                                    <td>
                                        {page.page === '/'
                                            ? '🏠 Homepage'
                                            : page.page}
                                    </td>

                                    <td>
                                        {(Number(page.views) || 0).toLocaleString()}
                                    </td>

                                    <td>
                                        {stats.totalViews > 0
                                            ? (
                                            (page.views / stats.totalViews) * 100
                                        ).toFixed(1) + '%'
                                            : '0%'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No page statistics available.</p>
                )}
            </div>

            <ClassificationModal
                isOpen={showClassificationModal}
                onClose={() => setShowClassificationModal(false)}
                onSave={() => setShowClassificationModal(false)}
            />

        </div>
    );
};

export default AnalyticsDashboard;
