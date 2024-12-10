  <style>
/* General Container */
.prof-container {
  margin: 0 auto;
  padding: 20px;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #444;
  padding-bottom: 20px;
}

.avatar {
    display: inline-block;
    overflow: hidden;
    border-radius: 50%;
    width: 64px; /* Set a fixed size for the avatar */
    height: 64px; /* Match the height to the width */
    border: 2px solid #f1f1f1; /* Optional: Adds a border around the avatar */
    background-color: #eee; /* Optional: Background color if no image */
    position: relative;
    box-sizing: border-box; /* Ensures border is included in the size */
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures the image covers the container without distortion */
    border-radius: 50%; /* Round the image edges */
    display: block; /* Ensures image doesn't have any unwanted space below it */
}

/* For responsiveness, you can scale the avatar for smaller screens */
@media (max-width: 768px) {
    .avatar {
        width: 48px; /* Reduce size on smaller screens */
        height: 48px;
    }
}

@media (max-width: 480px) {
    .avatar {
        width: 40px; /* Even smaller for mobile */
        height: 40px;
    }
}


.user-info {
  flex: 1;
}

.user-info h1 {
  margin: 0;
  font-size: 1.8rem;
}

.user-info p {
  margin: 5px 0;
  color: #aaa;
}

/* Summary Section */
.summary {
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid #444;
}

.summary-item {
  text-align: center;
}

.summary-item h3 {
  margin: 10px 0;
  font-size: 1.5rem;
}

/* Section Titles */

/* List Styles */
.badges, .questions, .answers, .tags {
  margin-top: 20px;
}

.badge-list, .question-list, .answer-list, .tag-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-item {
  background: #f3f3f3;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-item span {
  color: #aaa;
}

/* Footer */
.footer {
  text-align: center;
  margin-top: 20px;
  color: #888;
}

/* Top Tags Section */
#top-tags {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

#top-tags .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

#top-tags .title {
  font-size: 1.2rem;
  font-weight: bold;
}

#top-tags .view-tags {
  color: #0073e6;
  text-decoration: none;
}

#top-tags .view-tags:hover {
  text-decoration: underline;
}

.tags-card {
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
}

.tag-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.tag-item:last-child {
  border-bottom: none;
}

.tag-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-link {
  text-decoration: none;
  color: #0073e6;
  font-size: 1rem;
}

.tag-link:hover {
  text-decoration: underline;
}

.badge-link {
  margin-left: 4px;
}

.badge {
  display: inline-block;
  width: 16px;
  height: 16px;
}

.badge.bronze {
  background-color: #cd7f32;
  border-radius: 50%;
}

.tag-stats {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
}

.stat {
  text-align: center;
}

.stat .value {
  font-size: 1.1rem;
  font-weight: bold;
}

.stat .label {
  color: #666;
  font-size: 0.9rem;
  text-transform: lowercase;
}

/* Top Posts Section */
#js-top-posts {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.top-posts .header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.top-posts h2 {
  margin: 0;
  font-size: 1.5rem;
}

.top-posts p {
  margin: 8px 0;
  color: #666;
}

.top-posts a {
  text-decoration: none;
  color: #0073e6;
}

.top-posts a:hover {
  text-decoration: underline;
}

.filter-sort {
  display: flex;
  gap: 12px;
}

.filters button,
.sort button {
  padding: 4px 8px;
  border: 1px solid #ccc;
  background: #f8f8f8;
  cursor: pointer;
  font-size: 0.9rem;
}

.filters .selected,
.sort .selected {
  border-color: #0073e6;
  color: #0073e6;
}

.posts {
  border-top: 1px solid #ddd;
}

.post {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
}

.votes {
  font-weight: bold;
  color: #3a3;
  margin-right: 12px;
  min-width: 40px;
  text-align: center;
}

.post-title {
  flex-grow: 1;
  margin-right: 12px;
  text-decoration: none;
  color: #333;
}

.post-title:hover {
  color: #0073e6;
}

.date {
  color: #999;
  font-size: 0.85rem;
  white-space: nowrap;
}

.profile-container {
    display: inline-flex;
    flex-wrap: wrap;
    width: 20%;
    gap: 10px;
    flex-direction: row;
}

.profile-stats,
.communities {
  flex: 1 1 45%; /* Adjust width for responsiveness */
  min-width: 250px; /* Optional: ensures a minimum width */
}

.badges,
.questions,
.answers {
  flex: 1 1 30%; /* Adjust width for responsiveness */
  min-width: 200px; /* Optional: ensures a minimum width */
}


