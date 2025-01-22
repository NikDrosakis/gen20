<?php

if($this->G['id']!=''){
include $this->G['SITE_ROOT'] . "main/writer_edit.php";

} else{

$params['page']=$page=$this->page;
$sel=$this->booklists($params);
?>
<div id="writer">
<?php include PUBLIC_ROOT_WEB."main/{$page}/{$page}_archive.php"; ?>
</div>
<div id="pagination" class="paginikCon"></div>

<?php } ?>

