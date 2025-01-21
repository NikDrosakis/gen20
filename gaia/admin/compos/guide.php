<h3>Guide <?=$this->sub?><h3>
<?php
$doc= $this->db->f("select guide from alinks where name=?",[$this->sub])['guide'];
echo $doc;
?>
<button onclick="closePanel()" class="close-btn toprightcorner">X</button>