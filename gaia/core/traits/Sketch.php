<?php
namespace Core\Traits;

trait Sketch {

    /**
     * Returns a list of thumbnails (video + image) matched by basename.
     *
     * @return array
     */
protected function getSketchThumbnails(): array {

//    $videoWebPath = $this->SITE_URL . 'media/sketch_video/';
  //  $videoLocalPath = $this->MEDIA_ROOT . 'sketch_video/';
//    $imgWebPath = $this->SITE_URL . 'media/sketch_img/';
//    $imgLocalPath = $this->MEDIA_ROOT . 'sketch_img/';

  //  if (!is_dir($videoLocalPath) || !is_dir($imgLocalPath)) {
    //    return [];
    //}

    //$videoFiles = scandir($videoLocalPath);
    //$imageFiles = scandir($imgLocalPath);

    //$videoFiles = array_filter($videoFiles, fn($f) => preg_match('/\.mp4$/i', $f));
    //$imageFiles = array_filter($imageFiles, fn($f) => preg_match('/\.(jpg|jpeg|png|gif)$/i', $f));

 $userid = $_COOKIE['GENUID'] ?? null;
    if (!$userid) return [];

    $media = $this->db->fa("
        SELECT name, mediatype, filepath
        FROM {$this->publicdb}.media
        WHERE userid = ? AND mediatype IN ('image', 'video')
    ", [$userid]);

    if (!$media) return [];

    // Normalize function to strip suffixes like '-noir'
    $normalizeName = function(string $name): string {
        // Remove known suffix patterns (e.g., '-noir')
        return preg_replace('/(-noir)$/i', '', $name);
    };

    $thumbnailsAssoc = [];

    foreach ($media as $row) {
        $originalName = $row['name'];
        $baseName = $normalizeName($originalName);
        $type = $row['mediatype'];
        $url = $row['filepath'];

        // Group by normalized base name
        $thumbnailsAssoc[$baseName][$type] = $url;
    }

    $thumbnails = [];

    foreach ($thumbnailsAssoc as $name => $types) {
        $thumbnails[] = [
            'name' => $name,
            'types' => $types,
        ];
    }

    return $thumbnails;
}


protected function delSketchFile($array): array {
    $filename = is_array($array) ? $array['name'] ?? '' : $array;

    $path = $this->MEDIA_ROOT . $filename;
    $deleted = false;

    if (file_exists($path)) {
        $deleted = unlink($path);
    }
error_log("Deleting file: $path");
    if (!$deleted) {
        return [
            'status' => 500,
            'success' => false,
            'message' => 'File not found.',
            'deleted' => $deleted
        ];
    }
    return [
        'status' => 200,
        'success' => true,
        'deleted' => $deleted
    ];
}

function importSketchMediaToDb() {
    $userid = 30;
    $mediagrpid = 1;
    $status = 0;
    $privacy = 1;
    $sort = 0;
    $folders = [
        'sketch_img' => 'image',
        'sketch_video' => 'video'
    ];

    foreach ($folders as $folder => $type) {
        $fullPath = rtrim($this->MEDIA_ROOT, '/') . '/' . $folder;

        if (!is_dir($fullPath)) {
            echo "⛔ Folder not found: $fullPath\n";
            continue;
        }

        foreach (scandir($fullPath) as $file) {
            if ($file === '.' || $file === '..') continue;

            $filepath = $folder . '/' . $file;
            // Optional: skip if already exists
            $check = $this->db->f("SELECT id FROM {$this->publicdb}.media WHERE filepath = ?",[$filepath]);
            if ($check) {
                echo "⏩ Skipped existing: $filepath\n";
                continue;
            }

            $data = [
                'userid'     => $userid,
                'img'        => ($type === 'image') ? $file : null,
                'mediagrpid' => $mediagrpid,
                'name'       => pathinfo($file, PATHINFO_FILENAME),
                'title'      => ucfirst(pathinfo($file, PATHINFO_FILENAME)),
                'mediatype'  => $type,
                'filepath'   => $filepath,
                'status'     => $status,
                'privacy'    => $privacy,
                'created'    => date('Y-m-d H:i:s'),
                'modified'   => date('Y-m-d H:i:s'),
                'sort'       => $sort
            ];

            $this->db->inse($this->publicdb.'.media', $data); // 👈 insert via custom function
            echo "✅ Imported: $filepath\n";
        }
    }
}


}
