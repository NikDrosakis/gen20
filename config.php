<?php
@ini_set('max_execution_time', 0);
@ini_set('session.cookie_httponly',1);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set("log_errors", 1);
ini_set('memory_limit', '-1');
$time=time();
@ini_set('gd.jpeg_ignore_warning', true);
@ini_set('session.use_trans_sid', 0);
@ini_set('session.use_only_cookies', 1);
@ini_set('zlib.output_compression', '1');
define('GSROOT','/var/www/gs/');
define('API_ROOT','/var/www/gs/apiv1/');
define('SITE_ROOT',$_SERVER['DOCUMENT_ROOT'].'/');
define('BUILD_ROOT',$_SERVER['DOCUMENT_ROOT'].'/build/');
define('SERVERNAME',$_SERVER['SERVER_NAME']);
define('HTTP_HOST',$_SERVER['HTTP_HOST']);
define('REFERER',$_SERVER['HTTPS']=='on' ? 'https://' : 'http://'); //http or https

define('CUBO_ROOT','/var/www/gs/cubos/');

define('SERVEROOT',dirname(SITE_ROOT).'/');
define('SITE_URL',REFERER.HTTP_HOST.'/');

define('PUBLIC_ROOT',GSROOT.TEMPLATE.'/');
define('PUBLIC_ROOT_WEB',GSROOT.'public/'.$_SERVER['SERVER_NAME'].'/');


define('CUBO_URL',SITE_URL.'cubos/');

define('ADMIN_URL',REFERER.HTTP_HOST. '/admin/');
define('SITE',$_SERVER['HTTP_HOST']);
define('SERVERNAME', $_SERVER['SERVER_NAME']);

define('DOM_EXT', pathinfo($_SERVER['SERVER_NAME'], PATHINFO_EXTENSION));
define('DOM_ARRAY', explode('.',$_SERVER['SERVER_NAME']));

define('SERVERBASE',TEMPLATE.'.com');
define('LOC','en');
define('LANG','en');
define('AJAXREQUEST',$_SERVER['HTTP_X_REQUESTED_WITH']=="XMLHttpRequest");

define('MEDIA_ROOT', PUBLIC_ROOT_WEB.'media/');
define('MEDIA_URL',SITE_URL.'media/');
define('MEDIA_ROOT_ICON', MEDIA_ROOT."thumbs/");

define('PUBLIC_IMG_ROOT', PUBLIC_ROOT_WEB.'img/');
define('PUBLIC_IMG',SITE_URL.'img/');

define('ADMIN_IMG_ROOT', ADMIN_ROOT.'img/');
define('ADMIN_IMG',ADMIN_URL.'img/');

define('URL_FILE',basename($_SERVER['PHP_SELF']));
define('IMG',"/media/");
define ('TEMPLATESURI',PUBLIC_ROOT_WEB."templates/");


