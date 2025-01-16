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

      $update = $this->db->upsert($centralKey,$yamlParsedKeyless);
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
protected function yamlFromDB(string $query, $params = []): void {
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
    $extendedRow[$name] = $this->db->extendColumnFormat($results, $columnsFormat);

    // Convert the array to YAML format
    $yaml_raw = yaml_emit($extendedRow);

    // Save the YAML to a file (for example, 'data.yml')
    //xecho($yaml_raw);
    $filePath = ADMIN_ROOT.'manifest/'.$name.'_'.$table.'.yml';
    file_put_contents($filePath, $yaml_raw);

    echo "YAML file saved to $filePath.";
}


}