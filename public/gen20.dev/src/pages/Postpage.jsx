import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPostBySlug } from '../services/api';

function PostPage() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getPost = async () => {
            try {
                const data = await fetchPostBySlug(slug);
                setPost(data);
            } catch (error) {
                console.error("Failed to load post:", error);
            } finally {
                setLoading(false);
            }
        };
        getPost();
    }, [slug]);

    if (loading) return <div>Loading post...</div>;
    if (!post) return <div>Post not found.</div>;

    return (
        <div className="post-page">
            <article>
                <header className="post-header">
                    <h1>{post.title}</h1>
                    <div className="post-meta">
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        <span>· {post.category?.name || 'Uncategorized'}</span>
                    </div>
                </header>
                <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
        </div>
    );
}

export default PostPage;