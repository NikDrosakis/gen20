for(var in loop){
    `<div class="repo-card">
        <div class="repo-header">
            <a href="<?= $repo['html_url'] ?>" target="_blank">
                <h3><?= $repo['full_name'] ?></h3>
            </a>
            <?php if ($repo['fork']): ?>
                <span class="fork-badge">Forked</span>
            <?php endif; ?>
        </div>
        <p class="repo-description"><?= $repo['description'] ?></p>
        <div class="repo-meta">
            <span class="language-tag"><?= $repo['language'] ?></span>
            <span class="stars">
                <i class="fas fa-star"></i> <?= $repo['stargazers_count'] ?>
            </span>
            <span class="updated">Updated: <?= date('M d, Y', strtotime($repo['updated_at'])) ?></span>
        </div>
    </div>`;
    }
