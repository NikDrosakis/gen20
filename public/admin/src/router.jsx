// router.jsx - COMPLETE WORKING VERSION
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Cookies from 'js-cookie';

const Loading = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
    }}>
        Loading Admin...
    </div>
);

const ProtectedRoute = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const genUid = Cookies.get('GENUID');
        const genName = Cookies.get('GENNAME');
        const genRole = Cookies.get('GENROLE');

        console.log('Admin Auth Check:', { genUid, genName, genRole }); // Debug

        if (genUid && genName && (genRole === 'admin' || genRole === '1')) {
            setIsAuthorized(true);
        } else {
            // Use window.location for cross-app navigation
            window.location.href = '/login';
            setIsAuthorized(false);
        }
    }, []);

    if (isAuthorized === null) {
        return <Loading />;
    }

    return isAuthorized ? children : null;
};

// CRITICAL: No basename here because Vite base handles it
const AppRouter = () => {
    return (
        <BrowserRouter>
            <React.Suspense fallback={<Loading />}>
                <Routes>
                    {/* Use "/*" to match all routes under /admin */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <App />
                            </ProtectedRoute>
                        }
                    />
                    {/* Fallback redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </React.Suspense>
        </BrowserRouter>
    );
};

export default AppRouter;