<?php
namespace Core;

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

class Admin extends Gaia {
use Manifest, Head, Ermis, Lang, Tree, Form, Domain, Kronos, WS, Action, Template, Bundle, Media, Filemeta, My, Cubo;

protected $database;
protected $layout_selected;
protected $layout;
protected $db_sub;
protected $db_page;
protected $layouts=[
      '1'=>['name'=>'1','columns'=>"1fr", 'rows'=>"1fr",'channels'=>1],
      '2'=>['name'=>'1X2','columns'=>"2fr 1fr", 'rows'=>"1fr",'channels'=>2],  //70-30
      '3'=>['name'=>'2X1','columns'=>"2fr 1fr 1fr", 'rows'=>"1fr",'channels'=>3],  //50%
      '4'=>['name'=>'3','columns'=>"1fr 1f 1fr", 'rows'=>"1fr",'channels'=>3],
      '5'=>['name'=>'4','columns'=>"1fr 1fr", 'rows'=>"1fr 1fr",'channels'=>4],
      '6'=>['name'=>'6','columns'=>"1fr 1fr 1fr", 'rows'=>"1fr 1fr",'channels'=>6]
      ];

protected $editor;
protected $admin_sub;
protected $admin_page;
protected $emptyChannelImg='<img src="https://scontent.fath6-1.fna.fbcdn.net/v/t39.30808-6/346640854_1464202694405870_4821110064275118463_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeET8MMdyrrxcZXQPQRHxxULzTMCkFTvUl7NMwKQVO9SXlWjH0Q-knjnox1ZdrOQV0Q&_nc_ohc=kaVtIYyBrmEQ7kNvgHtt038&_nc_zt=23&_nc_ht=scontent.fath6-1.fna&_nc_gid=AKEgjeaOYw12bRkO0FEl6jd&oh=00_AYDlYaFlI9-vLGr2Zyak5KKkzHVXnaDNqSRly3sY4d_zaQ&oe=67232B67">';


     public function __construct()  {
          parent::__construct();
       }