/* Stats Section */
.stats-section {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.stats-card {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-item {
  width: 50%; /* Two columns */
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333333;
}

.stat-label {
  font-size: 14px;
  color: #666666;
}

/* Communities Section */
.communities-section {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.section-title {
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-item {
  margin-bottom: 10px;
}

.edit-link {
  font-size: 14px;
  color: #007bff;
  text-decoration: none;
}

.edit-link:hover {
  text-decoration: underline;
}

.community-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.community-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.community-logo {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 4px;
  background: #e0e0e0;
}

.community-name {
  flex-grow: 1;
  font-size: 14px;
  color: #333333;
}

.community-reputation {
  font-size: 14px;
  color: #666666;
}
@media (max-width: 768px) {
   .profile-container {
     flex-direction: column; /* Stack the sections vertically */
   }

   .profile-stats, .communities, .badges, .questions, .answers {
     flex: 1 1 100%; /* Ensure each section takes full width on smaller screens */
   }
 }


  </style>

<div class="prof-container">
  <!-- Profile Header -->
  <div class="profile-header">
      <a href="/admin/home/profile?action=edit"><span class="glyphicon glyphicon-edit"></span></a>
    <div class="avatar">
       <img src="https://scontent.fath4-2.fna.fbcdn.net/v/t39.30808-1/468656766_10235012962040628_5380845479433910890_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=103&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=u0wwyRDnaK4Q7kNvgEVspzS&_nc_zt=24&_nc_ht=scontent.fath4-2.fna&_nc_gid=AgNg3GfJ4pYwYLsYJFzCMn7&oh=00_AYDNTeYIydkNbAXmZ_HC263xAJYazmnJtXcL8Ca1JD0cEQ&oe=675A545A" alt="Nik Drosakis's user avatar" width="64" height="64" class="bar-sm bar-md d-block">
        </div>
    <div class="user-info">
      <h1>Nik Drosakis</h1>
      <p>
<?=!isset($_COOKIE['GSGRP']) ? '' : $this->usergrps[$_COOKIE['GSGRP']]?>
 - <?=isset($_COOKIE['GSNAME']) ?  $_COOKIE['GSNAME'] : ''?>
      </p>
      <p>Joined: 11 years, 11 months</p>
    </div>
  </div>

  <!-- Summary Section -->
  <div class="summary">
    <div class="summary-item">
      <h3>2,348</h3>
      <p>Reputation</p>
    </div>
    <div class="summary-item">
      <h3>22</h3>
      <p>Silver Badges</p>
    </div>
    <div class="summary-item">
      <h3>175</h3>
      <p>Votes Cast</p>
    </div>
  </div>

<div class="profile-container">
  <!-- Stats Section -->
  <div class="profile-stats">
    <h2 class="section-title">Stats</h2>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">2,348</div>
        <div class="stat-label">Reputation</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">336k</div>
        <div class="stat-label">Reached</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">114</div>
        <div class="stat-label">Answers</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">3</div>
        <div class="stat-label">Questions</div>
      </div>
    </div>
  </div>

  <!-- Communities Section -->
  <div class="communities">
    <div class="section-header">
      <h2 class="section-title">Communities</h2>
      <a href="#" class="edit-link">Edit</a>
    </div>
    <ul class="community-list">
      <li class="community-item">
        <div class="community-logo">🧑‍💻</div>
        <div class="community-name">Stack Overflow</div>
        <div class="community-reputation">2.3k</div>
      </li>
      <li class="community-item">
        <div class="community-logo">📚</div>
        <div class="community-name">Area 51</div>
        <div class="community-reputation">151</div>
      </li>
      <li class="community-item">
        <div class="community-logo">🌟</div>
        <div class="community-name">Meta Stack Exchange</div>
        <div class="community-reputation">101</div>
      </li>
      <li class="community-item">
        <div class="community-logo">🎓</div>
        <div class="community-name">Academia</div>
        <div class="community-reputation">101</div>
      </li>
      <li class="community-item">
        <div class="community-logo">💻</div>
        <div class="community-name">Ask Ubuntu</div>
        <div class="community-reputation">101</div>
      </li>
    </ul>
  </div>
</div>
<div style="
    width: 74%;
    float: inline-end;
    height: max-content;
    margin: 20px;
">
<p>Full Stack in all stages of web engineer and development, small and large-scale applications, from building concept to quality assurance, high-performance and tuning. Ten years programming &amp; ten years creative. Currently programming with PHP, JS, nodejs, python, reactjs.</p>
  <!-- Badges Section -->
  <div class="badges">
    <h2 class="section-title">Badges</h2>
    <ul class="badge-list">
      <li class="list-item">
        Great Answer <span class="badge gold">Gold</span>
      </li>
      <li class="list-item">
        Tenacious <span class="badge silver">Silver</span>
      </li>
      <li class="list-item">
        PHP Mastery <span class="badge bronze">Bronze</span>
      </li>
    </ul>
  </div>

  <!-- Questions Section -->
  <div class="questions">
    <h2 class="section-title">Questions</h2>
    <ul class="question-list">
      <li class="list-item">
        <div class="question-title">Ajax polling chat gets duplicates</div>
        <span class="question-votes">4 votes</span>
      </li>
      <li class="list-item">
        <div class="question-title">WebRTC PermissionDeniedError explained</div>
        <span class="question-votes">2 votes</span>
      </li>
    </ul>
  </div>

  <!-- Answers Section -->
  <div class="answers">
    <h2 class="section-title">Answers</h2>
    <ul class="answer-list">
      <li class="list-item">
        <div class="answer-title">How do I store an array in a file?</div>
        <span class="answer-votes">+170 votes</span>
      </li>
      <li class="list-item">
        <div class="answer-title">MySQL select query optimizations</div>
        <span class="answer-votes">+40 votes</span>
      </li>
    </ul>
  </div>



  <!-- Top Tags Section -->
  <div id="top-tags" class="top-tags">
    <h2 class="section-title">Top Tags</h2>
    <div class="tags-card">
      <div class="tag-item">
        <a href="#" class="tag-link">php</a>
        <span class="badge bronze"></span>
        <div class="tag-stats">
          <span class="stat">163 Score</span>
          <span class="stat">68 Posts</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Top Posts Section -->
  <div id="top-posts" class="top-posts">
    <h2 class="section-title">Top Posts</h2>
    <div class="posts">
      <div class="post">
        <span class="votes">101</span>
        <a href="#" class="post-title">PHP array stringify</a>
      </div>
      <div class="post">
        <span class="votes">22</span>
        <a href="#" class="post-title">'Delete' user but keep records (foreign keys)</a>
      </div>
    </div>
  </div>
</div>

</div>
