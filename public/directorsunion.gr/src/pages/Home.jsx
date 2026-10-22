// /pages/Home.jsx
import React from 'react';
import Slides from '../components/Slides';
import Hero from '../components/Hero';
import Latest from '../components/Latest';
import VideoPanel from '../components/VideoPanel';
import { useTheme } from '../contexts/ThemeContext';
import "./Home.css";
const Home = () => {
    const { theme } = useTheme();  

    return (
        <div className={`home-page ${theme}`}>
            <Slides groupName="home" />
            <Latest/>
            <VideoPanel />
            <Hero />
        </div>
    );
};

export default Home;