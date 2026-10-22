// pages/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getPageViewsStats, getDailyViews, getActiveUsers, getAvgEngagementTime } from '../utils/GoogleAnalytics';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalViews: 0,
        uniqueUsers: 0,
        avgEngagementTime: '0m 0s',
        totalPages: 0
    });
    const [topPages, setTopPages] = useState([]);
    const [dailyData, setDailyData] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAnalytics = () => {
        const { totalViews, topPages: pages } = getPageViewsStats();
        const daily = getDailyViews();
        const activeUsers = getActiveUsers();
        const avgTime = getAvgEngagementTime();

        setStats({
            totalViews: totalViews,
            uniqueUsers: activeUsers,
            avgEngagementTime: avgTime,
            totalPages: pages.length
        });

        setTopPages(pages.slice(0, 10)); // Top 10 pages
        setDailyData(daily.slice(-30)); // Last 30 days
        setLoading(false);
    };

    useEffect(() => {
        loadAnalytics();

        // Listen for real-time updates
        const handleUpdate = () => {
            loadAnalytics();
        };

        window.addEventListener('ga-data-updated', handleUpdate);

        // Refresh every 30 seconds
        const interval = setInterval(loadAnalytics, 30000);

        return () => {
            window.removeEventListener('ga-data-updated', handleUpdate);
            clearInterval(interval);
        };
    }, []);

    if (loading) {
        return (
            <div className="analytics-container">
                <div className="loading">Loading analytics data...</div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h1>Analytics Dashboard</h1>
                <p>Real-time statistics from your website</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-info">
                        <h3>Total Views</h3>
                        <p className="stat-value">{stats.totalViews.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                        <h3>Active Users</h3>
                        <p className="stat-value">{stats.uniqueUsers.toLocaleString()}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-info">
                        <h3>Avg Engagement</h3>
                        <p className="stat-value">{stats.avgEngagementTime}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-info">
                        <h3>Total Pages</h3>
                        <p className="stat-value">{stats.totalPages.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Top Pages Table */}
            <div className="analytics-section">
                <h2>📊 Top Pages</h2>
                <div className="table-container">
                    <table className="analytics-table">
                        <thead>
                        <tr>
                            <th>Page Title</th>
                            <th>Views</th>
                            <th>% of Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topPages.map((page, idx) => (
                            <tr key={idx}>
                                <td>{page.page === '/' ? 'Homepage' : page.page}</td>
                                <td>{page.views.toLocaleString()}</td>
                                <td>{((page.views / stats.totalViews) * 100).toFixed(2)}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Daily Views Chart (Simple) */}
            <div className="analytics-section">
                <h2>📈 Daily Views (Last 30 Days)</h2>
                <div className="chart-container">
                    <div className="bar-chart">
                        {dailyData.map((day, idx) => {
                            const height = (day.views / Math.max(...dailyData.map(d => d.views))) * 200;
                            return (
                                <div key={idx} className="bar-item">
                                    <div className="bar" style={{ height: `${height}px` }}>
                                        <span className="bar-value">{day.views}</span>
                                    </div>
                                    <div className="bar-label">{new Date(day.date).getDate()}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;