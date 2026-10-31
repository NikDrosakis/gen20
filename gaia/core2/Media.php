<?php
namespace Core\Traits;

trait Media {
//actiongrp unsplash
protected $UNSPLASH_URL='https://api.unsplash.com/search/photos/';

protected function validateImg($img) {
    return !$img ? "/asset/img/myface.jpg" : (strpos($img, '/') === 0 ? $img : MEDIA_URL . $img);
}

/**
 * Create a new folder/directory
 *
 * @param array $post Request data containing parentPath and folderName
 * @return array Response with success status and folder info
 */
protected function createFolder($post) {
    // Validate required parameters
    $parentPath = $post['parentPath'] ?? $post['folder'] ?? null;
    $folderName = $post['folderName'] ?? $post['name'] ?? null;

    if (!$parentPath) {
        return [
            'success' => false,
            'error' => 'Parent path is required'
        ];
    }

    if (!$folderName) {
        return [
            'success' => false,
            'error' => 'Folder name is required'
        ];
    }

    // Sanitize folder name - remove unsafe characters
    $folderName = preg_replace('/[^a-zA-Z0-9\s\_\-\.]/', '', trim($folderName));

    if (empty($folderName)) {
        return [
            'success' => false,
            'error' => 'Invalid folder name. Use only letters, numbers, spaces, underscores, and hyphens'
        ];
    }

    // Build the full path
    $fullPath = rtrim($parentPath, '/') . '/' . $folderName;

    // Security: Ensure the path is within MEDIA_ROOT
    $mediaRoot = rtrim(MEDIA_ROOT, '/');
    $realParentPath = realpath($parentPath);
    $realMediaRoot = realpath($mediaRoot);

    if (!$realParentPath || strpos($realParentPath, $realMediaRoot) !== 0) {
        return [
            'success' => false,
            'error' => 'Access denied: Cannot create folder outside media root'
        ];
    }

    // Check if folder already exists
    if (is_dir($fullPath)) {
        return [
            'success' => false,
            'error' => 'Folder already exists: ' . $folderName
        ];
    }

    // Attempt to create the folder
    if (mkdir($fullPath, 0755, false)) {
        return [
            'success' => true,
            'data' => [
                'name' => $folderName,
                'path' => $fullPath,
                'relative_path' => str_replace($mediaRoot, '', $fullPath),
                'parent_path' => $parentPath
            ],
            'message' => 'Folder created successfully'
        ];
    } else {
        return [
            'success' => false,
            'error' => 'Failed to create folder due to filesystem permissions'
        ];
    }
}

protected function deleteMedia($params)
{
    if (is_array($params)) {
        $filePath = $params['path'] ?? $params['filename'] ?? $params[0] ?? null;
        $folder = $params['folder'] ?? MEDIA_ROOT;
    } else {
        $filePath = $params;
    }

    if (!$filePath) {
        return ['error' => 'File path required'];
    }

    // Αν είναι μόνο filename, βρες το path
    if (strpos($filePath, '/') === false) {
        $domain = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $filePath = "{$folder}/{$filePath}";
    }

    $realPath = realpath($filePath);
    if (!$realPath || !file_exists($realPath)) {
        return ['error' => 'File not found'];
    }

        if (unlink($realPath)) {
        return ['message' => 'File deleted successfully'];
    }

    return ['error' => 'Cannot delete file'];
}


