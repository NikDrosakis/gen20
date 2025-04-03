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

protected function buildDoc() {
        $categories = [
            'Introduction to Gen20' => "SELECT name, doc FROM gen_admin.systems WHERE status > 0",
            'Core Systems & Infrustructure' => "SELECT name, doc FROM gen_admin.systems WHERE status > 0",
            'Class & Trait Architecture' => "SELECT name,doc FROM gen_admin.filemetacore ",
            'Cubos: The Dynamic Frontend & Backend Abstraction' => "SELECT name,doc FROM gen_admin.cubo ",
            'Database & State Management' => "SELECT name,doc FROM gen_admin.cubo ",
            'Action-Driven Ecosystem: Events & Automations' => "SELECT name,doc FROM gen_admin.cubo ",
            'API & WebSocket Communication' => "SELECT name,doc FROM gen_admin.cubo ",
            'Extending & Customizing Gen20' => "SELECT name,doc FROM gen_admin.cubo ",
            'Gen20 Development Workflow & Tooling' => "SELECT name,doc FROM gen_admin.cubo ",
            'Use Cases & Deployment Strategies' => "SELECT name,doc FROM gen_admin.cubo "
        ];
        $activeSystem = $_GET['system'] ?? '';

        echo '<div class="doc-container">';
        echo '<div class="sidebar">';

        foreach ($categories as $category => $query) {
            echo '<div class="nav-header">' . htmlspecialchars($category) . '</div>';
            echo '<ul class="nav-menu sub-menu">';

            $items = $this->db->fa($query);
            foreach ($items as $item) {
                $selected = ($item['name'] === $activeSystem) ? 'selected' : '';
                echo '<a class="' . $selected . '" href="/docs?system=' . htmlspecialchars($item['name']) . '">';
                echo htmlspecialchars($item['name']);
                echo '</a>';
            }
            echo '</ul>';
        }

        echo '</div>'; // Close sidebar

        echo '<main>';
        echo '<div class="post-container">';
        // Fetch document content
        $post = $this->db->f("SELECT * FROM gen_admin.systems WHERE name = ?", [$activeSystem]);

        if ($post) {
            echo '<article class="post">';
            echo '<h2 class="post-title">' . htmlspecialchars($post['name']) . '</h2>';
            echo '<div class="post-meta">Last updated: ' . date('F j, Y', strtotime($post['created'])) . '</div>';
            echo '<div class="post-content">';
            echo $post['doc'] ? $this->md_decode($post['doc']) : '';
            echo '</div>';
            echo '</article>';
        } else {
            echo '<div class="post">';
            echo '<h2>No Documentation Found</h2>';
            echo '<p>This system doesn’t have any documentation posts yet.</p>';
            echo '</div>';
        }

        echo '</div>'; // Close post-container
        echo '</main>';
        echo '</div>'; // Close doc-container
    }

}

