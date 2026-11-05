// /pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsDashboard from './AnalyticsDashboard';
import ContentArchiveAdmin from './ContentArchiveAdmin';
import './Home.css';

const Home = ({ navigateTo: navigateToProp }) => {
        const navigate = useNavigate();

        // Αν δεν έρχεται από τον γονέα, φτιάξε τοπική συνάρτηση
        const navigateTo = navigateToProp || ((path, id) => {
            // π.χ. 'page-new' → '/admin/page/new'
            // 'page-edit' + id → '/admin/page?id=5'
            if (path === 'page-new') navigate('/admin/page/new');
            else if (path === 'page-edit' && id) navigate(`/admin/page?id=${id}`);
            else navigate(`/admin/${path}`);
        });
    return (
        <div className="home-dashboard home-split-layout">
            {/* RIGHT: CONTENT MANAGER */}
            <main className="home-column home-analytics-column">
                <ContentArchiveAdmin
                    navigateTo={navigateTo}
                />
            </main>
            {/* LEFT: ANALYTICS */}
            <aside className="home-column home-manager-column">
                <AnalyticsDashboard />
            </aside>

        </div>
    );
};

export default Home;