 /**
      that's the plan resource_img_columns: combines actiongrp unsplash, action unsplash, executing
      @filemetacore.description  Store fetched images to database and local directory based on metadata tags.
       */
      protected function updateImg() {
          // 1. Fetch metadata from the database for entries without images - assoc array
          $metadataRecords = $this->db->flist("SELECT id, meta FROM gen_admin.post ");

          if (empty($metadataRecords)) {
              throw new Exception('No metadata records found for image fetching.');
          }

          // 2. Process each metadata record
          foreach ($metadataRecords as $recordID => $recordMeta) {
              $postId = $recordID;
              if($recordMeta!=null){
              $tags = explode(',', $recordMeta);

              // 3. Fetch images based on the tags
              $images = $this->fetchImages($tags);

              if (empty($images)) {
                  continue; // Skip if no images found for the tags
              }

              // 4. Save each image to local directory and database
              foreach ($images as $image) {
                  $imageId = $image['id'];
                  $imageUrl = $image['urls']['full']; // Full-size image
                  $localFilePath = MEDIA_ROOT . $imageId . '.jpg'; // Save with image ID as filename

if($imageUrl!=null){
                  // Download the image and save locally
                  file_put_contents($localFilePath, file_get_contents($imageUrl));

                  // 5. Insert update database record with image data
                  $this->db->q("UPDATE {$this->publicdb}.post SET img = ? WHERE id = ?", [MEDIA_URL.basename($localFilePath), $postId]);
}
                  // Limit to saving one image per metadata set, or comment out to save all images
                  break;
              }
          }}
      }

  /**
       * Fetch images from Unsplash based on metadata tags.
       *
       * @param array $tags Array of tags to search for images.
       * @param int $perPage Number of images to retrieve per request.
       * @return array Array of image data (URLs, descriptions, etc.).
       */
       // @filemetacore.description fetchImages
   protected function fetchImages($tags, $page = 1, $perPage = 10) {
       $query = implode(',', $tags);

       // action.endpoint
       $url = "{$this->UNSPLASH_URL}?query=" . urlencode($query) . "&page={$page}&per_page={$perPage}&client_id={$this->is['UNSPLASH_API_KEY']}";

//curl routine to get
       $ch = curl_init($url);
       curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
       $response = curl_exec($ch);
       $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
       curl_close($ch);

       if ($httpCode !== 200) {
           return ['error' => "HTTP Error: {$httpCode}", 'response' => $response];
       }

       $data = json_decode($response, true);
       return $data['results'] ?? [];
   }

