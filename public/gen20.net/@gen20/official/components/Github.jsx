import React, { useEffect, useState } from 'react';
import {useG} from "../contexts/GContext";

const Github = ({ owner = 'NikDrosakis', repoName = '' }) => {
    const [repos, setRepos] = useState([]);
    const [repoDetails, setRepoDetails] = useState(null);
    const [tags, setTags] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [commits, setCommits] = useState([]);
    const [activeTab, setActiveTab] = useState('repoDetails');
    const { G } = useG();
    const token = G.is.GITHUB_ACCESS_TOKEN;
    // If no specific repoName, fetch user's repos
    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const url = repoName
                    ? `https://api.github.com/repos/${owner}/${repoName}`
                    : `https://api.github.com/users/${owner}/repos?sort=updated`;

                const res = await fetch(url, {
                    headers: {
                        Authorization: `token ${token}`
                    },
                });
                const data = await res.json();
                if (!repoName) {
                    setRepos(data);
                } else {
                    // If repoName specified, load all tabs data for it
                    setRepoDetails(data);
                    fetchAdditionalData();
                }
            } catch (error) {
                console.error('GitHub fetch error:', error);
            }
        };

        // Fetch tags, workflows, commits for selected repo
        const fetchAdditionalData = async () => {
            try {
                const [tagsRes, workflowsRes, commitsRes] = await Promise.all([
                    fetch(`https://api.github.com/repos/${owner}/${repoName}/tags`, {
                        headers: {
                            Authorization: `token ${token}`,
                            Accept: 'application/vnd.github.v3+json',
                        },
                    }),
                    fetch(`https://api.github.com/repos/${owner}/${repoName}/actions/workflows`, {
                        headers: {
                            Authorization: `token ${token}`,
                            Accept: 'application/vnd.github.v3+json',
                        },
                    }),
                    fetch(
                        `https://api.github.com/repos/${owner}/${repoName}/commits?since=${new Date(
                            Date.now() - 30 * 24 * 60 * 60 * 1000
                        ).toISOString()}`,
                        {
                            headers: {
                                Authorization: `token ${token}`,
                                Accept: 'application/vnd.github.v3+json',
                            },
                        }
                    ),
                ]);

                const tagsData = await tagsRes.json();
                const workflowsData = await workflowsRes.json();
                const commitsData = await commitsRes.json();

                setTags(tagsData);
                setWorkflows(workflowsData.workflows || []);
                setCommits(commitsData);
            } catch (error) {
                console.error('GitHub additional data error:', error);
            }
        };

        fetchRepos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repoName, token, owner]);

    // Render list of repos if no repoName, otherwise show tabs for repo details
    if (!repoName) {
        return (
            <>
                <div className="container">
                    <div className="row">
                        <h2>GitHub Repositories</h2>
                        <div id="repo-archive" className="repo-archive">
                            {Array.isArray(repos) ? (
                                repos.map((repo) => (
                                    <div key={repo.id} className="repo-card">
                                        <div className="repo-header">
                                            <a href={repo.html_url} target="_blank" rel="noreferrer">
                                                <h3>{repo.full_name}</h3>
                                            </a>
                                            <a href={`/admin/github?name=${repo.name}`} target="_blank"
                                               rel="noreferrer">
                                                <h3>more</h3>
                                            </a>
                                            {repo.fork && <span className="fork-badge">Forked</span>}
                                        </div>
                                        <p className="repo-description">{repo.description || 'No description'}</p>
                                        <div className="repo-meta">
                                            <span className="language-tag">{repo.language || 'Unknown'}</span>
                                            <span className="stars">
          <i className="fas fa-star"/> {repo.stargazers_count}
        </span>
                                            <span className="updated">
          Updated: {new Date(repo.updated_at).toLocaleDateString()}
        </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No repos available or single repo fetched</p>
                            )}

                        </div>
                    </div>
                </div>

                <style>{`
          #repo-archive {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
          }

          .repo-card {
            width: 300px;
            margin-bottom: 20px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: aliceblue;
          }

          .repo-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }

          .repo-header h3 {
            margin: 0;
            font-size: 1.2em;
          }

          .repo-header a {
            text-decoration: none;
            color: #0366d6;
          }

          .fork-badge {
            font-size: 0.8em;
            padding: 4px 8px;
            background-color: #f0f0f0;
            border-radius: 4px;
          }

          .repo-description {
            margin-bottom: 10px;
          }

          .repo-meta {
            display: flex;
            align-items: center;
          }

          .language-tag {
            font-size: 0.8em;
            padding: 4px 8px;
            background-color: #eee;
            border-radius: 4px;
            margin-right: 10px;
          }

          .stars {
            display: flex;
            align-items: center;
            margin-right: 10px;
          }

          .stars i {
            color: #ffc107;
            margin-right: 4px;
          }

          .updated {
            font-size: 0.8em;
            color: #666;
          }
        `}</style>
            </>
        );
    }

    // When repoName is set, show tabbed repo details
    return (
        <>
            <h2>GitHub Repository Details: {repoDetails?.full_name || repoName}</h2>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'repoDetails' ? 'active' : ''}`}
                    onClick={() => setActiveTab('repoDetails')}
                >
                    Repository Details
                </button>
                <button
                    className={`tab-button ${activeTab === 'tags' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tags')}
                >
                    Version Tags
                </button>
                <button
                    className={`tab-button ${activeTab === 'workflows' ? 'active' : ''}`}
                    onClick={() => setActiveTab('workflows')}
                >
                    CI/CD Workflows
                </button>
                <button
                    className={`tab-button ${activeTab === 'commits' ? 'active' : ''}`}
                    onClick={() => setActiveTab('commits')}
                >
                    Recent Contributions
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'repoDetails' && repoDetails && (
                    <>
                        <h3>Repository Details</h3>
                        <p>
                            <strong>Name:</strong> {repoDetails.full_name}
                        </p>
                        <p>
                            <strong>Description:</strong> {repoDetails.description || 'No description'}
                        </p>
                        <p>
                            <strong>Language:</strong> {repoDetails.language || 'Unknown'}
                        </p>
                        <p>
                            <strong>Stars:</strong> {repoDetails.stargazers_count}
                        </p>
                    </>
                )}

                {activeTab === 'tags' && (
                    <>
                        <h3>Version Tags</h3>
                        {tags.length > 0 ? (
                            <ul>{tags.map((tag) => <li key={tag.name}>{tag.name}</li>)}</ul>
                        ) : (
                            <p>No tags found.</p>
                        )}
                    </>
                )}

                {activeTab === 'workflows' && (
                    <>
                        <h3>CI/CD Workflows</h3>
                        {workflows.length > 0 ? (
                            <ul>{workflows.map((w) => <li key={w.id}>{w.name}</li>)}</ul>
                        ) : (
                            <p>No workflows found.</p>
                        )}
                    </>
                )}

                {activeTab === 'commits' && (
                    <>
                        <h3>Recent Contributions (Last 30 Days)</h3>
                        {commits.length > 0 ? (
                            <ul>
                                {commits.map((commit) => (
                                    <li key={commit.sha}>
                                        {commit.commit.message} -{' '}
                                        {new Date(commit.commit.author.date).toLocaleDateString()}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No recent commits.</p>
                        )}
                    </>
                )}
            </div>

            <style>{`
        .tabs {
          display: flex;
          margin-bottom: 10px;
          gap: 10px;
        }
        .tab-button {
          padding: 10px 20px;
          cursor: pointer;
          border: 1px solid #ddd;
          background: #f7f7f7;
          border-radius: 5px;
          font-weight: 600;
        }
        .tab-button.active {
          background: #0366d6;
          color: white;
          border-color: #0366d6;
        }
        .tab-content {
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 5px;
          background: #fff;
        }
        ul {
          list-style: disc inside;
          padding-left: 0;
        }
      `}</style>
        </>
    );
};
export default Github;