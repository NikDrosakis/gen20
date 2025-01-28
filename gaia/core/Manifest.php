<?php
namespace Core;
/**
file (in yml format) manifesting action actiongrp cubos

#standards
filename manifest.yml: At the root of the systems
centralKey [name]_[table]  at action,actiongrp


#Dependendencies
maria.colFormat
maria.upsert
maria.f
maria.extendColumnFormat
maria.prepareColumnFormat
*/
trait  Manifest {


/**
BATCH created manifests and updated DB
 */

 /**
  * Extend and reformat data from DB into appropriate structure (reverses `prepareColumnFormat` logic).
  */
 public function extendColumnFormat(array $params, array $columnsFormat): array {


     foreach ($params as $key => &$value) {
         if (isset($columnsFormat[$key])) {
             $comment = $columnsFormat[$key];

             // Handle 'comma' fields - convert comma-separated strings back to arrays
             if (strpos($comment, 'comma') !== false && is_string($value)) {
                 $value = explode(',', $value);  // Convert comma-separated string to array
             }

             // Handle 'json' fields - decode JSON string back to array
             elseif (strpos($comment, 'json') !== false && is_string($value)) {
                 $value = json_decode($value, true);  // Convert JSON string to array
             }

             // Handle 'includes' fields - if it's a file path, store it as an 'includes' key
             elseif (is_string($value) && file_exists($value)) {
                 $value = ['includes' => $value];  // Store file path as an 'includes' key
             }

             // Handle simple string fields - no conversion needed, just ensure it is trimmed
             elseif (is_string($value)) {
                 $value = trim($value);  // Remove whitespace from string
             }

             // Handle integer fields - ensure it's an integer
             elseif (is_int($value)) {
                 // No transformation needed, just ensure it's an integer (useful for strict types)
                 $value = (int)$value;
             }
         }
     }
     return $params;
 }
/**
 * Processes manifest files from the database and generates the manifest for each system.
 *
 * @param string $table The database table to query.
 */
protected function batchManifestFilesFromDB(string $table, string $path=''): void {
    $systemPaths = $this->db->flist("SELECT name, path FROM $table");
    if($systemPaths && count($systemPaths) > 0){
    foreach ($systemPaths as $name => $path) {
        $this->manifestFileFromDB("SELECT * FROM $table WHERE name = ?", [$name],$path);
    }
    }else{
        echo "Table format not suitable for this operation";
    }
}

/**
 * Updates YAML configurations in the database for each system.
 *
 * @param string $table The database table to query.
 */
protected function batchYamlUpdateDB(string $table): void {
    $systemPaths = $this->db->flist("SELECT name, path FROM $table");
   if($systemPaths && count($systemPaths) > 0){
foreach ($systemPaths as $name => $path) {
        $yamlPath = ROOT . $path . '/manifest.yml';
        if (!file_exists($yamlPath)) {
            echo "Warning: YAML file not found at $yamlPath\n"; // Handle missing file
            continue;
        }
        $this->yamlUpdateDB($yamlPath);
    }
    }else{
        echo "Table format not suitable for this operation";
    }
}

/**
ONE RECORD created manifests and updated DB
 */
  protected function yamlParseFile(string $yamlFile='') {
        // Check if input is a file path or direct YAML content
        if (file_exists($yamlFile)) {
           $yamlContent = file_get_contents($yamlFile);
        }
        // Parse YAML to array
        $parsedData = yaml_parse($yamlContent);
        // Check if the YAML parsed successfully
        if ($parsedData === false) {
            throw new Exception("Invalid YAML content");
        }
        // Convert array to JSON
        return $parsedData;
    }
  ////watch system if ROOT."manifest.yml" is changed
          //watchFS($filetype='*.yml');
  /**
  Yaml file  Updates DB based on central key
  */
    protected function yamlUpdateDB(string $path=''):void {
      //if file is manifest
      if(file_exists($path)){
      $yamlParsed = $this->yamlParseFile($path);
//xecho($yamlParsed);
          // Extract the central key (assumed to be the table name)
          $centralKey = array_key_first($yamlParsed); // Get the first key as the table name
          $name= explode('_',$centralKey)[0];
          $table= explode('_',$centralKey)[1];

          if (!$centralKey || !is_array($yamlParsed[$centralKey])) {
              throw new Exception("Invalid structure in YAML file: $yamlFile");
          }
          // Remove the central key and use the rest as data
          $yamlParsedKeyless = $yamlParsed[$centralKey];

      $update = $this->db->upsert($table,$yamlParsedKeyless);
      //check if manifest row exists and update with all the $yamlParsed
      $update_manifest =$this->db->q("update $table set manifest=? where name=?",[yaml_emit($yamlParsed),$name]);

          if ($update && $update_manifest) {
              echo "Table $table, record $name updated successfully.";
          } else {
              echo "Failed to update the database.";
          }
      }else{
          echo "$path does not exist.";
      }
    }

/**
 * Fetch data from DB and convert it to a YAML file based on the column format.
 */
protected function manifestFileFromDB(string $query, $params = [],$savepath=''): void {
    $manifest= $this->manifestFromDB($query, $params);
    //parse to get the filename
    $yaml_array= yaml_parse($manifest);
  //  $filename= array_key_first($yaml_array);
    $path = $savepath=='' ? ROOT.'manifest/' : ROOT.$savepath.'/manifest.yml';
    //$filePath = $path.'.yml';
    //save to file
    if(!file_exists($path)){
    file_put_contents($path, $manifest);
    echo "YAML file saved to $path.\n";
    }else{
    echo "YAML exists in $path.\n";
    }
}

protected function manifestFromDB(string $query, $params = []): ?string {
    // Execute the query
     $results =$this->db->f($query, $params);
     $name=  $results['name'] ?? $results['id'];
    // Extract the table name from the query (for example, from a SELECT statement)
    preg_match('/FROM\s+`?(\w+)`?/i', $query, $matches);
    $table = $matches[1] ?? null;
    if (!$table) {
        throw new InvalidArgumentException("Table name could not be determined from the query.");
    }
    // Get the column format (comments) for the table
    $columnsFormat = $this->db->colFormat($table);
    // Process the results by extending the column format (reversing the transformations)
    $extendedRow[$name.'_'.$table] = $this->extendColumnFormat($results, $columnsFormat);
    // Convert the array to YAML format
    return yaml_emit($extendedRow);
}

/**
Parent Actiongrp creating manifest files from DB
*/
 protected function manifestFileActiongrpFromDB(string $name): void{
     $manifest= $this->manifestActiongrpFromDB($name);
     //parse to get the filename
     $yaml_array= yaml_parse($manifest);
     $filename= array_key_first($yaml_array);
     $filePath = ADMIN_ROOT.'manifest/'.$filename.'.yml';
     //save to file
     file_put_contents($filePath, $manifest);
     echo "YAML file saved to $filePath.";
 }

 protected function manifestActiongrpFromDB(string $name): ?string{
    // Execute the query
    $table= "actiongrp";
    $actiongrp =$this->db->f("select * from $table where name=?", [$name]);
     if ($actiongrp) {
    // Get the column format (comments) for the table
        $colFormat = $this->db->colFormat($table);
        $grsExtended=$this->extendColumnFormat($actiongrp, $colFormat);
      //  $actionColumnsFormat = $this->db->colFormat("action");
    if ($grsExtended) {
        $actions = $this->db->fa("SELECT * FROM gen_admin.action WHERE actiongrpid=?", [$actiongrp['id']]);
        // Add actions to the action group array
        $grsExtended['actions'] = array_values($actions);
    } else {
        echo "No action group found with the specified name.";
    }
$result=[];
    $name = $actiongrp['name'] ?? $actiongrp['id'];
    // Process the results by extending the column format (reversing the transformations)
    $result[$name.'_'.$table] = $grsExtended;

    // Convert the array to YAML format
    return yaml_emit($result);
       } else {
            echo "No action group found with the specified name.";
            return null; // Return null if no action group is found
        }
 }


}