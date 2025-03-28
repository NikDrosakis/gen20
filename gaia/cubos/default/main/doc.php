<!-- @deprecated now routed by admin ex async channel 2 with doc columns of tables-->
<h3>Documentation <?=$this->G['page']?><h3>
<?php
$doc= $this->db->f("select doc from {$this->publicdb}.page where name=?",[$this->page])['doc'];
echo $doc;
?>
<button onclick="closePanel()" class="close-btn toprightcorner">X</button>


