<h3>Guide <?=$this->sub?><h3>
<?php
$doc= $this->admin->f("select guide from admin_sub where name=?",[$this->sub])['guide'];
echo $doc;