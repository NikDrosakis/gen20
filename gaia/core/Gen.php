<?php
namespace Core;
use Exception;
/*
ADMIN Core Class ROUTING
layout with channels and drag and drop
abstract database access for use in traits
TO HEAD CSS
 Get layout preference from cookies, default to 3-column layout
        if ($layout === '50-50') {
            $columns = "1fr 1fr"; // 2 columns
            $rows = "1fr";       // 1 row
        } elseif ($layout === '70-30') {
            $columns = "2fr 1fr"; // 2 columns (70% - 30%)
            $rows = "1fr";       // 1 row
        } else { // Default: 3-column layout
            $columns = "1fr 1fr 1fr"; // 3 columns
            $rows = "1fr 1fr";       // 2 rows
        }
//schema 1, 2 '50-50','70-30', 3
    6: {
        columns: '1fr 1fr 1fr', // 3 columns
        rows: '1fr 1fr',        // 2 rows
    },
    4: {
        columns: '1fr 1fr',   // 2 columns
        rows: '1fr 1fr',
    },
    2: {
        columns: '1fr',       // 1 column
        rows: '1fr 1fr',      // 2 rows
    },
    1: {
        columns: '1fr',
        rows: '1fr'
    }
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
  - buildTable: "gen_admin.systems"
  - renderCubo: "default.mediac"
  - renderCubo: "slideshow"
sr:
  - renderCubo: "default.nbar"
  - renderCubo: "default.notificationweb"
f:
 - renderCubo: "chat.desk"
 - renderCubo: "default.menu"
';
protected $default_public_manifest='h:
  - renderCubo: "default.menuweb"
sl:
  - renderCubo: "default.mediac"
  - renderCubo: "slideshow"
  - renderCubo: "chat.venus"
sr:
  - renderCubo: "default.nbar"
  - renderCubo: "default.notification"
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
    }
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

protected function channelCheck($chanfile) {
        if (file_exists($chanfile)){
                    $buffer = $this->include_buffer($chanfile);
                if($buffer!=''){
                    return $buffer;
                }else{
                return $this->emptyChannelImg;
                }
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
    $manifest['m'][0]= ["include_buffer"=>"main/".$name . ".php"];
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
    try {
        switch ($method) {
            case 'iframe':
                return '<iframe id="sandbox" src="' . htmlspecialchars($param) . '" width="100%" height="1000px" sandbox="allow-scripts allow-same-origin allow-forms" style="border:1px solid black;"></iframe>';

            case 'include_buffer':
                $filePath = ADMIN_ROOT . $param;
                return file_exists($filePath) ? $this->{$method}($filePath) : "<p>File not found: $filePath</p>";

            default:
                return method_exists($this, $method) ? $this->{$method}($param) : "<p>Unknown method: $method</p>";
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

    // If a custom manifest exists, parse it; otherwise, use defaults
    $plan = $main['manifest'] ? yaml_parse($main['manifest']) :$this->defaultAdminManifest($name,$main['type']);

    // Ensure primary keys exist, fallback to default if missing
    foreach (['h','m', 'sl', 'sr','f'] as $section) {
        if (!isset($plan[$section]) || !is_array($plan[$section])) {
            $plan[$section] = $this->defaultAdminManifest($name)[$section] ?? []; // Use default if missing
        }
    }
    if($_SERVER['SYSTEM']!='admin'){
    $this->G['PAGECUBO'] = $plan = $this->getMaincubo($this->page);
    }

    $html = '<div id="container">';
    $html .= '<header>';
    $planH =empty($plan['h']) ? $system['h'] : $plan['h'];
foreach ($planH as $cubo) {
    if (is_array($cubo) && isset($cubo['renderCubo'])) {
        // Admin case: ["renderCubo" => "default.menuadmin"]
        $method = 'renderCubo';
        $param = $cubo['renderCubo'];
    } elseif (is_string($cubo)) {
        // Public case: "default.menuweb"
        $method = 'renderCubo';
        $param = $cubo;
    } else {
        continue; // Skip invalid formats
    }

    $result = $this->executeMethod($method, $param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
        $html .= $result;
        $html .= "</div>";
    }
}
    $html .= '</header>';

    // Left Sidebar
    $html .= '<div id="sidebar-left">';
        $html .= $this->manifestEditor();
foreach ($plan['sl'] as $cubo) {
    if (is_array($cubo) && isset($cubo['renderCubo'])) {
        // Admin case: ["renderCubo" => "default.menuadmin"]
        $param = $cubo['renderCubo'];
    } elseif (is_string($cubo)) {
        // Public case: "default.menuweb"
        $param = $cubo;
    } else {
        continue; // Skip invalid formats
    }

    $result = $this->renderCubo($param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
                    $html .= "<h3>
                                  <input id='{$param}_panel' class='red indicator'>
                                  <a href='/$param'><span class='glyphicon glyphicon-edit'></span>$param</a>
                                  <button onclick='gs.dd.init()' class='toggle-button'>🖱️</button>
                              </h3>";
        $html .= $result;
        $html .= "</div>";
    }
}

    $html .= '</div>'; // Close left sidebar

    // Main Page
     $mainWidth = $hasLeftSidebar && $hasRightSidebar ? '60' : ($hasLeftSidebar || $hasRightSidebar ? '80' : '100');
    $html .= '<div id="mainpage2">';
foreach ($plan['m'] as $cubo) {
    if (is_array($cubo) && isset($cubo['renderCubo'])) {
        // Admin case: ["renderCubo" => "default.nbar"]
        $method = 'renderCubo';
        $param = $cubo['renderCubo'];
    } elseif (is_string($cubo)) {
        // Public case: "default.nbar"
        $method = 'renderCubo';
        $param = $cubo;
    } else {
        continue; // Skip invalid formats
    }
    $result = $this->executeMethod($method, $param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
                    $html .= "<h3>
                                  <input id='{$param}_panel' class='red indicator'>
                                  <a href='/$param'><span class='glyphicon glyphicon-edit'></span>$param</a>
                              </h3>";
        $html .= $result;
        $html .= "</div>";
    }
}
   $html .= '</div>'; // Close right sidebar

    // Right Sidebar
    $html .= '<div id="sidebar-right">';
foreach ($plan['sr'] as $cubo) {
    if (is_array($cubo) && isset($cubo['renderCubo'])) {
        // Admin case: ["renderCubo" => "default.nbar"]
        $method = 'renderCubo';
        $param = $cubo['renderCubo'];
    } elseif (is_string($cubo)) {
        // Public case: "default.nbar"
        $method = 'renderCubo';
        $param = $cubo;
    } else {
        continue; // Skip invalid formats
    }
    $result = $this->executeMethod($method, $param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
                    $html .= "<h3>
                                  <input id='{$param}_panel' class='red indicator'>
                                  <a href='/$param'><span class='glyphicon glyphicon-edit'></span>$param</a>
                              </h3>";
        $html .= $result;
        $html .= "</div>";
    }
}
    $html .= '</div>'; // Close right sidebar

    //Footer
    $html .= '<div id="f">';
foreach ($plan['f'] as $cubo) {
    if (is_array($cubo) && isset($cubo['renderCubo'])) {
        // Admin case: ["renderCubo" => "default.nbar"]
        $method = 'renderCubo';
        $param = $cubo['renderCubo'];
    } elseif (is_string($cubo)) {
        // Public case: "default.nbar"
        $method = 'renderCubo';
        $param = $cubo;
    } else {
        continue; // Skip invalid formats
    }

    $result = $this->executeMethod($method, $param);
    if (!empty($result)) {
        $html .= "<div class='cubo'>";
                    $html .= "<h3>
                                  <input id='{$param}_panel' class='red indicator'>
                                  <a href='/$param'><span class='glyphicon glyphicon-edit'></span>$param</a>
                              </h3>";
        $html .= $result;
        $html .= "</div>";
    }
}
    $html .= '</div>'; // Close right sidebar

    $html .= '</div>'; // Close container

    return $html;
}

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