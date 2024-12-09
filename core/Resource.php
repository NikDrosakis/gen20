<?php
namespace Core;
/**
@filemetacore.sql-create
CREATE TABLE `resources` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `img` VARCHAR(200) DEFAULT NULL COMMENT 'sql-ins: URL of the image',
  `system_id` INT(11) NOT NULL COMMENT 'sql-fetch: Related system reference',
  `name` VARCHAR(300) NOT NULL COMMENT 'sql-fetch: Resource name',
  `company` VARCHAR(200) DEFAULT NULL COMMENT 'sql-ins: Company or provider',
  `conversation_id` VARCHAR(200) DEFAULT NULL COMMENT 'sql-fetch: API or external conversation ID',
  `url_auth` VARCHAR(200) DEFAULT NULL COMMENT 'sql-fetch: URL for authentication',
  `url_get` VARCHAR(200) DEFAULT NULL COMMENT 'sql-fetch: API GET URL',
  `type_of_data` VARCHAR(200) DEFAULT NULL COMMENT 'sql-fetch: Resource type (e.g., photos/videos)',
  `function_executed` TEXT COMMENT 'sql-ins: Stored function or purpose of resource',
  `status` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'sql-ins: Resource activity status',
  `updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),
  `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  `sort` INT(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'sql-fetch: Display order',
  `title` VARCHAR(200) DEFAULT NULL COMMENT 'sql-ins: Resource title',
  `description` TEXT DEFAULT NULL COMMENT 'sql-ins: Detailed description',
  `doc` TEXT DEFAULT NULL COMMENT 'sql-ins: Documentation or notes',
  `meta` TEXT DEFAULT NULL COMMENT 'sql-fetch: Metadata tags'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

@filemetacore.description Get Add Manage Resources from web

@filemetacore.features
Check standard nulls of DB and suggest to complete
Check all resources if active

@filemetacore.todo
- add more NULL img resources
- aDDMore resource text and bw and diff types of images
- Google Books API
- Open Library API
- LibraryThing API
- Use OpenCV, Pillow python job for kronos
*/
trait Resource {
protected $UNSPLASH_URL='https://api.unsplash.com/search/photos/';

  /**
       * Fetch images from Unsplash based on metadata tags.
       *
       * @param array $tags Array of tags to search for images.
       * @param int $perPage Number of images to retrieve per request.
       * @return array Array of image data (URLs, descriptions, etc.).
       */
       // @filemetacore.description fetchResource
   public function fetchResource($tags, $page = 1, $perPage = 10) {
       $query = implode(',', $tags);
       $url = "{$this->UNSPLASH_URL}?query=" . urlencode($query) . "&page={$page}&per_page={$perPage}&client_id={$this->G['is']['UNSPLASH_API_KEY']}";

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


      /**
      @filemetacore.description  Store fetched images to database and local directory based on metadata tags.
       */
      protected function storeResource() {
          // 1. Fetch metadata from the database for entries without images - assoc array
          $metadataRecords = $this->db->flist("SELECT id, meta FROM post ");
xecho($metadataRecords);
          if (empty($metadataRecords)) {
              throw new Exception('No metadata records found for image fetching.');
          }

          // 2. Process each metadata record
          foreach ($metadataRecords as $recordID => $recordMeta) {
              $postId = $recordID;
              if($recordMeta!=null){
              $tags = explode(',', $recordMeta);

              // 3. Fetch images based on the tags
              $images = $this->fetchResource($tags);
xecho($tags);
xecho($images);
              if (empty($images)) {
                  continue; // Skip if no images found for the tags
              }

              // 4. Save each image to local directory and database
              foreach ($images as $image) {
                  $imageId = $image['id'];
                  $imageUrl = $image['urls']['full']; // Full-size image
                  $localFilePath = MEDIA_ROOT . $imageId . '.jpg'; // Save with image ID as filename
xecho($imageUrl);
xecho($localFilePath);
if($imageUrl!=null){
                  // Download the image and save locally
                  file_put_contents($localFilePath, file_get_contents($imageUrl));

                  // 5. Insert update database record with image data
                  $this->db->q("UPDATE post SET img = ? WHERE id = ?", [MEDIA_URL.basename($localFilePath), $postId]);
}
                  // Limit to saving one image per metadata set, or comment out to save all images
                  break;
              }
          }}
      }

  protected function storeResources2() {
      $metadataRecords = $this->db->flist("SELECT id, meta FROM resources WHERE img IS NULL");

      if (empty($metadataRecords)) {
          echo "No metadata records found for image fetching.\n";
          return;
      }

      foreach ($metadataRecords as $recordID => $recordMeta) {
          $postId = $recordID;
          if ($recordMeta === null) continue;

          $tags = explode(',', $recordMeta);
          $images = $this->fetchResource($tags);

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
                  $this->db->q("UPDATE resources SET img = ? WHERE id = ?", [MEDIA_URL . basename($localFilePath), $postId]);
                  echo "Image saved and resource updated: {$localFilePath}\n";
                  break; // Save only one image per record
              }
          }
      }
  }


  }
  ?>