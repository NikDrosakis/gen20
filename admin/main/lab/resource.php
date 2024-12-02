<?php
// Usage example
$tags = 'books, libraries';
$images = $this->fetchImages($tags);

if (isset($images['error'])) {
    echo 'Error fetching images: ' . implode(', ', $images['error']);
} else {
    foreach ($images as $imageUrl) {
        echo '<img src="' . $imageUrl . '" alt="Image related to ' . htmlspecialchars($tags) . '">';
    }
}
