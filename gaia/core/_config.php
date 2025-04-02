<?php
  // Handle SERVER_NAME in CLI
    if (php_sapi_name() == "cli") {
        $_SERVER['SERVER_NAME'] = 'localhost';  // or set a default value
        define('DOMAIN', $_SERVER['SERVER_NAME']);
        $_SERVER['SYSTEM'] = 'cli';  // or set a default value
        $_SERVER['HTTP_HOST'] = 'localhost';    // or set a default value
        $_SERVER['HTTPS'] = '';                 // or set to an empty string
        define('TEMPLATE', "localhost");
    }else{
        define('DOMAIN', $_SERVER['SERVER_NAME']);
        $servernameArray = explode('.', DOMAIN);
        $template = $servernameArray[0].$servernameArray[1];
        define('TEMPLATE', $template);
    }
	define('GSROOT','/var/www/gs/');
    define('GAIAROOT',GSROOT.'gaia/');
    define('API_ROOT',GAIAROOT.'apiv1/');
    define('SITE_ROOT',$_SERVER['DOCUMENT_ROOT'].'/');
    define('BUILD_ROOT',$_SERVER['DOCUMENT_ROOT'].'/build/');
    define('SERVERNAME',$_SERVER['SERVER_NAME']);
    define('HTTP_HOST',$_SERVER['HTTP_HOST']);
    define('REFERER',$_SERVER['HTTPS']=='on' ? 'https://' : 'http://'); //http or https
    define('ERMIS_ROOT',GSROOT.'ermis/');
    define('KRONOS_ROOT',GSROOT.'kronos/');
    define('MARS_ROOT',GSROOT.'mars/');
    @define('CUBO_ROOT',GAIAROOT.'cubos/');
    define('CUBO_ROOT_DEFAULT',GAIAROOT.'cubos/default/');
    define('SERVEROOT',dirname(SITE_ROOT).'/');
    define('SITE_URL',REFERER.HTTP_HOST.'/');
    define('PUBLIC_ROOT',GAIAROOT.TEMPLATE.'/');
    define('PUBLIC_ROOT_WEB',GAIAROOT.'public/'.$_SERVER['SERVER_NAME'].'/');
    define('CUBO_URL',SITE_URL.'cubos/');
    define('ASSETa_URL',REFERER.HTTP_HOST. '/asset/');
    define('SITE',$_SERVER['HTTP_HOST']);
    define('DOM_EXT', pathinfo($_SERVER['SERVER_NAME'], PATHINFO_EXTENSION));
    define('DOM_ARRAY', explode('.',$_SERVER['SERVER_NAME']));
    define('SERVERBASE',TEMPLATE.'.com');
    define('LOC','en');
    define('LANG','en');
    define('AJAXREQUEST', isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest');
    define('MEDIA_ROOT', GSROOT.'media/'.DOMAIN.'/');
    define('ASSET_URL',SITE_URL.'asset/');
    define('MEDIA_URL',SITE_URL.'media/');
    define('MEDIA_ROOT_ICON', MEDIA_ROOT.DOMAIN.'/thumbs/');
    define('PUBLIC_IMG_ROOT', PUBLIC_ROOT_WEB.'img/');
    define('PUBLIC_IMG',SITE_URL.'img/');
    define('ASSET_ROOT',GAIAROOT.'asset/');
    define('ASSET_IMG_ROOT', ASSET_ROOT.'img/');
    define('ASSET_IMG',ASSET_URL.'img/');
    define('URL_FILE',basename($_SERVER['PHP_SELF']));
    define('IMG',"/media/");
    define ('TEMPLATESURI',PUBLIC_ROOT_WEB."templates/");
    define ('DEEPSEEK_API_URL',"https://api.deepseek.com/v1/chat/completions");
    define ('DEEPSEEK_API_KEY',"sk-6f9b9c7c2f88482db3d4c2a367e0da0b");

    //this
    $this->time = time();
    $this->LIB = SITE_URL . "/lib/";
    $this->IMG = SITE_URL . "img/";
    $this->TEMPLATE = TEMPLATE;
    $this->GSROOT = GSROOT;
    $this->GAIAROOT = GAIAROOT;
    $this->API_ROOT = API_ROOT;
    $this->SITE_URL = SITE_URL;
    $this->SITE_ROOT = SITE_ROOT;
    $this->BUILD_ROOT = BUILD_ROOT;
    $this->MEDIA_ROOT = MEDIA_ROOT;
    $this->MEDIA_URL = MEDIA_URL;
    $this->PUBLIC_ROOT = PUBLIC_ROOT;
    $this->PUBLIC_ROOT_WEB = PUBLIC_ROOT_WEB;
    $this->PUBLIC_IMG_ROOT = PUBLIC_IMG_ROOT;
    $this->PUBLIC_IMG = PUBLIC_IMG;
    $this->ASSET_IMG_ROOT = ASSET_IMG_ROOT;
    $this->ASSET_IMG = ASSET_IMG;
    $this->ASSET_ROOT = ASSET_ROOT;
    $this->ASSET_URL = ASSET_URL;
    $this->REFERER = REFERER;
    $this->server = $_SERVER;
    $this->HTTP_HOST = HTTP_HOST;
    $this->DOMAIN = DOMAIN;
    $this->lang = isset($_GET['lang']) ? $_GET['lang'] : (!empty($_COOKIE['lang']) ? $_COOKIE['lang'] : 'en');
    $this->langprefix = isset($_GET['lang']) && $_GET['lang'] != 'en' ? $_GET['lang'] : (!empty($_COOKIE['lang']) ? $_COOKIE['lang'] : '');
    $this->APPSROOT = SITE_ROOT . "apps/";
    $this->APPSPATH = SITE_URL . "apps/";

    $this->globs_types = array(
    0 => 'text',
    1 => 'img',
    2 => 'html',
    3 => 'boolean',
    4 => 'integer',
    5 => 'decimal',
    6 => 'textarea',
    7 => 'url',
    8 => 'color',
    9 => 'read',
    10 => 'json',
    11 => 'code'
    );

    $this->GET = $_GET;
    $this->CUBO_ROOT = CUBO_ROOT;
    $this->WIDGETLOCALPATH = SITE_URL . "/widgets/";
    $this->WIDGETPATH = "/widgets/";
    $this->WIDGETLOCALURI = CUBO_ROOT;
    $this->WIDGETURI = CUBO_ROOT;
    $this->MAINURI = PUBLIC_ROOT_WEB . "main/";
    $this->LOC = "en";
    $this->MEDIA_ROOT_ICON = MEDIA_ROOT_ICON;
    $this->CRON = SITE_ROOT . "cron/";

    $this->error = array(
    1 => 'already exists',
    2 => 'query did not executed'
    );

    $this->xmls = array('sitemap', 'atom', 'rss');

    $this->authentication = array(
    '1' => 'Account Active',
    '2' => 'Account Suspended. Proceed to Payment Page.',
    '3' => 'Account Registration Invoice Pending. Proceed to Payment Page.',
    '4' => 'Account Proactivated. Proceed to Registration Confirmation Page.',
    '5' => 'Account is banned.Contact with Administrator.'
    );

    $this->authen = array(
    '1' => 'Active',
    '2' => 'Suspended',
    '3' => 'Not Activated',
    '4' => 'Proactivated',
    '5' => 'Banned'
    );

    $this->orient = array(1 => 'horizontal', 2 => 'vertical');
    $this->status = array("0" => 'closed', "1" => 'inactive', "2" => 'active');
    $this->langs = array(1 => 'en', 2 => 'gr');
    $this->privacy = array(0 => 'hidden', 1 => 'visible');
    $this->colorstatus = array(0 => 'red', 1 => 'orange', 2 => 'green');
    $this->phase = array(0 => 'logged out', 1 => 'sleepy', 2 => 'logged in');

    $this->icons = array(
    "api" => "axes-three-dimensional",
    "admin" => "alert",
    "apps" => "leaf",
    "backup" => "duplicate",
    "categories" => "list-alt",
    "console" => "scale",
    "documentation" => "question-sign",
    "fileerrors" => "alert",
    "global" => "record",
    "home" => "dashboard",
    "local" => "globe",
    "logout" => "hand-right",
    "manage" => "edit",
    "media" => "film",
    "gallery" => "film",
    "modules" => "th",
    "menu" => "list",
    "new" => "new-window",
    "notifications" => "hand-right",
    "page" => "th-large",
    "pagevar" => "equalizer",
    "permissions" => "filter",
    "post" => "file",
    "redis" => "road",
    "seo" => "bullhorn",
    "simulate" => "record",
    "sync" => "tree-conifer",
    "setup" => "cog",
    "stats" => "stats",
    "superboard" => "list-alt",
    "tags" => "tags",
    "tax" => "tags",
    "templates" => "th-large",
    "widget" => "th-large",
    "groups" => "briefcase",
    "user" => "user"
    );

    $this->sucolors = array(
    '1' => 'rgba(265,118,267,0.3)',
    '2' => 'rgba(85,155,195,0.5)',
    '3' => 'rgba(165,175,95,0.3)',
    '4' => 'rgba(85,45,95,0.3)',
    '5' => 'rgba(85,45,95,0.3)',
    '6' => 'rgba(85,45,95,0.3)',
    '7' => 'rgba(85,45,95,0.3)',
    '8' => 'rgba(85,45,95,0.3)'
    );

    $this->action_status = array(
    0 => 'DEPRECATED',
    1 => 'DANGEROUS',
    2 => 'MISSING_INFRASTRUCTURE',
    3 => 'NEEDS_UPDATES',
    4 => 'INACTIVE_WRONG_FAILED',
    5 => 'NEW',
    6 => 'WORKING_TESTING_EXPERIMENTAL',
    7 => 'ALPHA_RUNNING_READY',
    8 => 'BETA_WORKING',
    9 => 'STABLE',
    10 => 'STABLE_DEPENDS_OTHERS'
    );

    $this->post_status = array(
    0 => 'Closed',
    1 => 'Inactive',
    2 => 'Active'
    );

    $this->bool = array('y' => 'YES', 'n' => 'NO');
    $this->greekMonths = array('Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου');
    $this->status_message = array(
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
    // Assigning values to class properties using $this
    $this->CURRENT = getcwd();
    $this->URL = php_sapi_name() !== 'cli' ? SITE_URL . $_SERVER['REQUEST_URI'] : '';
    $this->URL_FILE = URL_FILE;
    $this->URL_PAGE = basename(URL_FILE, ".php");
    $this->SELF = php_sapi_name() !== 'cli' ? (SITE_URL . $_SERVER['PHP_SELF'] . (!empty($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : '')) : '';
    $this->SELF_NONURL = php_sapi_name() !== 'cli' ? $_SERVER['PHP_SELF'] . (!empty($_SERVER['QUERY_STRING']) ? '?' . $_SERVER['QUERY_STRING'] : '') : '';
    $this->QUERY_STRING = php_sapi_name() !== 'cli' ? $_SERVER['QUERY_STRING'] : '';
    $this->server = $_SERVER;
    $this->SYSTEM = $_SERVER['SYSTEM'];
//    $this->aconf = json_decode(file_get_contents(PUBLIC_ROOT_WEB . "gaia.json"), true);
 //   $this->classif = json_decode(file_get_contents(PUBLIC_ROOT_WEB . "tax.json"), true);
    $this->id = isset($_GET['id']) ? trim($_GET['id']) : '';
    $this->userid = isset($_GET['userid']) ? trim($_GET['userid']) : '';
    $this->page = isset($_GET['page']) ? $_GET['page'] : 'home';
    $this->mode = $this->mode = $_GET['mode'] ?? '';
    $this->action = $_GET['action'] ?? '';
    $this->slug = $_GET['slug'] ?? '';
    $this->name = $_GET['name'] ?? '';
    $this->href = $_GET['href'] ?? '';
    $this->src = $_GET['src'] ?? '';
    $this->SITE_ROOT = SITE_ROOT;
    $this->SITE_URL = SITE_URL;
    $this->HTTP_HOST = HTTP_HOST;

    $this->book_status = array("0" => "lost", "1" => "not owned", "2" => "desired to buy", "3" => "owned on shelve");
    $this->isread = array(0 => "no", 1 => "reading", 2 => "read");
    $this->bookdefaultimg = "/isset/img/empty.png";
    $this->publisherdefaultimg = "/isset/img/empty_publisher.png";
    $this->writerdefaultimg = "/asset/img/empty_user.png";
    $this->logo = "/img/logo.png";
    $this->parenting_areas = [
       "h1" => "h", "h2" => "h", "h3" => "h",
       "sl1" => "sl", "sl2" => "sl", "sl3" => "sl",
       "sr1" => "sr", "sr2" => "sr", "sr3" => "sr",
       "fr" => "f", "fc" => "f", "fl" => "f"
    ];
    $this->version = '0.69';

    $this->publicdb = "gen_".TEMPLATE;
    $this->loggedin = !empty($_COOKIE['GSID']);
    $this->ini = ini_get_all();
    $this->env = getenv();

