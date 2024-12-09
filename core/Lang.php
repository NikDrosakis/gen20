<?php
namespace Core;
use Pug\Pug;
/**
@filemeta.description locationzalition tool to add edit remove languages (multilanguage schema)
@filemeta.depends admin/main/language.php
@filemeta.todo
switch default lang
add lang (auto translate custom posts)
cubo lang
add languages
1) FIND ALL COMMENTS LOC
2) alter table with field_[loc]
3) update table of active languages
*/
trait Lang {
use Form;

protected $defaultLang='en';
protected $localized;

// @filemeta.description buildNewlangColumns


// @filemeta.description testing method
protected function pugTest(){
// Create a Pug instance
$pug = new Pug();

// Render a Pug template as a string
echo $pug->render('
    h2 Welcome to Pug in PHP!
    div This is a simple Pug example rendered in PHP.
');

// Or compile a file
return $pug->renderFile('path/to/template.pug');
}
/**
 * @filemeta.description Adds new language columns to the public database
 * @filemeta.features Alters public database, adding new language columns to all "loc" comment columns
 */
protected function addLangColumn($newlang_prefix = '') {
    // Get all tables
    foreach ($this->listTables() as $table) {
        // Fetch table metadata
        $columns = $this->db->tableMeta($table);

        // Loop through columns
        foreach ($columns as $column) {
            $oldColumn = $column['COLUMN_NAME'];
            $columnComment = trim($column['COLUMN_COMMENT']);

            // Check if the column has a "loc" comment
            if ($columnComment === 'loc') {
                // Construct new column name
                $newColumn = $oldColumn . "_" . $newlang_prefix;

                // Check if the new column already exists
                if (!array_key_exists($newColumn, array_column($columns, 'COLUMN_NAME'))) {
                    // Prepare SQL to add the new column
                    $sql = sprintf(
                        "ALTER TABLE `%s` ADD COLUMN `%s` TEXT DEFAULT NULL COMMENT 'loc' AFTER `%s`",
                        $table,
                        $newColumn,
                        $oldColumn
                    );
                    // Execute SQL
                    $this->db->exec($sql);
                }
            }
        }
    }
}
/**
 * @filemeta.description Drops language columns to the public database
 * @filemeta.features Alters public database, droping language columns to all "loc" comment columns
 */
/**
 * @filemeta.description Drops language columns from the public database
 * @filemeta.features Alters public database, dropping language columns for all "loc" comment columns
 */
protected function dropLangColumn($newlang_prefix = '') {
    // Get all tables
    foreach ($this->listTables() as $table) {
        // Fetch table metadata
        $columns = $this->db->tableMeta($table);

        // Loop through columns
        foreach ($columns as $column) {
            $oldColumn = $column['COLUMN_NAME'];
            $columnComment = trim($column['COLUMN_COMMENT']);

            // Check if the column has a "loc" comment
            if ($columnComment === 'loc') {
                // Construct new column name
                $newColumn = $oldColumn . "_" . $newlang_prefix;

                // Check if the new column exists
                if (in_array($newColumn, array_column($columns, 'COLUMN_NAME'))) {
                    // Prepare SQL to drop the new column
                    $sql = sprintf(
                        "ALTER TABLE `%s` DROP COLUMN `%s`",
                        $table,
                        $newColumn
                    );
                    // Execute SQL
                    $this->db->exec($sql);
                }
            }
        }
    }
}


}