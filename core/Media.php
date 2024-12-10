<?php
namespace Core;

trait Media {

protected function validateImg($img){
return !$img ? "/admin/img/myface.jpg" : (strpos($img, 'https://') === false ? MEDIA_URL . $img: $img);
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
xecho($mediaData);
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

      echo $this->formPagination($totalPages,$page);
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

}
