import { useEffect, useState } from 'react';
import Player from '@cubos/player/Player';
import './Gallery.css';

const API_BASE = '/api/v1/maria';
const escapeSql = (s = '') => String(s).replace(/'/g, "''");

const GallerySection = ({ mediagrpid = 1 }) => {
    const [isOpen, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchItems = async () => {
            setLoading(true);
            setError(null);
            try {
                const sql = `SELECT * FROM gen_gen20net.media WHERE mediagrpid=${Number(mediagrpid)} ORDER BY created DESC`;
                const res = await fetch(
                    `${API_BASE}/fa?key=maria&q=${encodeURIComponent(sql)}`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const rows = Array.isArray(data) ? data : data?.rows ?? data?.data ?? [];
                setItems(rows);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error fetching media:', err);
                    setError(err.message);
                    setItems([]);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
        return () => controller.abort();
    }, [mediagrpid]);

    const handleChange = () => setOpen(!isOpen);

    const getThumbnail = (img) => {
        if (img?.startsWith('http')) return img;
        return `/media/${img?.trim() || 'default.jpg'}`;
    };

    return (
        <section className="portfolio spad">
            <div className="container">
                <div className="portfolio__filter">
                    <ul>
                        <li className="active" data-filter="*">All</li>
                        <li data-filter=".branding">Film</li>
                        <li data-filter=".digital-marketing">Theatre</li>
                        <li data-filter=".web">Live</li>
                        <li data-filter=".photography">Programming</li>
                        <li data-filter=".ecommerce">Action</li>
                    </ul>
                </div>

                {loading && <p className="gallery-state">Loading media…</p>}
                {error && <p className="gallery-state gallery-state--error">Error: {error}</p>}

                {!loading && !error && (
                    <div className="portfolio__gallery">
                        {items.length ? (
                            items.map((item, index) => (
                                <article key={item.id || index} className="portfolio__item">
                                    <div
                                        className="portfolio__item__video"
                                        style={{ backgroundImage: `url("${getThumbnail(item.img)}")` }}
                                    >
                                        <Player
                                            url={item.filepath || ''}
                                            isOpen={isOpen}
                                            close={handleChange}
                                        />
                                        <button className="bare" onClick={handleChange}>Play</button>

                                        </div>

                                    <div className="portfolio__item__text">
                                        <h4>{item.title || 'Χωρίς Τίτλο'}</h4>
                                        <ul>
                                            <li>{item.mediatype?.toUpperCase() || 'VIDEO'}</li>
                                            <li>{item.created ? new Date(item.created).toLocaleDateString() : ''}</li>
                                        </ul>
                                        {item.description && (
                                            <p className="portfolio__item__desc">
                                                {item.description.split('\n')[0].slice(0, 150)}…
                                            </p>
                                        )}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="gallery-state">Δεν υπάρχουν διαθέσιμα βίντεο αυτή τη στιγμή.</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default GallerySection;