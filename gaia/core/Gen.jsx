import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/apiv1'; // Ensure this aligns with your PHP API structure

const Gen = () => {
    useEffect(() => {
        // Example API call to check server status
        axios.get(`${API_BASE}/status`)
            .then(response => console.log('Server Status:', response.data))
            .catch(error => console.error('API Error:', error));
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};
const Home = () => <h1>Welcome to Gen20</h1>;
const About = () => <h1>About Gen20</h1>;
const NotFound = () => <h1>404 - Not Found</h1>;

export default Gen;
