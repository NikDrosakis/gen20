// App.jsx
import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import Navbar from "./components/NavAdmin";
import { MessagingProvider, useMessaging } from './MessagingContext';
import { useG } from './GContext';
import { useManifest } from './ManifestContext';
import ChatBox from './ChatBox';
import ChatList from './ChatList';
import Cookies from 'js-cookie';

// Lazy registry: pages/*.jsx (+ SlidesAdmin που είναι στο components/)
const pages = import.meta.glob("./pages/*.jsx");
const REGISTRY = {};
for (const [path, loader] of Object.entries(pages)) {
    const name = path.split("/").pop().replace(/\.jsx$/, "");
    REGISTRY[name] = lazy(loader);
}
REGISTRY["SlidesAdmin"] = lazy(() => import("./components/SlidesAdmin"));

function MessagingDebug() {
    const { connection, messages, sendSystem } = useMessaging();
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

function AutoOpenChat({ userID, activeChats, setActiveChats, setIsChatOpen }) {
    const { messages } = useMessaging();

    useEffect(() => {
        if (messages.length === 0) return;

        const last = messages[messages.length - 1];

        // --- Case 1: insert/message → άνοιξε το chat ΑΜΕΣΩΣ (pop-up) ---
        if (last.type === "insert" || last.type === "message") {
            const sender = last.uid || last.userid;
            const isMine = sender === userID;
            let peer = null;
            if (last.cid) {
                const parts = last.cid.split("-");
                peer = parts.find((p) => p && p !== userID) || null;
            }
            if (!peer) peer = isMine ? last.to : sender;
            if (!peer || peer === userID) return;

            // Αν είναι ήδη ανοιχτό το ίδιο, μην το ξανανοίξεις
            if (activeChats.some((c) => c.userId === peer)) return;

            const cid = [userID, peer].sort().join("-");
            setActiveChats((prev) => [
                ...prev,
                { cid, userId: peer, userName: peer, status: "active" },
            ]);
            setIsChatOpen(true); // pop-up
            return;
        }

        // --- Case 2: reslist → άνοιξε το chat με τον πρώτο online peer ---
        if (last.type === "reslist") {
            try {
                const peers = JSON.parse(last.c || "[]");
                const peer = peers.find((p) => p && p !== userID);
                if (!peer) return;
                if (activeChats.some((c) => c.userId === peer)) return;

                const cid = [userID, peer].sort().join("-");
                setActiveChats((prev) => [
                    ...prev,
                    { cid, userId: peer, userName: peer, status: "active" },
                ]);
            } catch (err) {
                console.warn("[AutoOpenChat] bad reslist:", err);
            }
            return;
        }
    }, [messages, userID, activeChats, setActiveChats, setIsChatOpen]);

    return null;
}

const App = () => {
    // ✅ activeChats (array) αντί activeChat (single)
    const [activeChats, setActiveChats] = useState([]);
    const [currentPage, setCurrentPage] = useState('home');
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const { G, loading: configLoading, error } = useG();
    const { manifest } = useManifest();
    const [showSetup, setShowSetup] = useState(false);
    const [setupChecked, setSetupChecked] = useState(false);
// Στο component, μετά το activeChats:
    const [isChatOpen, setIsChatOpen] = useState(false);
    // ============================================================
    // userid από GENUID cookie + G.publicdb
    // ============================================================
    const genUid = Cookies.get('GENUID');
    const userID = useMemo(() => {
        if (!genUid) return "guest";
        const domain = window.location.host;
        return `${domain}:${genUid}`;
    }, [genUid]);

    // ✅ Προσθήκη νέου chat (αν δεν υπάρχει)
    const handleOpenChat = (session) => {
        setActiveChats((prev) => {
            if (prev.some((c) => c.cid === session.cid)) return prev;
            return [...prev, session];
        });
    };

    // ✅ Κλείσιμο συγκεκριμένου chat
    const handleCloseChat = (cid) => {
        setActiveChats((prev) => prev.filter((c) => c.cid !== cid));
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

        if (path === '/admin/content') {
            if (id) setCurrentPage('content-edit');
            else if (isNew) setCurrentPage('content-new');
            else setCurrentPage('content');
        }
        else if (path === '/admin/pages') setCurrentPage('pages');
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
        else if (path === '/admin/settings') setCurrentPage('settings');
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
            case 'content-edit': window.location.href = `/admin/content?id=${id}`; break;
            case 'content-new': window.location.href = '/admin/content?new'; break;
            case 'content': window.location.href = '/admin/content'; break;
            case 'user-edit': window.location.href = `/admin/user-edit?userId=${id}`; break;
            case 'user-new': window.location.href = '/admin/user-new'; break;
            case 'pages': window.location.href = '/admin/pages'; break;
            case 'users': window.location.href = '/admin/users'; break;
            case 'analytics': window.location.href = '/admin/analytics'; break;
            case 'classification': window.location.href = '/admin/classification'; break;
            case 'monetize': window.location.href = '/admin/monetize'; break;
            case 'settings': window.location.href = '/admin/settings'; break;
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

        // route key + props (routing logic) — manifest κάνει key → component
        let key;
        const props = { navigateTo };

        if (path === '/admin/content') {
            if (id) { key = 'contentOne'; props.contentId = id; props.isNew = false; }
            else if (isNew) { key = 'contentOne'; props.isNew = true; }
            else key = 'content';
        }
        else if (path === '/admin/user-edit' && userId) { key = 'userOne'; props.userId = userId; props.isNew = false; }
        else if (path === '/admin/user-new') { key = 'userOne'; props.isNew = true; }
        else {
            const map = {
                '/admin': 'home',
                '/admin/pages': 'pages',
                '/admin/users': 'users',
                '/admin/analytics': 'analytics',
                '/admin/doc': 'doc',
                '/admin/classification': 'classification',
                '/admin/monetize': 'monetize',
                '/admin/settings': 'settings',
                '/admin/languages': 'languages',
                '/admin/media': 'media',
                '/admin/slides': 'slides',
                '/admin/links': 'links',
                '/admin/members': 'members',
                '/admin/superadmin': 'superadmin',
            };
            key = map[path] || 'home';
        }

        const PAGES = manifest?.pages || {};
        const pageDef = PAGES[key] || PAGES.notFound;
        const Comp = pageDef ? REGISTRY[pageDef.page] : null;

        return Comp
            ? <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}><Comp {...props} /></Suspense>
            : <div style={{ padding: 24 }}>Page not found: {key}</div>;
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
                activeChats={activeChats}
                setActiveChats={setActiveChats}
                setIsChatOpen={setIsChatOpen}
            />
            {/* Floating button — ανοίγει το chat */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                        zIndex: 1000,
                        padding: '12px 20px',
                        borderRadius: 24,
                        border: 'none',
                        background: '#4a90e2',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                >
                    💬 Chat
                </button>
            )}

            {isChatOpen && (
            <div className="chat-widget">
                <ChatList
                    onOpenChat={handleOpenChat}
                    activeChat={activeChats[0]}
                    meUid={userID}
                />
                {activeChats.map((chat) => (
                    <ChatBox
                        key={chat.cid}
                        cid={chat.cid}
                        meUid={userID}
                        peerUid={chat.userId}
                        peerName={chat.userName}
                        onClose={() => handleCloseChat(chat.cid)}
                    />
                ))}
            </div>
            )}
        </MessagingProvider>
    );
};

export default App;
