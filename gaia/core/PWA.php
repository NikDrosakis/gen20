<?php
namespace Core;
use Exception;

trait PWA {
/**
power web application offline use

 */

     public function syncToIndexedDB($domain) {

         $tables = ["users", "posts", "settings"];

         $exportData = [];
         foreach ($tables as $table) {
             $stmt = $this->db->fa("SELECT * FROM {$table}");
         }

         // Αποθηκεύει το JSON κάπου (π.χ. σε API endpoint ή file)
         file_put_contents(GSROOT."setup/pwa/{$domain}.json", json_encode($exportData));

         return json_encode(["status" => "success", "domain" => $domain]);
     }

}