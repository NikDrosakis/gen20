# Gen20 Glossary

## filemeta
@[table.field]  table.field content (strictly this style) inside <!--  -->	or /**  */
<script> 		filemeta.script 
<style> 		save/update/bundle to filemeta.css  starting <style> endofcontent </style>
<head> 			filemeta.head starting <head> endofcontent </head>
@cron 			create/update cron 

## filemetacore
@[method]		filemetacore.description of class method

## sql COMMENT  
readonly      set not edited
img 		  set an <img> by Form/Template
img-upload 	  set an <img> + upload by Form/Template
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
 		
 