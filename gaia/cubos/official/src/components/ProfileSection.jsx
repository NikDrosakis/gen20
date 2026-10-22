import React, { useEffect, useState } from "react";
import DB from "../contexts/DB";
import { useG } from "../contexts/GContext";

const ProfileSection = ({ userId, lang }) => {
    const { G } = useG();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // Παίρνουμε profile data από το API με το userId
                const data = await DB.fetchPost(`/users/${userId}`, "profile");
                setProfile(data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) return <div>Loading profile...</div>;
    if (!profile) return <div>Profile not found</div>;

    return (
        <section className="profile-section container">
            {/* Cover Photo */}
            <div className="profile-cover" style={{ backgroundImage: `url(${profile.coverPhoto || "/img/default-cover.jpg"})` }}>
                <div className="profile-avatar-wrapper">
                    <img
                        className="profile-avatar"
                        src={profile.avatar || "/img/default-avatar.png"}
                        alt={`${profile.name}'s avatar`}
                    />
                </div>
            </div>

            {/* Basic Info */}
            <div className="profile-info">
                <h2 className="profile-name">{profile.name}</h2>
                <p className="profile-bio">{profile.bio || "No bio yet."}</p>
                <div className="profile-location">{profile.location}</div>

                {/* Buttons */}
                <div className="profile-actions">
                    <button className="btn btn-primary">Follow</button>
                    <button className="btn btn-secondary">Message</button>
                </div>
            </div>

            {/* Stats */}
            <div className="profile-stats">
                <div>
                    <strong>{profile.followersCount || 0}</strong>
                    <span>Followers</span>
                </div>
                <div>
                    <strong>{profile.followingCount || 0}</strong>
                    <span>Following</span>
                </div>
                <div>
                    <strong>{profile.postsCount || 0}</strong>
                    <span>Posts</span>
                </div>
            </div>
        </section>
    );
};

export default ProfileSection;
