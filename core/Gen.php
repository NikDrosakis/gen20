<?php
namespace Core;

class Gen extends Gaia {
use Head;
use Form;
use Media;
use My;
use GSocket;
use Template;
use Cubo;

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
    }
    }

	protected function publicRouter() {

     echo  $this->renderPublicHead();
      try {
          $this->G['PAGECUBO'] = $this->getMaincuboBypage();
		} catch (Exception $e) {
          // Handle exception and set error in buffer
          $this->catch_errors();
      }
		$this->getBody();
      		//load all widgets of the page to the body
    }

	protected function getBody() {
		// Check if there are cubos for the current page
		$pc=$this->G['PAGECUBO'];
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
		include PUBLIC_ROOT_WEB . "main/menuweb.php";
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
        include CUBO_ROOT.$cubo."/public.php";
        echo '</div>';  // Correctly closing div
    }}
    echo '</div>';
}

// Main content
echo '<div id="m" style="width:' . $main_width . '%">';

    if (!$has_not_m) {

      foreach ($pc['m'] as $cubo) {
           echo '<div id="' . $cubo . '" class="row archive-content">';
              //include CUBO_ROOT.$cubo."/public.php";
              $main= $this->db->f("select * from main where name=?",[$this->page]);
              echo  $this->buildTemplateArchive($main);
              echo '</div>';  // Correctly closing div
      }
  }elseif(!empty($this->G['PAGECUBO'])){
                      $pageTemplate= $this->db->f("select * from main where name=?",[$this->page]);
                   //   xecho($pageTemplate);
 }else{
     $template= $this->db->f("select template_read from main where name=?",['404'])['template_read'];
     echo $this->renderTemplatePug($template);
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
        include CUBO_ROOT.$cubo."/public.php";
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
        include CUBO_ROOT.$cubo."/public.php";
        echo '</div>';  // Correctly closing div
    }
}
    echo '</div>';
}

    echo '<script src="/js/load.js"></script>
          </body>
          </html>';
	}
}