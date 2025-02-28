<?php
namespace Core;
use Exception;
use Wordpress;
/*
ADMIN Core Class ROUTING
layout with channels and drag and drop
abstract database access for use in traits
*/
class Gen extends Gaia {

use System, Url, Meta, Manifest, Head, Ermis, Lang, Tree, Form, Domain, Kronos, WS, Action, Template, Bundle, Media, Filemeta, My, Cubo, Rethink, Template,Book;
protected $database;
protected $layout_selected;
protected $layout;
protected $db_sub;
protected $db_page;
protected $default_admin_manifest='h:
  - renderCubo: "default.menuadmin"
sl:
  - renderCubo: "default.mediac"
  - renderCubo: "slideshow"
sr:
  - renderCubo: "default.nbar"
  - renderCubo: "default.notificationweb"
f:
 - renderCubo: "chat.desk"
';
protected $default_public_manifest='h:
  - renderCubo: "default.menuweb"
sl:
  - renderCubo: "default.mediac"
  - renderCubo: "slideshow"
sr:
  - renderCubo: "default.nbar"
f:
 - renderCubo: "chat.desk"
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
protected $main;
protected $maingrp;
protected $emptyChannelImg='<img src="https://scontent.fath6-1.fna.fbcdn.net/v/t39.30808-6/346640854_1464202694405870_4821110064275118463_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeET8MMdyrrxcZXQPQRHxxULzTMCkFTvUl7NMwKQVO9SXlWjH0Q-knjnox1ZdrOQV0Q&_nc_ohc=kaVtIYyBrmEQ7kNvgHtt038&_nc_zt=23&_nc_ht=scontent.fath6-1.fna&_nc_gid=AKEgjeaOYw12bRkO0FEl6jd&oh=00_AYDlYaFlI9-vLGr2Zyak5KKkzHVXnaDNqSRly3sY4d_zaQ&oe=67232B67">';


