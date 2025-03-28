<?php
/** @filemeta.description starting file common for PUBLIC,ADMIN,API systems with nginx and core */
/**
@filemeta.updatelog
v1 procedural library
v2 geocode,gps2Num,get_image_location functions
v3 logging functions
*/
// @filemeta.features logging function execution with magic constants
function logging() {
    $doc = "#doc: Function exampleFunction executed in file " . __FILE__ . " on line " . __LINE__."\n";
    $doc .= " with method " . __METHOD__."\n";
    $doc .= " at " . date('Y-m-d H:i:s');
    error_log($doc); // Log to PHP error log or to a custom log file
}

// @filemeta.features logging with debug_backtrace()
function logCall() {
    $backtrace = debug_backtrace();
    $logData = "#doc: Function call stack at " . date('Y-m-d H:i:s') . "\n";

    foreach ($backtrace as $call) {
        $logData .= "#file: " . $call['file'] . " | #line: " . $call['line'] . " | #function: " . $call['function'] . "\n";
    }

    error_log($logData); // Log to PHP error log or to a custom log file
}

// @filemeta.features logging as a middleware
function middlewareLog($handler) {
    return function() use ($handler) {
        // Log the initial request, such as the route hit
        $route = $_SERVER['REQUEST_URI']; // or another routing mechanism
        error_log("#doc: Incoming request to route " . $route . " at " . date('Y-m-d H:i:s')."\n");

        // Call the handler (the actual controller function)
        $response = call_user_func($handler);

        // Log the response or function execution details
        $backtrace = debug_backtrace();
        $logData = "#doc: Function call stack after request\n";

        foreach ($backtrace as $call) {
            $logData .= "#file: " . $call['file'] . " | #line: " . $call['line'] . " | #function: " . $call['function'] . "\n";
        }

        error_log($logData);

        return $response;
    };
}

// @filemeta.features logging as error handling
function customErrorHandler($errno, $errstr, $errfile, $errline) {
    $logData = "#doc: Error caught at " . date('Y-m-d H:i:s') . " | File: $errfile | Line: $errline | Error: $errstr";
    error_log($logData); // Log to PHP error log or a custom log file
}

// @filemeta.features logging as buffer
function captureFunctionCalls() {
    ob_start();
    register_shutdown_function(function() {
        $output = ob_get_clean();

        // Capture backtrace or other relevant data
        $backtrace = debug_backtrace();
        $logData = "#doc: Function call stack at the end of script\n";

        foreach ($backtrace as $call) {
            $logData .= "#file: " . $call['file'] . " | #line: " . $call['line'] . " | #function: " . $call['function'] . "\n";
        }

        error_log($logData); // Log to PHP error log or custom log file
    });
}


// @filemeta.features Function to remove folders and files
    function rrmdir($dir) {
        if (is_dir($dir)) {
            $files = scandir($dir);
            foreach ($files as $file)
                if ($file != "." && $file != "..") rrmdir("$dir/$file");
            rmdir($dir);
        }
        else if (file_exists($dir)) unlink($dir);
    }

// @filemeta.features Function to Copy folders and files
    function rcopy($src, $dst) {
        if (file_exists ( $dst ))
            rrmdir ( $dst );
        if (is_dir ( $src )) {
            mkdir ( $dst );
            $files = scandir ( $src );
            foreach ( $files as $file )
                if ($file != "." && $file != "..")
                    rcopy ( "$src/$file", "$dst/$file" );
        } else if (file_exists ( $src ))
            copy ( $src, $dst );
    }

// @filemeta.features is associative array
function is_assoc(array $arr){
    if (array() === $arr) return false;
    return array_keys($arr) !== range(0, count($arr) - 1);
}

// @filemeta.features json parse from php
function link_exist($link){
if (@fopen($link,'r') !='') {return true;} else{ return false;}
}

// @filemeta.features limit for pagination
function limit($text, $limit=10){
   return substr( $text,0,$limit );  
}
// @filemeta.features limit for pagination with space
function limit_text_with_space( $text, $limit){
  if( strlen($text)>$limit )	{
    return substr( $text,0,-(strlen(strrchr($text,' '))) );
  }  
}

// @filemeta.features parse string
function contains($str,$sub){
    return strpos($str, $sub)!== false ? true : false;
}

// @filemeta.features convert to greek chars
function greeklish($str){
$greekLetters=array('"',"'",'<','>','?',':','*','(',')',' ','-','α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω','Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω','ά','έ','ή','ί','ό','ύ','ώ','ς');
$enLetters=array('','','','','','','_','_','_','_','_','a','v','g','d','e','z','i','th','i','k','l','m','n','x','o','p','r','s','t','u','f','h','ps','o','A','B','G','D','E','Z','I','Th','I','K','L','M','N','X','O','P','R','S','T','Y','F','Ch','Ps','O','a','e','i','i','o','u','o','s');
return str_replace($greekLetters, $enLetters,$str);
}

