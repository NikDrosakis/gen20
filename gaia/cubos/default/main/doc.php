<!-- @deprecated now routed by admin ex async channel 2 with doc columns of tables-->
<h3>Documentation <?=$this->G['sub']?><h3>
<?php
$sub= $this->sub;
if($sub!=''){
$doc= $this->db->f("select gen_admin.doc from $sub where name=?",[$sub])['doc'];
}else{
$doc= $this->db->f("select gen_admin.doc from {$this->publicdb}.main where name=?",[$this->page])['doc'];
}
echo $doc;
?>
<button onclick="closePanel()" class="close-btn toprightcorner">X</button>


