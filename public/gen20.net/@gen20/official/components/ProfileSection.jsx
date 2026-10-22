import React, { useEffect, useState } from "react";
import DB from "../contexts/DB";
import { useG } from "../contexts/GContext";
import { useLocation } from "react-router-dom";

const ProfileSection = () => {
    const { G } = useG();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const nameParam = params.get("name");
    console.log(nameParam);

    useEffect(() => {
        if (!nameParam) return;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const query = `SELECT * FROM gen_gen20net.user WHERE name = '${nameParam.replace(/'/g, "''")}'`;
                const data = await DB.maria("f", query);
                console.log(query);
                console.log(data);
                setProfile(data || null);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [nameParam]);

    if (loading) return <div style={{textAlign:"center", marginTop:"2rem"}}>Loading profile...</div>;
    if (!profile) return <div style={{textAlign:"center", marginTop:"2rem"}}>Profile not found</div>;

    return (
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
                backgroundImage: `url(/img/${profile.img || "/img/default-cover.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "top",
                position: "relative",
                filter: "brightness(0.75)"
            }}>
                {/* Overlay for text contrast */}
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
                        src={`/img/${profile.img || "default-avatar.png"}`}
                        alt={`${profile.fullname}'s avatar`}
                        style={{width: "100%", height: "100%", objectFit: "cover"}}
                    />

                </div>
            </div>

            {/* Info Section */}
            <div style={{
                padding: "80px 2rem 2rem 2rem",
                textAlign: "left"
            }}>
                <h1 style={{fontSize: "2.4rem", marginBottom: "0.2rem", fontWeight: "700"}}>
                    {profile.fullname}
                </h1>
                <p style={{color: "#666", fontStyle: "italic", marginBottom: "1rem"}}>
                    {profile.bio || "No bio yet."}
                </p>
                <p style={{fontWeight: "500", color: "#444", marginBottom: "1.5rem"}}>
                    📍 {profile.location || "Unknown location"}
                </p>

                {/* Buttons */}
                <div style={{display: "flex", gap: "1rem", marginBottom: "2rem"}}>
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
                    <div style={{textAlign: "center"}}>
                        <div style={{fontSize: "1.6rem", color: "#007bff"}}>{profile.followersCount || 0}</div>
                        <div style={{color: "#555", fontSize: "0.9rem"}}>Followers</div>
                    </div>
                    <div style={{textAlign: "center"}}>
                        <div style={{fontSize: "1.6rem", color: "#007bff"}}>{profile.followingCount || 0}</div>
                        <div style={{color: "#555", fontSize: "0.9rem"}}>Following</div>
                    </div>
                    <div style={{textAlign: "center"}}>
                        <div style={{fontSize: "1.6rem", color: "#007bff"}}>{profile.postsCount || 0}</div>
                        <div style={{color: "#555", fontSize: "0.9rem"}}>Posts</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfileSection;
