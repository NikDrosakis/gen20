// pages/Blog.jsx
import { useState, useEffect } from "react";
import { useParams  } from "react-router-dom";
import ContentArchive from "../components/content/ContentArchive";
import ContentOne from "../components/content/ContentOne";
import Search from "../components/Search";
import "./Blog.css";
import Cookies from 'js-cookie';
export default function Blog() {
    const { name } = useParams();
    const lang = Cookies.get('lang') || 'en';
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [sortBy, setSortBy] = useState("latest");
    const [categoriesList, setCategoriesList] = useState([]);
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const query = `SELECT 
                c.*,
                u.name as author_name,
                u.img as author_img,
                u.firstname as author_firstname,
                u.lastname as author_lastname,
                ct.title_en as category_title_en,
                ct.title  as category_title 
            FROM ${publicdb}.content c
            LEFT JOIN ${publicdb}.user u ON c.userid = u.id
            LEFT JOIN ${publicdb}.classification ct ON c.classificationid = ct.id
            WHERE c.type='post'
            ORDER BY c.id DESC`;
console.log(query);
            const response = await fetch(`/api/v1/maria/fa?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            let postsData = [];
            if (data.success && data.data) {
                if (Array.isArray(data.data)) {
                    postsData = data.data;
                }
            } else if (Array.isArray(data)) {
                postsData = data;
            } else if (data.data && Array.isArray(data.data)) {
                postsData = data.data;
            } else {
                postsData = getDemoPosts();
            }

            setPosts(postsData);

            const uniqueCategories = [...new Set(postsData.map(p => p.classificationid).filter(Boolean))];
            fetchCategoriesList(uniqueCategories);

        } catch (err) {
            console.error("Error fetching posts:", err);
            setError(err.message);
            setPosts(getDemoPosts());
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoriesList = async (categoryIds) => {
        if (categoryIds.length === 0) return;

        try {
            const ids = categoryIds.join(',');
            const response = await fetch(`/api/v1/maria/fa?q=select id, title from ${publicdb}.classification where id IN(${ids})`);
            const data = await response.json();

            let catsData = [];
            if (data.success && data.data) {
                catsData = data.data;
            } else if (Array.isArray(data)) {
                catsData = data;
            }

            setCategoriesList(catsData);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const getDemoPosts = () => {
        return [
            { id: 1, title_en: "Understanding Pharmacogenomics in Modern Medicine", excerpt_en: "Exploring how genetic variations influence drug response...", description_en: "<p>Full content about pharmacogenomics...</p>", classificationid: 1, userid: 1, view_count: 1247, created: "2024-03-15", featured: true, author_name: "Dr. Niki Mourtzi", author_firstname: "Niki", author_lastname: "Mourtzi", category_title_en: "Pharmacogenomics" },
            { id: 2, title_en: "Polygenic Risk Scores: A New Frontier", excerpt_en: "How PRS is revolutionizing disease risk prediction...", description_en: "<p>Full content about PRS...</p>", classificationid: 2, userid: 1, view_count: 892, created: "2024-03-10", featured: false, author_name: "Dr. Niki Mourtzi", author_firstname: "Niki", author_lastname: "Mourtzi", category_title_en: "Genetics" }
        ];
    };

    const getAuthorName = (post) => {
        if (post.author_firstname || post.author_lastname) {
            return `${post.author_firstname || ''} ${post.author_lastname || ''}`.trim();
        }
        return post.author_name || `Author ${post.userid}`;
    };

    const getCategoryTitle = (post) => {
        return post.category_title_en || `Category ${post.classificationid}`;
    };

    const getAvailableCategories = () => {
        const allCategories = [{ id: "all", name: "All Articles", icon: "📚" }];

        const existingclassificationids = [...new Set(posts.map(p => p.classificationid).filter(Boolean))];

        existingclassificationids.forEach(classificationid => {
            const category = categoriesList.find(c => c.id === classificationid);
            if (category) {
                allCategories.push({
                    id: classificationid.toString(),
                    name: category.title_en || `Category ${classificationid}`,
                    icon: getCategoryIcon(classificationid)
                });
            }
        });

        return allCategories;
    };

    const getCategoryIcon = (classificationid) => {
        const icons = { 1: "💊", 2: "🧬", 3: "💻", 4: "🤖", 5: "🔬" };
        return icons[classificationid] || "📄";
    };

    const getCategoryCount = (categoryId) => {
        if (categoryId === "all") return posts.length;
        return posts.filter(p => p.classificationid === parseInt(categoryId)).length;
    };

    const getFilteredPosts = () => {
        let filtered = posts;

        // Filter by category
        if (activeTab !== "all") {
            filtered = filtered.filter(post => post.classificationid === parseInt(activeTab));
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(post =>
                post.title_en?.toLowerCase().includes(term) ||
                post.excerpt_en?.toLowerCase().includes(term) ||
                post.description_en?.toLowerCase().includes(term) ||
                getAuthorName(post).toLowerCase().includes(term) ||
                getCategoryTitle(post).toLowerCase().includes(term)
            );
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            if (sortBy === "latest") return new Date(b.created) - new Date(a.created);
            if (sortBy === "oldest") return new Date(a.created) - new Date(b.created);
            if (sortBy === "views") return (b.view_count || 0) - (a.view_count || 0);
            return 0;
        });

        return filtered.map(post => ({
            ...post,
            author_display: getAuthorName(post),
            category_display: getCategoryTitle(post)
        }));
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredPosts = getFilteredPosts();
    const featuredPosts = filteredPosts.filter(p => p.featured === 1 || p.featured === true);
    const regularPosts = filteredPosts.filter(p => !(p.featured === 1 || p.featured === true));
    const availableCategories = getAvailableCategories();

    // If there's an ID in URL, show single article view
    if (name) {
        const singlePost = posts.find(p => p.name === name);
        return <ContentOne pageName={name} initialContent={singlePost} allPosts={posts} lang={lang}/>;
    }

    // Otherwise show blog archive view
    return (
        <div className="blog-page">
            <div className="blog-container">
                {/* Tabs */}
                <div className="blog-tabs">
                    <div className="tabs-container">
                        {availableCategories.map(cat => (
                            <button
                                key={cat.id}
                                className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(cat.id)}
                            >
                                <span>{cat.icon}</span>
                                {cat.name}
                                <span className="tab-count">{getCategoryCount(cat.id)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Component */}
                <div className="search-section">
                    <Search onSearch={handleSearch} initialValue={searchTerm} />
                </div>

                {/* Stats Bar */}
                <div className="stats-bar">
                    <div className="results-count">
                        <strong>{filteredPosts.length}</strong> articles found
                    </div>
                    <div className="sort-options">
                        <button className={`sort-btn ${sortBy === 'latest' ? 'active' : ''}`} onClick={() => setSortBy('latest')}>Latest</button>
                        <button className={`sort-btn ${sortBy === 'oldest' ? 'active' : ''}`} onClick={() => setSortBy('oldest')}>Oldest</button>
                        <button className={`sort-btn ${sortBy === 'views' ? 'active' : ''}`} onClick={() => setSortBy('views')}>Most Views</button>
                    </div>
                </div>

                {/* Content Archive */}
                <ContentArchive
                    posts={regularPosts}
                    featuredPosts={featuredPosts}
                    loading={loading}
                    error={error}
                    searchTerm={searchTerm}
                    lang={lang}
                />
            </div>
        </div>
    );
}