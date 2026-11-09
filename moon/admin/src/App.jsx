// App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from "./components/NavAdmin";
import SlidesAdmin from "./components/SlidesAdmin";
import Home from "./pages/Home";
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import UserArchiveAdmin from "./pages/UserArchiveAdmin";
import UserOneAdmin from "./pages/UserOneAdmin";
import Classification from "./pages/Classification";
import Links from "./pages/Links";
import ContentArchiveAdmin from "./pages/ContentArchiveAdmin";
import ContentOneAdmin from "./pages/ContentOneAdmin";
import Monetize from "./pages/Monetize";
import LangAdmin from "./pages/LangAdmin";
import SuperAdmin from "./pages/SuperAdmin";
import { MessagingProvider, useMessaging } from './MessagingContext';
import MemberFormAdmin from "./pages/MemberFormAdmin";
import Settings from "./pages/Settings";
import Media from "./pages/Media";
import Doc from "./pages/Doc";
import { useG } from './GContext';
import ChatBox from './ChatBox';
import ChatList from './ChatList';
import Cookies from 'js-cookie';

function MessagingDebug() {
    const { connection, messages, sendSystem,sendGetConversations, getConversations  } = useMessaging();
    return (
        <div style={{
            position: "fixed", bottom: 0, left: 0,
            background: "#000", color: "#0f0",
            padding: 8, fontSize: 12, zIndex: 9999,
            fontFamily: "monospace",
        }}>
            <div>WS: {connection} · msgs: {messages.length}</div>
            <button onClick={() => sendSystem("hello from admin")}>
                Send test
            </button>
            {messages.slice(-3).map((m, i) => (
                <div key={i}>{m.system}: {m.verba}</div>
            ))}
        </div>
    );
}

function AutoOpenChat({ userID, activeChat, setActiveChat }) {
    const { messages } = useMessaging();

    useEffect(() => {
        if (messages.length === 0) return;

        const last = messages[messages.length - 1];
        console.log("[AutoOpenChat] last:", last.type, last);

        // --- Case 1: insert → άνοιξε το chat με τον peer ---
        if (last.type === "insert" || last.type === "message") {
            if (last.system !== "chat") return;
            if (last.to !== userID) return;

            const peer = last.userid;
            if (!peer || peer === userID) return;
            if (activeChat?.userId === peer) return;

            const cid = [userID, peer].sort().join("-");
            console.log("[AutoOpenChat] OPEN from insert:", { cid, peer });
            setActiveChat({ cid, userId: peer, userName: peer, status: "active" });
            return;
        }

        // --- Case 2: reslist → άνοιξε το chat με τον πρώτο online peer ---
        if (last.type === "reslist" && last.system === "chat") {
            try {
                const peers = JSON.parse(last.c || last.verba || "[]");
                console.log("[AutoOpenChat] reslist peers:", peers);

                const peer = peers.find((p) => p && p !== userID);
                if (!peer) {
                    console.log("[AutoOpenChat] no peer (only me)");
                    return;
                }
                if (activeChat?.userId === peer) {
                    console.log("[AutoOpenChat] already open:", peer);
                    return;
                }

                const cid = [userID, peer].sort().join("-");
                console.log("[AutoOpenChat] OPEN from reslist:", { cid, peer });
                setActiveChat({ cid, userId: peer, userName: peer, status: "active" });
            } catch (err) {
                console.warn("[AutoOpenChat] bad reslist:", err);
            }
            return;
        }
    }, [messages, userID, activeChat, setActiveChat]);

    return null;
}

