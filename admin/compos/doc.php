<!-- @deprecated now routed by admin ex async channel 2 with doc columns of tables-->
<h3>Documentation <?=$this->G['sub']?><h3>
<?php
$sub= $this->G['sub'];
if($sub!=''){
$doc= $this->admin->f("select doc from $sub where name=?",[$sub])['doc'];
}else{
$doc= $this->admin->f("select doc from admin_sub where name=?",[$this->sub])['doc'];
}
echo $doc;
?>
<button onclick="closePanel()" class="close-btn toprightcorner">X</button>


