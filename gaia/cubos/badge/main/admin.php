<style>
.badge-cubo-container {
    position: relative;
    width: 100%;
    overflow: hidden;
    background-color: #f9f9f9;
}
.badge-cubo {
    display: flex;
    transition: transform 0.5s ease;
}
.badge-card {
    min-width: 100%;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    background-color: #fff;
}
.badge-icon {
    font-size: 3rem;
}
.badge-nav {
    position: absolute;
    top: 50%;
    cursor: pointer;
    font-size: 24px;
    user-select: none;
}
.nav-left {
    left: 10px;
}
.nav-right {
    right: 10px;
}
</style>

<div class="badge-cubo-container">
    <div class="badge-cubo" id="badgeCubo">
        <div class="badge-card" id="level1">
            <div class="badge-icon">🏆</div>
            <h4>Level 1 - Newcomer</h4>
            <p>Welcome to the journey! This badge marks your first step.</p>
        </div>
        <!-- Additional levels 2 to 10 can be dynamically generated based on data -->
    </div>
    <div class="badge-nav nav-left" onclick="navigateBadge(-1)">&#10094;</div>
    <div class="badge-nav nav-right" onclick="navigateBadge(1)">&#10095;</div>
</div>

<script>
    let currentBadgeIndex = 0;
    const totalBadges = 10;

    function navigateBadge(direction) {
        const badgeCubo = document.getElementById('badgeCubo');
        currentBadgeIndex = (currentBadgeIndex + direction + totalBadges) % totalBadges;

        badgeCubo.style.transform = `translateX(-${currentBadgeIndex * 100}%)`;
    }

    // Data for badges can be loaded from a server or predefined object for each level
    const badgeData = [
        { level: 1, title: "Newcomer", icon: "🏆", description: "This badge marks your first step." },
        { level: 2, title: "Explorer", icon: "🌍", description: "You have completed your first goal!" },
        // ...up to level 10
    ];

</script>
