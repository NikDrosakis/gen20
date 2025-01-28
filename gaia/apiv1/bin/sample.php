<?php
/** witch method POST GET etc
file as $this->id
 /api/bin/$this->method."/".$this->id
 $action as request param
 read api request for data from file  /api/bin/

 $user= $spd->fetch("SELECT uid,loggedin FROM user_app WHERE regid=?",array($this->id));
 if(empty($user)){
 //    $q= $spd->query("INSERT INTO user_app (regid,loggedin) VALUES(?,1)", array($this->id));
     $q= $spd->query("INSERT INTO user_app (regid) VALUES(?)", array($this->id));
 }
     $data='ok';
     //running class
     $c=new Count;
     $data = $c->data($this->action,$this->id,$this->grp);

     //returning array $data=array(1=>'goood',2=>'better');
 */