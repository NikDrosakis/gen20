<?php
namespace Core;

/**
 Action Ermis is the beginning of Action with it's websocket server and fs.watch that dominates the system
 exeActions exported to index.js:
 `Instantiate Actions |  const { exeActions } = require('./action');exeActions(app);
 Running Web Socket Server for RealTime Actions; WServer(server,app,exeActions);

--> uses Maria, Messenger
--> runs in systemsid ermis
 TODO utilize ci/cd process (through Github) example in the end
 TODO utilize the power of event driven kafka logic
 TODO utilize the power of unit testing
 TODO use the manifest.md as high level filesystem & sql standarization

@filemetacore.description Get Add Manage Resources from web

@filemetacore.features
Check standard nulls of DB and suggest to complete
Check all actiongrp if active

@filemetacore.todo
- add more NULL img actiongrp
- aDDMore resource text and bw and diff types of images
- Google Books API
- Open Library API
- LibraryThing API
- Use OpenCV, Pillow python job for kronos
*/

trait Action {
/**
the Core does not need to publish to WS just in case of realtime need
*/
use WS;
use Manifest;

protected function upsertActionFromFS(){

}
/**
One action triggered from button
*/
protected function runAction(array $params=[]){
    $action=$params['key'];
    //this is one action later execute a plan (series of actions)
    $record = $this->admin->f("
     SELECT actiongrp.keys, actiongrp.name as grpName, actiongrp.base, action.*
                FROM action
                LEFT JOIN actiongrp ON actiongrp.id = action.actiongrpid
                WHERE action.id=$action
    ");
    return $record;
}

protected function addAction(array $key_value_array=[]){
    $this->admin->inse("action",$key_value_array);
}





}