<?php
namespace Core\Traits;
use Exception;

/**
Watch is used by gen-daemon using inotify to fire php methods through GEN CLI
 */
trait Watch {

/**
 * Monitors changes in Cubo view files to update Redis cache and document changes.
 *
 * @param string $cuboview The identifier for the Cubo and view, formatted as 'cubo.view'.
 */
protected function cubosFolder($cuboview) {
    // Split the cuboview into cubo and view parts
    list($cubo, $view) = explode('.', $cuboview);
    // Construct the URL to fetch data
    $url = SITE_URL . "cubos/index.php?cubo=$cubo&file=$view.php";

    try {
        // Delete the existing cache key
        $this->redis->del("cubo_" . $cuboview);

        // Fetch the new data
        $response = $this->fetchUrl($url);

        // Update documentation in the database
        $doc = $this->help($cuboview, 'view');
        $this->db->q("UPDATE gen_admin.cuboview SET doc=? WHERE name=?", [$doc, $cuboview]);

        // Set the new response to cache
        $this->redis->set("cubo_" . $cuboview, $response);

        // Log the successful update
        $this->log("Successfully updated cache and documentation for: $cuboview");
    } catch (Exception $e) {
        // Log any errors encountered during the process
        $this->log("Error updating cuboview '$cuboview': " . $e->getMessage());
    }
}

/**
 * Handles changes in core traits and classes by backing up core files and updating documentation.
 *
 * @param string $filename The name of the changed core file.
 */
protected function coreFolder($filename) {
    $sourceDir = GAIAROOT . 'core';
    $coreBackupDir = GAIAROOT . 'core2';
    $logFile = GSROOT . 'log/gen.log';

    try {
        // Ensure backup directory exists
        if (!is_dir($coreBackupDir)) {
            mkdir($coreBackupDir, 0755, true);
        }

        // Backup core files
        exec("cp -r $sourceDir/* $coreBackupDir/");

        // Retrieve documentation for the changed file
        $doc = $this->helpClass($filename);


        // Update documentation in the database
        $this->db->q("UPDATE gen_admin.filemetacore SET doc=? WHERE name=?", [$doc, $filename]);

        // Log the successful backup and documentation update
        $this->log("Successfully backed up and updated documentation for: $filename");
    } catch (Exception $e) {
        // Log any errors encountered during the process
        $this->log("Error processing core file '$filename': " . $e->getMessage());
    }
}

}