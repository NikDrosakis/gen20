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
$docsMap = [
  // κεφαλαιο / θεμα => [πίνακας, σειρά_εμφάνισης]
  ['chapter' => '01. Εισαγωγή & Συστήματα',      'table' => 'gen_admin.systems',        'sortby' => 'name', 'alias' => 'Subsystem'],
  ['chapter' => '02. Core Classes & Traits',     'table' => 'gen_admin.filemetacore',   'sortby' => 'name', 'alias' => 'CoreClass'],
  ['chapter' => '03. Cubos: UI+Backend Units',   'table' => 'gen_admin.cubo',           'sortby' => 'name', 'alias' => 'Cubo'],
  ['chapter' => '04. Δημόσια Βάση',              'table' => "{$this->publicdb}.metadata", 'sortby' => 'name', 'alias' => 'PublicDB'],
  ['chapter' => '05. Dashboard',                'table' => 'gen_admin.metadata',       'sortby' => 'name', 'alias' => 'AdminDB'],
  ['chapter' => '06. API & WebSockets',          'table' => 'gen_admin.api',            'sortby' => 'name', 'alias' => 'API'],
  ['chapter' => '07. WS & Signals',       'table' => 'gen_admin.ws',             'sortby' => 'name', 'alias' => 'WS'],
  ['chapter' => '08. CLI & Devflow',    'table' => 'gen_admin.cli',            'sortby' => 'name', 'alias' => 'CLI'],
  ['chapter' => '09. Use Cases / Deployments',   'table' => 'gen_admin.usecases',       'sortby' => 'name', 'alias' => 'UseCase']
];
    $categories = [
        'Introduction to Gen20' => "SELECT name, doc, modified,img FROM gen_admin.systems WHERE status > 0",
        'Core Systems & Infrastructure' => "SELECT name, doc, modified,img FROM gen_admin.systems WHERE status > 0",
        'Class & Trait Architecture' => "SELECT name, doc, modified,img FROM gen_admin.filemetacore",
        'Cubos: The Dynamic Frontend & Backend Abstraction' => "SELECT name, doc, modified, img FROM gen_admin.cubo",
        'Database Maria Public' => "SELECT name, description as doc, modified,img FROM {$this->publicdb}.metadata",
        'Database Maria Administration' => "SELECT name, description as doc, modified,img FROM gen_admin.metadata",
        'Action-Driven Ecosystem: Events & Automations' => "SELECT name, doc, modified,img FROM gen_admin.cubo",
        'API & WebSocket Communication' => "SELECT name, doc, modified,img FROM gen_admin.cubo",
        'Extending & Customizing Gen20' => "SELECT name, doc, modified,img FROM gen_admin.cubo",
        'Gen20 Development Workflow & Tooling' => "SELECT name, doc, modified,img FROM gen_admin.cubo",
        'Use Cases & Deployment Strategies' => "SELECT name, doc, modified,img FROM gen_admin.cubo"
    ];
    $activeSystem = $_GET['system'] ?? '';
        $output = '<div class="sidebar">';
         //   $output .= $this->formSearch('gen_admin.cubo','buildCoreTable2');
            foreach ($categories as $category => $query) {
                $output .= '<div class="nav-header">' . htmlspecialchars($category) . '</div>';
                $output .= '<ul class="nav-menu sub-menu">';

                $items = $this->db->fa($query);
                foreach ($items as $item) {
                    $selected = ($item['name'] === $activeSystem) ? 'selected' : '';
                    $output .= '<a class="' . $selected . '" href="/admin/docs?system=' . htmlspecialchars($item['name']) . '">';
                    $output .= $item['img']
                        ? '<img src="'.$item['img'].'">'
                        : '<span style="font-size:24px;">📖</span>';
                    $output .= htmlspecialchars(ucfirst($item['name'])) . '</a>';
                }
                $output .= '</ul>';
            }
            $output .= '</div>'; // Close sidebar
        return $output;
}

protected function buildDoc() {
    $activeSystem = $_GET['system'] ?? false;
         $output .=  $this->menuDoc();
        $output .= '<div class="post-container">';
        $output .= '<article class="post">';
    // Fetch document content
    if(!$activeSystem){
    //first page
    $output .= '<img src="https://gen20.net/img/gem20_logo.png">';
    $output .= $this->is['version'];

    }else{
    $post = $this->db->f("SELECT * FROM gen_admin.systems WHERE name = ?", [$activeSystem]);
    $output .= '<div class="doc-container">';
    if ($post) {
        $output .= '<h2 class="post-title">';
        $output .= $post['img']
        ? '<img src="'.$post['img'].'">'
        : '<span style="font-size:24px;">📖</span>';
        $output .=  htmlspecialchars(ucfirst($post['name']));
        $output .= '</h2>';
        $output .= '<div class="post-meta">Last updated: ' . date('F j, Y H:i', strtotime($post['modified'])) . '</div>';
        //removed inline listeners replaced with document.querySelector('.post-content').addEventListener('keyup', saveThis);
        $output .= '<div class="edit-bar"><button id="toggleEdit" onclick="toggleEditMode()">✏️ Edit</button></div>';
        $output .= '<div class="post-content">' . ($post['doc'] ? $this->md_decode($post['doc']) : '') . '</div>';
    } else {
        $output .= '<h2>';
        $output .=  ucfirst($this->SYSTEM);
        $output .= 'No Documentation Found</h2>';
        $output .= '<div class="edit-bar"><button id="toggleEdit" onclick="toggleEditMode()">✏️ Edit</button></div>';
        $output .= '<div class="post-content"><p>This system doesn’t have any documentation posts yet.</p></div>';
    }
    }
    $output .= '</article>';
    $output .= '</div>';
    $output .= '</div>';
    return $output;
    }


}

