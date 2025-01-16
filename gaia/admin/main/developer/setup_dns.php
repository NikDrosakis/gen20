//automate page title and main links (from metadata)
//update form set limit to 10
//get nginx webservers
//get bind domains

//switch admin domain from setup & all dashboard will change domain
//check filesystem (standardize public filesystem)

<?php

xecho($this->getZones());

$output = shell_exec('sudo systemctl reload nginx');
echo "<pre>$output</pre>";