 public function handleRequest() {
  // if ($this->isApiRequest()) {
   // Now calls isApiRequest() from Gaia
   //   $this->api->startAPI();
   //  } else
if ($this->isXHRRequest()) {
               $this->handleXHRRequest();

        } else if($this->isCuboRequest()){
          $this->handleCuboRequest();

        } else if($this->isWorkerRequest()){
                $this->handleWorkerRequest();
        }else{
        // VL-specific normal request handling:
        if ($_SERVER['SYSTEM'] == 'admin') {

            $this->adminDomWrap();
        }
	  //else{
         //   $this->publicUI_router();
     //      }
        }
    }


protected function adminDomWrap() {
//layout select
           if($this->sub==''){
                     $this->layout_selected="6";
                     $mainpageName='mainpage';
                 }else if($_COOKIE['openDocChannel']=='1' || $_COOKIE['openGuideChannel']!='1'){
                            $this->layout_selected="1";
                            $mainpageName='mainpage2';
                 }else{
                     $this->layout_selected="2";
                     $mainpageName='mainpage2';
            }

         $layout=$this->layouts[$this->layout_selected];
         extract($layout);

         //head
        $this->renderAdminHead();

        //navigation
        include $this->ADMIN_ROOT . "compos/dshbar.php";

        //body
        echo '<div id="container">';

      //1channel grid-template-columns:2fr 1fr 1fr;grid-template-rows:1fr;
      //2 right thin channels grid-template-columns:2fr 1fr 1fr;grid-template-rows:1fr;
       if($this->G['sub']!=''){
        echo '<div id="mainpage2">';

       }else{
        echo '<div id="mainpage" style="grid-template-columns:'.$columns.';grid-template-rows:'.$rows.';">';
        }
        //echo '<div id="'.$mainpageName.'">';

        //mainpage dom php file in channels default ONE
         //CHANNEL(s) HTML
        echo $this->channelDispatch();

        //CLOSING CONTAINERS
        echo '</div>'; //container
        echo '</div>';

        //FOOTER
        echo '</div>';
        //end of container-->
   //     include_once CUBO_ROOT."venus/public.php";
        echo '<script src="/admin/js/start.js"></script>';
        echo '</body>';
        echo '</html>';

}

protected function produceSubchannel($channel){
                //INCLUDE embedded to iframes
                if($content['type']=='iframe'){
                return $this->ADMIN_ROOT . "compos/iframe.php";
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

protected function produce6channel($name,$ch,$page,$type,$table){
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
            case "compos" : $chanfile = ADMIN_ROOT."compos/".$name.".php" ; break;
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

 protected function channelRender($name,$table,$ch='1'){
 $Position=['1'=>'top-left','2'=>'top-right','3'=>'top-center','4'=>'bottom-center','5'=>'bottom-left','6'=>'bottom-right'];
  if($this->sub!=''){
       $this->db_sub=$this->db->f("SELECT * FROM gen_admin.admin_sub where name=?",[$name]);
       }
    $html='';
    $html .='<div id="ch'.$ch.'" title="CHANNEL '.$ch.'" class="channel '.$Position[$ch].'">';

      //CHANNEL FILE SUB FILE
    if ($this->db_sub['type'] == 'table') {
          //select * from admin_page  and sub=$this->sub
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
    $html .='</div>';
    return $html;
 }


protected function channelDispatch() {
   // $channels=$this->layouts[$this->layout_selected]['channels'];
    //this is for 6 channels
 $this->db_page = $this->db->f("SELECT * FROM gen_admin.admin_page where name=?",[$this->page]);
    //add automatice table and forms based on metadata admin.admin_sub.type=='table'
//NO SUBPAGE - MULTIPLE CHANNELS 6
if($this->sub==''){
    $admin_pageid = $this->db_page['id'];
    if($this->page=='home'){
    $admin_subs = $this->db->fa("SELECT * FROM gen_admin.admin_sub order by sort limit 6");  //6th is notifications
    }else{
    $admin_subs = $this->db->fa("SELECT * FROM gen_admin.admin_sub where admin_pageid=? order by sort limit 6",[$admin_pageid]);  //6th is notifications
    }
    $html='';
    foreach ($admin_subs as $channel => $content){
      $name = $content['name'];
      $table=$this->has_maria($name);
      //$table = $content['has_maria']!=null ?  $this->has_maria($content['has_maria']) : $name;
      $ch = strval($channel+1);
      //get parent page of sub

      $page = $content['has_maria']
      ? $this->G['subparent'][$content['has_maria']]
      : $this->G['subparent'][$name];
      //include _edit page
      //or normal main php file
      //$mp['mainfile'.$ch]= $this->ADMIN_ROOT . "main/" . $this->page . "/" . $this->page . ".php";
      $html .= $this->produce6channel($name,$ch,$page,$content['type'],$table);
      }
  
      return $html;

//SUB PAGE - DEFAULT 1 CHANNEL subpage + DOC + NOTIFICATION
}else{
      $name=$this->sub;
      $html .= $this->channelRender($name,$this->has_maria());
      $html .= '<script>gs.ui.sort(`UPDATE ${G.has_maria} SET sort=? WHERE id = ?`, "list", G.has_maria);</script>';
      //add notification bar
    //  $html .= $this->channelRenderFile($this->notification_file,2);
      //add doc bar if type==table select doc FROM gen_admin.table with form input
   //   $html .= $this->channelRenderFile($this->notification_file,3);
           //channel doc

      //$html .= $this->channelRenderDoc($name);

      return $html;
    }
}

/**
navigation
*/
protected function navigate() {
    // Fetch data from the database
    $pages = $this->db->fa("SELECT * FROM gen_admin.admin_page ORDER BY sort");

    // Initialize the navigation structure
    $this->G['apages'] = [];

    // Populate the navigation structure
    foreach ($pages as $page) {
        // Extract relevant details
        $slug = $page['name']; // Assuming 'name' corresponds to the desired slug
        $title = $page['title'];
        $icon = $page['img']; // Assuming 'img' corresponds to the icon

        // Check if the parent key (like "manage") exists, otherwise create it
        if (!isset($this->G['apages'][$slug])) {
            $this->G['apages'][$slug] = [
                "title" => $title,
                "subs" => [],
                "icon" => $icon
            ];
        }

        // Add sub-navigation if applicable
         $subs = $this->db->fa("SELECT * FROM gen_admin.admin_sub order by sort");
         if(!empty($subs)){
         foreach ($subs as $sub) {
         if($sub['admin_pageid']==$page['id']){
            $this->G['apages'][$slug]['subs'][$sub['name']] = [
                "slug" => $sub['title'],
                "icon" => $sub['img'],
                "mode" => $sub['type']
            ];
         }
         }
        }
}
    return $this->G['apages'];
}

    protected function admin_subs() {
        $widgets = read_folder($this->G['WIDGETURI']);
		$subs=array();
         foreach ($widgets as $wid) {
            if (file_exists($this->G['WIDGETURI'] . $wid . "/admin.php")) {
                $subs[$wid] = ["slug" => ucfirst($wid), "icon" => "time"];
            }
        }
        return $subs;
    }

/**
GET all dependencies for head
build the body here not in  body.php
*/
 protected function experimental_pages(string $mainpage): ?array    {
        // Directory where PHP files are stored
        $directory = ADMIN_ROOT . "main/$mainpage";

        // Get all PHP files from the directory
        $files = glob($directory . '/*.php');

        // Initialize an array to store filtered files
        $filteredFiles = [];

        // Get the filenames to be excluded (those in 'subs' and the main page itself)
        $excludedFileNames = !empty($this->apages[$mainpage]['subs']) ? array_keys($this->apages[$mainpage]['subs']):[];
        $excludedFileNames[] = $mainpage; // Add the main page itself to the exclusion list

        // Loop through the files and filter out those containing 'buffer' or 'xhr'
        foreach ($files as $file) {
            // Get the base file name (without path) and remove '.php' extension
            $filename = pathinfo($file, PATHINFO_FILENAME);

            // Exclude files containing 'buffer' or 'xhr', and files in the excluded list
            if (!preg_match('/buffer|xhr/i', $filename) && !in_array($filename, $excludedFileNames)) {
                $filteredFiles[] = $filename; // Add to the filtered list if valid
            }
        }
        // Return the filtered file list, or null if none found
        return !empty($filteredFiles) ? $filteredFiles : [];
  }



}