// @filemeta.features systime left from current timestamp
function systime($tstamp,$fromnow=false,$report=false){
    $tstamp = $fromnow==true ? time() - $tstamp : $tstamp;
	$time='';
	$min=60;$hour=3600;$day=86400;$year=31536000;

	if ($tstamp < $min){ $report==true ? $timeMsg= $tstamp.' '.'sec' : $timeMsg = 'now';}
	//tstamp > minute
	elseif ($tstamp >= $min && $tstamp < $hour ){ 
	$time = $tstamp / $min; 	
	$sec = $sec < 10 ? str_pad($tstamp -((int) $time * $min), 2, "0", STR_PAD_LEFT) : $tstamp -((int) $time * $min);
	$timeMsg= (int)$time.' '.((int)$time!=1?'mins':'min').($report==true ? ' '.$sec.' '.'sec' : '');
	}	
	//tstamp > hour
	elseif ($tstamp >= $hour && $tstamp < $day ){ 
	$time = $tstamp / $hour;	
	if ($time - (int)$time !=0) { 
	$timeMsg= (int)$time.' '.((int)$time!=1? 'hrs':'hour').' & '.(int)(($time-(int)$time) * $min);
	} else { $timeMsg=$time.' '.($time!=1?'hours':'hour'); }
	}
	//tstamp > day
	elseif ($tstamp >= $day && $tstamp < $year){ $time = $tstamp / $day;			
		$tstampDiff= $time - (int)$time;
		if ($tstampDiff !=0) { $timeMsg= (int)$time.' '.((int)$time!=1?'days':'day');}else { $timeMsg=$time.' '.($time!=1?'days':'day'); }
		}	
	//tstamp > year
	elseif ($tstamp >= $year){ $time = $tstamp / $year;			
		$tstampDiff= $time - (int)$time;
		if ($tstampDiff !=0) { $timeMsg= (int)$time.' '.((int)$time!=1?'years':'year').' & '.(int)($tstampDiff * 365).' '.((int)($tstampDiff * 365)!=1?'days':'day');}else { $timeMsg=$time.' '.($time!=1?'years':'year'); }
		}
		return $timeMsg;
	}	

// @filemeta.features sortArrayByArray
function sortArrayByArray($array,$orderArray) {
    $ordered = array();
    foreach($orderArray as $key) {
        if(array_key_exists($key,$array)) {
            $ordered[$key] = $array[$key];
            unset($array[$key]);
        }
    }
    return $ordered;
}

// @filemeta.features save file with full privileges
function write_file($filename,$filedata=''){
if (!file_exists($filename)){
        file_put_contents($filename, $filedata);
} else{
file_put_contents($filename,$filedata, FILE_APPEND | LOCK_EX);
}
    chmod($filename, 0777);
}

// @filemeta.features read file
function read_file($file){
header('Content-type: text/html; charset=UTF-8');
$fh = fopen($file, 'r');
$data=fread($fh, filesize($file));
fclose($fh);
return $data;
}

// @filemeta.features return filesize in kb
function file_size($path){
    $io = popen('/usr/bin/du -sk ' . $path, 'r');
    $size = fgets($io, 4096);
    $size = substr($size, 0, strpos($size, "\t"));
    pclose($io);
    return round($size/1024);
}

// @filemeta.features echoes with pre tag for arrays with button to save clipboard
function xecho($quer){
    echo '<button onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText || this.nextElementSibling.value)" class="glyphicon glyphicon-copy"></button><pre>';
    print_r($quer);
echo '</pre>';
}

// @filemeta.features Start output buffering to capture print_r output
function xechox($quer) {
    ob_start();
    print_r($quer);
    $printedQuery = ob_get_clean();
    // @filemeta.features  Safely escape the printed query for HTML output
    $escapedQuery = htmlspecialchars($printedQuery, ENT_QUOTES, 'UTF-8');
    // @filemeta.features  Build and return the output string
    return '<div class="gs-preview">
                <button onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText || this.nextElementSibling.value)"
                        class="glyphicon glyphicon-copy">
                    Copy
                </button>
                <pre>' . $escapedQuery . '</pre>
            </div>';
}

// @filemeta.features creates excerpt from string
function excerpt($str, $link='', $startPos=0, $maxLength=300) {
		if(strlen($str) > $maxLength) {
			$excerpt   = substr($str, $startPos, $maxLength-3);
			$lastSpace = strrpos($excerpt, ' ');
			$excerpt   = substr($excerpt, 0, $lastSpace);
			$excerpt  .= '<a href="'.$link.'">[...]</a>';
		} else {
			$excerpt = $str;
		}
		return $excerpt;
	}

