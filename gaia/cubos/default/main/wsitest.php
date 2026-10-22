<?php
//$openai= $this->requestWSI('openai/chat',["message"=>"hello there?"]);
//$gaia= $this->requestWSI('gaia/user',[],'get');
//$botpress= $this->requestWSI('botpress/chat',["message"=>"how are you?"]);
//$test= $this->requestWSI('test/chat',["message"=>"how are you?"]);
//$hug= $this->requestWSI('huggingface/chat',["message"=>"how are you?"]);
//$docs= $this->requestWSI('docs',["message"=>"how are you?"]);
//$rapidapi= $this->requestWSI('rapidapi/gpt',["message"=>"how are you?"]);
//$timetable= $this->requestWSI('timetable/');
//xecho ($hub);
//xecho ($gaia);
//xecho ($botpress);
//xecho ($test);
//xecho ($docs);
//xecho ($timetable)
$this->connectToWebSocket('wss://vivalibro.com:3010/1');
// Subscribe to the Redis channel
$this->sendMessage("hello world"); //to send messages to the server
$this->redis->handleMessage("hello world2"); //to send messages to the server
