<?php
namespace Core;

/**
 Action Ermis is the beginning of Action with it's websocket server and fs.watch that dominates the system
 exeActions exported to index.js:
 `Instantiate Actions |  const { exeActions } = require('./action');exeActions(app);
 Running Web Socket Server for RealTime Actions; WServer(server,app,exeActions);

--> uses Maria, Messenger
--> runs in systemsid ermis
 TODO utilize ci/cd process (through Github) example in the end
 TODO utilize the power of event driven kafka logic
 TODO utilize the power of unit testing
 TODO use the manifest.md as high level filesystem & sql standarization

@filemetacore.description Get Add Manage Resources from web

@filemetacore.features
Check standard nulls of DB and suggest to complete
Check all actiongrp if active

@filemetacore.todo
- add more NULL img actiongrp
- aDDMore resource text and bw and diff types of images
- Google Books API
- Open Library API
- LibraryThing API
- Use OpenCV, Pillow python job for kronos
*/

trait Action {
/**
the Core does not need to publish to WS just in case of realtime need
*/
use WS;
use Manifest;
//actiongrp unsplash
protected $UNSPLASH_URL='https://api.unsplash.com/search/photos/';

    /**
     * Converts YAML string or file content to JSON.
     *
     * @param string $yamlContent The YAML content to convert (can be a string or file path).
     * @return string JSON encoded data.
     */


protected function upsertActionFromFS(){

}

protected function exeAction(){

}
protected function addAction(array $key_value_array=[]){
    $this->admin->inse("action",$key_value_array);
}
  /**
       * Fetch images from Unsplash based on metadata tags.
       *
       * @param array $tags Array of tags to search for images.
       * @param int $perPage Number of images to retrieve per request.
       * @return array Array of image data (URLs, descriptions, etc.).
       */
       // @filemetacore.description fetchResource
   protected function fetchResource($tags, $page = 1, $perPage = 10) {
       $query = implode(',', $tags);

       // action.endpoint
       $url = "{$this->UNSPLASH_URL}?query=" . urlencode($query) . "&page={$page}&per_page={$perPage}&client_id={$this->G['is']['UNSPLASH_API_KEY']}";

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
      $metadataRecords = $this->db->flist("SELECT id, meta FROM actiongrp WHERE img IS NULL");

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
                  $this->db->q("UPDATE actiongrp SET img = ? WHERE id = ?", [MEDIA_URL . basename($localFilePath), $postId]);
                  echo "Image saved and resource updated: {$localFilePath}\n";
                  break; // Save only one image per record
              }
          }
      }
  }


  }
  ?>