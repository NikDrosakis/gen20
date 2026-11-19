// //Home.jsx
import React from 'react';
import Slides from './Slides';
import Hero from './Hero';
import Latest from './Latest';
import VideoPanel from './VideoPanel';
import { useTheme } from './ThemeContext';
import "./Home.css";
const Home = () => {
    const { theme } = useTheme();  

    return (
        <div className={`home-page ${theme}`}>
            <Latest/>
            <>
            <Slides groupName="home" />
            <VideoPanel />
            </>
        </div>
    );
};

export default Home;