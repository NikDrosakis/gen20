// /pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { getPageViewsStats, getActiveUsers, getAvgEngagementTime, getDailyViews } from '../utils/GoogleAnalytics';
import './Home.css';

const Home = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalPages: 0,
        totalViews: 0,
        activeUsers: 0,
        avgEngagementTime: '0m 0s'
    });
    const [pageStats, setPageStats] = useState([]);
    const [dailyStats, setDailyStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAnalyticsData();

        // Real-time listener για νέα events
        const handleGaEvent = () => {
            loadAnalyticsData();
        };

        window.addEventListener('ga-data-updated', handleGaEvent);
        window.addEventListener('ga-frontend-event', handleGaEvent);

        // Refresh every 30 seconds
        const interval = setInterval(loadAnalyticsData, 30000);

        return () => {
            window.removeEventListener('ga-data-updated', handleGaEvent);
            window.removeEventListener('ga-frontend-event', handleGaEvent);
            clearInterval(interval);
        };
    }, []);

    const loadAnalyticsData = () => {
        console.log('Loading analytics data...');

        // Get data from GoogleAnalytics helper functions
        const { totalViews, topPages: pages } = getPageViewsStats();
        const activeUsers = getActiveUsers();
        const avgTime = getAvgEngagementTime();
        const dailyData = getDailyViews();

        console.log('Analytics data:', { totalViews, pages, activeUsers, avgTime, dailyData });

        if (totalViews === 0 && pages.length === 0) {
            setLoading(true);
            setError('No analytics data available yet. Waiting for user interactions...');
            return;
        }

        // Calculate total pages (unique URLs)
        const totalPages = pages.length;

        // Get top 10 pages for display
        const top10Pages = pages.slice(0, 10);

        // Get last 30 days for chart
        const last30Days = dailyData.slice(-30);

        setPageStats(top10Pages);
        setDailyStats(last30Days);
        setStats({
            totalUsers: 0, // This would come from your API
            totalPosts: 0, // This would come from your API
            totalPages: totalPages,
            totalViews: totalViews,
            activeUsers: activeUsers,
            avgEngagementTime: avgTime
        });
        setLoading(false);
        setError(null);
    };

    const handleQuickAction = (actionName) => {
        // Track event if trackEvent is available
        if (window.trackEvent) {
            window.trackEvent('click', 'Button Click', `${actionName} clicked on Admin Panel`);
        }

        switch(actionName) {
            case 'Create Post':
                window.location.href = '#create-post';
                break;
            case 'Add User':
                window.location.href = '#add-user';
                break;
            case 'Upload Media':
                window.location.href = '#upload-media';
                break;
            case 'Settings':
                window.location.href = '#settings';
                break;
            default:
                break;
        }
    };

    const handleStatClick = (statTitle, statValue) => {
        if (window.trackEvent) {
            window.trackEvent('click', 'Statistics', `${statTitle}: ${statValue} clicked`);
        }
    };

    const statCards = [
        { title: 'Total Views', value: stats.totalViews, icon: '👁️', change: '+0%', color: '#f59e0b' },
        { title: 'Active Users', value: stats.activeUsers, icon: '👥', change: '+0%', color: '#3b82f6' },
        { title: 'Avg Engagement', value: stats.avgEngagementTime, icon: '⏱️', change: '+0%', color: '#10b981' },
        { title: 'Total Pages', value: stats.totalPages, icon: '📄', change: '+0%', color: '#8b5cf6' }
    ];

    // Find max views for chart scaling
    const maxDailyViews = dailyStats.length > 0
        ? Math.max(...dailyStats.map(d => d.views), 1)
        : 1;

    if (loading) {
        return (
            <div className="home-dashboard">
                <div style={{
                    padding: "24px",
                    maxWidth: "1400px",
                    margin: "0px auto",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "20px", color: "#666" }}>Loading analytics data...</div>
                    <div style={{ fontSize: "14px", color: "#999", marginTop: "10px" }}>
                        Waiting for Google Analytics to collect data...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-dashboard">
                <div style={{
                    padding: "24px",
                    maxWidth: "1400px",
                    margin: "0px auto",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "20px", color: "#dc3545" }}>⚠️ {error}</div>
                    <button
                        onClick={() => loadAnalyticsData()}
                        style={{
                            marginTop: "16px",
                            padding: "8px 16px",
                            background: "#667eea",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer"
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="home-dashboard">
            <div style={{
                padding: "24px",
                maxWidth: "1400px",
                margin: "0px auto"
            }}>
                <h1 style={{
                    margin: "0px 0px 8px",
                    fontSize: "28px",
                    color: "rgb(26, 32, 44)"
                }}>Analytics Dashboard</h1>
                <p>Real-time statistics from your website</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="stat-card"
                        style={{borderTopColor: stat.color}}
                        onClick={() => handleStatClick(stat.title, stat.value)}
                    >
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <h3>{stat.title}</h3>
                            <p className="stat-value">
                                {typeof stat.value === 'number'
                                    ? stat.value.toLocaleString()
                                    : stat.value}
                            </p>
                            <span className="stat-change positive">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Views Chart */}
            {dailyStats.length > 0 && (
                <div style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "24px",
                    margin: "0 24px 24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    <h3 style={{ marginBottom: "20px" }}>📈 Daily Views (Last 30 Days)</h3>
                    <div style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "4px",
                        minHeight: "250px",
                        padding: "20px 0"
                    }}>
                        {dailyStats.map((day, idx) => {
                            const height = (day.views / maxDailyViews) * 200;
                            return (
                                <div key={idx} style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "8px"
                                }}>
                                    <div style={{
                                        width: "100%",
                                        height: `${height}px`,
                                        background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                                        borderRadius: "4px 4px 0 0",
                                        position: "relative",
                                        cursor: "pointer",
                                        transition: "height 0.3s"
                                    }}>
                                        {day.views > 0 && (
                                            <span style={{
                                                position: "absolute",
                                                top: "-20px",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                fontSize: "10px",
                                                color: "#4a5568"
                                            }}>
                                                {day.views}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: "10px",
                                        color: "#718096",
                                        transform: "rotate(-45deg)",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {new Date(day.date).getDate()}/{new Date(day.date).getMonth() + 1}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Top Pages Table */}
            {pageStats.length > 0 && (
                <div style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "24px",
                    margin: "0 24px 24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    <h3 style={{ marginBottom: "20px" }}>📊 Top Pages</h3>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}>
                            <thead>
                            <tr style={{
                                borderBottom: "2px solid #e2e8f0"
                            }}>
                                <th style={{
                                    textAlign: "left",
                                    padding: "12px",
                                    color: "#4a5568",
                                    fontWeight: "600"
                                }}>Page</th>
                                <th style={{
                                    textAlign: "right",
                                    padding: "12px",
                                    color: "#4a5568",
                                    fontWeight: "600"
                                }}>Views</th>
                                <th style={{
                                    textAlign: "right",
                                    padding: "12px",
                                    color: "#4a5568",
                                    fontWeight: "600"
                                }}>% of Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pageStats.map((page, idx) => (
                                <tr key={idx} style={{
                                    borderBottom: "1px solid #e2e8f0",
                                    transition: "background 0.2s"
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f7fafc"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                                    <td style={{
                                        padding: "12px",
                                        color: "#2d3748"
                                    }}>
                                        {page.page === '/' ? '🏠 Homepage' : page.page}
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "right",
                                        fontWeight: "500",
                                        color: "#2d3748"
                                    }}>
                                        {page.views.toLocaleString()}
                                    </td>
                                    <td style={{
                                        padding: "12px",
                                        textAlign: "right",
                                        color: "#718096"
                                    }}>
                                        {((page.views / stats.totalViews) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
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
                        <button className="action-btn" onClick={() => handleQuickAction('Create Post')}>
                            📝 Create Post
                        </button>
                        <button className="action-btn" onClick={() => handleQuickAction('Add User')}>
                            👥 Add User
                        </button>
                        <button className="action-btn" onClick={() => handleQuickAction('Upload Media')}>
                            🖼️ Upload Media
                        </button>
                        <button className="action-btn" onClick={() => handleQuickAction('Settings')}>
                            ⚙️ Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;