   public function __construct() {
           parent::__construct();
        $this->G['PAGECUBO'] = $this->getMaincubo($this->page);
   }

/**
 * Handle instantiated Class from parent Gaia
 *
 * @return void
 */   
	 public function handleRequest() {
 		if ($this->isXHRRequest()) {
          $this->handleXHRRequest();

        } else if($this->isWorkerRequest()){
                $this->handleWorkerRequest();

//merge routers
        }elseif ($_SERVER['SYSTEM'] == 'admin') {
            $this->router();

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
$this->renderAdminHead();

//BODY
if($_SERVER['SYSTEM']=='admin'){
echo $this->buildManifest($this->page);
}else{
echo $this->buildManifest($this->page);
}

//FOOTER
//     include_once CUBO_ROOT."venus/public.php";
echo '<script src="/admin/js/start.js"></script>';
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

protected function defaultAdminManifest($name,$type='file') {
    //include subfile if exists
    $manifest = yaml_parse($this->default_admin_manifest);
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
protected function defaultPublicManifest($name,$type='file') {
    //include subfile if exists
    $manifest = yaml_parse($this->default_public_manifest);
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
        // Admin case: ["renderCubo" => "default.nbar"]
    try {
        switch ($method) {
            case 'iframe':
                return '<iframe id="sandbox" src="' . htmlspecialchars($param) . '" width="100%" height="1000px" sandbox="allow-scripts allow-same-origin allow-forms" style="border:1px solid black;"></iframe>';

            case 'renderCubo':
               $response = $this->renderCubo($param);
                if (is_array($response)) {
                    return $response['data'];
                }

            default:
            $url = SITE_URL."api/v1/local/$method?key=$param";
             // Ensure response is properly formatted
                $response = $this->fetchUrl($url);
                if (is_array($response)) {
                    return $response['data'];
                }
        }
    } catch (Exception $e) {
        return "<p>Error: " . $e->getMessage() . "</p>";
    }
}

/**
$url = SITE_URL.'api/v1/local/buildTable?table=gen_vivalibrocom.main'
$this->fetchUrl($url)
*/
protected function buildManifest($name) {
    $main = $this->mainplan($name);

    $default_admin = yaml_parse($this->default_admin_manifest) ?: [];  // Ensure it always returns an array
    $default_public = yaml_parse($this->default_public_manifest) ?: [];  // Ensure it always returns an array
    $system=$_SERVER['SYSTEM']!='admin' ? $default_public : $default_admin;

    if($_SERVER['SYSTEM']!='admin'){
    /**
    $plan = $this->G['PAGECUBO'];
     */
    //MAIN MANIFEST & PAGECUBO IS THE SAME $main['manifest']===$this->G['PAGECUBO']
    // If a custom manifest exists, parse it; otherwise, use defaults
    $plan = $main['manifest'] ? yaml_parse($main['manifest']) :$this->defaultPublicManifest($name,$main['type']);
    }else{
    $plan = $main['manifest'] ? yaml_parse($main['manifest']) :$this->defaultAdminManifest($name,$main['type']);
    }

    // Ensure primary keys exist, fallback to default if missing
    foreach (['h','m', 'sl', 'sr','f'] as $section) {
        if (!isset($plan[$section]) || !is_array($plan[$section])) {
            $plan[$section] = $_SERVER['SYSTEM']=='admin' ? $this->defaultAdminManifest($name)[$section] : $this->defaultPublicManifest($name)[$section]; // Use default if missing
        }
    }
//xecho($plan);

    $html = '<div id="container">';
    $html .= '<header>';
    $planH =empty($plan['h']) ? $system['h'] : $plan['h'];
foreach ($planH as $methods){
foreach ($methods as $method => $param) {
    $result = $this->executeMethod($method, $param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
        $html .= $result;
        $html .= "</div>";
    }}
}
    $html .= '</header>';

    // Left Sidebar
    $html .= '<div id="sidebar-left">';
        $html .= $this->manifestEditor();
       foreach ($plan['sl'] as $methods){
       foreach ($methods as $method => $param) {
        $result = $this->executeMethod($method,$param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
        $html .= $this->addHeaderCubo($param);
        $html .= $result;
        $html .= "</div>";
    }}
}

    $html .= '</div>'; // Close left sidebar

    // Main Page
     $mainWidth = $hasLeftSidebar && $hasRightSidebar ? '60' : ($hasLeftSidebar || $hasRightSidebar ? '80' : '100');
    $html .= '<div id="mainpage2">';
foreach ($plan['m'] as $methods){
foreach ($methods as $method => $param) {
    $result = $this->executeMethod($method, $param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
        $html .= $this->addHeaderCubo($param);
        $html .= $result;
        $html .= "</div>";
    }}
}
   $html .= '</div>'; // Close right sidebar

    // Right Sidebar
    $html .= '<div id="sidebar-right">';
foreach ($plan['sr'] as $methods){
foreach ($methods as $method => $param) {
    $result = $this->executeMethod($method, $param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
        $html .= $this->addHeaderCubo($param);
        $html .= $result;
        $html .= "</div>";
    }}
}
    $html .= '</div>'; // Close right sidebar

    //Footer
    $html .= '<footer>';
foreach ($plan['f'] as $methods){
foreach ($methods as $method => $param) {
   $html .= "<div class='cubo'>";
   $result = $this->executeMethod($method, $param);
    if (!empty($result)) {
        $html .= $this->addHeaderCubo($param);
        $html .= $result;
    }
        $html .= "</div>";
}
    $html .= '</footer>'; // Close right sidebar
    $html .= '</div>'; // Close container
    return $html;
}}

protected function main() {
    $widgets = read_folder($this->G['WIDGETURI']);
    $subs=array();
     foreach ($widgets as $wid) {
        if (file_exists($this->G['WIDGETURI'] . $wid . "/admin.php")) {
            $subs[$wid] = ["slug" => ucfirst($wid), "icon" => "time"];
        }
    }
    return $subs;
}

}