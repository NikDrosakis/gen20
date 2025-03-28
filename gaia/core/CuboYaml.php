<?php
namespace Core;
use Exception;
/**
based on yaml

 */
 trait CuboYaml {

protected function createYaml2Cubo($name = '') {
    $cuboDir = CUBO_ROOT . $name . '/';
    $setupPath = $cuboDir . 'manifest.yml';
      //  xecho(GLOB("$cuboDir*"));
    // Check if manifest.yml exists
    if (!file_exists($setupPath)) {
        throw new Exception("Setup file not found for cubo: $name");
    }
    // Parse manifest.yml
    $setup = yaml_parse_file($setupPath);
    $cuboName = $name; // Use the cubo name directly

    //step 1: setup cubo table into the database
        $sqls=!empty($setup['sql']) ? implode(',',$setup['sql']):'';
        $mains=!empty($setup['main']) ? implode(',',$setup['main']):'';
        $data = [
            'name' => $name,
            'tables' => $sqls,
            'mains' => $mains
        ];
     $cuboId = $this->db->inse("gen_admin.cubo", $data);

    // Step 2: Process SQL scripts
if (!empty($setup['sql'])) {
    foreach ($setup['sql'] as $sqlFile) {
        $sqlFilePath = $cuboDir . 'sql/' . $sqlFile . '.sql';
        // Ensure the file exists before running the MySQL command
        if (file_exists($sqlFilePath)) {
           $returnVar= $this->db->runSqlFile($sqlFilePath);
            // Check for command success
            if ($returnVar !== 0) {
                echo "Error running SQL script: $sqlFilePath\n";
            } else {
                echo "Successfully ran SQL script: $sqlFilePath\n";
            }
        } else {
            echo "SQL file not found: $sqlFilePath\n";
        }
    }
}

// Step 3: Process Main PHP files
if (!empty($setup['main'])) {
    foreach ($setup['main'] as $mainFile) {
        $mainFilePath = $cuboDir . $name . '/main/' . $mainFile . '.php';

        // Create the file with an example if it doesn't already exist
        if (!file_exists($mainFilePath)) {
            $exampleContent = "<?php\n\n// Example content for $mainFile\n";
            $exampleContent .= "// Generated on " . date('Y-m-d H:i:s') . "\n\n";
            file_put_contents($mainFilePath, $exampleContent);

            echo "Created file: $mainFilePath\n";
        } else {
            echo "File already exists: $mainFilePath\n";
        }
    }
}
    // Step 4: Insert cubo metadata into `pagegrp`
    $pagegrpData = [
        'cuboid' => $cuboId, // Assuming a cubo ID has been created
        'name' => $cuboName,
        'description' => $setup['description'] ?? ''
    ];
    $pagegrpGrpId = $this->db->inse("$this->publicdb.pagegrp", $pagegrpData);
    if($pagegrpGrpId){
    echo "Inserted pagecubo $pagegrpGrpId";
    }

    // Step 5: Insert `mains` components into `main` table
    if (!empty($setup['mains'])) {
        foreach ($setup['mains'] as $main) {
            $mainData = [
                'pagegrpid' => $pagegrpGrpId,
             'manifest' => "m:\\n -\"$main\"",
                'name' => $main
            ];
            $insertedMainId = $this->db->inse("$this->publicdb.main", $mainData);

            // Step 4: Insert into `pagecubo` table for each main
            $pagecuboData = [
                'mainid' => $insertedMainId,
                'area' => 'm',
                'cuboid' => $insertedGrpId,
                'name' => $cuboName
            ];
            $insertedpagecuboId = $this->db->inse("$this->publicdb.pagecubo", $pagecuboData);
            if($insertedpagecuboId){
            echo "Inserted pagecubo $insertedpagecuboId";
            }
        }
    }

// Step 6: Insert to admin/cubo navigation & mainplan of running in admin
    $adminFilePath = $cuboDir . 'admin.php';
    if (file_exists($adminFilePath)) {
    // Step 5: Insert links for admin.php if it exists
        $linksData = [
            'pagegrpid' => 5,
            'name' => $name,
            'title' => ucfirst($name),
            'manifest' => "m:\\n -renderCubo:\"$name./admin.php\"",
        ];
        $mainId = $this->db->inse("{$this->publicdb}.main", $linksData);
            if($mainId){
                    echo "Inserted main $mainId";
                    }
    }

    return true; // Return success
}


}