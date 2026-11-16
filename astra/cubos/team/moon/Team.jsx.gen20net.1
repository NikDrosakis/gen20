// src/cubos/team/Team.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Team.css";

export default function Team({ limit = 6, bg = "/media/team-bg.jpg" }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ctrl = new AbortController();
        (async () => {
            try {
                // σταθερός endpoint: ο server διαλέγει βάση από το Host
                const res = await fetch(
                    `/api/v1/maria/fa?key=${encodeURIComponent("select * from gen_gen20net.user")}`,
                    { signal: ctrl.signal }
                );
                if (!res.ok) throw new Error(res.status);
                const data = await res.json();
                const list = data.success && Array.isArray(data.data) ? data.data : [];
                setMembers(list.slice(0, limit));
            } catch (err) {
                if (err.name !== "AbortError") console.error("Team:", err);
                setMembers([]);
            } finally {
                if (!ctrl.signal.aborted) setLoading(false);
            }
        })();
        return () => ctrl.abort();
    }, [limit]);

    if (loading) return <div className="team-loading-state">Loading...</div>;
    if (!members.length) return null;

    return (
        <section
            className="team-section set-bg"
            style={{ backgroundImage: `url("${bg}")` }}
        >
            <div className="team-container">
                <div className="team-row">
                    <div className="team-col-full">
                        <div className="team-title-wrapper">
                            <h2 className="team-title">The Team</h2>
                        </div>
                    </div>
                </div>

                <div className="team-grid">
                    {members.map((m, i) => (
                        <div className="team-col" key={m.name || i}>
                            <div
                                className={`team-member ${
                                    ["", "team-member--second", "team-member--third"][i % 3]
                                } set-bg`}
                                style={{
                                    backgroundImage: `url(/media/${m.img || "default-user.jpg"})`,
                                }}
                            >
                                <div className="team-member-overlay">
                                    <h4 className="team-member-name">{m.fullname}</h4>
                                    <p className="team-member-title">{m.title}</p>
                                    <Link
                                        to={`/profile?name=${encodeURIComponent(m.name)}`}
                                        className="team-member-profile-btn"
                                    >
                                        Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="team-footer">
                    <div className="team-footer-col">
                        <div className="team-footer-btn-wrapper">
                            <Link to="/profile" className="team-footer-btn">
                                More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}