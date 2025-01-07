<?php
namespace Core;
/**
file (in yml format) manifesting an action or actiongrp
 προσθήκη id
αλλαγή ονόματος αρχείου
με το watch μπορώ

Dependendencies

maria.colFormat
maria.upsert
maria.f
maria.extendColumnFormat
maria.prepareColumnFormat
*/
trait  Manifest {

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
  Yaml to Update DB
  */
    protected function yamlUpdateDB(string $path=''):void {
      //if file is manifest
      if(file_exists($path)){
      $yamlParsed = $this->yamlParseFile($path);
//xecho($yamlParsed);
          // Extract the central key (assumed to be the table name)
          $centralKey = array_key_first($yamlParsed); // Get the first key as the table name

          if (!$centralKey || !is_array($yamlParsed[$centralKey])) {
              throw new Exception("Invalid structure in YAML file: $yamlFile");
          }
          // Remove the central key and use the rest as data
          $yamlParsedKeyless = $yamlParsed[$centralKey];

      $update = $this->admin->upsert($centralKey,$yamlParsedKeyless);
          if ($update) {
              echo "Database updated successfully.";
          } else {
              echo "Failed to update the database.";
          }
      }else{
          echo "File does not exist.";
      }
    }

/**
 * Fetch data from DB and convert it to a YAML file based on the column format.
 */
protected function manifestFileFromDB(string $query, $params = []): void {
    $manifest= $this->manifestFromDB($query, $params);
    //parse to get the filename
    $yaml_array= yaml_parse($manifest);
    $filename= array_key_first($yaml_array);
    $filePath = ADMIN_ROOT.'manifest/'.$filename.'.yml';
    //save to file
    file_put_contents($filePath, $manifest);
    echo "YAML file saved to $filePath.";
}

protected function manifestFromDB(string $query, $params = []): ?string {
    // Execute the query
     $results =$this->admin->f($query, $params);
     $name=  $results['name'] ?? $results['id'];
    // Extract the table name from the query (for example, from a SELECT statement)
    preg_match('/FROM\s+`?(\w+)`?/i', $query, $matches);
    $table = $matches[1] ?? null;
    if (!$table) {
        throw new InvalidArgumentException("Table name could not be determined from the query.");
    }
    // Get the column format (comments) for the table
    $columnsFormat = $this->admin->colFormat($table);
    // Process the results by extending the column format (reversing the transformations)
    $extendedRow[$name.'_'.$table] = $this->admin->extendColumnFormat($results, $columnsFormat);
    // Convert the array to YAML format
    return yaml_emit($extendedRow);
}

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
    $actiongrp =$this->admin->f("select * from $table where name=?", [$name]);
     if ($actiongrp) {
    // Get the column format (comments) for the table
        $colFormat = $this->admin->colFormat($table);
        $grsExtended=$this->admin->extendColumnFormat($actiongrp, $colFormat);
      //  $actionColumnsFormat = $this->admin->colFormat("action");
    if ($grsExtended) {
        $actions = $this->admin->fa("SELECT * FROM action WHERE actiongrpid=?", [$actiongrp['id']]);
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