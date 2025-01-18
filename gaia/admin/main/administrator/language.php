<style>
/* Base styles for the grid */
body.grid-enabled {
  background-image: linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px);
  background-size: 5px 5px; /* 5x5 pixel squares */
  position: relative;
}

.grid-mode-admin {
  background-color: rgba(255, 255, 255, 0.7); /* Light overlay for admin mode */
}

.grid-mode-public {
  background-color: transparent;
}
</style>



<?php
$current_code="en";
//$current_code=$this->G['is']['lang_primary'];

//get all loc fields of database
$langList=$this->db->flist("select code,name from {$this->publicdb}.language");
xecho($langList);

//provide the dropdown
$dropNewLangs=$this->drop($langList,$current_code,'addLangColumn');
xecho($this->db->show("engine","gen_admin"));
?>
<!--default-->
<h2>Default Language: <?=$current_code?></h2>
<!--change-->
<h2>Add new language: <?=$dropNewLangs?></h2>
<!--activate-->
<button id="activationButton" onclick="runAction('buildNewLang','')" data-lang="" class="button">Activate New Language</button>
<!--table-->
<h2>Language Table:</h2>

<?php exit();?>
<?=$this->buildTable($this->publicdb.".language");?>
