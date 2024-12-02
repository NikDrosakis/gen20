<?php
namespace Core;

class Gen extends Gaia {
use Head;
use Cubo;
use Form;
use Media;
use My;
use GSocket;
use Template;

 public $bookdefaultimg= "/img/empty.png";
 public $book_status=["0"=>"lost","1"=>"not owned","2"=>"desired","3"=>"shelve"];
 public $isread=[0=>"not read",1=>"reading",2=>"read"];

   public function __construct() { // Dependency Injection
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

        }elseif ($_SERVER['SYSTEM'] == 'vivalibrocom') {

				$this->publicRouter();

   //     }elseif ($_SERVER['SYSTEM'] == 'api' && $this->resource=='local') {
	//	    $this->apiAccess();
      //  }
    }

	//public function apiAccess() {
		//	$request = $_GET;
//			$executeMethod=$this->{this->id}($request);
	//		header("HTTP/2 $status $status_message");
      //      header("Content-Type: application/json; charset=UTF-8");
        //   return ["status"=>200,"success"=>true,"code"=>'LOC1',"data"=>$executeMethod];
	}

	protected function publicRouter() {

     echo  $this->renderPublicHead();
      try {
          $this->G['PAGECUBOS'] = $this->getMaincuboBypage();
		} catch (Exception $e) {
          // Handle exception and set error in buffer
          $this->catch_errors();
      }
		$this->getBody();
      		//load all widgets of the page to the body
    }

	protected function getBody() {
		// Check if there are cubos for the current page
		$pc=$this->G['PAGECUBOS'];
		$has_not_sl=!$pc['sl1'] && !$pc['sl2'] && !$pc['sl3'];
		$has_not_sr=!$pc['sr1'] && !$pc['sr2'] && !$pc['sr3'];
		$has_not_f=!$pc['fc'] && !$pc['fr'] && !$pc['fl'];
		$has_not_m=empty($pc['m']);
		$main_width= !$has_not_sl && !$has_not_sr ? '60' : (!$has_not_sl || !$has_not_sr ? '80' :'100');
		$srArray = [];
        if (!empty($pc['sr1'])) $srArray[] = $pc['sr1'];
        if (!empty($pc['sr2'])) $srArray[] = $pc['sr2'];
        if (!empty($pc['sr3'])) $srArray[] = $pc['sr3'];
        $slArray = [];
        if (!empty($pc['sl1'])) $slArray[] = $pc['sl1'];
        if (!empty($pc['sl2'])) $slArray[] = $pc['sl2'];
        if (!empty($pc['sl3'])) $slArray[] = $pc['sl3'];
        $fArray = [];
        if (!empty($pc['fl'])) $fArray[] = $pc['fl'];
        if (!empty($pc['fc'])) $fArray[] = $pc['fc'];
        if (!empty($pc['fr'])) $fArray[] = $pc['fr'];
		echo '
			<body class="' . (!empty($_COOKIE['display']) ? $_COOKIE['display'] : 'light') . '">
			<script type="text/javascript">var G=' . json_encode($this->G, JSON_UNESCAPED_UNICODE) . ';</script>
			<script src="' . ADMIN_URL . 'js/gen.js"></script>
			<script src="/js/index.js"></script>';
		echo '<div id="h">';
		include PUBLIC_ROOT_WEB . "compos/menuweb.php";
		if($this->page!='home'){include PUBLIC_ROOT_WEB . "compos/searchbox.php"; }
		echo '</div>';
		// Left sidebar
    /**
    TODO add cubos divs
    ADDED SERVER SIDE RENDERING
     */
if (!$has_not_sl) {
    echo '<div id="sl">';
    foreach ($slArray as $sl) {
    foreach ($sl as $cubo) {
        echo '<div id="' . $cubo . '" class="cubo">';
        include CUBOS_ROOT.$cubo."/public.php";
        echo '</div>';  // Correctly closing div
    }}
    echo '</div>';
}

// Main content
echo '<div id="m" style="width:' . $main_width . '%">';
    if (!$has_not_m) {
      foreach ($pc['m'] as $cubo) {
           echo '<div id="' . $cubo . '" class="row archive-content">';
              include CUBOS_ROOT.$cubo."/public.php";
              echo '</div>';  // Correctly closing div
      }
  }
  /*
    if($this->G['has_maria']){
    //if($this->page!='book'){
    $main= $this->db->f("select * from main where name=?",[$this->page]);
    if(!empty($main) && $main['template_archive']!=null && $main['query_archive']!=null){
echo '<div class="row archive-content">';
    if($this->id!=''){
echo  $this->buildTemplateRead($main);
    }else{
echo  $this->buildTemplateArchive($main);
}
echo '</div>';
     }else{
    include PUBLIC_ROOT_WEB."main/".$this->page."/".$this->page.".php";
    }

    }else{
    include $this->route(); // Main content loaded here
    }
*/
echo '</div>';


    // Right sidebar
if (!$has_not_sr) {
    echo '<div id="sr">';
    foreach ($srArray as $sr) {
    foreach ($sr as $cubo) {
        echo '<div id="' . $cubo . '" class="cubo">';
        include CUBOS_ROOT.$cubo."/public.php";
        echo '</div>';  // Correctly closing div
    }}
    echo '</div>';
}


    // Footer
if (!$has_not_f) {
    echo '<div id="f">';
    foreach ($fArray as $f) {
    foreach ($f as $cubo) {
        echo '<div id="' . $cubo . '" class="cubo">';
        include CUBOS_ROOT.$cubo."/public.php";
        echo '</div>';  // Correctly closing div
    }
}
    echo '</div>';
}

    echo '<script src="/js/load.js"></script>
          </body>
          </html>';
	}
/**
 contained INSIDE compos/body.php
*/
  protected function route() {
    $page=$this->page;
    $id=$this->id;
    $action=$this->action;
  $first_path=PUBLIC_ROOT_WEB."main/$page/$page.php";
  $second_path=PUBLIC_ROOT_WEB."main/$page/$id/read.php";  //ie id
  $second_path_file=PUBLIC_ROOT_WEB."main/$page/read.php";  //ie id
  $third_path=PUBLIC_ROOT_WEB."main/$page/$id/$action.php";  //ie id
  $third_path_file=PUBLIC_ROOT_WEB."main/$page/$action.php";  //ie id


          if($page!='' && $id!='' && $action!='' && file_exists($third_path_file)){
             $route= $third_path_file;
                }elseif($page!='' && $id!='' && file_exists($second_path_file)){
                    $route= $second_path_file;
                }elseif($page!='' && file_exists($first_path)){
                    $route= $first_path;

            //CATCH CASE 404 typed after domain anything, any levels
            }else{
            $route= PUBLIC_ROOT_WEB."main/404.php"; //echo "<h2>404 - Page Not Found<h2>";

            }
//xecho($route);

            //and the load all widgets of the page to the body in any async way from top top bottom
            //in order to create the body


                return $route;

    }
}