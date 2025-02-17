<style>
 #repo-archive {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    .repo-card {
        width: 300px; /* Adjust card width as needed */
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
        color: #0366d6; /* GitHub blue */
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
        color: #ffc107; /* Yellow for stars */
        margin-right: 4px;
    }

    .updated {
        font-size: 0.8em;
        color: #666;
    }
</style>
  <h2>GitHub Repository Details</h2>

   <div class="tabs">
      <button class="tab-button" onclick="openTab(event, 'repoDetails')">Repository Details</button>
      <button class="tab-button" onclick="openTab(event, 'tags')">Version Tags</button>
      <button class="tab-button" onclick="openTab(event, 'workflows')">CI/CD Workflows</button>
      <button class="tab-button" onclick="openTab(event, 'commits')">Recent Contributions</button>
    </div>

    <div id="repoDetails" class="tab-content">
      <!-- Content for Repository Details -->
      <h2>Repository Details</h2>
      <div id="repo-details"></div>
    </div>

    <div id="tags" class="tab-content">
      <!-- Content for Version Tags -->
      <h2>Version Tags</h2>
      <div id="tags"></div>
    </div>

    <div id="workflows" class="tab-content">
      <!-- Content for CI/CD Workflows -->
      <h2>CI/CD Workflows</h2>
      <div id="workflows"></div>
    </div>

    <div id="commits" class="tab-content">
      <!-- Content for Recent Contributions -->
      <h2>Recent Contributions</h2>
      <div id="commits"></div>
    </div>

  <div id="repo-details"></div>
  <div id="tags"></div>
  <div id="workflows"></div>
  <div id="commits"></div>
<div id="repo-archive"></div>



<script>
const token = G.is.GITHUB_ACCESS_TOKEN;
const owner = "NikDrosakis";
var repo = G.name;

if(G.name!=''){
var repo = G.name;
var url = `https://api.github.com/repos/${owner}/${repo}`;
}else{
var url = 'https://api.github.com/user/repos';
}
fetch(url, {
  method: 'GET',
  headers: {
    'Authorization': `token ${token}`, // Use backticks for template literals
    'Accept': 'application/vnd.github.v3+json'
  }
})
.then(response => response.json())
.then(repos => {
    if(G.name==''){renderRepos(repos);}
    console.log(repos);
})
.catch(error => console.error('Error:', error));



function renderRepos(repos) {
    const container = document.getElementById('repo-archive');
    container.innerHTML = ''; // Clear any existing content

    repos.forEach(repo => {
        const repoCard = `
            <div class="repo-card">
                <div class="repo-header">
                    <a href="${repo.html_url}" target="_blank">
                        <h3>${repo.full_name}</h3>
                    </a>
                    <a href="/admin/github?name=${repo.name}" target="_blank">
                        <h3>more</h3>
                    </a>
                    ${repo.fork ? '<span class="fork-badge">Forked</span>' : ''}
                </div>
                <p class="repo-description">${repo.description || 'No description'}</p>
                <div class="repo-meta">
                    <span class="language-tag">${repo.language || 'Unknown'}</span>
                    <span class="stars">
                        <i class="fas fa-star"></i> ${repo.stargazers_count}
                    </span>
                    <span class="updated">Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        container.innerHTML += repoCard;
    });
}
 function fetchRepoDetails() {
      const url = `https://api.github.com/repos/${owner}/${repo}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }).then(response => response.json());
    }

    function fetchTags() {
      const tagsUrl = `https://api.github.com/repos/${owner}/${repo}/tags`;
      return fetch(tagsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }).then(response => response.json());
    }

    function fetchWorkflows() {
      const workflowsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows`;
      return fetch(workflowsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }).then(response => response.json());
    }

    function fetchCommits() {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const sinceDate = oneMonthAgo.toISOString();
      const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceDate}`;
      return fetch(commitsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }).then(response => response.json());
    }

    Promise.all([fetchRepoDetails(), fetchTags(), fetchWorkflows(), fetchCommits()])
      .then(([repoDetails, tags, workflows, commits]) => {
        document.getElementById('repo-details').innerHTML = `
          <h3>Repository Details</h3>
          <p><strong>Name:</strong> ${repoDetails.full_name}</p>
          <p><strong>Description:</strong> ${repoDetails.description}</p>
          <p><strong>Language:</strong> ${repoDetails.language}</p>
          <p><strong>Stars:</strong> ${repoDetails.stargazers_count}</p>
        `;

        document.getElementById('tags').innerHTML = `
          <h3>Version Tags</h3>
          <ul>${tags.map(tag => `<li>${tag.name}</li>`).join('')}</ul>
        `;

        document.getElementById('workflows').innerHTML = `
          <h3>CI/CD Workflows</h3>
          <ul>${workflows.workflows.map(workflow => `<li>${workflow.name}</li>`).join('')}</ul>
        `;

        document.getElementById('commits').innerHTML = `
          <h3>Contributions in Last Month</h3>
          <ul>${commits.map(commit => `<li>${commit.commit.message} - ${commit.commit.author.date}</li>`).join('')}</ul>
        `;
      })
      .catch(error => console.error('Error:', error));
</script>
