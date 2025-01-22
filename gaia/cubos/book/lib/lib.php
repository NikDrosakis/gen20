<span style="float:left;" onclick="gs.ui.goto(['previous','lib','id',G.id,'/lib?id='])" class="next glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
<span style="float:right" onclick="gs.ui.goto(['next','lib','id',G.id,'/lib?id='])" class="next glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
<h2 style="cursor:pointer">Libraries</h2>
<button type="button" style="border:none;background:none;" id="newlib">New Manual Entry</button>
<?php
if($this->G['id']!=''){

include $this->G['SITE_ROOT'] . "main/lib_edit.php";

}else{

$params['page']=$page=$this->page;
$sel=$this->booklists($params);

?>
<div id="libraries">
<?php include PUBLIC_ROOT_WEB."main/{$page}/{$page}_archive.php"; ?>
</div>
<div id="pagination" class="paginikCon"></div>

<?php } ?>