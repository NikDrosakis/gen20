import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Dynamically import the App component for each cubo (can be a separate file for each cubo)
const Curriculum = React.lazy(() => import('./curriculum/src/index.jsx'));  // Path to your first cubo component

const App = () => {
    return (
        <Router>
            <React.Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/curriculum" element={<Curriculum />} />
                </Routes>
            </React.Suspense>
        </Router>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
