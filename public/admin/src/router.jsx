import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Cookies from 'js-cookie';
import App from './App';

function ProtectedRoute({ children }) {
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const uid = Cookies.get('GENUID');
        const name = Cookies.get('GENNAME');
        const role = Cookies.get('GENROLE');

        const allowed =
            Boolean(uid && name) &&
            (role === 'admin' || role === '1');

        setAuthorized(allowed);
        setChecking(false);

        if (!allowed) {
            window.location.href = '/login';
        }
    }, []);

    if (checking) {
        return <div className="admin-loading">Loading Admin...</div>;
    }

    return authorized ? children : null;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <App />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
