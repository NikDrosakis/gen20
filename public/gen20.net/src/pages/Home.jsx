// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import TeamSection from "../components/TeamSection";
import EventBoard from "../components/EventBoard";

const Home = ({ path, lang }) => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                // Fetch blocks from content table (type='block')
                const response = await fetch(`/api/v1/maria/fa?folder=select * from ${publicdb}.content where type='post' order by sort desc`);
                const data = await response.json();

                if (data.success && data.data) {
                    setBlocks(data.data);
                }
            } catch (error) {
                console.error('Error fetching blocks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlocks();
    }, [publicdb]);

    if (loading) {
        return <div className="loading-state">Loading...</div>;
    }

    return (
        <>
            <EventBoard postgrpid={30} lang={lang} />
            <TeamSection path={path} lang={lang} />
        </>
    );
};

export default Home;