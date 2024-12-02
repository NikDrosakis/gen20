<?php
namespace Core;
/**
Get Resources from the web

TODO
====
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
      public function fetchImages($tags, $page = 1, $perPage = 10) {
          $query = implode(',', $tags); // Combine tags into a single query string
          $url = "{$this->UNSPLASH_URL}?query=" . urlencode($query) . "&page={$page}&per_page={$perPage}&client_id={$this->G['is']['UNSPLASH_API_KEY']}";

          // Initialize cURL session
          $ch = curl_init($url);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          $response = curl_exec($ch);
          curl_close($ch);

          // Decode JSON response
          $data = json_decode($response, true);

          // Check for errors in the response
          if (isset($data['errors'])) {
              return ['error' => $data['errors']];
          }

          return $data['results'];
      }

      /**
       * Store fetched images to database and local directory based on metadata tags.
       */
      protected function storeResources() {
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
              $images = $this->fetchImages($tags);
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
  }
  ?>