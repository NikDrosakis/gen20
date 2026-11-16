import { useEffect, useState } from 'react';
import EditButton from './EditButton';
import NewButton from './NewButton';

const API = '/api/v1/maria/q?key=';
const escapeSql = (s = '') => String(s).replace(/'/g, "''");

const runQuery = async (sql, signal) => {
    const res = await fetch(API + encodeURIComponent(sql), { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data?.rows ?? data?.data ?? [];
};

const MdSection = ({ path }) => {
    const [blocks, setBlocks] = useState([]);
    const [postid, setPostid] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchPostAndBlocks = async () => {
            setLoading(true);
            setError(null);
            try {
                // Post ID
                const postRows = await runQuery(
                    `SELECT id FROM gen_gen20net.post WHERE name = '${escapeSql(path)}'`,
                    signal
                );
                const foundId = postRows?.[0]?.id;
                if (foundId) setPostid(foundId);

                // Blocks (ταξινομημένα)
                const data = await runQuery(
                    `SELECT * FROM gen_gen20net.${escapeSql(path)} ORDER BY sort ASC`,
                    signal
                );
                setBlocks(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('MdSection fetch error:', err);
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPostAndBlocks();
        return () => controller.abort();
    }, [path]);

    if (loading) return <div className="container">Loading…</div>;
    if (error) return <div className="container">Error: {error}</div>;

    return (
        <div className="blog-details spad">
            <div className="container">
                <div className="row d-flex justify-content-center">
                    <div className="col-lg-8">
                        <div className="blog__details__content">
                            <div className="blog__details__text">
                                {blocks.map((block) => (
                                    <div key={block.id} style={{ marginBottom: 16 }}>
                                        <div
                                            id={`block-${block.id}`}
                                            data-block-id={block.id}
                                            data-row="content"
                                            style={{ fontSize: '1.5em' }}
                                            dangerouslySetInnerHTML={{ __html: block.content }}
                                        />
                                        <EditButton
                                            blockId={block.id}
                                            uri="ai-guide"
                                            row="content"
                                            editable
                                            lang="el"
                                        />
                                    </div>
                                ))}
                                <NewButton postid={postid} row="content" lang="el" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MdSection;