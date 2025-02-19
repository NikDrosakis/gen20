<h3>Guide <?=$this->page?><h3>
<?php
$doc= $this->db->f("select guide from {$this->publicdb}.main where name=?",[$this->page])['guide'];
echo $doc;
?>
<button onclick="closePanel()" class="close-btn toprightcorner">X</button>