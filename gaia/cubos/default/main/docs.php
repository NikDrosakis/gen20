<style>
/* Main Layout */
a img{width:30px;margin:5px;}
a span{width:30px;margin:5px;}
h2 img{width:60px;margin:10px;}
.edit-bar {
    text-align: right;
    margin: 10px 20px 0 0;
}

.edit-bar button {
    background: #007bff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 3px;
    cursor: pointer;
}

.edit-bar button.editing {
    background: #28a745;
}

.doc-container {
    min-height: 100vh;
}

.sidebar {
min-width: 250px;
    background-color: #f5f5f5;
    float: left;
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid #ddd;
    padding-top: 60px;
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
    padding: 8px 20px;
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
    let editMode = false;

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

    let editMode = false;
});

function toggleEditMode() {
    const content = document.querySelector('.post-content');
    const button = document.getElementById('toggleEdit');

    if (!content) return;

    if (!editMode) {
        content.contentEditable = true;
        content.classList.add('editable');
        content.focus();
        button.innerText = '💾 Save';

        // ✅ Προσθέτουμε δυναμικά το onkeyup όταν μπαίνεις σε edit mode
      //  content.addEventListener('keyup', contentKeyupHandler);
    } else {
        content.contentEditable = false;
        content.classList.remove('editable');
        button.innerText = '✏️ Edit';

        // Optional save
        docChanged(content);

        // ✅ Αφαιρούμε τον handler για καθαρότητα
        //content.removeEventListener('keyup', contentKeyupHandler);
    }
    editMode = !editMode;
}

// ✅ Χειριστής για το onkeyup
function contentKeyupHandler(e) {
    if (editMode) {
        docChanged(e.target); // ή contentEl
    }
}

async function docChanged(contentEl) {
    const newDoc = contentEl.innerHTML.trim();
    console.log(newDoc)
    if (!newDoc) return console.warn("No system name or content to save");
    const newDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
            const update = await gs.api.maria.q(
                "UPDATE gen_admin.systems SET doc = ?, modified= ? WHERE name = ?",
                [newDoc, newDate, G.GET.system]
            );
        console.log("Doc updated");
    } catch (err) {
        console.error("Error updating doc:", err);
    }
}

</script>

<?php echo $this->buildDoc(); ?>

