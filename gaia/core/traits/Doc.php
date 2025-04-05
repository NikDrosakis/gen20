<?php
namespace Core\Traits;
use ReflectionClass;
use Exception;

/**
 * Trait for managing method-based documentation
    gets with Gaia help method
 */
trait Doc {
    /**
     * Provides documentation for a method.
     */
    public function addMethodDoc($method): string {
        // Returns the documentation string for the requested method
    }

    /**
     * Deletes documentation for a method.
     */
    public function delMethodDoc($method): string {
        // Returns the documentation string for the requested method
    }


    /**
     * Render documentation for a method.
     */
    public function alterMethodDoc($method): string {
        // Returns the documentation string for the requested method
    }

protected function menuDoc() {
    $categories = [
        'Introduction to Gen20' => "SELECT name, doc FROM gen_admin.systems WHERE status > 0",
        'Core Systems & Infrastructure' => "SELECT name, doc FROM gen_admin.systems WHERE status > 0",
        'Class & Trait Architecture' => "SELECT name, doc FROM gen_admin.filemetacore",
        'Cubos: The Dynamic Frontend & Backend Abstraction' => "SELECT name, doc FROM gen_admin.cubo",
        'Database Maria Public' => "SELECT name, description as doc FROM {$this->publicdb}.metadata",
        'Database Maria Administration' => "SELECT name, description as doc FROM gen_admin.metadata",
        'Action-Driven Ecosystem: Events & Automations' => "SELECT name, doc FROM gen_admin.cubo",
        'API & WebSocket Communication' => "SELECT name, doc FROM gen_admin.cubo",
        'Extending & Customizing Gen20' => "SELECT name, doc FROM gen_admin.cubo",
        'Gen20 Development Workflow & Tooling' => "SELECT name, doc FROM gen_admin.cubo",
        'Use Cases & Deployment Strategies' => "SELECT name, doc FROM gen_admin.cubo"
    ];
    $activeSystem = $_GET['system'] ?? '';
        $output = '<div class="sidebar">';
             echo $this->formSearch('gen_admin.cubo','buildCoreTable2');
            foreach ($categories as $category => $query) {
                $output .= '<div class="nav-header">' . htmlspecialchars($category) . '</div>';
                $output .= '<ul class="nav-menu sub-menu">';
                $items = $this->db->fa($query);
                foreach ($items as $item) {
                    $selected = ($item['name'] === $activeSystem) ? 'selected' : '';
                    $output .= '<a class="' . $selected . '" href="/docs?system=' . htmlspecialchars($item['name']) . '">';
                    $output .= htmlspecialchars($item['name']) . '</a>';
                }
                $output .= '</ul>';
            }
            $output .= '</div>'; // Close sidebar
        return $output;
}

protected function buildDoc() {
    $activeSystem = $_GET['system'] ?? '';
    echo $this->menuDoc();

    // Fetch document content
    $post = $this->db->f("SELECT * FROM gen_admin.systems WHERE name = ?", [$activeSystem]);

    $output = '<div class="doc-container">';
    if ($post) {
        $output .= '<main>';
        $output .= '<div class="post-container">';
        $output .= '<article class="post">';
        $output .= '<h2 class="post-title">' . htmlspecialchars($post['name']) . '</h2>';
        $output .= '<div class="post-meta">Last updated: ' . date('F j, Y', strtotime($post['created'])) . '</div>';
        //removed inline listeners replaced with document.querySelector('.post-content').addEventListener('keyup', saveThis);
        $output .= '<div class="edit-bar"><button id="toggleEdit" onclick="toggleEditMode()">✏️ Edit</button></div>';
        $output .= '<div class="post-content">' . ($post['doc'] ? $this->md_decode($post['doc']) : '') . '</div>';
        $output .= '</article>';
    } else {
        $output .= '<div class="post"><h2>No Documentation Found</h2>';
        $output .= '<p>This system doesn’t have any documentation posts yet.</p></div>';
    }

    $output .= '</div></main>';
    $output .= '</div>';
    return $output;
}


}

