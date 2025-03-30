<?php
namespace Core;

trait Media {
//actiongrp unsplash
protected $UNSPLASH_URL='https://api.unsplash.com/search/photos/';

protected function validateImg($img) {
    return !$img ? "/asset/img/myface.jpg" : (strpos($img, '/') === 0 ? $img : MEDIA_URL . $img);
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


protected function generateImg($prompt){
    $url = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1';
    $headers = [
        'Authorization: Bearer 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'
    ];
    $data = json_encode(['inputs' => $prompt]);
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
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

    /**
     * Handle file upload from a POST request
     */
    protected function upload_file($post) {
        $folder = $post['folder'] ?? MEDIA_ROOT;
        $file = $post['file'];
        $uploadDir = "/var/www/media/$folder/";
        $uploadFile = $uploadDir . basename($file['upload_image']['name']);
        $filename = $file['upload_image']['name'];

        if (move_uploaded_file($file['upload_image']['tmp_name'], $uploadFile)) {
            $insert = $this->db->inse($folder, ["filename" => $filename, "sort" => 9999]);

            return $insert
                ? ['filename' => $filename, 'sort' => 9999, 'id' => $insert]
                : ['error' => 'Failed to save file in the database'];
        } else {
            return ['error' => 'Failed to upload file'];
        }
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

  // The function that retrieves the media files and directories
  protected function getMedia(array $get=[]):array {
      // Extract parameters from the request
      $folder = $get['folder'] ?? MEDIA_ROOT;
      $pag = (int)($get['pag'] ?? 1);
      $limit = (int)($get['limit'] ?? 10);
      $offset = ($pag - 1) * $limit;

      // Check if the folder exists
      if (!is_dir($folder)) {
          return ['error' => 'Directory does not exist: ' . $folder];
      }

      // Get the list of files in the folder
      $allFiles = array_diff(scandir($folder), ['..', '.']);
      if ($allFiles === false) {
          return ['error' => 'Failed to read directory'];
      }

      // Slice the files to apply pagination
      $files = array_slice($allFiles, $offset, $limit);
      if (empty($files)) {
          return ['error' => 'No files found'];
      }
      // Prepare the response with files, directories, and pagination details
      $response = [
          'files' => [],
          'directories' => glob(MEDIA_ROOT."*",GLOB_ONLYDIR),
          'total' => count($allFiles),
          'page' => $pag,
          'limit' => $limit,
          'currentFolder' => $folder,
          'urlfolder' => MEDIA_URL,
          'basefolder' => basename($folder),
          'parentFolder' => dirname($folder),
      ];

      // Separate files and directories
      foreach ($files as $file) {
          if (is_dir($folder . '/' . $file)) {
              $response['directories'][] = $file;
          } else {
              $response['files'][] = $file;
          }
      }

      return $response;
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


}
