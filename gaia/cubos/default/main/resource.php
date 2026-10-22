<?php
//$this->storeAction();
xecho ($this->yaml2json());
// Usage example
$tags = 'books, libraries';
$images = $this->fetchAction($tags);

if (isset($images['error'])) {
    echo 'Error fetching images: ' . implode(', ', $images['error']);
} else {
    foreach ($images as $imageUrl) {
        echo '<img src="' . $imageUrl . '" alt="Image related to ' . htmlspecialchars($tags) . '">';
    }
}
$this->storeAction();