  protected function updateImgs2() {
      $metadataRecords = $this->db->flist("SELECT id, meta FROM gen_admin.actiongrp WHERE img IS NULL");

      if (empty($metadataRecords)) {
          echo "No metadata records found for image fetching.\n";
          return;
      }

      foreach ($metadataRecords as $recordID => $recordMeta) {
          $postId = $recordID;
          if ($recordMeta === null) continue;

          $tags = explode(',', $recordMeta);
          $images = $this->fetchImages($tags);

          if (empty($images)) {
              echo "No images found for metadata tags: " . implode(', ', $tags) . "\n";
              continue;
          }

          foreach ($images as $image) {
              $imageId = $image['id'];
              $imageUrl = $image['urls']['full'];
              $localFilePath = MEDIA_ROOT . $imageId . '.jpg';

              if ($imageUrl) {
                  file_put_contents($localFilePath, file_get_contents($imageUrl));
                  $this->db->q("UPDATE actiongrp SET img = ? WHERE id = ?", [MEDIA_URL . basename($localFilePath), $postId]);
                  echo "Image saved and resource updated: {$localFilePath}\n";
                  break; // Save only one image per record
              }
          }
      }
  }


// Core/Traits/Media.php - modified generateImg
// Core/Traits/Media.php
// Core/Traits/Media.php
protected function generateImg($params = null) {
    // 1. Prompt
    if (is_array($params) && !empty($params['prompt'])) {
        $prompt = trim($params['prompt']);
    } elseif (!empty($_POST['prompt'])) {
        $prompt = trim($_POST['prompt']);
    } else {
        $input = json_decode(file_get_contents('php://input'), true);
        $prompt = trim($input['prompt'] ?? '');
    }

    if (empty($prompt)) {
        return ['success' => false, 'error' => 'Prompt is required'];
    }

    // 2. API key
    $apiKey = getenv('POLLINATIONS_API_KEY') ?: '';
    if (empty($apiKey)) {
        return ['success' => false, 'error' => 'POLLINATIONS_API_KEY not configured'];
    }

    // 3. ΝΕΟ endpoint: GET /image/{prompt}
    $imageUrl = 'https://gen.pollinations.ai/image/' . rawurlencode($prompt)
        . '?model=black-forest-labs/flux.1-schnell'
        . '&width=1024&height=1024'
        . '&seed=' . random_int(1, 999999)
        . '&nologo=true';   // δοκίμασε, μπορεί να μην υποστηρίζεται

    $ch = curl_init($imageUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Accept: image/*',
        ],
        CURLOPT_TIMEOUT => 180,
        CURLOPT_CONNECTTIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; MediaManager/1.0)',
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $curlErrno = curl_errno($ch);
    $curlError = curl_error($ch);
    curl_close($ch);

    // 4. cURL errors
    if ($response === false || $httpCode === 0) {
        error_log("[generateImg] cURL #{$curlErrno}: {$curlError}");
        return [
            'success' => false,
            'error' => "Pollinations unreachable (cURL #{$curlErrno})",
            'details' => $curlError,
        ];
    }

    // 5. HTTP errors (402 = insufficient balance, 401 = bad key)
    if ($httpCode !== 200) {
        $body = substr($response, 0, 500);
        error_log("[generateImg] Pollinations HTTP {$httpCode}: {$body}");
        return [
            'success' => false,
            'error' => "Pollinations error: HTTP {$httpCode}",
            'details' => $body,
        ];
    }

    // 6. Έλεγξε αν είναι εικόνα
    if (strpos($contentType ?? '', 'image/') === false) {
        return [
            'success' => false,
            'error' => 'Pollinations returned non-image response',
            'details' => substr($response, 0, 500),
        ];
    }

    // 7. Target folder
    $mediaRoot = rtrim(MEDIA_ROOT, '/');
    $targetFolder = $mediaRoot;

    $requestedFolder = '';
    if (is_array($params) && !empty($params['folder'])) {
        $requestedFolder = $params['folder'];
    } elseif (!empty($_POST['folder'])) {
        $requestedFolder = $_POST['folder'];
    }

    if (!empty($requestedFolder)) {
        if (strpos($requestedFolder, $mediaRoot) === 0) {
            $targetFolder = rtrim($requestedFolder, '/');
        } else {
            $targetFolder = $mediaRoot . '/' . ltrim($requestedFolder, '/');
            $targetFolder = rtrim($targetFolder, '/');
        }
    }

    if (!is_dir($targetFolder)) {
        if (!@mkdir($targetFolder, 0755, true) && !is_dir($targetFolder)) {
            return ['success' => false, 'error' => 'Cannot create target folder'];
        }
    }

    if (strpos($targetFolder, $mediaRoot) !== 0) {
        return ['success' => false, 'error' => 'Invalid target folder'];
    }

    // 8. Save
    $filename = 'ai_' . time() . '_' . bin2hex(random_bytes(4)) . '.jpg';
    $filepath = $targetFolder . '/' . $filename;

    if (file_put_contents($filepath, $response) === false) {
        return ['success' => false, 'error' => 'Failed to save image'];
    }

    // 9. URL
    $relativePath = substr($filepath, strlen($mediaRoot));
    $imageUrlOut = rtrim(MEDIA_URL, '/') . '/' . ltrim($relativePath, '/');

    return [
        'success' => true,
        'image_url' => $imageUrlOut,
        'filename' => $filename,
        'path' => $filepath,
        'size' => filesize($filepath),
        'prompt' => $prompt,
    ];
}
    /**
     * Upload media from a URL
     */
    protected function upload_url($post) {
        $folder = $post['folder'] ?? MEDIA_ROOT;
        $url = $post['url'];
        $filename = $this->sanitizeFilename(basename($url));
        $caption = $post['caption'] ?? '';
        $targetFilePath = "/var/www/media/$folder/" . $filename;

        if (file_put_contents($targetFilePath, file_get_contents($url))) {
            $insert = $this->db->inse($folder, ["filename" => $filename, "caption" => $caption, "sort" => 9999]);

            return $insert
                ? ['filename' => $filename, 'caption' => $caption, 'sort' => 9999, 'id' => $insert]
                : ['error' => 'Error saving file to database'];
        } else {
            return ['error' => 'Failed to download image'];
        }
    }
// Core/Traits/Media.php
/**
 * Handle file upload from a POST request
 */
public function uploadFile($params = null) {
    // Check if file exists
    if (!isset($_FILES['upload_image']) || $_FILES['upload_image']['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'No file received'];
    }

    $file = $_FILES['upload_image'] ?? null;
    $uploadDir = $_POST['folder'] ?? $params['folder'] ?? MEDIA_ROOT;

    // Create directory if not exists
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $filename = basename($file['name']);
    $uploadFile = rtrim($uploadDir, '/') . '/' . $filename;

    if (move_uploaded_file($file['tmp_name'], $uploadFile)) {
        return [
            'success' => true,
            'data' => [
                'filename' => $filename,
                'path' => $uploadFile,
                'size' => $file['size']
            ]
        ];
    }
    return ['success' => false, 'error' => 'Move failed'];
}
    /**
     * Upload media directly by filename and caption
     */
    protected function upload_media($post) {
        $folder = $post['folder'] ?? 'default_folder'; // Define a default folder if none is provided
        $filename = $post['filename'];
        $caption = $post['caption'] ?? '';

        // Insert into the specified folder
        $insert = $this->db->inse($folder, ["filename" => $filename, "caption" => $caption, "sort" => 9999]);

        return $insert
            ? [
                'status' => 'success',
                'filename' => $filename,
                'caption' => $caption,
                'sort' => 9999,
                'id' => $insert
              ]
            : ['status' => 'fail'];
    }

    /**
     * Fetch media files from a directory with pagination
     */
  // The function that loads and renders the media gallery
  protected function loadMedia(array $get=[]) {
      // Call getMedia to retrieve the files and directories
      $mediaData = $this->getMedia($get);

      // Check for errors in the response from getMedia
      if (isset($mediaData['error'])) {
          echo '<div class="error">' . htmlspecialchars($mediaData['error']) . '</div>';
          return;
      }

      // Extract the media files and directories
      $files = $mediaData['files'];
      $directories = $mediaData['directories'];
      $total = $mediaData['total'];
      $urlfolder = $mediaData['urlfolder'];
      $limit = $mediaData['limit'];
      $page = $mediaData['page'];
      $currentFolder = $mediaData['currentFolder'];
      $parentFolder = $mediaData['parentFolder'];
      // Calculate total pages for pagination
      $totalPages = ceil($total / $limit);

      // Display "parent folder" link if not in the root directory
      if ($currentFolder !== MEDIA_ROOT) {
          echo '<div class="folder" data-folder="' . htmlspecialchars($parentFolder) . '">..</div>';
      }

      // Loop through directories and display them
      foreach ($directories as $directory) {
          echo '<div class="folder" data-folder="' . htmlspecialchars($directory) . '">';
          echo htmlspecialchars($directory);
          echo '</div>';
      }

      // Loop through files and display them as images
     foreach ($files as $file) {
          $filePath = $urlfolder. htmlspecialchars($file);
          echo '<img src="' . $filePath . '" data-filename="' . htmlspecialchars($file) . '" alt="' . htmlspecialchars($file) . '" class="thumbnail" draggable="true">';
      }

   //   echo $this->formPagination($totalPages,$page);
  }

protected function getMedia(array $get = []): array {
    $folder = $get['folder'] ?? MEDIA_ROOT;
    $pag = (int)($get['pag'] ?? $get['page'] ?? 1);
    $limit = (int)($get['limit'] ?? 10);
    $offset = ($pag - 1) * $limit;

    if (!is_dir($folder)) {
        return ['error' => 'Directory does not exist: ' . $folder];
    }

    $allItems = array_diff(scandir($folder), ['..', '.']);
    if ($allItems === false) {
        return ['error' => 'Failed to read directory'];
    }

    $directories = [];
    $allFiles = [];   // ← τώρα θα κρατάει ['name' => ..., 'mtime' => ...]

    foreach ($allItems as $item) {
        $fullPath = $folder . '/' . $item;
        if (is_dir($fullPath)) {
            $directories[] = $item;
        } else {
            // ✅ Κράτα mtime για sorting
            $allFiles[] = [
                'name'  => $item,
                'mtime' => @filemtime($fullPath) ?: 0,
            ];
        }
    }

    // ✅ SORT: νεότερο πρώτο (descending mtime)
    usort($allFiles, function ($a, $b) {
        if ($b['mtime'] === $a['mtime']) {
            return strcmp($b['name'], $a['name']); // fallback: αλφαβητικά desc
        }
        return $b['mtime'] <=> $a['mtime'];
    });

    $total = count($allFiles);          // ✅ total ΠΡΙΝ το slice (σωστό)
    $filesPage = array_slice($allFiles, $offset, $limit);

    // ✅ Επέστρεψε μόνο τα filenames (strings) — ίδιο format όπως πριν
    $files = array_map(fn($f) => $f['name'], $filesPage);

    // Subdirectories (ταξινομημένα αλφαβητικά)
    sort($directories, SORT_NATURAL | SORT_FLAG_CASE);
    $subdirectories = [];
    foreach ($directories as $dir) {
        $subdirectories[] = [
            'name' => $dir,
            'path' => $folder . '/' . $dir,
            'relative_path' => str_replace(MEDIA_ROOT, '', $folder . '/' . $dir),
            'file_count' => count(glob($folder . '/' . $dir . '/*')),
        ];
    }

    return [
        'files' => $files,
        'directories' => $directories,
        'subdirectories' => $subdirectories,
        'total' => $total,
        'page' => $pag,
        'limit' => $limit,
        'currentFolder' => $folder,
        'urlfolder' => MEDIA_URL,
        'basefolder' => basename($folder),
        'parentFolder' => dirname($folder),
        'folderName' => basename($folder),
        'canGoUp' => ($folder !== rtrim(MEDIA_ROOT, '/')),
    ];
}
  /**
   * List all folders recursively for dropdown navigation
   *
   * @param string $path Starting path (default: MEDIA_ROOT)
   * @param int $depth Current depth for recursion
   * @return array Nested array of folders
   */
  protected function listFoldersRecursive($path = null, $depth = 0) {
      $path = $path ?? MEDIA_ROOT;

      if (!is_dir($path)) {
          return [];
      }

      $folders = [];
      $directories = glob($path . '/*', GLOB_ONLYDIR);

      foreach ($directories as $dir) {
          $folderName = basename($dir);
          $relativePath = str_replace(MEDIA_ROOT, '', $dir);

          $folders[] = [
              'name' => $folderName,
              'path' => $dir,
              'relative_path' => $relativePath,
              'depth' => $depth,
              'indent' => str_repeat('--', $depth),
              'display_name' => str_repeat('&nbsp;&nbsp;', $depth) . '📁 ' . $folderName,
              'subfolders' => $this->listFoldersRecursive($dir, $depth + 1)
          ];
      }

      return $folders;
  }

  /**
   * Get flattened folder list for dropdown select
   *
   * @param string $path Starting path
   * @return array Flattened list of folders
   */
  protected function getFolderTreeFlat($path = null) {
      $path = $path ?? MEDIA_ROOT;
      $folders = [];

      $this->buildFolderTreeFlat($path, $folders, 0);

      return $folders;
  }

  /**
   * Helper to build flattened folder tree
   *
   * @param string $path Current path
   * @param array &$folders Reference to folders array
   * @param int $depth Current depth
   */
  protected function buildFolderTreeFlat($path, &$folders, $depth = 0) {
      if (!is_dir($path)) {
          return;
      }

      $directories = glob($path . '/*', GLOB_ONLYDIR);
      sort($directories);

      foreach ($directories as $dir) {
          $folderName = basename($dir);
          $relativePath = str_replace(MEDIA_ROOT, '', $dir);

          $folders[] = [
              'name' => $folderName,
              'path' => $dir,
              'relative_path' => $relativePath,
              'depth' => $depth,
              'indent' => $depth,
              'display' => str_repeat('  ', $depth) . '📁 ' . $folderName
          ];

          $this->buildFolderTreeFlat($dir, $folders, $depth + 1);
      }
  }

  /**
   * API endpoint to get folder tree as JSON
   */
  protected function getFolderTree() {
      $folders = $this->getFolderTreeFlat();

      return [
          'success' => true,
          'data' => [
              'root' => MEDIA_ROOT,
              'root_name' => basename(rtrim(MEDIA_ROOT, '/')),
              'folders' => $folders,
              'total' => count($folders)
          ]
      ];
  }
    /**
     * Sanitize filename to remove unsafe characters
     */
    protected function sanitizeFilename($filename) {
        return preg_replace('/[^a-zA-Z0-9-_\.]/', '', $filename);
    }


protected function updateCuboImg($table = '',$name = '') {
$cubo = is_array($current_cubo) ? $current_cubo['key'] : $current_cubo;
$db=explode('.',$table)[0];

    $cuboFolder = $db=='gen_admin' ? ADMIN_IMG_ROOT . $cubo . "/" : $this->CUBO_ROOT . $cubo . "/";
    $publicFilePath = $cuboFolder . "public.php";

    // Validate Cubo folder and file
    if (!file_exists($publicFilePath)) {
        throw new Exception("Cubo file not found: " . $publicFilePath);
    }

    // Generate the HTML output
    $htmlOutputPath = $cuboFolder . "render.html";
    $html = $this->include_buffer($publicFilePath);

    if (empty($html)) {
        throw new Exception("Failed to load HTML from: " . $publicFilePath);
    }

    // Save the rendered HTML to a file
    file_put_contents($htmlOutputPath, $html);

    // Define output image path
    $outputImagePath = $cuboFolder . 'output_' . $cubo . '.png';

    // Use wkhtmltoimage to convert HTML to PNG
    $command = escapeshellcmd("wkhtmltoimage --quality 90 $htmlOutputPath $outputImagePath");
    exec($command, $output, $resultCode);

    if ($resultCode !== 0) {
        throw new Exception("Error executing wkhtmltoimage: " . implode("\n", $output));
    }

    // Update the database with the new image path
    $this->db->q("UPDATE $table SET img = ? WHERE name = ?", [$outputImagePath, $cubo]);

    return "Image successfully saved as $outputImagePath";
}

protected function downloadExternalImage(array $params=[]):array {
    $imageUrl = $params['imageUrl'] ?? $params['url'] ?? null;
    $postName = $params['postName'] ?? $params['post_name'] ?? null;
    $subfolder = $params['subfolder'] ?? '';

    // Validate
    if (!$imageUrl) {
        return ['success' => false, 'error' => 'URL is required'];
    }

    if (!$postName) {
        return ['success' => false, 'error' => 'Post name is required'];
    }

    // Clean URL
    $imageUrl = strtok($imageUrl, '?');

    // Validate URL
    if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
        return ['success' => false, 'error' => 'Invalid URL: ' . $imageUrl];
    }

    // Extract hostname
    $hostname = DOMAIN;
    $extension = strtolower(pathinfo(parse_url($imageUrl, PHP_URL_PATH), PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if (!in_array($extension, $allowedExtensions)) {
        $extension = 'jpg';
    }

    // Generate filename (BEFORE using it)
    $safePostName = preg_replace('/[^a-zA-Z0-9\-]/', '-', $postName);
    $filename = $safePostName . '_' . time() . '.' . $extension;

    // NOW create directory and path (after $filename is defined)
    $uploadDir = "/var/www/gs/media/{$hostname}/{$subfolder}/";
    $localPath = $uploadDir . $filename;
    $localUrl = "/media/nikimourtzi.com/{$subfolder}/{$filename}";

    if (!is_dir($uploadDir)) {
        $oldUmask = umask(0);
        $mkdirResult = mkdir($uploadDir, 0777, true);
        umask($oldUmask);

        if (!$mkdirResult) {
            return ['success' => false, 'error' => 'Cannot create directory: ' . $uploadDir];
        }
    }

    // Check writable
    if (!is_writable($uploadDir)) {
        return ['success' => false, 'error' => 'Directory not writable: ' . $uploadDir];
    }

    // Download image
    $ch = curl_init($imageUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; GEN20-Bot/1.0)');
    curl_setopt($ch, CURLOPT_REFERER, "https://{$hostname}");
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $imageData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    if ($httpCode !== 200 || !$imageData) {
        return [
            'success' => false,
            'error' => "Failed to download image (HTTP {$httpCode})"
        ];
    }
    // Save image
    $bytesWritten = file_put_contents($localPath, $imageData);

    if ($bytesWritten !== false && $bytesWritten > 0) {
        return [
            'success' => true,
            'local_path' => $localPath,
            'local_url' => $localUrl,
            'filename' => $filename,
            'relative_path' => "/media/{$subfolder}/{$filename}",
            'hostname' => $hostname,
            'original_url' => $imageUrl,
            'size' => filesize($localPath)
        ];
    } else {
        return [
            'success' => false,
            'error' => 'Failed to write image to disk. Tried: ' . $localPath
        ];
    }
}

    /**
     * Λήψη screenshot από ένα URL και αποθήκευση στο media library
     */
    protected function captureScreenshot($params = []) {
        $url = $params['url'] ?? null;
        $folder = $params['folder'] ?? ''; // π.χ. 'blog'

        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            return ['success' => false, 'error' => 'Valid URL is required'];
        }

        // API Key για το ScreenshotAPI (βάλε το δικό σου)
        // Ιδανικά χρησιμοποίησε getenv('SCREENSHOT_API_KEY')
        $apiKey = 'YOUR_SCREENSHOT_API_KEY';

        // Κλήση στο ScreenshotAPI.to (ή σε όποιο API διαλέξεις)
        $apiUrl = 'https://screenshotapi.to/api/v1/screenshot?' . http_build_query([
            'url' => $url,
            'width' => 1200,
            'height' => 630,
            'type' => 'png'
        ]);

        $ch = curl_init($apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'x-api-key: ' . $apiKey
            ],
            CURLOPT_TIMEOUT => 60,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; MediaManager/1.0)',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);

        if ($httpCode !== 200 || strpos($contentType, 'image/') === false) {
            return ['success' => false, 'error' => 'Failed to capture screenshot from API'];
        }

        // Αποθήκευση στο σωστό folder (όπως στο generateImg)
        $mediaRoot = rtrim(MEDIA_ROOT, '/');
        $targetFolder = $mediaRoot;

        if (!empty($folder)) {
            if (strpos($folder, $mediaRoot) === 0) {
                $targetFolder = rtrim($folder, '/');
            } else {
                $targetFolder = $mediaRoot . '/' . ltrim($folder, '/');
                $targetFolder = rtrim($targetFolder, '/');
            }
        }

        if (!is_dir($targetFolder)) {
            @mkdir($targetFolder, 0755, true);
        }

        $filename = 'screenshot_' . time() . '_' . bin2hex(random_bytes(4)) . '.png';
        $filepath = $targetFolder . '/' . $filename;

        if (file_put_contents($filepath, $response) === false) {
            return ['success' => false, 'error' => 'Failed to save screenshot to disk'];
        }

        $relativePath = substr($filepath, strlen($mediaRoot));
        $imageUrl = rtrim(MEDIA_URL, '/') . '/' . ltrim($relativePath, '/');

        return [
            'success' => true,
            'image_url' => $imageUrl,
            'filename' => $filename,
            'path' => $filepath,
        ];
    }


}
