// App.jsx - Χωρίς hash navigation, όλα path-based
import React, { useState, useEffect } from 'react';
import Navbar from "./components/NavAdmin";
import SlidesAdmin from "./components/SlidesAdmin";
import Home from "./pages/Home";
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserArchiveAdmin from "./pages/user/UserArchiveAdmin";
import UserOneAdmin from "./pages/user/UserOneAdmin";
import Classification from "./pages/Classification";
import Links from "./pages/Links";
import ContentArchiveAdmin from "./pages/content/ContentArchiveAdmin";
import ContentOneAdmin from "./pages/content/ContentOneAdmin";
import Monetize from "./pages/Monetize";
import Layout from "./pages/Layout";
import LangAdmin from "./pages/LangAdmin";
import SuperAdmin from "./pages/SuperAdmin";
import MemberFormAdmin from "./pages/MemberFormAdmin";
import Setup from "./pages/Setup";
import Media from "./pages/Media";

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    const isNew = searchParams.get('new') !== null;
    const userId = searchParams.get('userId');

    // Content management
    if (path === '/admin/page') {
      if (id) {
        setCurrentPage('page-edit');
      } else if (isNew) {
        setCurrentPage('page-new');
      } else {
        setCurrentPage('page-archive');
      }
    }
    // User management
    else if (path === '/admin/users') {
      setCurrentPage('users');
    }
    else if (path === '/admin/user-new') {
      setCurrentPage('user-new');
    }
    else if (path === '/admin/user-edit' && userId) {
      setEditId(userId);
      setCurrentPage('user-edit');
    }
    // Other pages
    else if (path === '/admin/analytics') {
      setCurrentPage('analytics');
    }
    else if (path === '/admin/classification') {
      setCurrentPage('classification');
    }
    else if (path === '/admin/layout') {
      setCurrentPage('layout');
    }
    else if (path === '/admin/monetize') {
      setCurrentPage('monetize');
    }
    else if (path === '/admin/setup') {
      setCurrentPage('setup');
    }
    else if (path === '/admin/languages') {
      setCurrentPage('languages');
    }
    else if (path === '/admin/media') {
      setCurrentPage('media');
    }
    else if (path === '/admin/slides') {
      setCurrentPage('slides');
    }
    else if (path === '/admin/links') {
      setCurrentPage('links');
    }
    else if (path === '/admin/members') {
      setCurrentPage('members');
    }
    else if (path === '/admin/superadmin') {
      setCurrentPage('superadmin');
    }
    else if (path === '/admin') {
      setCurrentPage('home');
    }
    else {
      setCurrentPage('home');
    }

    setLoading(false);
  }, [window.location.pathname, window.location.search]);

  // Handle navigation - all path-based
  const navigateTo = (page, id = null) => {
    console.log('Navigating to:', page, id);

    switch(page) {
        // Content management
      case 'page-edit':
        window.location.href = `/admin/page?id=${id}`;
        break;
      case 'page-new':
        window.location.href = '/admin/page?new';
        break;
      case 'page-archive':
        window.location.href = '/admin/page';
        break;

        // User management
      case 'user-edit':
        window.location.href = `/admin/user-edit?userId=${id}`;
        break;
      case 'user-new':
        window.location.href = '/admin/user-new';
        break;
      case 'users':
        window.location.href = '/admin/users';
        break;

        // Other pages
      case 'analytics':
        window.location.href = '/admin/analytics';
        break;
      case 'classification':
        window.location.href = '/admin/classification';
        break;
      case 'layout':
        window.location.href = '/admin/layout';
        break;
      case 'monetize':
        window.location.href = '/admin/monetize';
        break;
      case 'setup':
        window.location.href = '/admin/setup';
        break;
      case 'languages':
        window.location.href = '/admin/languages';
        break;
      case 'media':
        window.location.href = '/admin/media';
        break;
      case 'slides':
        window.location.href = '/admin/slides';
        break;
      case 'links':
        window.location.href = '/admin/links';
        break;
      case 'members':
        window.location.href = '/admin/members';
        break;
      case 'superadmin':
        window.location.href = '/admin/superadmin';
        break;
      case 'home':
      default:
        window.location.href = '/admin';
        break;
    }
  };

  // Render current page
  const renderPage = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    const isNew = searchParams.get('new') !== null;
    const userId = searchParams.get('userId');
    const path = window.location.pathname;

    // Content routes
    if (path === '/admin/page') {
      if (id) {
        return <ContentOneAdmin navigateTo={navigateTo} contentId={id} isNew={false} />;
      } else if (isNew) {
        return <ContentOneAdmin navigateTo={navigateTo} isNew={true} />;
      } else {
        return <ContentArchiveAdmin navigateTo={navigateTo} />;
      }
    }

    // User routes
    if (path === '/admin/user-edit' && userId) {
      return <UserOneAdmin navigateTo={navigateTo} userId={userId} isNew={false} />;
    }
    if (path === '/admin/user-new') {
      return <UserOneAdmin navigateTo={navigateTo} isNew={true} />;
    }
    if (path === '/admin/users') {
      return <UserArchiveAdmin navigateTo={navigateTo} />;
    }

    // Other routes based on path
    switch(path) {
      case '/admin/analytics':
        return <AnalyticsDashboard navigateTo={navigateTo} />;
      case '/admin/classification':
        return <Classification navigateTo={navigateTo} />;
      case '/admin/layout':
        return <Layout navigateTo={navigateTo} />;
      case '/admin/monetize':
        return <Monetize navigateTo={navigateTo} />;
      case '/admin/setup':
        return <Setup navigateTo={navigateTo} />;
      case '/admin/languages':
        return <LangAdmin navigateTo={navigateTo} />;
      case '/admin/media':
        return <Media navigateTo={navigateTo} />;
      case '/admin/slides':
        return <SlidesAdmin navigateTo={navigateTo} />;
      case '/admin/links':
        return <Links navigateTo={navigateTo} />;
      case '/admin/members':
        return <MemberFormAdmin navigateTo={navigateTo} />;
      case '/admin/superadmin':
        return <SuperAdmin navigateTo={navigateTo} />;
      case '/admin':
      default:
        return <Home />;
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
      <div className="admin-container">
        <header className="admin-header">
          <Navbar currentPage={currentPage} onNavigate={navigateTo} />
        </header>
        <div className="admin-content">
          {renderPage()}
        </div>
      </div>
  );
};

export default App;