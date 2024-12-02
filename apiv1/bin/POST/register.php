<?php
$q= $this->register("UPDATE user SET phase=0 WHERE id=? AND regid=?", array($this->id,$this->regid));
if(!$q){ $data='NO';}else{
    $data='OK';
}