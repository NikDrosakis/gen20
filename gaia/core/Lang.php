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
    $default_lang = $this->G['setup']['lang_default'];

    // Provide the dropdown
    $dropNewLangs = $this->renderSelectField(
        "language",
        $default_lang,
        $this->db->flist("SELECT code, name FROM {$this->publicdb}.language WHERE status=0")
    );

    // Default Language Label
    $html = "<label>Default Language: {$default_lang}</label>\n";

    // Column Format
    $allDefaultColumns = $this->db->getColumnsWithComment($this->publicdb, 'loc-default');
    $html .= count($allDefaultColumns) . " columns in {$this->publicdb}\n<br/>";

    // Change Language
    $html .= "<label>Add new language: {$dropNewLangs}</label>\n<br/>";

    $installed_langs = $this->db->flist("SELECT code FROM {$this->publicdb}.language WHERE status=2 AND code!=?", ['en']);

    foreach ($installed_langs as $lang) {
        $allcols = $this->db->getColumnsWithComment($this->publicdb, "loc-$lang");
        $html .= count($allcols) . " columns in $lang\n<br/>";
        $html .= "<button id='activationButton' data-method='dropLang' data-value='$lang' class='button sync-language' onclick=\"gs.api.bind(this)\">Remove $lang Language</button>\n<br/>";
    }

    // Selected Language Label
    $html .= "<label>Language Selected: <span class='sync-language'></span></label>\n<br/>";

    // Activate New Language Button
    $html .= "<button id='activationButton' data-method='buildNewLang' class='button sync-language' onclick=\"gs.api.bind(this)\">Activate New Language</button>\n<br/>";

    return $html;
}


protected function buildNewLang($value = '') {
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
        //update status
        $this->db->q("UPDATE {$this->publicdb}.language SET status=2 where code=?",[$value]);
    }

    return true;
}
protected function dropLang($prefix) {
    $prefix = is_array($prefix) ? $prefix['value'] : $prefix;
    if (!$prefix) {
        throw new InvalidArgumentException("Language prefix is required.");
    }
    // Get all columns that have "loc-$prefix" in their comment
    $allColumns = $this->db->getColumnsWithComment($this->publicdb, "loc-$prefix");
    // Iterate over the columns and drop each one
    foreach ($allColumns as $col) {
        $this->db->alter("{$this->publicdb}.{$col['TABLE_NAME']}", "drop", ['COLUMN_NAME' => $col['COLUMN_NAME']]);
    }
//update status
        $this->db->q("UPDATE {$this->publicdb}.language SET status=0 where code=?",[$prefix]);
    return true;
}

}