// @filemeta.features  converts array to ini file
function write_ini($array, $file){
    $res = array();
    foreach($array as $key => $val) {
	if(is_array($val)){
		$res[] = "[$key]";
		foreach($val as $skey => $sval) $res[] = "$skey = ".(is_numeric($sval) ? $sval : '"'.$sval.'"');
	} else $res[] = "$key = ".(is_numeric($val) ? $val : '"'.$val.'"');
    }
   if(file_put_contents($file, implode("\r\n", $res))){return true;}else{return false;}
} 

// @filemeta.features  htmlencode
function htmlencode($value, $flags=ENT_QUOTES, $encoding ="UTF-8"){
	return htmlentities($value, $flags, $encoding);
}

// @filemeta.features  htmldecode
function htmldecode($value, $flags=ENT_QUOTES, $encoding ="UTF-8"){
	$elements = array("\r", "\n");
	$result = array(" ", " ");
	$final=trim(str_replace($elements, $result, $value));	
	$decoded= html_entity_decode($final, $flags, $encoding);
	return ($decoded);
}

// @filemeta.features  delete recursively
function delTree($dir) {
   $files = array_diff(scandir($dir), array('.','..')); 
    foreach ($files as $file) { 
      (is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file"); 
    } 
    return rmdir($dir); 
  } 

// @filemeta.features  get total size
function format_size($size) {
    global $action, $units;
    $units = explode(' ', 'B KB MB GB TB PB');
    $mod = 1024;
    for ($i = 0; $size > $mod; $i++) {
        $size /= $mod;
    }
    $endIndex = strpos($size, ".")+3;
    return substr( $size, 0, $endIndex).' '.$units[$i];
}

// @filemeta.features  get total size in kb
function folder_size($path,$round=false) {
    $total_size = 0;
    $files = scandir($path);
    $cleanPath = rtrim($path, '/'). '/';

    foreach($files as $t) {
        if ($t<>"." && $t<>"..") {
            $currentFile = $cleanPath . $t;
            if (is_dir($currentFile)) {
                $size = folder_size($currentFile);
                $total_size += $size;
            }
            else {
                $size = filesize($currentFile);
                $total_size += $size;
            }
        }   
    }
    return $round==true ? round($total_size/1024) : $total_size/1024;
}

// @filemeta.features  get dir size
function dirSize($directory,$round=false) {
    $size = 0;
    foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory)) as $file){
        $size+=$file->getSize();
    }
    return $round==true ? round($size/1024) : $size/1024;
}

// @filemeta.features  get files with pattern to array
function rglob($pattern, $flags = 0) {
    $files = glob($pattern, $flags); 
    foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
        $files = array_merge($files, rglob($dir.'/'.basename($pattern), $flags));
    }
    return $files;
}

// @filemeta.features  get files with pattern to array
function glob_($pattern=''){
$files=array_filter(glob($pattern), 'is_file');
return $files;
}

// @filemeta.features  read_folder
function read_folder($directory, $except = array(), $uniqueID = false, $sort = false) {
    $return = array();

    // Ensure $directory is a string and not null before calling strpos
    if (is_string($directory) && strpos($directory, "http://") !== false) {
        $contents = @file_get_contents($directory);
        if ($contents !== false) {
            preg_match_all("|href=[\"'](.*?)[\/][\"']|", $contents, $hrefs);
            $return = array_values($hrefs[1]);
        }
    } elseif ($uniqueID !== false) {
        if (is_string($directory) && is_dir($directory)) {
            $dirhandler = opendir($directory);
            $files = [];
            $nofiles = 0;
            while ($file = readdir($dirhandler)) {
                if ($file != '.' && $file != '..') {
                    $nofiles++;
                    $files[] = $file;
                }
            }
            closedir($dirhandler);
            $return = array_values($files);
        }
    } else {
        // Ensure $directory is a string and not null before calling is_dir
        if (is_string($directory) && is_dir($directory)) {
            $dirhandler = opendir($directory);
            $files = [];
            $nofiles = 0;
            while ($file = readdir($dirhandler)) {
                if ($file != '.' && $file != '..' && !in_array($file, $except)) {
                    $nofiles++;
                    $files[$nofiles] = $file;
                }
            }
            closedir($dirhandler);
            $return = is_array($files) ? array_values($files) : [];
        }
    }

    // Sort the result array if required
    if ($sort === true && is_array($return)) {
        sort($return);
    }

    return $return;
}

// @filemeta.features  read_folder_recursive
function read_folder_recursive($dir,&$results = array()){
    $files = scandir($dir);

    foreach($files as $key => $value){       
	   $path = realpath($dir.DIRECTORY_SEPARATOR.$value);
		$folder=substr(dirname($path),strlen(SITE_ROOT));	 
	 if(!in_array($folder,array('libs','gaia/lib'))){
	 
        if(!is_dir($path)) {
            $results[] = $path;
        } else if($value != "." && $value != "..") {		
            read_folder_recursive($path, $results);
            $results[] = $path;
        }
    }
	}
    return $results;
}

