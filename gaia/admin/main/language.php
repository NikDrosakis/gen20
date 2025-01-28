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
$dropNewLangs=$this->renderSelectField("language",$current_code,$langList);
?>
<!--default-->
<h2>Default Language: <?=$current_code?></h2>
<!--change-->
<h2>Add new language: <?php echo $dropNewLangs?></h2>
<!--colFormat-->
<?php
$allcolumnskeyword= $this->db->getColumnsWithComment($this->publicdb,'loc-default');
echo count($allcolumnskeyword)." in $this->publicdb";
//foreach($allcolumnskeyword as $columnDetails){
  //  $columnDetails['COLUMN_COMMENT'] = 'loc-default';
//$this->db->alter("$this->publicdb.{$columnDetails['TABLE_NAME']}", 'modify', $columnDetails);
//}
?>
<!--modify comments to loc-default -->

<!--table-->
<h2>Language Selected : </h2>
<!--activate-->
<button id="activationButton" onclick="runAction('buildNewLang','')" data-lang="" class="button">Activate New Language</button>


<?php //echo $this->buildTable($this->publicdb.".language");?>
<div id="justrun"></div>
<script>
document.addEventListener('DOMContentLoaded', async function() {
await gs.api.run("runActionplan","buildTable",{key:"gen_admin.systems",state:0},"justrun");
  })
  </script>
