<h3>Documentation <?=$this->G['sub']?><h3>
<?php
$sub= $this->G['sub'];
if($sub!=''){
$doc= $this->admin->f("select doc from $sub where name=?",[$sub])['doc'];
}else{
$doc= $this->admin->f("select doc from admin_sub where name=?",[$this->sub])['doc'];
}
echo $doc;