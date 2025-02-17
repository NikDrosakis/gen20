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
  - manifestEditor: ""
  - renderCubo: "default.mediac"
  - renderCubo: "slideshow"
  - renderCubo: "chat.venus"
  - renderCubo: "chat.desk"
sr:
  - renderCubo: "default.nbar"
  - renderCubo: "default.notificationweb"
';
protected $default_public_manifest='h:
  - renderCubo: "default.menuweb"
sl:
  - renderCubo: "default.mediac"
  - renderCubo: "slideshow"
  - renderCubo: "chat.venus"
  - renderCubo: "chat.desk"
sr:
  - renderCubo: "default.nbar"
  - renderCubo: "default.notification"
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
protected $alinks;
protected $alinksgrp;
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
echo $this->buildManifest($this->sub);

//FOOTER
//     include_once CUBO_ROOT."venus/public.php";
echo '<script src="/admin/js/start.js"></script>';
echo '</body>';
echo '</html>';
}

protected function produceSubchannel($channel){
                //INCLUDE embedded to iframes
                if($content['type']=='iframe'){
                return $this->ADMIN_ROOT . "common/iframe.php";
                 }else  if (file_exists($this->ADMIN_ROOT . "main/" . $this->page . "/" .$this->sub . ".php")) {
                return $this->ADMIN_ROOT . "main/" . $this->page . "/" .$this->sub . ".php";
                }
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

protected function produce6channel($name,$ch,$page,$type,$mainplan){
    $Position=['1'=>'top-left','2'=>'top-right','3'=>'top-center','4'=>'bottom-center','5'=>'bottom-left','6'=>'bottom-right'];
 $html = '<div id="ch'.$ch.'" title="CHANNEL '.$ch.'" class="channel '.$Position[$ch].'">';

   if($type=='iframe'){
        $html .='<iframe src='.$name.'
            style="border: none; width: 100%; height: 100%;"
            allow="payment"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
        ></iframe>';

   }elseif($type=='table'){

    //then insert the table
        $html .= $this->buildTable($table);
        $html .= '<script>gs.ui.sort(`UPDATE '.$table.' SET sort=? WHERE id = ?`, "list", "'.$table.'");</script>';
   }else{
    switch($type){
            case "common" : $chanfile = ADMIN_ROOT."common/".$name.".php" ; break;
            case "cubos" : $chanfile = CUBO_ROOT.$name."/public.php" ; break;
            default:   $chanfile = ADMIN_ROOT."main/".$page."/".$name.".php" ; break;
    }
    if (file_exists($chanfile)){
    $buffer = $this->include_buffer($chanfile);
    if($buffer!=''){
      $html .= $buffer;
    }}else{
      $html .= $this->emptyChannelImg;
    }
  }
  $html .='</div>';
      return $html;
}

/**
     DO channels producing from home to global Admin
    channels merged in G.apages
*/
 protected function channelRenderFile($file,$ch=1){
  $Position=['1'=>'top-left','2'=>'top-right','3'=>'top-center','4'=>'bottom-center','5'=>'bottom-left','6'=>'bottom-right'];
     $html='';
     //$html .='<div id="ch'.$ch.'" title="CHANNEL '.$ch.'" class="channel '.$Position[$ch].'">';
     $html .='<div title="CHANNEL '.$ch.'">';
        $html .= $this->channelCheck($file);
     $html .='</div>';
     return $html;
 }

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
    if($_SERVER['SYSTEM']!='admin'){
     $mainWidth = $hasLeftSidebar && $hasRightSidebar ? '60' : ($hasLeftSidebar || $hasRightSidebar ? '80' : '100');
    $html .= '<div id="mainpage2">';
    $html .=  $this->renderMainContent($plan);
    $html .=  '</div>';

    }else{

        $html .= '<div id="mainpage2">';
    foreach ($plan['m'] as $methodData) {
        foreach ($methodData as $method => $param) {
        $result = $this->executeMethod($method, $param);
        if (!empty($result)) {
            $html .= "<div class='cubo'>";
            $html .= $result;
            $html .= "</div>";
        }
        }
    }
    $html .= '</div>'; // Close main page
}


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




 protected function channelRender($name,$ch='1'){
 $Position=['1'=>'top-left','2'=>'top-right','3'=>'top-center','4'=>'bottom-center','5'=>'bottom-left','6'=>'bottom-right'];

    $html ='<div id="ch'.$ch.'" title="CHANNEL '.$ch.'" class="channel '.$Position[$ch].'">';

    //if($this->id !='' && $this->mode ==''){
      //    $html .=  $this->buildForm($table);
//$rows=$this->mainplan($name);

//xecho($rows['manifest']);
//xecho(yaml_parse($rows['manifest']));
   // }else{

           //$html .= $this->mainPlanAdminEditor($name);

   // }

/*
      //CHANNEL FILE SUB FILE
    if ($this->db_sub['type'] == 'table') {
          //select * from alinksgrp  and sub=$this->sub
             //add also the file after the table
         if($this->id !='' && $this->mode ==''){
            $html .=  $this->buildForm($table);

         }elseif($this->mode !=''){
           //then insert table
           $filename=$this->ADMIN_ROOT . "main/" . $this->page . "/" .$this->sub ."_".$this->mode. ".php";
           if(file_exists($filename)){
            $html .= include_buffer($filename);
           }

         }else{
       //RUN TABLE SUB
       //firrst the file contents
     //     $chanfile = ADMIN_ROOT."main/".$this->page."/".$name.".php" ;
      //         if (file_exists($chanfile)){
      //         $buffer = $this->include_buffer($chanfile);
        //       if($buffer!=''){$html .= $buffer;}}
       //THEN RUN THE TABLE
            $html .=  $this->buildTable($table);
         }
      }elseif ($this->db_sub['type'] == 'cubos') {
        $chan = $this->produceCuboadmin($name);
         $html .= $this->channelCheck($chan);

      }elseif ($this->sub!='') {
        $chan = $this->produceSubchannel($name);
         $html .= $this->channelCheck($chan);
     }

 */

    $html .='</div>';
    return $html;
 }

/**
TODO channel has to disconnect from G.page
 */
protected function channelDispatch() {
   // $channels=$this->layouts[$this->layout_selected]['channels'];
    //this is for 6 channels
 $this->db_page = $this->db->f("SELECT * FROM gen_admin.alinksgrp where name=?",[$this->page]);
    //add automatice table and forms based on metadata admin.alinks.type=='table'
//NO SUBPAGE - MULTIPLE CHANNELS 6
if($this->sub==''){
    $alinksgrpid = $this->db_page['id'];
    if($this->page=='home'){
    $alinks = $this->db->fa("SELECT * FROM gen_admin.alinks order by sort limit 6");  //6th is notifications
    }else{
    $alinks = $this->db->fa("SELECT * FROM gen_admin.alinks where alinksgrpid=? order by sort limit 6",[$alinksgrpid]);  //6th is notifications
    }
    $html='';

    if($this->page=='home'){
    $html .= $this->syncDom(DOMAIN);
    //$html .= $this->createMaria(DOMAIN);
    $html .= $this->buildForm(["key"=>"gen_admin.domain","name"=>DOMAIN]);
    $html .= $this->include_buffer(ADMIN_ROOT."main/layout.php");

    }else{
    foreach ($alinks as $channel => $content){
      $name = $content['name'];

      //$table = $content['mainplan']!=null ?  $this->mainplan($content['mainplan']) : $name;
      $ch = strval($channel+1);
      //get parent page of sub

      $page = $this->G['subparent'][$name];
      //include _edit page
      //or normal main php file
      //$mp['mainfile'.$ch]= $this->ADMIN_ROOT . "main/" . $this->page . "/" . $this->page . ".php";
   //   xecho($name);
    //  xecho($content['mainplan']);
 //   $html .= $this->produce6channel($name,$ch,$page,$content['type'],$content['mainplan']);
//     xecho($content['mainplan']);
      $html .= $this->channelRender($name,$ch,$content);
      }
    }

      return $html;

//SUB PAGE - DEFAULT 1 CHANNEL subpage + DOC + NOTIFICATION
}else{
      $name=$this->sub;

     // $html .= $this->channelRender($name,1,$this->mainplan($name));

    //  $html .= '<script>gs.ui.sort(`UPDATE ${G.mainplan} SET sort=? WHERE id = ?`, "list", G.mainplan);</script>';
      //add notification bar
    //  $html .= $this->channelRenderFile($this->notification_file,2);
      //add doc bar if type==table select doc FROM gen_admin.table with form input
   //   $html .= $this->channelRenderFile($this->notification_file,3);
           //channel doc
      //$html .= $this->channelRenderDoc($name);
      return $html;
    }
}

protected function alinks() {
    $widgets = read_folder($this->G['WIDGETURI']);
    $subs=array();
     foreach ($widgets as $wid) {
        if (file_exists($this->G['WIDGETURI'] . $wid . "/admin.php")) {
            $subs[$wid] = ["slug" => ucfirst($wid), "icon" => "time"];
        }
    }
    return $subs;
}

protected function mainPlanAdminEditor($name,$alinks=[]){
    if(empty($alinks)){
     $alinks = $this->mainplan($name);
     }
     $plan= $alinks['mainplan'] ? json_decode($alinks['mainplan'],true) : $alinks['mainplan'];
     $html = $this->renderFormField("mainplan",["type"=>"json","comment"=>"json","table"=>"gen_admin.alinks","id"=>$alinks['id']],$alinks['mainplan']);
     //execute the plan to be included in core.Action switch cases
     foreach($plan as $step => $action){
        foreach($action as $method=>$params){
    try {
    switch($method) {
        case 'iframe':
            $html .= '<iframe id="sandbox" src="'.$params.'" width="100%" height="1000px" sandbox="allow-scripts allow-same-origin allow-forms" style="border:1px solid black;"></iframe>';
            break;
         //fs
        //case 'include_buffer':
          //  $params = $this->ADMIN_ROOT . $params . ".php";
           // $html .= $this->{$method}($params);
            //break;
        default:
            $html .= $this->{$method}($params);
            break;
    }
    } catch (Exception $e) {
        // Catch any exceptions that might occur
        $html .= "<p>Error: " . $e->getMessage() . "</p>";
    }
    }}
    return $html;
}

protected function buildMainPlan(){
     $main = $this->mainplan();
     $plan= json_decode($main['mainplan'],true) ?? $main['mainplan'];
     foreach($plan as $step => $action){
        foreach($action as $method=>$params){
    try {
    switch($method) {
        case 'iframe':
            $html .= '<iframe id="sandbox" src="'.$params.'" width="100%" height="1000px" sandbox="allow-scripts allow-same-origin allow-forms" style="border:1px solid black;"></iframe>';
            break;
         //fs
        case 'include_buffer':
            $params = $this->PUBLIC_ROOT_WEB . $params . ".php";
            if (file_exists($params)) {
                $html .= $this->{$method}($params);
            } else {
                $html .= "File not found in $params";
            }
            break;
        default:
            $html .= $this->{$method}($params);
            break;
    }
    } catch (Exception $e) {
        // Catch any exceptions that might occur
        $html .= "<p>Error: " . $e->getMessage() . "</p>";
    }
    }}
    return $html;
}
/**
 * Renders the main content area.
 */
protected function renderMainContent($pc) {
    if (!empty($pc['m'])) {
        foreach ($pc['m'] as $cubo) {
            $html ="<div id=\"$cubo\" class=\"row archive-content\">";
            try {
                // Check if the corresponding Router method exists dynamically
                $routerMethod = $cubo . 'Router';

                if (method_exists($this, $routerMethod)) {
                    $html .= $this->{$routerMethod}($this->page);
                } else {
                    // Fallback: Load the file from CUBO_ROOT
                    $file = CUBO_ROOT . $cubo . "/main/{$this->page}.php";
                    if (!file_exists($file)) {
                        throw new \Exception("File not found: $file");
                    }
                    $html .= $this->renderCubo($cubo);
                }

            } catch (\Throwable $e) {
                echo "<!-- Error loading main content for $cubo: " . $e->getMessage() . " -->";
            }
            $html .=  "</div>";
        }
    } else {
        try {
            // Handle 404 template logic
        } catch (\Throwable $e) {
            echo "<!-- Error loading 404 template: " . $e->getMessage() . " -->";
        }
    }
    return $html;
}

/**
 * Includes a file safely and reports errors.
 */
protected function safeInclude($file, $errorMessage = "")
{
    try {
        include $file;
    } catch (\Throwable $e) {
        echo "<!-- $errorMessage: " . $e->getMessage() . " -->";
    }
}


}