// @filemeta.features get lines of file
function filelines($file){
$linecount = 0;
$handle = fopen($file, "r");
while(!feof($handle)){
  $line = fgets($handle);
  $linecount++;
}
return (int)$linecount;
fclose($handle);
}

// @filemeta.features read_line
function read_line($file, $line){
if (file_exists($file) && $line !==null) {
$lines=file($file);
return $lines[$line];
}
}

// @filemeta.features dir_tree
function dir_tree($dir){
	$path = '';
	$stack[] = $dir;
	while($stack)
	{
		$thisdir = array_pop($stack);
		if($dircont = scandir($thisdir))
		{
			$i=0;
			while(isset($dircont[$i]))
			{
				if($dircont[$i] !== '.' && $dircont[$i] !== '..')
				{
					$current_file = $thisdir.DIRECTORY_SEPARATOR.$dircont[$i];
					if(is_file($current_file))
					{
						$path[] = $thisdir.DIRECTORY_SEPARATOR.$dircont[$i];
					}
					elseif (is_dir($current_file))
					{
						$path[] = $thisdir.DIRECTORY_SEPARATOR.$dircont[$i];
						$stack[] = $current_file;
					}
				}
				$i++;
			}
		}
	}
	return $path;
}

// @filemeta.features delete_dir
function delete_dir($dir) {

    if (!file_exists($dir)) return true;
    if (!is_dir($dir)) return unlink($dir);
    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') continue;
        if (!delete_dir($dir.DIRECTORY_SEPARATOR.$item)) return false;
    }
    return rmdir($dir);	
}
function xrmdir($path)
{
    if (is_dir($path) === true)
    {
        $files = array_diff(scandir($path), array('.', '..'));

        foreach ($files as $file)
        {
            xrmdir(realpath($path) . '/' . $file);
        }

        return rmdir($path);
    }

    else if (is_file($path) === true)
    {
        return unlink($path);
    }

    return false;
}

// @filemeta.features explode with multiple params
function multiexplode ($delimiters,$string) { 
    $ready = str_replace($delimiters, $delimiters[0], $string);
    $launch = explode($delimiters[0], $ready);
    return  $launch;
}

// @filemeta.features sanitize tags
function striptags($textarea){
$textarea=str_replace("'",'&#39;',$textarea);
//$textarea1=str_replace("\xA0", ' ', $textarea);
$textarea2= multiexplode(array("|","href","//"),$textarea);

foreach ($textarea2 as $string){
if (strpos($string,'href') !=true || strpos($string,'www') !=true)
$textArray[]=preg_replace("#<a.*?>([^>]*)</a>#i", "$1", $string);
}
//var_dump($textArray);
return implode(' ',$textArray);

}

// @filemeta.features get_client_ip
function get_client_ip() {
    $ipaddress = '';
    if (getenv('HTTP_CLIENT_IP'))
        $ipaddress = getenv('HTTP_CLIENT_IP');
    else if(getenv('HTTP_X_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
    else if(getenv('HTTP_X_FORWARDED'))
        $ipaddress = getenv('HTTP_X_FORWARDED');
    else if(getenv('HTTP_FORWARDED_FOR'))
        $ipaddress = getenv('HTTP_FORWARDED_FOR');
    else if(getenv('HTTP_FORWARDED'))
       $ipaddress = getenv('HTTP_FORWARDED');
    else if(getenv('REMOTE_ADDR'))
        $ipaddress = getenv('REMOTE_ADDR');
    else
        $ipaddress = 'UNKNOWN';
    return $ipaddress;
}
// @filemeta.features profanity_filter SEARCH THE TEXT AND FIND DIRTY WORDS
function profanity_filter($textarea,$dirt=array()){
	//multi explode all the text to array
	$textarea= multiexplode(array("|"," ","//"),$textarea);

	//create the loop to check
	foreach ($textarea as $string){
	$textArray[]= preg_match_all("/(".implode('|',$dirt).")/", $string, $matches)
			? '<span style="background:yellow">'.$string.'</span>' 
			: $string;
	}
	return implode(' ',$textArray);
}
// @filemeta.features profanity_counter SEARCH THE TEXT AND COUNT DIRTY WORDS
function profanity_counter($textarea,$dirt=array()){
$counter =0;
$textArray=array();
//multi explode all the text to array
$textarea= multiexplode(array("|"," ","//"),$textarea);
//create the loop to check
foreach ($textarea as $string){
if(preg_match_all("/(".implode('|',$dirt).")/", $string, $matches)){ 
$counter +=1;
}
}
return (int)$counter;
}

// @filemeta.features recurse_copy
function recurse_copy($src,$dst) { 
    $dir = opendir($src); 
    @mkdir($dst); 
    while(false !== ( $file = readdir($dir)) ) { 
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) { 
                recurse_copy($src . '/' . $file,$dst . '/' . $file); 
            } 
            else { 
                copy($src . '/' . $file,$dst . '/' . $file); 
				chmod($dst . '/' . $file, 0777);				
            } 
        } 
    } 
    closedir($dir); 
}

