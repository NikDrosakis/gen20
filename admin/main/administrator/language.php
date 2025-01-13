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
$current_code=$this->G['is']['lang_primary'];
$langList=$this->db->flist("select code,name from gen_admin.language");
$dropNewLangs=$this->drop($langList,"language",'addLangColumn');
?>
<h2>Current Language: <?=$langList[$current_code]?><h2>

<h2>Add new Language: <?=$dropNewLangs?><h2>

<button style="display:none" id="activationButton" data-lang="" class="button">Activate New Language</button>

<script>

</script>



<?php

//echo $this->pugTest();

//xecho($this->buildNewlangColumns());
//logging();

//set_error_handler('customErrorHandler');

//captureFunctionCalls();
?>

