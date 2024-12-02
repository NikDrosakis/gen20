<?php
xecho ($this->experimental_pages("lab"));
//xecho($this->gpm->fa("select * from systems"));
//λύθηκε το θέμα της Form Gpm
xecho($this->mon->listCollections());
$chat1=$this->mon->fa("chat1",["cid"=>3701232]);

//xecho($this->gsolr->search("love"));
xecho($chat1['chat']);
