<?php
namespace Core;
use Exception;
use Wordpress;
use Core\Traits\Url;
use Core\Traits\System;
use Core\Traits\Meta;
use Core\Traits\Manifest;
use Core\Traits\Head;
use Core\Traits\Ermis;
use Core\Traits\Lang;
use Core\Traits\Tree;
use Core\Traits\Form;
use Core\Traits\DomainZone;
use Core\Traits\DomainFS;
use Core\Traits\DomainDB;
use Core\Traits\DomainHost;
use Core\Traits\Kronos;
use Core\Traits\WS;
use Core\Traits\Action;
use Core\Traits\Template;
use Core\Traits\Media;
use Core\Traits\Filemeta;
use Core\Traits\My;
use Core\Traits\CuboAdmin;
use Core\Traits\CuboPublic;
use Core\Cubo\Book;

/*
WEB UI INSTANCE
Core Class ROUTING
layout
manifestEditor
abstract database access for use in traits
wordpress integrated
magento integrated
*/
class Gen extends Gaia {
use  Url, System,Meta, Manifest, Head, Ermis, Lang, Tree, Form, DomainZone,DomainFS,DomainDB,DomainHost,Kronos, WS, Action, Template, Media, Filemeta, My, CuboAdmin, CuboPublic, Template,Book;

protected $database;
protected $layout_selected;
protected $layout;
protected $db_sub;
protected $db_page;
protected $default_manifest='h:
  - renderCubo: "default.menu"
sl:
  - renderCubo: "slideshow.public"
  - renderCubo: "default.media"
sr:
  - renderCubo: "default.nbar"
f:
';

protected $layouts=[
      '1'=>['name'=>'1','columns'=>"1fr", 'rows'=>"1fr",'channels'=>1],
      '2'=>['name'=>'1X2','columns'=>"2fr 1fr", 'rows'=>"1fr",'channels'=>2],  //70-30
      '3'=>['name'=>'2X1','columns'=>"2fr 1fr 1fr", 'rows'=>"1fr",'channels'=>3],  //50%
      '4'=>['name'=>'3','columns'=>"1fr 1f 1fr", 'rows'=>"1fr",'channels'=>3],
      '5'=>['name'=>'4','columns'=>"1fr 1fr", 'rows'=>"1fr 1fr",'channels'=>4],
      '6'=>['name'=>'6','columns'=>"1fr 1fr 1fr", 'rows'=>"1fr 1fr",'channels'=>6]
      ];
protected $editor;
public $page;
public $pagegrp;
protected $emptyChannelImg='<img src="https://scontent.fath6-1.fna.fbcdn.net/v/t39.30808-6/346640854_1464202694405870_4821110064275118463_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeET8MMdyrrxcZXQPQRHxxULzTMCkFTvUl7NMwKQVO9SXlWjH0Q-knjnox1ZdrOQV0Q&_nc_ohc=kaVtIYyBrmEQ7kNvgHtt038&_nc_zt=23&_nc_ht=scontent.fath6-1.fna&_nc_gid=AKEgjeaOYw12bRkO0FEl6jd&oh=00_AYDlYaFlI9-vLGr2Zyak5KKkzHVXnaDNqSRly3sY4d_zaQ&oe=67232B67">';


