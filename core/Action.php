<?php
namespace Core;
/**
 Action Ermis is the beginning of Action with it's websocket server and fs.watch that dominates the system
 exeActions exported to index.js:
 `Instantiate Actions |  const { exeActions } = require('./action');exeActions(app);
 Running Web Socket Server for RealTime Actions; realTimeConnection(server,app,exeActions);

--> uses Maria, Messenger
--> runs in systemsid ermis
 TODO utilize ci/cd process (through Github) example in the end
 TODO utilize the power of event driven kafka logic
 TODO utilize the power of unit testing
 TODO use the manifest.md as high level filesystem & sql standarization

CREATE TABLE `actiongrp` (
  `id` int(11) UNSIGNED NOT NULL COMMENT 'auto',
  `name` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL,
  `img` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL COMMENT 'img-upload',
  `type` enum('api','ai','ws','db','store') DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `sort` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `status` enum('inactive','active','closed') NOT NULL DEFAULT 'inactive',
  `keys` varchar(300) DEFAULT NULL,
  `project_id` varchar(255) DEFAULT NULL,
  `updated` datetime NOT NULL DEFAULT current_timestamp(),
  `created` datetime NOT NULL DEFAULT current_timestamp(),
  `doc` text DEFAULT NULL,
  `meta` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `actiongrp`
--

INSERT INTO `actiongrp` (`id`, `name`, `img`, `type`, `description`, `sort`, `title`, `status`, `keys`, `project_id`, `updated`, `created`, `doc`, `meta`) VALUES
(4, 'counters', NULL, 'ws', 'Counters for Notications (N)', 0, NULL, 'active', NULL, NULL, '2024-12-21 07:43:22', '2024-12-21 07:43:22', NULL, NULL),
(7, 'watch', NULL, NULL, 'Nodejs fs.watch file system', 0, NULL, 'active', NULL, NULL, '2024-12-21 07:43:22', '2024-12-21 07:43:22', NULL, NULL),
(8, 'langchain', NULL, 'ai', 'AI generative', 0, NULL, 'active', NULL, NULL, '2024-09-07 23:27:09', '2024-09-07 23:27:09', NULL, NULL),
(9, 'haystack', NULL, 'ai', 'AI', 0, NULL, 'active', NULL, NULL, '2024-09-09 03:21:09', '2024-09-09 03:21:09', NULL, NULL),
(10, 'tensorflow', NULL, 'ai', 'AI ', 0, NULL, 'active', NULL, NULL, '2024-09-09 03:29:51', '2024-09-09 03:29:51', NULL, NULL),
(11, 'gemini', NULL, 'ai', 'AI', 0, NULL, 'active', 'AISTUDIO_API_KEY=AIzaSyBzMZiTWZPLZuoPkPhCyeFGMa0DhCUcS3M', NULL, '2024-09-12 06:08:15', '2024-09-12 06:08:15', NULL, NULL),
(12, 'solr', NULL, 'db', 'Database Access', 0, NULL, 'active', NULL, NULL, '2024-09-21 00:17:34', '2024-09-21 00:17:34', NULL, NULL),
(13, 'cohere', NULL, 'ai', 'AI generative', 0, NULL, '', 'COHERE_API_KEY=JJbPnZypYWRTRZx8YhY3Kiynt0DariSCzTylaPUz', NULL, '2024-09-21 06:46:45', '2024-09-21 06:46:45', NULL, NULL),
(14, 'transformers', NULL, 'ai', 'AI', 0, NULL, 'active', NULL, NULL, '2024-09-25 04:26:54', '2024-09-25 04:26:54', NULL, NULL),
(15, 'llama', NULL, 'ai', 'AI', 0, NULL, 'inactive', NULL, NULL, '2024-09-25 06:14:51', '2024-09-25 06:14:51', NULL, NULL),
(16, 'gptneo', NULL, 'ai', 'AI', 0, NULL, 'active', NULL, NULL, '2024-09-25 06:28:13', '2024-09-25 06:28:13', NULL, NULL),
(17, 'bloom', NULL, 'ai', 'AI', 0, NULL, '', NULL, NULL, '2024-09-25 06:46:26', '2024-09-25 06:46:26', NULL, NULL),
(18, 'timetable', NULL, 'api', 'Nodejs Task Tables', 0, NULL, 'active', NULL, NULL, '2024-09-25 11:59:27', '2024-09-25 11:59:27', NULL, NULL),
(23, 'openai', NULL, 'ai', 'AI', 0, NULL, 'active', 'OPENAI_API_KEY=sk-svcacct-fL6ZuXVYLsPT9dqIoGthgBFJNf7y5IItA2jT2GBy-rV_EDJpO7T3BlbkFJ0VJ_hWb5Y-3cY0YKki5qvVLRMcB11UbH69TVq3GW3Vhn2rouMA', NULL, '2024-12-21 09:36:05', '2024-12-21 09:36:05', NULL, NULL),
(24, 'chatgpt', NULL, 'ai', 'AI', 0, NULL, 'active', NULL, NULL, '2024-12-21 09:38:02', '2024-12-21 09:38:02', NULL, NULL),
(25, 'huggingface', NULL, 'ai', 'AI', 0, NULL, 'active', 'HUGGINGFACE_API_KEY=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', NULL, '2024-12-21 09:39:33', '2024-12-21 09:39:33', NULL, NULL),
(26, 'rapidapi', NULL, 'api', 'Ermis Kronos Cli Core Service', 0, NULL, 'active', NULL, NULL, '2024-12-21 09:40:34', '2024-12-21 09:40:34', NULL, NULL),
(27, 'botpress', NULL, 'ai', 'Ermis Service', 0, NULL, 'active', NULL, NULL, '2024-12-21 09:41:48', '2024-12-21 09:41:48', NULL, NULL),
(28, 'mongo', NULL, 'db', 'Database Access', 0, NULL, 'active', NULL, NULL, '2024-12-21 09:42:59', '2024-12-21 09:42:59', NULL, NULL),
(29, 'gaia', NULL, 'api', 'Database Access', 0, NULL, 'active', 'MARIA=gen_vivalibrocom,MARIADMIN=gen_admin,MARIAUSER=dros,MARIAPASS=n130177!,MARIAHOST=localhost', NULL, '2024-12-21 09:42:59', '2024-12-21 09:42:59', NULL, NULL),
(30, 'claude', NULL, 'ai', 'AI', 0, NULL, 'active', NULL, NULL, '2024-12-22 18:01:15', '2024-12-22 18:01:15', NULL, NULL),
(31, 'anthropic', NULL, 'ai', 'AI', 0, NULL, 'active', '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', NULL, '2024-12-22 18:01:15', '2024-12-22 18:01:15', NULL, NULL),
(32, 'unsplash', NULL, 'api', 'api for photos', 0, NULL, 'active', 'UNSPLASH_API_KEY=zUylrbwfwdI2Q9NiSV85oZZcF8oc6CIAJWEwC5sR91Y', NULL, '2024-12-22 18:01:15', '2024-12-22 18:01:15', NULL, 'photos'),
(33, 'redis', NULL, 'db', 'Database Access', 0, NULL, 'active', 'REDIS_HOST=localhost,REDIS_PORT=6379,REDIS_PASS=yjF1f7uiHttcp', NULL, '2024-12-21 09:42:59', '2024-12-21 09:42:59', NULL, NULL),
(34, 'openweather', NULL, 'api', 'api for weather', 0, NULL, 'active', 'OPENWEATHER_API_KEY=92c886aad0edc29a8a6368b98035f0ab', NULL, '2024-12-22 18:01:15', '2024-12-22 18:01:15', NULL, 'weather'),
(35, 'serpapi', NULL, 'api', 'api of multiple content of other apis', 0, NULL, 'active', 'SERP_API=c070a5c543d6aa0734b815fb1583bd729327470c2c03e1a85daa1937a54ac5f7', NULL, '2024-12-22 18:01:15', '2024-12-22 18:01:15', NULL, 'photos'),
(36, 'drive', NULL, 'api', 'Google Drive for storing files', 0, NULL, 'active', 'GOOGLE_DRIVE_API_KEY=JJbPnZypYWRTRZx8YhY3Kiynt0DariSCzTylaPUz,GOOGLE_DRIVE_API_ID=vivalibro,GOOGLE_DRIVE_CLIENT_ID=390020636315-mbpues4t33u0gq3fnrrc6m3gdgio2q9e.apps.googleusercontent.com,GOOGLE_PICKER_API_KEY=AIzaSyC6k2FPNg4b-dozRtDilmur_lUVrf0ezfM', NULL, '2024-12-22 18:01:15', '2024-12-22 18:01:15', NULL, 'store, google'),
(37, 'github', NULL, 'ai', 'Github Repo Store', 0, NULL, 'inactive', 'GITHUB_ACCESS_TOKEN=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', NULL, '2024-09-25 04:26:54', '2024-09-25 04:26:54', NULL, NULL),
(38, 'dropbox', NULL, 'store', 'Dropbox', 0, NULL, 'inactive', 'DROPBOX_API_KEY=jpc1pso3eioj87m,DROPBOX_ACCESS_TOKEN=sl.B8jXDBNJ58utPpBlYTx_UjOl4SwP-1OHVOPOuQ3oeB5bvRJ9yeQnrGYEIOcN7cN0C-8a-D5N7ICxU5n9_Cv9xLCtnzcHcv93EqsljoDVRpLsmGdciJcHV66v9GSUtAykwXFjgQM_LlQV', NULL, '2024-09-25 06:28:13', '2024-09-25 06:28:13', NULL, NULL),
(39, 'expo', NULL, 'store', 'Expo React Native Apps of Gen20', 0, NULL, 'active', 'EXPO_GITHUB=zJ286l2_K-yfbVi1vPv4aKp5SlgG_RmeBiaKM1Ep,EXPO_ASSESS_TOKEN=_LydbH5bjtL0NF-E_kxsC_18_h938-IUtI4F7gtn', NULL, '2024-12-21 07:43:22', '2024-12-21 07:43:22', NULL, NULL),
(40, 'watson', NULL, 'api', 'Watson AI', 0, NULL, 'active', 'WATSON_CREDENTIALS=5GwhZBMQXWxnFJA6gqPxFud32Bri5IDZiXK2YG0PFkqv', NULL, '2024-12-22 18:01:15', '2024-12-22 18:01:15', NULL, 'ai');

@filemetacore.sql-create
CREATE TABLE `action` (
  `id` int(11) NOT NULL COMMENT 'auto',
  `names` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL COMMENT 'comma',
  `img` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL COMMENT 'img-upload',
  `sort` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `actiongrpid` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectjoin-actiongrp.name',
  `systemsid` smallint(5) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'selectjoin-systems.name',
  `type` enum('N','generate','watch','route','int_resource','ext_resource') DEFAULT NULL,
  `endpoint` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL COMMENT 'json',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `hint` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL COMMENT 'comma',
  `domappend` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL COMMENT 'comma',
  `statement` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL COMMENT 'sql',
  `rule` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL,
  `execute` text CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci DEFAULT NULL COMMENT 'js',
  `cast` enum('all','many','one') CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci NOT NULL DEFAULT 'all',
  `status` enum('testing','activated','troubled','inactived','wrong','closed') DEFAULT NULL,
  `usergroups` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'comma',
  `interval_time` int(10) UNSIGNED DEFAULT 0,
  `schedule` varchar(200) DEFAULT NULL COMMENT 'cron',
  `log` text DEFAULT NULL,
  `doc` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

INSERT INTO `action` (`id`, `names`, `img`, `sort`, `actiongrpid`, `systemsid`, `type`, `endpoint`, `message`, `description`, `hint`, `domappend`, `statement`, `rule`, `execute`, `cast`, `status`, `usergroups`, `interval_time`, `schedule`, `log`, `doc`) VALUES
(1, 'Active Libraries,Total Books,English Titles,Greek Titles,Writers', NULL, 0, 4, 1, 'N', NULL, '{system: \"vivalibrocom\",page: \'\',cast: \'all\',type: \'N\',text: notifications,class: \"c_square cblue\"}', 'Counters', 'User active libraries,Total books in the library,Total English titles available,Total Greek titles available,Total publishers registered,Total writers registered', 'c_active_libraries,c_total_books,c_en_titles,c_el_titles,c_publishers,c_writers', 'SELECT COUNT(id) AS c_active_libraries FROM c_book_lib WHERE status=2;SELECT COUNT(id) AS c_total_books FROM c_book;SELECT COUNT(id) AS c_en_titles FROM c_book WHERE lang=\'en\';SELECT COUNT(id) AS c_el_titles FROM c_book WHERE lang=\'el\';SELECT COUNT(id) AS c_publishers FROM c_book_publisher;SELECT COUNT(id) AS c_writers FROM c_book_writer;', NULL, 'for(const [key, value] of Object.entries(message.text)){const span=document.createElement(\'span\');const existingClass=document.querySelector(key);if(existingClass){const span=document.createElement(\'span\');span.className=message.class;span.textContent=value;existingClass.appendChild(span);}}', 'all', 'activated', NULL, 40, NULL, NULL, 'better  publish and php will  get GSocket'),
(16, 'reload', NULL, 0, 7, 3, 'watch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'location.reload()', 'all', 'inactived', NULL, 0, NULL, NULL, NULL),
(17, 'langchain', NULL, 0, 8, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(18, 'haystack', NULL, 0, 9, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(19, 'tensorflow', NULL, 0, 10, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(20, 'gemini', NULL, 0, 11, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(21, 'solr', NULL, 0, 12, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(22, 'cohere', NULL, 0, 13, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(23, 'transformers', NULL, 0, 14, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(24, 'llama', NULL, 0, 15, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(25, 'gptneo', NULL, 0, 16, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(26, 'bloom', NULL, 0, 17, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(27, 'timetable', NULL, 0, 18, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(28, 'openai', NULL, 0, 23, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(29, 'chatgpt', NULL, 0, 24, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(30, 'huggingface', NULL, 0, 25, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(31, 'rapidapi', NULL, 0, 26, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(32, 'botpress', NULL, 0, 27, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(33, 'mongo', NULL, 0, 28, 3, 'route', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(34, 'gaia', NULL, 0, 29, 3, 'route', NULL, NULL, NULL, NULL, NULL, 'update/insert', NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(46, 'gemini', NULL, 0, 11, 3, 'generate', '/action_task', NULL, NULL, NULL, NULL, 'update/insert', NULL, NULL, 'all', 'activated', NULL, 0, NULL, NULL, NULL),
(47, 'unsplash', NULL, 0, 11, 3, 'ext_resource', 'GET,https://api.unsplash.com/collections?client_id={UNSPLASH_API_KEY}', NULL, NULL, NULL, NULL, 'update img divided with comma/insert', NULL, NULL, 'all', 'wrong', NULL, 0, NULL, 'Environment variable UNSPLASH_API_KEY is not defined.', NULL),
(48, 'openweather', NULL, 0, 11, 3, 'ext_resource', 'GET,https://api.openweathermap.org/data/3.0/onecall/overview?lat={lat}&lon={lon}&appid={API key}', NULL, NULL, NULL, NULL, 'update/insert', NULL, NULL, 'all', 'wrong', NULL, 0, NULL, 'Environment variable lat is not defined.', NULL);

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
protected $UNSPLASH_URL='https://api.unsplash.com/search/photos/';


//this function
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