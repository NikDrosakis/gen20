// components/TeamSection.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from 'js-cookie';
import "./TeamSection.css"; // Import the CSS file

const TeamSection = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const lang = Cookies.get('lang') || 'el';

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
                const response = await fetch(`/api/v1/maria/fa?folder=select fullname, title, img, name from ${publicdb}.user`);
                const data = await response.json();
                setGroups(data.success && data.data ? data.data : []);
            } catch (err) {
                console.error("Error fetching team:", err);
                setGroups([]);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    if (loading) {
        return <div className="team-loading-state">Loading team...</div>;
    }

    if (groups.length === 0) {
        return null;
    }

    return (
        <section className="team-section set-bg" style={{ backgroundImage: `url("/media/team-bg.jpg")` }}>
            <div className="team-container">
                <div className="team-row">
                    <div className="team-col-full">
                        <div className="team-title-wrapper">
                            <h2 className="team-title">{lang === 'el' ? 'Η Ομάδα' : 'The Team'}</h2>
                        </div>
                    </div>
                </div>
                <div className="team-grid">
                    {groups.map((member, index) => (
                        <div className="team-col" key={member.name || index}>
                            <div
                                className={`team-member ${
                                    index % 3 === 1 ? "team-member--second" :
                                        index % 3 === 2 ? "team-member--third" : ""
                                } set-bg`}
                                style={{ backgroundImage: `url(/media/${member.img || "default-user.jpg"})` }}
                            >
                                <div className="team-member-overlay">
                                    <h4 className="team-member-name">{member.fullname}</h4>
                                    <p className="team-member-title">{member.title}</p>
                                    <Link
                                        to={`/profile?name=${encodeURIComponent(member.name)}`}
                                        className="team-member-profile-btn"
                                    >
                                        {lang === 'el' ? 'Προφίλ' : 'Profile'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {groups.length > 0 && (
                    <div className="team-footer">
                        <div className="team-footer-col">
                            <div className="team-footer-btn-wrapper">
                                <Link to="/profile" className="team-footer-btn">
                                    {lang === 'el' ? 'Περισσότερα' : 'More'}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TeamSection;