$this->G= array(
    'LIB'=> SITE_URL."/lib/",
    'IMG'=> SITE_URL."img/",
    'TEMPLATE'=>TEMPLATE,

    'GSROOT'=> GSROOT,
    'API_ROOT'=> API_ROOT,

    'SITE_URL'=>SITE_URL,
    'SITE_ROOT'=> SITE_ROOT,
    'BUILD_ROOT'=> BUILD_ROOT,
    'MEDIA_ROOT'=> MEDIA_ROOT,
    'MEDIA_URL'=>MEDIA_URL,

    'PUBLIC_ROOT'=> PUBLIC_ROOT,
    'PUBLIC_ROOT_WEB'=>PUBLIC_ROOT_WEB,
    'PUBLIC_IMG_ROOT'=>PUBLIC_IMG_ROOT,
    'PUBLIC_IMG'=>PUBLIC_IMG,

    'ADMIN_IMG_ROOT'=>ADMIN_IMG_ROOT,
    'ADMIN_IMG'=>ADMIN_IMG,
    'ADMIN_ROOT'=> ADMIN_ROOT,
    'ADMIN_URL'=>ADMIN_URL,

    'REFERER'=>REFERER,
    'server'=>$_SERVER,
    'HTTP_HOST'=>HTTP_HOST,
//*********************BASIC HIERARCHY domain > globs > template > page > uris(2nd level) > widget*************
    'DOMAIN'=> DOMAIN,
//'DOMAINS'=> $DOMAINS,
//**lang**
    'lang'=>isset($_GET['lang']) ? $_GET['lang'] : (!empty($_COOKIE['lang']) ? $_COOKIE['lang']: 'en'),
    'langprefix'=>isset($_GET['lang']) && $_GET['lang']!='en' ? $_GET['lang'] : (!empty($_COOKIE['lang']) ? $_COOKIE['lang']: ''),
    'APPSROOT'=> SITE_ROOT."apps/",
    'APPSPATH'=> SITE_URL."apps/",
    'globs_types'=>array(0=>'text',1=>'img',2=>'html',3=>'boolean',4=>'integer',5=>'decimal',6=>'textarea',7=>'url',8=>'color',9=>'read',10=>'json',11=>'code'),
//preserver uris array 2nd level SITE_URL/[uri]

    'CUBO_ROOT'=> CUBO_ROOT,
    'WIDGETLOCALPATH'=> SITE_URL."/widgets/",
    'WIDGETPATH'=> "/widgets/",
    'WIDGETLOCALURI'=> CUBO_ROOT,
    'WIDGETURI'=> CUBO_ROOT,
    'MAINURI'=> PUBLIC_ROOT_WEB."main/",
//*********************MEDIA**********************
    'LOC'=> "en",
    'MEDIA_ROOT_ICON'=> MEDIA_ROOT_ICON,
//*********************CRONS*********************
    'CRON'=> SITE_ROOT."cron/",
//*********************errors*******************************
    'error'=>array(
        1 => 'already exists',
        2 => 'query did not executed'
    ),
//seo
    'xmls'=> array('sitemap','atom','rss'),
//**********************GLOBAL FORMS
    'authentication'=>array('1'=>'Account Active','2'=>'Account Suspended. Proceed to Payment Page.','3'=>'Account Registration Invoice Pending. Proceed to Payment Page.','4'=> 'Account Proactivated. Proceed to Registration Confirmation Page.','5'=> 'Account is banned.Contact with Administrator.'),
    'authen'=>array('1'=>'Active','2'=>'Suspended','3'=>'Not Activated','4'=> 'Proactivated','5'=> 'Banned'),
    'orient'=>array(1=>'horizontal',2=>'vertical'),

    //statuses
    'status'=>array("0"=>'closed',"1"=>'inactive',"2"=>'active'),

    'langs'=>array(1=>'en',2=>'gr'),
    'privacy'=>array(0=>'hidden',1=>'visible'),
    'colorstatus'=>array(0=>'red',1=>'orange',2=>'green'),
    'phase'=>array(0=>'logged out',1=>'sleepy',2=>'logged in'),
    'icons'=>array(
        "api"=>"axes-three-dimensional",
        "admin"=>"alert",
        "apps"=>"leaf",
        "backup"=>"duplicate",
        "categories"=>"list-alt",
        "console"=>"scale",
        "documentation"=>"question-sign",
        "fileerrors"=>"alert",
        "global"=>"record",
        "home"=>"dashboard",
        "local"=>"globe",
        "logout"=>"hand-right",
        "manage"=>"edit",
        "media"=>"film",
        "gallery"=>"film",
        "modules"=>"th",
        "menu"=>"list",
        "new"=>"new-window",
        "notifications"=>"hand-right",
        "page"=>"th-large",
        "pagevar"=>"equalizer",
        "permissions"=>"filter",
        "post"=>"file",
        "redis"=>"road",
        "seo"=>"bullhorn",
        "simulate"=>"record",
        "sync"=>"tree-conifer",
        "setup"=>"cog",
        "stats"=>"stats",
        "superboard"=>"list-alt",
        "tags"=>"tags",
        "tax"=>"tags",
        "templates"=>"th-large",
        "widget"=>"th-large",
        "groups"=>"briefcase",
        "user"=>"user"
    ),
    'sucolors'=>array(
        '1'=>'rgba(265,118,267,0.3)',
        '2'=>'rgba(85,155,195,0.5)',
        '3'=>'rgba(165,175,95,0.3)',
        '4'=>'rgba(85,45,95,0.3)',
        '5'=>'rgba(85,45,95,0.3)',
        '6'=>'rgba(85,45,95,0.3)',
        '7'=>'rgba(85,45,95,0.3)',
        '8'=>'rgba(85,45,95,0.3)'
    ),
    'post_status'=>array(
        0=>'Closed',
        1=>'Inactive',
        2=>'Active'
    ),
    'bool'=>array('y' => 'YES','n'=>'NO'),
    'greekMonths' => array('Ιανουαρίου','Φεβρουαρίου','Μαρτίου','Απριλίου','Μαΐου','Ιουνίου','Ιουλίου','Αυγούστου','Σεπτεμβρίου','Οκτωβρίου','Νοεμβρίου','Δεκεμβρίου')
);
$this->G["status_message"] = array(
    "100" => "Continue",
    "101" => "Switching Protocols",
    "200" => "Success",
    "201" => "Created",
    "202" => "Accepted",
    "203" => "Non-Authoritative Information",
    "204" => "No Content",
    "205" => "Reset Content",
    "206" => "Partial Content",
    "300" => "Multiple Choices",
    "301" => "Moved Permanently",
    "302" => "Found",
    "303" => "See Other",
    "304" => "Not Modified",
    "305" => "Use Proxy",
    "306" => "(Unused)",
    "307" => "Temporary Redirect",
    "400" => "Bad Request",
    "401" => "Unauthorized enter to API",
    "402" => "Payment Required",
    "403" => "Forbidden",
    "404" => "Not Found",
    "405" => "Method Not Allowed",
    "406" => "Not Acceptable",
    "407" => "Proxy Authentication Required",
    "408" => "Request Timeout",
    "409" => "Conflict",
    "410" => "Gone",
    "411" => "Length Required",
    "412" => "Precondition Failed",
    "413" => "Request Entity Too Large",
    "414" => "Request-URI Too Long",
    "415" => "Unsupported Media Type",
    "416" => "Requested Range Not Satisfiable",
    "417" => "Expectation Failed",
    "418" => "Invalid JSON",
    "419" => "Method Not Provided",
    "500" => "Internal Server Error",
    "501" => "Not Implemented",
    "502" => "Bad Gateway",
    "503" => "Service Unavailable",
    "504" => "Gateway Timeout",
    "505" => "HTTP Version Not Supported"
);
 $this->G['icons'] =$this->icons=array(
        "api"=>"axes-three-dimensional",
        "admin"=>"alert",
        "apps"=>"leaf",
        "backup"=>"duplicate",
        "categories"=>"list-alt",
        "console"=>"scale",
        "documentation"=>"question-sign",
        "fileerrors"=>"alert",
        "global"=>"record",
        "home"=>"dashboard",
        "local"=>"globe",
        "logout"=>"hand-right",
        "manage"=>"edit",
        "media"=>"film",
        "gallery"=>"film",
        "modules"=>"th",
        "menu"=>"list",
        "new"=>"new-window",
        "notifications"=>"hand-right",
        "page"=>"th-large",
        "pagevar"=>"equalizer",
        "permissions"=>"filter",
        "post"=>"file",
        "redis"=>"road",
        "seo"=>"bullhorn",
        "simulate"=>"record",
        "sync"=>"tree-conifer",
        "setup"=>"cog",
        "stats"=>"stats",
        "superboard"=>"list-alt",
        "tags"=>"tags",
        "tax"=>"tags",
        "templates"=>"th-large",
        "widget"=>"th-large",
        "groups"=>"briefcase",
        "user"=>"user"
    );
        $this->G['CURRENT'] = getcwd();
        $this->G['URL'] = php_sapi_name() !== 'cli' ? SITE_URL . $_SERVER['REQUEST_URI'] : '';
        $this->G['URL_FILE'] = URL_FILE;
        $this->G['URL_PAGE'] = basename(URL_FILE, ".php");
        $this->G['SELF'] = php_sapi_name() !== 'cli' ? (SITE_URL . $_SERVER['PHP_SELF'] . (!empty($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : '')) : '';
        $this->G['SELF_NONURL'] = php_sapi_name() !== 'cli' ? $_SERVER['PHP_SELF'] . (!empty($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : '') : '';
        $this->G['QUERY_STRING'] = php_sapi_name() !== 'cli' ? $_SERVER['QUERY_STRING'] : '';
        $this->G['server'] = $_SERVER;
        $this->G['SYSTEM'] = $_SERVER['SYSTEM'];
		$this->G['aconf']= json_decode(file_get_contents(PUBLIC_ROOT_WEB."gaia.json"),true);
		$this->G['classif']= json_decode(file_get_contents(PUBLIC_ROOT_WEB."tax.json"),true);

		$this->G['id'] = isset($_GET['id']) ? trim($_GET['id']):'';
		$this->G['userid'] = isset($_GET['userid']) ? trim($_GET['userid']):'';
		if ($this->G['SYSTEM']=='admin'){
		$this->G['page']= $this->page= $_GET['page']!='' ?  $_GET['page'] : 'home';
		}elseif ($this->G['SYSTEM']=='vivalibrocom'){
		$this->G['page']=$this->page=  $_GET['page']!='' ?  $_GET['page'] : 'home';
		}
		$this->G['sub']= $this->sub=$_GET['sub'] ?? '';
        $this->G['mode']= $this->mode=$_GET['mode'] ?? '';
        $this->G['action']= $_GET['action'] ?? '';
        $this->G['slug']= $_GET['slug'] ?? '';
        $this->G['id']= $_GET['id'] ?? '';
        $this->G['name']= $_GET['name'] ?? '';
        $this->G['href']= $_GET['href'] ?? '';
        $this->G['src']= $_GET['src'] ?? '';


		$this->G['SITE_ROOT']=SITE_ROOT;
		$this->G['SITE_URL']=SITE_URL;
		$this->G['HTTP_HOST']=HTTP_HOST;
		$this->G['book_status']=array("0" => "lost","1" =>"not owned","2" =>"desired to buy","3" => "owned on shelve");
		$this->G['isread']=array(0=> "no",1 => "reading",2 => "read");
		$this->G['bookdefaultimg']= "/img/empty.png";
		$this->G['publisherdefaultimg']= "/img/empty_publisher.png";
		$this->G['writerdefaultimg']= "/img/empty_user.png";
        $this->G['book_status'] = ["0" => "lost", "1" => "not owned", "2" => "desired to buy", "3" => "owned on shelve"];
        $this->G['isread'] = [0 => "no", 1 => "reading", 2 => "read"];
        $this->G['bookdefaultimg'] = "/admin/img/empty.png";
        $this->G['publisherdefaultimg'] = "/admin/img/empty_publisher.png";
        $this->G['writerdefaultimg'] = "/admin/img/empty_user.png";
        $this->G['logo'] = "/img/logo.png";

$this->G['parenting_areas'] = [
               "h1"=>"h","h2"=>"h","h3"=>"h",
                 "sl1"=>"sl","sl2"=>"sl","sl3"=>"sl",
                 "sr1"=>"sr","sr2"=>"sr","sr3"=>"sr",
                 "fr"=>"f","fc"=>"f","fl"=>"f"
             ];
           $this->G['version']='0.42';
?>