// @filemeta.features update dir privileges
function chmod_r($path) {
    $dir = new DirectoryIterator($path);
    foreach ($dir as $item) {
        chmod($item->getPathname(), 0777);
        if ($item->isDir() && !$item->isDot()) {
            chmod_r($item->getPathname());
        }
    }
}

// @filemeta.features update permissions and privileges
function fsmodify($obj) {
    $chunks = explode('/', $obj);
    chmod($obj, is_dir($obj) ? 0777 : 0777);
    chown($obj, $chunks[2]);
    chgrp($obj, $chunks[2]);
}

// @filemeta.features file system modify
function fsmodifyr($dir)
{
    if($objs = glob($dir."/*")) {
        foreach($objs as $obj) {
            fsmodify($obj);
            if(is_dir($obj)) fsmodifyr($obj);
        }
    }

    return fsmodify($dir);
}
// @filemeta.features ZIP ONE OR MORE FILES USAGE zipfiles('classes',array('DBA.class.php','DB.class.php'));
function zipfiles($filename,$zipfiles=array()){
$zip = new ZipArchive();

foreach ($zipfiles as $zipfile){ 
if ($zip->open($filename, ZipArchive::CREATE)!== TRUE) {
    exit("cannot open <$filename>\n");
}
//$zip->addFromString("testfilephp.txt" . time(), "#1 This is a test string added as testfilephp.txt.\n");
//$zip->addFromString("testfilephp2.txt" . time(), "#2 This is a test string added as testfilephp2.txt.\n");
$zip->addFile($zipfile,$zipfile);
//echo "numfiles: " . $zip->numFiles . "\n";
//echo "status:" . $zip->status . "\n";
$zip->close();
}
}

// @filemeta.features sanitize filename
function sanitizeFilename(string $filename): string {
    // 1. Remove invalid characters
    $filename = preg_replace('/[^a-zA-Z0-9_\.\-]/', '', $filename);
    // 2. Remove leading or trailing dots, spaces, or underscores
    $filename = trim($filename, '. _');
    // 3. Prevent double dots (..) for security
    $filename = str_replace('..', '', $filename);
    return $filename;
}
// @filemeta.features zipfolder
function zipfolder($rootPath){
// Initialize archive object
$zip = new ZipArchive();
$zip->open($rootPath.'.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);

$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($rootPath),
    RecursiveIteratorIterator::LEAVES_ONLY
); 

foreach ($files as $name => $file)
{
    // Skip directories (they would be added automatically)
    if (!$file->isDir())
    {
        // Get real and relative path for current file
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($rootPath) + 1);

        // Add current file to archive
        $zip->addFile($filePath, $relativePath);
    }
} 
// @filemeta.features  Zip archive will be created only after closing object
$zip->close();
}
function unzip_folder($zipfile,$source,$target){
$source = 'version_1.x';
$target = '/path/to/target';

$zip = new ZipArchive;
$zip->open($zipfile);
for($i=0; $i<$zip->numFiles; $i++) {
    $name = $zip->getNameIndex($i);

    // Skip files not in $source
    if (strpos($name, "{$source}/") !== 0) continue;

    // Determine output filename (removing the $source prefix)
    $file = $target.'/'.substr($name, strlen($source)+1);

    // Create the directories if necessary
    $dir = dirname($file);
    if (!is_dir($dir)) mkdir($dir, 0777, true);

    // Read from Zip and write to disk
    $fpr = $zip->getStream($name);
    $fpw = fopen($file, 'w');
    while ($data = fread($fpr, 1024)) {
        fwrite($fpw, $data);
    }
    fclose($fpr);
    fclose($fpw);
}
}

// @filemeta.features unzip
function unzip($zipfile,$dst){
	$zip = new ZipArchive;
	if ($zip->open($zipfile) === TRUE) {
		if ($zip->extractTo($dst)){
			return true;	
		};
		$zip->close();		
	} else {
		return false;
	}
}

