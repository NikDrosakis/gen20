# Gen20 Glossary

## filemeta
@[table.field]  table.field content (strictly this style) inside <!--  -->	or /**  */
<script> 		filemeta.script 
<style> 		save/update/bundle to filemeta.css  starting <style> endofcontent </style>
<head> 			filemeta.head starting <head> endofcontent </head>
@cron 			create/update cron 
@filemeta.description	update filemeta.description
@filemeta.todo          update filemeta.todo
@filemeta.features      update filemeta.features
@filemeta.doc           update filemeta.doc

## filemetacore
@filemetacore.description	update filemetacore.description
@filemetacore.todo          update filemetacore.todo
@filemetacore.features      update filemetacore.features
@filemetacore.doc           update filemetacore.doc

## sql COMMENT  
readonly      set not edited
img 		  set <img> 
img-icon 	  set <img> for icon library
img-photo 	  set <img> for user photo library
img-graph 	  set <img> for Graph creation
img-graph 	  set <img> for Graph creation
meta          comma separated words
twig	   	  set twig editor  by Form/Template
pug 	   	  set pug editor by Form/Template
sql 	   	  read as sql by Form/Template
selectjoin-[table.field] read as joined with other table
selectG-[key] read as $this->G[key]
auto 	   	  read as primary key (mostly id, not edit)
boolean		  read as checkbox boolean or FALSE/TRUE NO/YES 0/1
json	   	  read as json  
exe 		  render button for execution
loc 		  localized field to offer auto translation if null

## folders
cubo 		folder with cubos
compos		folder with components
main 		admin/folder 
 		
 
