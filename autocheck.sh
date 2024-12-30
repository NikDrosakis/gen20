#!/bin/bash
#get .env vars
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
#autocheck.sh ACTION - CUBO - METADATA -


#SYNOPSIS
#1 ACTION
#2 CUBO
#2A cubo check cubo.tables of dbs and create sql mysqldump of those tables in cubo/[CUBO_NAME]
#if not exist run existing version sql to CREATE TABLE
#2B cubo backup

  #REVERSE
#4 filemeta ??
#5 img NULLS
#6 doc
#7 meta NULLS (comma)




#1 insert into actiongrp.name=[SERVICE_NAME],type='service' if name not exist
#  insert into action if name not exist kronos/v1/
  #     name=[SERVICE_NAME],
  #     actiongrp=returned #1,
  #     systemsid=(select id from systems where name='$systems.name')
  #     type='route'
  #     status='testing'


