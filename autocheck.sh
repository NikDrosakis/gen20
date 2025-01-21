#!/bin/bash
#get .env vars
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
#autocheck.sh ACTION - CUBO - METADATA -


#SYNOPSIS
#1 ACTION


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


