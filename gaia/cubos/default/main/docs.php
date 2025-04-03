<style>
/* Main Layout */
.doc-container {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 250px;
    background-color: #f5f5f5;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid #ddd;
    padding-top: 60px; /* Space for fixed header */
}

main {
    flex: 1;
    margin-left: 250px; /* Ensure content is not under the sidebar */
}

/* Navigation */
.nav-menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.selected {
    background: #333;
    color: white;
}

.nav-menu a {
    display: block;
    padding: 12px 20px;
    text-decoration: none;
    transition: all 0.3s;
    border-bottom: 1px solid #e0e0e0;
}

.nav-menu a:hover {
    background-color: #575757;
    color: white;
}

.nav-header {
    padding: 15px 20px;
    font-weight: bold;
    font-size: 1.1em;
    cursor: pointer;
    position: relative;
}

.nav-header:after {
    content: '+';
    position: absolute;
    right: 20px;
    transition: transform 0.3s;
}

.nav-header.collapsed:after {
    content: '-';
}

.sub-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.sub-menu.collapsed {
    max-height: 0;
}

.sub-menu.expanded {
    max-height: 1000px; /* Adjust based on your content */
}

/* Content Styling */
.post-container {
    max-width: 800px;
    margin: 0 auto;
}

.post {
    background: white;
    padding: 25px;
    margin-bottom: 30px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    height: 100vh;
}

.post-title {
    color: #333;
    margin-top: 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.post-meta {
    color: #777;
    font-size: 0.9em;
    margin-bottom: 15px;
}

.post-content {
    line-height: 1.6;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Collapsible functionality
    const headers = document.querySelectorAll('.nav-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const subMenu = this.nextElementSibling;
            this.classList.toggle('collapsed');
            subMenu.classList.toggle('collapsed');
            subMenu.classList.toggle('expanded');
        });

        // Initialize collapsed state
        const subMenu = header.nextElementSibling;
        header.classList.add('collapsed');
        subMenu.classList.add('collapsed');
    });
});
</script>
        <?php echo $this->formSearch('gen_admin.cubo','buildCoreTable2'); ?>
<?php
$this->buildDoc();
?>