// pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TeamSection from "../components/TeamSection";
import Breadcrumb from "../components/Breadcrumb";

const Profile = () => {
    const [searchParams] = useSearchParams();
    const name = searchParams.get('name');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!name) {
                setError('No profile name provided');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/v1/maria/f?folder=select * from ${publicdb}.user where name='${name}' and status=1`);
                const data = await response.json();

                if (data.success && data.data) {
                    setProfile(data.data);
                } else {
                    setError('Profile not found');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [name, publicdb]);

    if (loading) {
        return <div className="loading-state">Loading profile...</div>;
    }

    if (error || !profile) {
        return <div className="error-state">{error || 'Profile not found'}</div>;
    }

    // Get the first user from data (if data is array)
    const user = profile.data || profile;

    return (
        <>
            <Breadcrumb path="profile" />

            <section style={{
                maxWidth: "900px",
                margin: "2rem auto",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                color: "#222",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 0 12px rgba(0,0,0,0.1)",
                overflow: "hidden"
            }}>
                {/* Cover photo */}
                <div style={{
                    height: "240px",
                    backgroundImage: `url(/media/${user.cover_img || "default-cover.jpg"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "top",
                    position: "relative",
                    filter: "brightness(0.75)"
                }}>
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.25)"
                    }}></div>

                    {/* Avatar */}
                    <div style={{
                        position: "absolute",
                        bottom: "-60px",
                        left: "2rem",
                        borderRadius: "50%",
                        border: "5px solid #fff",
                        width: "120px",
                        height: "120px",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        backgroundColor: "#eee"
                    }}>
                        <img
                            src={`/media/${user.img || "default-avatar.png"}`}
                            alt={`${user.fullname || user.name}'s avatar`}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                                e.target.src = "/assets/default-avatar.png";
                            }}
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div style={{
                    padding: "80px 2rem 2rem 2rem",
                    textAlign: "left"
                }}>
                    <h1 style={{ fontSize: "2.4rem", marginBottom: "0.2rem", fontWeight: "700" }}>
                        {user.fullname || user.name}
                    </h1>
                    <p style={{ color: "#666", fontStyle: "italic", marginBottom: "1rem" }}>
                        {user.bio || "No bio yet."}
                    </p>
                    <p style={{ fontWeight: "500", color: "#444", marginBottom: "1.5rem" }}>
                        📍 {user.location || "Unknown location"}
                    </p>

                    {/* Buttons */}
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                        <button style={{
                            padding: "0.7rem 1.6rem",
                            fontWeight: "600",
                            fontSize: "1rem",
                            color: "#fff",
                            backgroundColor: "#007bff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "background-color 0.25s"
                        }} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0056b3"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#007bff"}>
                            Follow
                        </button>

                        <button style={{
                            padding: "0.7rem 1.6rem",
                            fontWeight: "600",
                            fontSize: "1rem",
                            color: "#007bff",
                            backgroundColor: "transparent",
                            border: "2px solid #007bff",
                            borderRadius: "5px",
                            cursor: "pointer",
                            transition: "background-color 0.25s, color 0.25s"
                        }} onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = "#007bff";
                            e.currentTarget.style.color = "#fff";
                        }} onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#007bff";
                        }}>
                            Message
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-around",
                        borderTop: "1px solid #eee",
                        paddingTop: "1rem",
                        fontWeight: "600"
                    }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.6rem", color: "#007bff" }}>{user.followers_count || 0}</div>
                            <div style={{ color: "#555", fontSize: "0.9rem" }}>Followers</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.6rem", color: "#007bff" }}>{user.following_count || 0}</div>
                            <div style={{ color: "#555", fontSize: "0.9rem" }}>Following</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1.6rem", color: "#007bff" }}>{user.posts_count || 0}</div>
                            <div style={{ color: "#555", fontSize: "0.9rem" }}>Posts</div>
                        </div>
                    </div>
                </div>
            </section>

            <TeamSection />
        </>
    );
};

export default Profile;