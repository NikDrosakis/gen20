<?php
namespace Core;
use Core\Traits\Kronos;

trait Sketch {
    use Kronos;

    /**
     * Returns a list of thumbnails (video + image) matched by basename.
     *
     * @return array
     */
    public function getSketchThumbnails(): array {
        $videoWebPath = $this->SITE_URL . 'media/sketch_video/';
        $videoLocalPath = $this->MEDIA_ROOT . 'sketch_video/';
        $imgWebPath = $this->SITE_URL . 'media/sketch_img/';
        $imgLocalPath = $this->MEDIA_ROOT . 'sketch_img/';

        // Ensure directories exist
        if (!is_dir($videoLocalPath) || !is_dir($imgLocalPath)) {
            return [];
        }

        $videoFiles = scandir($videoLocalPath);
        $imageFiles = scandir($imgLocalPath);

        $videoFiles = array_filter($videoFiles, fn($f) => preg_match('/\.mp4$/i', $f));
        $imageFiles = array_filter($imageFiles, fn($f) => preg_match('/\.(jpg|jpeg|png|gif)$/i', $f));

        $thumbnails = [];

        foreach ($videoFiles as $file) {
            $base = pathinfo($file, PATHINFO_FILENAME);
            $thumbnails[$base]['video'] = $videoWebPath . $file;
        }

        foreach ($imageFiles as $file) {
            $base = pathinfo($file, PATHINFO_FILENAME);
            $thumbnails[$base]['image'] = $imgWebPath . $file;
        }

        return $thumbnails;
    }
}
