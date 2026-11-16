import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Profile.css';

const escapeSql = (s = '') => String(s).replace(/'/g, "''");

export default function Profile() {
    const [searchParams] = useSearchParams();
    const name = searchParams.get('name');

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const publicdb = 'gen_' + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        if (!name) {
            setError('No profile name provided');
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const sql = `SELECT * FROM ${publicdb}.user WHERE name='${escapeSql(name)}' AND status=1`;
                const res = await fetch(
                    `/api/v1/maria/fa?key=maria&q=${encodeURIComponent(sql)}`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                // Το API μπορεί να επιστρέψει array ή { rows: [...] } ή { data: [...] }
                const rows = Array.isArray(data) ? data : data?.rows ?? data?.data ?? [];
                const found = Array.isArray(rows) ? rows[0] : rows;

                if (found) setUser(found);
                else setError('Profile not found');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching profile:', err);
                    setError('Failed to load profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        return () => controller.abort();
    }, [name, publicdb]);

    if (loading) return <div className="profile-state">Loading profile…</div>;
    if (error || !user) return <div className="profile-state profile-state--error">{error || 'Profile not found'}</div>;

    return (
        <section className="profile">
            <div className="profile__cover">
                <img
                    className="profile__cover-img"
                    src={`/media/${user.cover_img || 'default-cover.jpg'}`}
                    alt=""
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="profile__cover-overlay" />

                <div className="profile__avatar">
                    <img
                        src={`/media/${user.img || 'default-avatar.png'}`}
                        alt={`${user.fullname || user.name}'s avatar`}
                        onError={(e) => { e.currentTarget.src = '/assets/default-avatar.png'; }}
                    />
                </div>
            </div>

            <div className="profile__body">
                <h1 className="profile__name">{user.fullname || user.name}</h1>
                <p className="profile__bio">{user.bio || 'No bio yet.'}</p>
                <p className="profile__location">📍 {user.location || 'Unknown location'}</p>

                <div className="profile__actions">
                    <button type="button" className="btn btn--primary">Follow</button>
                    <button type="button" className="btn btn--outline">Message</button>
                </div>

                <div className="profile__stats">
                    <Stat value={user.followers_count} label="Followers" />
                    <Stat value={user.following_count} label="Following" />
                    <Stat value={user.posts_count} label="Posts" />
                </div>
            </div>
        </section>
    );
}

function Stat({ value = 0, label }) {
    return (
        <div className="profile__stat">
            <div className="profile__stat-value">{value}</div>
            <div className="profile__stat-label">{label}</div>
        </div>
    );
}