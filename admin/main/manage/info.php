<h3>WEBSERVER</h3>
<span id="webserver"><?=$this->isWebserver()['name'];?></span>
<span id="webserverversion"><?=$this->isWebserver()['version'];?></span>
<h3 id="system"><?=$this->isOs()?></h3>
<?php
$webserver=$this->isWebserver();
$mysqlVersion = shell_exec('mysql --version');
echo $mysqlVersion;
echo $fspace= @disk_free_space("/")/(1024*1024*1024);
echo $mem= $this->mem()/(1024*1024);
exec ("find ".SITE_ROOT." -type d -exec chmod 0777 {} +");
exec ("find ".SITE_ROOT." -type f -exec chmod 0777 {} +");
?>
<div id="version"></div>