   public function __construct() {
           parent::__construct();

        $this->PAGECUBO = $this->getpagecubo($this->page);
   }

/**
 * Handle instantiated Class from parent Gaia
 *
 * @return void
 */   
	 public function handleRequest() {
 		if ($this->isXHRRequest()) {
          $this->handleXHRRequest();

        }elseif ($_SERVER['SYSTEM'] == 'vivalibrocom') {
				$this->router();

        }elseif ($_SERVER['SYSTEM'] == 'nomadpoetrycom') {
				$this->wpRouter();
        }
    }
/**
WORDPRESS ROUTER
 */
protected function wpRouter() {
    define('WP_USE_THEMES', true);

    //$wpPath = GAIAROOT . 'vendor/johnpbloch/wordpress'; // Adjust if needed
    $wpPath = GAIAROOT . 'public/'.DOMAIN; // Adjust if needed
    if (!file_exists($wpPath . '/wp-blog-header.php')) {
        throw new Exception("WordPress not found at: $wpPath");
    }

    require_once $wpPath . '/wp-blog-header.php';
    exit; // Ensure Gen20 does not continue processing
}


protected function router() {
//HEAD
$this->renderHead();


//BODY
    echo $this->buildManifest($this->page);

//FOOTER
//     include_once CUBO_ROOT."venus/public.php";
echo '<script src="/asset/js/start.js"></script>';
echo '</body>';
echo '</html>';
}

protected function produceCuboadmin($channel){
    //INCLUDE embedded to iframes
    if (file_exists($this->WIDGETURI .$channel . "/admin.php")) {
        return $this->WIDGETURI .$channel . "/admin.php";
    }
}

/**
     DO channels producing from home to global Admin
    channels merged in G.apages
*/
 protected function channelRenderDoc($table,$ch='2'){
  $Position=['1'=>'top-left','2'=>'top-right','3'=>'top-center','4'=>'bottom-center','5'=>'bottom-left','6'=>'bottom-right'];
     $html='';
     $html .='<div id="ch'.$ch.'" title="CHANNEL '.$ch.'" class="channel '.$Position[$ch].'">';
       $html .= '<button onclick="closePanel()" class="close-btn toprightcorner">X</button>'; // Close button

        $html .= $this->renderDoc($table);
     $html .='</div>';
     return $html;
 }

protected function defaultManifest($name,$type='file') {
    //include subfile if exists
    $manifest = yaml_parse($this->default_manifest);
    $sub=CUBO_ROOT."default/main/".$name . ".php";
    //if file exists insert file
    if($this->id !='' && $this->mode ==''){
    $manifest['m'][0]= ["buildForm"=> $name];

    }elseif(file_exists($sub)){
    $manifest['m'][0]= ["renderCubo"=>"default.$name"];
    //if table exists insert table

    }elseif($type=='table'){
    $manifest['m'][0]= ["buildTable"=>"gen_admin.$name"];
    }
    return $manifest;
}

protected function executeMethod($method, $param) {
    try {
        switch ($method) {
            case 'iframe':
                return '<iframe id="sandbox" src="' . htmlspecialchars($param) . '" width="100%" height="1000px" sandbox="allow-scripts allow-same-origin allow-forms" style="border:1px solid black;"></iframe>';

            case 'renderCubo':
                $response = $this->renderCubo($param);
                if (is_array($response)) {
                    return $response['data'];
                }
                return $response;

            default:
                $url = SITE_URL . "api/v1/local/$method?key=$param";
                $response = $this->fetchUrl($url);
                if (is_array($response)) {
                    return $response['data'];
                }
                return $response;
        }
    } catch (Exception $e) {
        // Log the error and return a fallback
        error_log("Error executing method '$method': " . $e->getMessage());
        return "<p>Error executing method '$method'.</p>";
    }
}

protected function addHeaderCubo(string $cubo){
        $title = implode(' ', array_map('ucfirst', explode('.', $cubo)));
return "<h3>
<input id='{$cubo}_panel' class='red indicator'>
<a href='/$cubo'><span class='glyphicon glyphicon-edit'></span>$title</a>
<button onclick='gs.dd.init()' class='bare toggle-button'>🖱️</button>
</h3>";
}
/**
$url = SITE_URL.'api/v1/local/buildTable?table=gen_vivalibrocom.page'
$this->fetchUrl($url)
*/
protected function buildManifest($name) {
    $page = $this->pageplan($name);

    $default = yaml_parse($this->default_manifest) ?: [];
    $plan = $page['manifest'] ? yaml_parse($page['manifest']) : $this->defaultManifest($name, $page['type']);


    // Ensure primary keys exist, fallback to default if missing
    foreach (['h', 'm', 'sl', 'sr', 'f'] as $section) {
        if (!isset($plan[$section]) || !is_array($plan[$section])) {
            $plan[$section] = $this->defaultManifest($name)[$section];
        }
    }

    $html = '<div id="container">';
    $html .= '<header>';
    $planH = empty($plan['h']) ? $default['h'] : $plan['h'];
    foreach ($planH as $methods) {
        foreach ($methods as $method => $param) {
            $result = $this->executeMethod($method, $param);
            if (!empty($result)) {
                $html .= "<div class='cubo'>";
                $html .= $result;
                $html .= "</div>";
            }
        }
    }
    $html .= '</header>';

    // Left Sidebar
    $html .= '<div id="sidebar-left">';
   // $html .= $this->manifestEditor();
    foreach ($plan['sl'] as $methods) {
        foreach ($methods as $method => $param) {
            $result = $this->executeMethod($method, $param);
            if (!empty($result)) {
                $html .= "<div class='cubo'>";
                $html .= $this->addHeaderCubo($param);
                $html .= $result;
                $html .= "</div>";
            }
        }
    }
    $html .= '</div>';

    // page Page
    $html .= '<div id="mainpage2">';
    foreach ($plan['m'] as $methods) {
        foreach ($methods as $method => $param) {
            $result = $this->executeMethod($method, $param);
            if (!empty($result)) {
                $html .= "<div class='cubo'>";
                $html .= $this->addHeaderCubo($param);
                $html .= $result;
                $html .= "</div>";
            }
        }
    }
    $html .= '</div>';

    // Right Sidebar
    $html .= '<div id="sidebar-right">';
    foreach ($plan['sr'] as $methods) {
        foreach ($methods as $method => $param) {
            $result = $this->executeMethod($method, $param);
            if (!empty($result)) {
                $html .= "<div class='cubo'>";
                $html .= $this->addHeaderCubo($param);
                $html .= $result;
                $html .= "</div>";
            }
        }
    }
    $html .= '</div>';

    // Footer
    $html .= '<footer>';
    foreach ($plan['f'] as $methods) {
        foreach ($methods as $method => $param) {
            $html .= "<div class='cubo'>";
            $result = $this->executeMethod($method, $param);
            if (!empty($result)) {
                $html .= $this->addHeaderCubo($param);
                $html .= $result;
            }
            $html .= "</div>";
        }
    }
    $html .= '</footer>';
    $html .= '</div>';

    return $html;
}



}