// @filemeta.features write_onfile
function write_onfile($file,$txt){
	$myfile = fopen($file, "w") or die("Unable to open file!");
	fwrite($myfile, $txt);
	fclose($myfile);
}
// @filemeta.features send_download
function send_download($file){
    $basename = basename($file);
    $length   = sprintf("%u", filesize($file));

    header('Content-Description: File Transfer');
	header("Content-Type: application/zip");
    header('Content-Disposition: attachment; filename="' . $basename . '"');
	header("Content-Transfer-Encoding: Binary");    
	header('Connection: Keep-Alive');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    header('Content-Length: ' . $length);

    set_time_limit(0);
    readfile($file);
}
// @filemeta.features randomPostCode
function randomPostCode($length = 5) {
return substr(str_shuffle("0123456789ACCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, $length);
}
// @filemeta.features query_string_rewrite
	function query_string_rewrite($url){
		$rewriten= multiexplode(array("=","&"),$url);
		//echo SITE_URL;
		for($i=1;$i < count($rewriten);$i+=2){
		return $rewriten[$i].'/';
		//echo '/';
		}
	}
// @filemeta.features redirect
function redirect($to=null,$permanent = false) {
	global $action,$lang;
 	if($permanent) {
	header('HTTP/1.1 301 Moved Permanently');
	} elseif(is_string($to) && $to!=null ){
	header('Location: '.$to); 	
	} elseif (is_array($to)){
	header('Location: '.http_build_query($to));
	}elseif($to == 0) {	
	header('Location: '.$_SERVER['REQUEST_URI']);
	} else{
	return null;	
	}
}

// @filemeta.features is_json
function isJson(string $string) {
    // First check if the input is a string, as only strings can be valid JSON
    if (!is_string($string)) {
        return false;
    }
 json_decode($string);
    return (json_last_error() === JSON_ERROR_NONE);
}
// @filemeta.features jsonget read & decode file
function jsonget($file){
	if(file_exists($file)){
	$content= file_get_contents($file);
	return json_decode($content,true);
	}else{
	return false;
	}
}
// @filemeta.features encode and save file
function jsonset($array, $filePath) {
    // Convert the array to a JSON string
    $jsonString = json_encode($array, JSON_PRETTY_PRINT);

    // Check if json_encode was successful
    if ($jsonString === false) {
        // Handle error in encoding, if necessary
        return false;
    }

    // Save the JSON string to the specified file
    $result = file_put_contents($filePath, $jsonString);

    // Check if file_put_contents was successful
    if ($result === false) {
        // Handle error in saving file, if necessary
        return true;
    }

    // Return success
    return true;
}
// @filemeta.features remove_whitespace
function remove_whitespace($str){
    return str_replace("  "," ",str_replace("\xc2\xa0",'',$str));
}

// @filemeta.features  Main function file
function file_tree($directory, $return_link, $extensions = array()) {
    // Generates a valid XHTML list of all directories, sub-directories, and files in $directory
    // Remove trailing slash
    if( substr($directory, -1) == "/" ) $directory = substr($directory, 0, strlen($directory) - 1);
    $code .= file_tree_dir($directory, $return_link, $extensions);
    return $code;
}
// @filemeta.features file_tree_dir
function file_tree_dir($directory, $return_link, $extensions = array(), $first_call = true) {
    // Recursive function called by php_file_tree() to list directories/files

    // Get and sort directories/files
    if( function_exists("scandir") ) $file = scandir($directory); else $file = php4_scandir($directory);
    natcasesort($file);
    // Make directories first
    $files = $dirs = array();
    foreach($file as $this_file) {
        if( is_dir("$directory/$this_file" ) ) $dirs[] = $this_file; else $files[] = $this_file;
    }
    $file = array_merge($dirs, $files);

    // Filter unwanted extensions
    if( !empty($extensions) ) {
        foreach( array_keys($file) as $key ) {
            if( !is_dir("$directory/$file[$key]") ) {
                $ext = substr($file[$key], strrpos($file[$key], ".") + 1);
                if( !in_array($ext, $extensions) ) unset($file[$key]);
            }
        }
    }

    if( count($file) > 2 ) { // Use 2 instead of 0 to account for . and .. "directories"
        $php_file_tree = "<ul";
        if( $first_call ) { $php_file_tree .= " class=\"filedir\""; $first_call = false; }
        $php_file_tree .= ">";
        foreach( $file as $this_file ) {
            if( $this_file != "." && $this_file != ".." ) {
                if( is_dir("$directory/$this_file") ) {
                    // Directory
                    $php_file_tree .= "<li class=\"tree-dir\"><a href=\"#\">" . htmlspecialchars($this_file) . "</a>";
                    $php_file_tree .= file_tree_dir("$directory/$this_file", $return_link ,$extensions, false);
                    $php_file_tree .= "</li>";
                } else {
                    // File
                    // Get extension (prepend 'ext-' to prevent invalid classes from extensions that begin with numbers)
                    $ext = "ext-" . substr($this_file, strrpos($this_file, ".") + 1);
                    $linkfile= $directory."/".urlencode($this_file);
                    $link = str_replace("[link]", $linkfile, $return_link);
                    $php_file_tree .= "<li class=\"tree-file " . strtolower($ext) . "\"><span style=\"cursor:pointer\" id=".$linkfile." onclick=\"$link\">".htmlspecialchars($this_file)."</span></li>";
                }
            }
        }
        $php_file_tree .= "</ul>";
    }
    return $php_file_tree;
}

// @filemeta.features find if array is multidimesional
function is_multi($a) {
    $rv = array_filter($a,'is_array');
    if(count($rv)>0) return true;
    return false;
}
// @filemeta.features get_class_methods_noparent
function get_class_methods_noparent($class){
    $f = new ReflectionClass($class);
    $methods = array();
    foreach ($f->getMethods() as $m) {
        if ($m->class == $class) {
            $methods[] = $m->name;
        }
    }
    return $methods;
}
// @filemeta.features del_reset_array
function del_reset_array($arr,$delkey){
    reset($arr);
    $key= key($arr);
    unset($arr[$delkey]);
    array_values($arr);
    $i=0;
    foreach($arr as $aid=>$aval){
        $b[$key+$i]=$aval;
        $i+=1;
    }
    return $b;
}

// @filemeta.features create subarray from keys
function sublist($array,$list=array()){
    $new=array();
    foreach($list as $li){
        $new[$li]=$array[$li];
    }
    return $new;
}
// @filemeta.features ismobile
function ismobile () {
    $user_agent = strtolower ( $_SERVER['HTTP_USER_AGENT'] );
    // matches popular mobile devices that have small screens and/or touch inputs
    // mobile devices have regional trends; some of these will have varying popularity in Europe, Asia, and America
    // detailed demographics are unknown, and South America, the Pacific Islands, and Africa trends might not be represented, here
    if ( preg_match ( "/phone|iphone|itouch|ipod|symbian|android|htc_|htc-|palmos|blackberry|opera mini|iemobile|windows ce|nokia|fennec|hiptop|kindle|mot |mot-|webos\/|samsung|sonyericsson|^sie-|nintendo/", $user_agent ) ) {
        // these are the most common
        return true;
    } else if ( preg_match ( "/mobile|pda;|avantgo|eudoraweb|minimo|netfront|brew|teleca|lg;|lge |wap;| wap /", $user_agent ) ) {
        // these are less common, and might not be worth checking
        return true;
    }else {
        return false;
    }
}
// @filemeta.features json2array any conf json
function json2array($file){
    if(file_exists($file)) {
        $json = file_get_contents($file);
        return json_decode($json, true);
    }
}

// @filemeta.features get timed
function timed(){
    return date('YmdHis');
}
// @filemeta.features convert timed to datetime format
function timedt($timed,$format='YmdHis'){
    $dt= str_split($timed);
    $Y= $dt[0].$dt[1].$dt[2].$dt[3];
    $m= $dt[4].$dt[5];
    $d= $dt[6].$dt[7];
    $H= $dt[8].$dt[9];
    $i= $dt[10].$dt[11];
    $s= $dt[12].$dt[13];
    $fm= str_split($format);
    $fmafter= array('Y'=>'-','m'=>'-','d'=>' ','H'=>':','i'=>':','s'=>'');
    end($fm);$lastkey=$fm[key($fm)]; foreach($fm as $f){$ft[]=$$f.($f==$lastkey ? '' :$fmafter[$f]);}
    return implode('',$ft);
}
// @filemeta.features convert unix timed to timestamp (database use)
function timedx($timed){
    return strtotime(timedt($timed));
}
// @filemeta.features filelistbycrit
function filelistbycrit($fileName, $crits=array()) {
    $lines = file($fileName);
    $list=array();
    foreach($crits as $crit) {
        if (!empty($lines)) {
            foreach ($lines as $lineNumber => $line) {
                if (strpos($line, $crit) !== false) {
//                    $list[] = $line;
                    $list[] = trim(explode("Query",$line)[1]);
                }
            }
        }
    }
    return $list;
}
// @filemeta.features geocode
function geocode($address){

    // url encode the address
 //   $address = urlencode($address);
     
    // google map geocode api url
	$url= 'http://nominatim.openstreetmap.org/reverse?format=json&lat='.$address['latitude'].'&lon='.$address['longitude'];
	//xecho($url);
 //   $url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=$address&key=AIzaSyB3NXrYxpqV86N4iBOfJgeQnVsIKha3qLM";
 $context = stream_context_create(
    array(
        "http" => array(
            "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
        )
    )
);
    // get the json response
    $resp_json = file_get_contents($url, false, $context);
     
    // decode the json
    $resp = json_decode($resp_json, true);
 
    // response status will be 'OK', if able to geocode given address 
  //  if($resp['status']=='OK'){
 if(!empty($resp)){
        // get the important data
    //    $lati = isset($resp['results'][0]['geometry']['location']['lat']) ? $resp['results'][0]['geometry']['location']['lat'] : "";
        $road = isset($resp['address']['road']) ? $resp['address']['road'] : "";
        $suburb = isset($resp['address']['suburb']) ? $resp['address']['suburb'] : "";
        $city = isset($resp['address']['city']) ? $resp['address']['city'] : "";
        $state = isset($resp['address']['state']) ? $resp['address']['state'] : "";
			return "$road $suburb $city $state";
	            
        }else{
            return false;
        }
}
// @filemeta.features gps2Num
function gps2Num($coordPart){
    $parts = explode('/', $coordPart);
    if(count($parts) <= 0)
    return 0;
    if(count($parts) == 1)
    return $parts[0];
    return floatval($parts[0]) / floatval($parts[1]);
}
// @filemeta.features get_imgloc
function get_imgloc($exif = ''){
	    if($exif!=false && (isset($exif['GPS']) || isset($exif['GPSLatitude']))){
        $GPSLatitudeRef = !empty($exif['GPS']) ? $exif['GPS']['GPSLatitudeRef'] :  $exif['GPSLatitudeRef'];
        $GPSLatitude    = !empty($exif['GPS']) ? $exif['GPS']['GPSLatitude'] : $exif['GPSLatitude'];
        $GPSLongitudeRef= !empty($exif['GPS']) ? $exif['GPS']['GPSLongitudeRef'] : $exif['GPSLongitudeRef'];
        $GPSLongitude   = !empty($exif['GPS']) ? $exif['GPS']['GPSLongitude'] : $exif['GPSLongitude'];
        $lat_degrees = count($GPSLatitude) > 0 ? gps2Num($GPSLatitude[0]) : 0;
        $lat_minutes = count($GPSLatitude) > 1 ? gps2Num($GPSLatitude[1]) : 0;
        $lat_seconds = count($GPSLatitude) > 2 ? gps2Num($GPSLatitude[2]) : 0;
        
        $lon_degrees = count($GPSLongitude) > 0 ? gps2Num($GPSLongitude[0]) : 0;
        $lon_minutes = count($GPSLongitude) > 1 ? gps2Num($GPSLongitude[1]) : 0;
        $lon_seconds = count($GPSLongitude) > 2 ? gps2Num($GPSLongitude[2]) : 0;
        
        $lat_direction = ($GPSLatitudeRef == 'W' or $GPSLatitudeRef == 'S') ? -1 : 1;
        $lon_direction = ($GPSLongitudeRef == 'W' or $GPSLongitudeRef == 'S') ? -1 : 1;
        
        $latitude = $lat_direction * ($lat_degrees + ($lat_minutes / 60) + ($lat_seconds / (60*60)));
        $longitude = $lon_direction * ($lon_degrees + ($lon_minutes / 60) + ($lon_seconds / (60*60)));
        return array('latitude'=>str_replace(',','.',$latitude), 'longitude'=>str_replace(',','.',$longitude));
    }else{
        return false;
    }
}
// @filemeta.features get_image_location
function get_image_location($image = ''){
    $exif = @exif_read_data($image, 0, true);
    if($exif && isset($exif['GPS'])){
        $GPSLatitudeRef = $exif['GPS']['GPSLatitudeRef'];
        $GPSLatitude    = $exif['GPS']['GPSLatitude'];
        $GPSLongitudeRef= $exif['GPS']['GPSLongitudeRef'];
        $GPSLongitude   = $exif['GPS']['GPSLongitude'];
        
        $lat_degrees = count($GPSLatitude) > 0 ? gps2Num($GPSLatitude[0]) : 0;
        $lat_minutes = count($GPSLatitude) > 1 ? gps2Num($GPSLatitude[1]) : 0;
        $lat_seconds = count($GPSLatitude) > 2 ? gps2Num($GPSLatitude[2]) : 0;
        
        $lon_degrees = count($GPSLongitude) > 0 ? gps2Num($GPSLongitude[0]) : 0;
        $lon_minutes = count($GPSLongitude) > 1 ? gps2Num($GPSLongitude[1]) : 0;
        $lon_seconds = count($GPSLongitude) > 2 ? gps2Num($GPSLongitude[2]) : 0;
        
        $lat_direction = ($GPSLatitudeRef == 'W' or $GPSLatitudeRef == 'S') ? -1 : 1;
        $lon_direction = ($GPSLongitudeRef == 'W' or $GPSLongitudeRef == 'S') ? -1 : 1;
        
        $latitude = $lat_direction * ($lat_degrees + ($lat_minutes / 60) + ($lat_seconds / (60*60)));
        $longitude = $lon_direction * ($lon_degrees + ($lon_minutes / 60) + ($lon_seconds / (60*60)));

        return array('latitude'=>str_replace(',','.',$latitude), 'longitude'=>str_replace(',','.',$longitude));
    }else{
        return false;
    }
}

// @filemeta.features coo
	function coo($con,$row,$domain=SERVERNAME){
		//if(!isset($_COOKIE[$con])){
		setcookie($con,$row,time()+(365*24*60*60),'/',$domain);
		//}
	}
// @filemeta.features coodel
	function coodel($name){
		setcookie($name, '', time()-1000);
		setcookie($name, '', time()-1000, '/');
		setcookie($name, '', time()-1000, '/home');
	}
// @filemeta.features cookieClear
	function cookieClear(){
		if (isset($_SERVER['HTTP_COOKIE'])) {
			$cookies = explode(';', $_SERVER['HTTP_COOKIE']);
			foreach($cookies as $cookie) {
				$parts = explode('=', $cookie);
				$name = trim($parts[0]);
				$this->coodel($name);
			}
		}
	}