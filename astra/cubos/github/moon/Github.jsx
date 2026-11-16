import { useEffect, useState } from 'react';
import { useG } from '../../GContext';
import './Github.css';

const Github = ({ owner = 'NikDrosakis', repoName = '', username, perPage = 30 }) => {
    const effectiveOwner = username || owner;
    const { G } = useG();
    const token = G?.is?.GITHUB_ACCESS_TOKEN;

    const [repos, setRepos] = useState([]);
    const [repoDetails, setRepoDetails] = useState(null);
    const [tags, setTags] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [commits, setCommits] = useState([]);
    const [activeTab, setActiveTab] = useState('repoDetails');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const headers = {
            ...(token ? { Authorization: `token ${token}` } : {}),
            Accept: 'application/vnd.github.v3+json',
        };
        const gh = (path) =>
            fetch(`https://api.github.com${path}`, { headers, signal: controller.signal })
                .then((r) => {
                    if (!r.ok) throw new Error(`GitHub ${r.status}`);
                    return r.json();
                });

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!repoName) {
                    const data = await gh(`/users/${effectiveOwner}/repos?sort=updated&per_page=${perPage}`);
                    setRepos(Array.isArray(data) ? data : []);
                } else {
                    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
                    const [details, tagsData, wfData, commitsData] = await Promise.all([
                        gh(`/repos/${effectiveOwner}/${repoName}`),
                        gh(`/repos/${effectiveOwner}/${repoName}/tags`),
                        gh(`/repos/${effectiveOwner}/${repoName}/actions/workflows`),
                        gh(`/repos/${effectiveOwner}/${repoName}/commits?since=${since}`),
                    ]);
                    setRepoDetails(details);
                    setTags(tagsData);
                    setWorkflows(wfData.workflows || []);
                    setCommits(commitsData);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('GitHub fetch error:', err);
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [effectiveOwner, repoName, token, perPage]);

    if (loading) return <div className="container">Loading GitHub…</div>;
    if (error) return <div className="container github-error">GitHub error: {error}</div>;

    // ---- Λίστα repos ----
    if (!repoName) {
        return (
            <div className="container">
                <div className="row">
                    <h2>GitHub Repositories</h2>
                    <div id="repo-archive" className="repo-archive">
                        {repos.length ? (
                            repos.map((repo) => (
                                <div key={repo.id} className="repo-card">
                                    <div className="repo-header">
                                        <a href={repo.html_url} target="_blank" rel="noreferrer">
                                            <h3>{repo.full_name}</h3>
                                        </a>
                                        <a href={`/admin/github?name=${repo.name}`} target="_blank" rel="noreferrer">
                                            <h3>more</h3>
                                        </a>
                                        {repo.fork && <span className="fork-badge">Forked</span>}
                                    </div>
                                    <p className="repo-description">{repo.description || 'No description'}</p>
                                    <div className="repo-meta">
                                        <span className="language-tag">{repo.language || 'Unknown'}</span>
                                        <span className="stars"><i className="fas fa-star" /> {repo.stargazers_count}</span>
                                        <span className="updated">
                      Updated: {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No repos available.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ---- Λεπτομέρειες με tabs ----
    const tabs = [
        ['repoDetails', 'Repository Details'],
        ['tags', 'Version Tags'],
        ['workflows', 'CI/CD Workflows'],
        ['commits', 'Recent Contributions'],
    ];

    return (
        <div className="container">
            <h2>GitHub Repository Details: {repoDetails?.full_name || repoName}</h2>

            <div className="tabs">
                {tabs.map(([key, label]) => (
                    <button
                        key={key}
                        className={`tab-button ${activeTab === key ? 'active' : ''}`}
                        onClick={() => setActiveTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="tab-content">
                {activeTab === 'repoDetails' && repoDetails && (
                    <>
                        <h3>Repository Details</h3>
                        <p><strong>Name:</strong> {repoDetails.full_name}</p>
                        <p><strong>Description:</strong> {repoDetails.description || 'No description'}</p>
                        <p><strong>Language:</strong> {repoDetails.language || 'Unknown'}</p>
                        <p><strong>Stars:</strong> {repoDetails.stargazers_count}</p>
                    </>
                )}

                {activeTab === 'tags' && (
                    <>
                        <h3>Version Tags</h3>
                        {tags.length ? <ul>{tags.map((t) => <li key={t.name}>{t.name}</li>)}</ul> : <p>No tags found.</p>}
                    </>
                )}

                {activeTab === 'workflows' && (
                    <>
                        <h3>CI/CD Workflows</h3>
                        {workflows.length ? <ul>{workflows.map((w) => <li key={w.id}>{w.name}</li>)}</ul> : <p>No workflows found.</p>}
                    </>
                )}

                {activeTab === 'commits' && (
                    <>
                        <h3>Recent Contributions (Last 30 Days)</h3>
                        {commits.length ? (
                            <ul>
                                {commits.map((c) => (
                                    <li key={c.sha}>
                                        {c.commit.message} — {new Date(c.commit.author.date).toLocaleDateString()}
                                    </li>
                                ))}
                            </ul>
                        ) : <p>No recent commits.</p>}
                    </>
                )}
            </div>
        </div>
    );
};

export default Github;