const App = () => {
    // Μετά το useState(activeChat)
    const [activeChat, setActiveChat] = useState(null);
    const [currentPage, setCurrentPage] = useState('home');
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const { G, loading: configLoading, error } = useG();
    const [showSetup, setShowSetup] = useState(false);
    const [setupChecked, setSetupChecked] = useState(false);

    // ============================================================
    // userid από GENUID cookie + G.publicdb
    // ============================================================
    const genUid = Cookies.get('GENUID');
    const userID = useMemo(() => {
        if (!genUid) return "guest";
        const domain = window.location.host;  // "gen20.net" ή "nikimourtzi.com"
        return `${domain}:${genUid}`;          // "gen20.net:38"
    }, [genUid]);

    const handleOpenChat = (session) => {
        setActiveChat(session);
    };

    // Setup check
    useEffect(() => {
        if (configLoading || error || !G || !G.set) return;
        if (setupChecked) return;

        let missingValues = false;
        if (Array.isArray(G.set)) {
            missingValues = G.set.some(item => item?.val === null || item?.val === undefined);
        } else if (typeof G.set === 'object') {
            missingValues = Object.values(G.set).some(item => item?.val === null || item?.val === undefined);
        }

        setSetupChecked(true);

        if (missingValues) {
            const timer = setTimeout(() => setShowSetup(true), 5000);
            return () => clearTimeout(timer);
        }
    }, [G, configLoading, error, setupChecked]);

    // Routing
    useEffect(() => {
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('id');
        const isNew = searchParams.get('new') !== null;
        const userId = searchParams.get('userId');

        if (path === '/admin/page') {
            if (id) setCurrentPage('page-edit');
            else if (isNew) setCurrentPage('page-new');
            else setCurrentPage('page-archive');
        }
        else if (path === '/admin/users') setCurrentPage('users');
        else if (path === '/admin/user-new') setCurrentPage('user-new');
        else if (path === '/admin/user-edit' && userId) {
            setEditId(userId);
            setCurrentPage('user-edit');
        }
        else if (path === '/admin/analytics') setCurrentPage('analytics');
        else if (path === '/admin/doc') setCurrentPage('doc');
        else if (path === '/admin/classification') setCurrentPage('classification');
        else if (path === '/admin/monetize') setCurrentPage('monetize');
        else if (path === '/admin/setup') setCurrentPage('setup');
        else if (path === '/admin/languages') setCurrentPage('languages');
        else if (path === '/admin/media') setCurrentPage('media');
        else if (path === '/admin/slides') setCurrentPage('slides');
        else if (path === '/admin/links') setCurrentPage('links');
        else if (path === '/admin/members') setCurrentPage('members');
        else if (path === '/admin/superadmin') setCurrentPage('superadmin');
        else setCurrentPage('home');

        setLoading(false);
    }, [window.location.pathname, window.location.search]);

    const navigateTo = (page, id = null) => {
        switch(page) {
            case 'page-edit': window.location.href = `/admin/page?id=${id}`; break;
            case 'page-new': window.location.href = '/admin/page?new'; break;
            case 'page-archive': window.location.href = '/admin/page'; break;
            case 'user-edit': window.location.href = `/admin/user-edit?userId=${id}`; break;
            case 'user-new': window.location.href = '/admin/user-new'; break;
            case 'users': window.location.href = '/admin/users'; break;
            case 'analytics': window.location.href = '/admin/analytics'; break;
            case 'classification': window.location.href = '/admin/classification'; break;
            case 'monetize': window.location.href = '/admin/monetize'; break;
            case 'setup': window.location.href = '/admin/setup'; break;
            case 'languages': window.location.href = '/admin/languages'; break;
            case 'media': window.location.href = '/admin/media'; break;
            case 'slides': window.location.href = '/admin/slides'; break;
            case 'links': window.location.href = '/admin/links'; break;
            case 'members': window.location.href = '/admin/members'; break;
            case 'superadmin': window.location.href = '/admin/superadmin'; break;
            case 'doc': window.location.href = '/admin/doc'; break;
            case 'home':
            default: window.location.href = '/admin'; break;
        }
    };

    const renderPage = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('id');
        const isNew = searchParams.get('new') !== null;
        const userId = searchParams.get('userId');
        const path = window.location.pathname;

        if (path === '/admin/page') {
            if (id) return <ContentOneAdmin navigateTo={navigateTo} contentId={id} isNew={false} />;
            else if (isNew) return <ContentOneAdmin navigateTo={navigateTo} isNew={true} />;
            else return <ContentArchiveAdmin navigateTo={navigateTo} />;
        }

        if (path === '/admin/user-edit' && userId) return <UserOneAdmin navigateTo={navigateTo} userId={userId} isNew={false} />;
        if (path === '/admin/user-new') return <UserOneAdmin navigateTo={navigateTo} isNew={true} />;
        if (path === '/admin/users') return <UserArchiveAdmin navigateTo={navigateTo} />;

        switch(path) {
            case '/admin/analytics': return <AnalyticsDashboard navigateTo={navigateTo} />;
            case '/admin/classification': return <Classification navigateTo={navigateTo} />;
            case '/admin/monetize': return <Monetize navigateTo={navigateTo} />;
            case '/admin/setup': return <Settings navigateTo={navigateTo} />;
            case '/admin/languages': return <LangAdmin navigateTo={navigateTo} />;
            case '/admin/media': return <Media navigateTo={navigateTo} />;
            case '/admin/slides': return <SlidesAdmin navigateTo={navigateTo} />;
            case '/admin/links': return <Links navigateTo={navigateTo} />;
            case '/admin/doc': return <Doc navigateTo={navigateTo} />;
            case '/admin/members': return <MemberFormAdmin navigateTo={navigateTo} />;
            case '/admin/superadmin': return <SuperAdmin navigateTo={navigateTo} />;
            case '/admin':
            default: return <Home navigateTo={navigateTo} />;
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
    }

    return (
        <MessagingProvider userID={userID} domains={["gen20.net"]}>
            <div className="admin-container">
                <header className="admin-header">
                    <Navbar currentPage={currentPage} onNavigate={navigateTo} />
                </header>
                <div className="admin-content">
                    {renderPage()}
                </div>
            </div>

            <AutoOpenChat
                userID={userID}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
            />

            <div className="chat-widget">
                <ChatList
                    onOpenChat={handleOpenChat}
                    activeChat={activeChat}
                    meUid={userID}
                />
                {activeChat && (
                    <ChatBox
                        cid={activeChat.cid}
                        meUid={userID}
                        peerUid={activeChat.userId}
                        peerName={activeChat.userName}
                    />
                )}
            </div>


        </MessagingProvider>
    );
};

export default App;
