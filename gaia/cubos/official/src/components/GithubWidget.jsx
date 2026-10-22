import React, { useEffect, useState } from 'react';

const GithubWidget = ({ username }) => {
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!username) return;
        const fetchRepos = async () => {
            try {
                setLoading(true);
                const res = await fetch(`https://api.github.com/users/NikDrosakis/repos?sort=updated&per_page=5`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setRepos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRepos();
    }, [username]);

    if (loading) return <div>Loading GitHub repos...</div>;
    if (error) return <div>Error loading GitHub data: {error}</div>;

    return (
        <div className="github-widget">
            <h3>GitHub Repositories</h3>
            <ul>
                {repos.map(repo => (
                    <li key={repo.id}>
                        <a href={repo.html_url} target="_blank" rel="noreferrer">
                            {repo.name}
                        </a>
                        <p>{repo.description || 'No description'}</p>
                        <small>⭐ {repo.stargazers_count} | Forks: {repo.forks_count}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GithubWidget;
