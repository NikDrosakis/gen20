<?php

if($this->G['id']!=''){

include $this->G['SITE_ROOT'] . "main/publisher_edit.php";

}else{

$params['page']=$page=$this->page;
$sel=$this->booklists($params);
?>

<div id="publisher">
<?php
//xecho($sel);
include PUBLIC_ROOT_WEB."main/{$page}/{$page}_archive.php";
?>
</div>

<div id="pagination" class="paginikCon"></div>

<?php } ?>