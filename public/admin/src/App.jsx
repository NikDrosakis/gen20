// App.jsx
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
import Doc from "./pages/Doc";
import { useG } from './contexts/GContext';
import SetupToolbox from './components/SetupToolbox';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const { G, loading: configLoading, error } = useG();
  const [showSetup, setShowSetup] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);

  // ✅ ΝΕΟ: 5 Δευτερόλεπτα καθυστέρηση για το SetupToolbox
  useEffect(() => {
    // Αν το config φορτώνει ακόμα ή έχει σφάλμα, περίμενε
    if (configLoading || error || !G || !G.set) return;

    // Αν το έχουμε ήδη ελέγξει, μην κάνεις τίποτα
    if (setupChecked) return;

    // Έλεγχος για null τιμές
    let missingValues = false;
    if (Array.isArray(G.set)) {
      missingValues = G.set.some(item => item?.val === null || item?.val === undefined);
    } else if (typeof G.set === 'object') {
      missingValues = Object.values(G.set).some(item => item?.val === null || item?.val === undefined);
    }

    setSetupChecked(true);

    if (missingValues) {
      // Αν λείπουν τιμές, περίμενε 5 δευτερόλεπτα (5000ms) και μετά δείξε το
      const timer = setTimeout(() => {
        setShowSetup(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [G, configLoading, error, setupChecked]);

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
    else if (path === '/admin/doc') {
      setCurrentPage('doc');
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

  const navigateTo = (page, id = null) => {
    switch(page) {
      case 'page-edit':
        window.location.href = `/admin/page?id=${id}`;
        break;
      case 'page-new':
        window.location.href = '/admin/page?new';
        break;
      case 'page-archive':
        window.location.href = '/admin/page';
        break;
      case 'user-edit':
        window.location.href = `/admin/user-edit?userId=${id}`;
        break;
      case 'user-new':
        window.location.href = '/admin/user-new';
        break;
      case 'users':
        window.location.href = '/admin/users';
        break;
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
      case 'doc':
        window.location.href = '/admin/doc';
        break;
      case 'home':
      default:
        window.location.href = '/admin';
        break;
    }
  };

  const renderPage = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    const isNew = searchParams.get('new') !== null;
    const userId = searchParams.get('userId');
    const path = window.location.pathname;

    if (path === '/admin/page') {
      if (id) {
        return <ContentOneAdmin navigateTo={navigateTo} contentId={id} isNew={false} />;
      } else if (isNew) {
        return <ContentOneAdmin navigateTo={navigateTo} isNew={true} />;
      } else {
        return <ContentArchiveAdmin navigateTo={navigateTo} />;
      }
    }

    if (path === '/admin/user-edit' && userId) {
      return <UserOneAdmin navigateTo={navigateTo} userId={userId} isNew={false} />;
    }
    if (path === '/admin/user-new') {
      return <UserOneAdmin navigateTo={navigateTo} isNew={true} />;
    }
    if (path === '/admin/users') {
      return <UserArchiveAdmin navigateTo={navigateTo} />;
    }

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
      case '/admin/doc':
        return <Doc navigateTo={navigateTo} />;
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
      <>
        <div className="admin-container">
          <header className="admin-header">
            <Navbar currentPage={currentPage} onNavigate={navigateTo} />
          </header>
          <div className="admin-content">
            {renderPage()}
          </div>
        </div>

        {/* Το Toolbox εμφανίζεται μετά από 5 δευτερόλεπτα (αν χρειάζεται) */}
        {showSetup && (
            <SetupToolbox
                onComplete={() => setShowSetup(false)}
            />
        )}
      </>
  );
};

export default App;