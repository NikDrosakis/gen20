import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPosts } from '../services/api';

function HomePage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const categorySlug = searchParams.get('category');

    useEffect(() => {
        const getPosts = async () => {
            try {
                const data = await fetchPosts(categorySlug);
                setPosts(data);
            } catch (error) {
                console.error("Failed to load posts:", error);
            } finally {
                setLoading(false);
            }
        };
        getPosts();
    }, [categorySlug]);

    if (loading) return <div>Loading posts...</div>;

    return (
        <div className="home-page">
            <h1>Welcome to gen20.dev</h1>
            <p className="subtitle">A modern development blog.</p>
            <div className="post-list">
                {posts.map(post => (
                    <article key={post.id} className="post-preview">
                        <Link to={`/post/${post.slug}`}>
                            <h2>{post.title}</h2>
                            <p className="post-excerpt">{post.excerpt}</p>
                            <span className="read-more">Read more →</span>
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default HomePage;