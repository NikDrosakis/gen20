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


protected function buildNewLangUI() {
    $current_code = "en";
    $default_lang = $this->G['is']['lang_primary'];
    // Provide the dropdown
    $dropNewLangs = $this->renderSelectField(
    "language",
    $current_code,
    $this->db->flist("SELECT code, name FROM {$this->publicdb}.language")
    );

    //-- Default -->
    $html = "<label>Default Language: {$current_code}</label>";

    //-- Change -->
    $html .= "<label>Add new language: {$dropNewLangs}</label>";

    //-- Column Format -->
    $allDefaultColumns = $this->db->getColumnsWithComment($this->publicdb, 'loc-default');
    $allDeColumns = $this->db->getColumnsWithComment($this->publicdb, 'loc-de');

    $html .= count($allDefaultColumns) . " columns in {$this->publicdb}";
    $html .= count($allDeColumns) . " columns in {$this->publicdb}";
    //-- Table -->
    $html .= "<br/><label>Language Selected: <span class='sync-language'></span></label>";
    //-- Activate -->
    $html .= "<br/><button id='activationButton' data-method='addLanguageColumn' class='button sync-language' onclick=\"gs.api.bind(this)\">Activate New Language</button>";
    $html .= "<br/>";
    return $html;
}

public function addLanguageColumn($value = '') {
$value=is_array($value) ? $value['value'] : $value;
    if (!$value) {
        throw new InvalidArgumentException("New language code is required.");
    }

    $allDefaultColumns = $this->db->getColumnsWithComment($this->publicdb, 'loc-default');

    // Add the new column after the original column
    foreach ($allDefaultColumns as $col) {
        // Construct new column name: columnname_langcode
        $newColumnName = "{$col['COLUMN_NAME']}_{$value}";

        // Clone existing column details, modify name & comment
        $newColumnDetails = $col;
        $newColumnDetails['COLUMN_NAME'] = $newColumnName;
        $newColumnDetails['COLUMN_COMMENT'] = "loc-{$value}";

        // Perform the database alteration
        $this->db->alter("{$this->publicdb}.{$col['TABLE_NAME']}", "add", $newColumnDetails, $col['COLUMN_NAME']);
    }

    return true;
}

/**
 * @filemeta.description Adds new language columns to the public database
 * @filemeta.features Alters public database, adding new language columns to all "loc" comment columns
 */
protected function addLangColumn($newlang_prefix = '') {
    // Get all tables
    foreach ($this->db->show("tables") as $table) {
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
    foreach ($this->db->show("tables",$this->publicdb) as $table) {
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