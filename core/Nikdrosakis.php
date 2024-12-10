<?php
namespace Core;

class Nikdrosakis extends Gaia {


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
				
        }elseif ($_SERVER['SYSTEM'] == 'vivalibro') {
				
				$this->public_router();
		
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
	
	protected function public_router() {

       include PUBLIC_ROOT_WEB."compos/head.php";
      try {
            $this->G['PAGECUBOS']=$this->getMaincuboBypage();
		} catch (Exception $e) {
          // Handle exception and set error in buffer
          $this->catch_errors();
      }
			$this->get_body();
      		//load all widgets of the page to the body
      
}

	protected function get_body() {
		// Check if there are cubos for the current page 		
		$pc=$this->G['PAGECUBOS'];
		$has_not_sl=!$pc['sl1'] && !$pc['sl2'] && !$pc['sl3'];
		$has_not_sr=!$pc['sr1'] && !$pc['sr2'] && !$pc['sr3'];
		$main_width= !$has_not_sl && !$has_not_sr ? '60' : (!$has_not_sl || !$has_not_sr ? '80' :'100');	
		
		echo '
			<body class="' . (!empty($_COOKIE['display']) ? $_COOKIE['display'] : 'light') . '">
			<script type="text/javascript">var G=' . json_encode($this->G, JSON_UNESCAPED_UNICODE) . ';</script>
			<script src="' . ADMIN_URL . 'js/gs.js"></script>
			<script src="/js/index.js"></script>';

		echo '<div id="h">';
		include PUBLIC_ROOT_WEB . "compos/menuweb.php"; 
		if($this->page!='home'){include PUBLIC_ROOT_WEB . "compos/searchbox.php"; }
		echo '</div>'; 
		
		// Left sidebar 
		if (!$has_not_sl) {
			echo '<div id="sl"></div>';
		}
		
		// Main 
		echo '<div id="m" style="width:'.$main_width.'%">';
		include $this->route(); 
		echo '</div>'; 
		
		// Right sidebar 
		if (!$has_not_sr) {
		echo '<div id="sr"></div>';
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

    // Method to generate a list of books based on the current page type
  protected function booklists(array $get): array {
        $pagin = 12; // number of results per page
        $pagenum=$get['pagenum'] ?? 1;
        $start = ($pagenum - 1) * $pagin;
        $limit = " LIMIT $start, $pagin";
        $q = $get['q'] ?? '';
        $buffer = array();
        $sel = array();

        if ($get['page'] == 'ebook') {
            $name = isset($get['name']) ? $get['name'] : '';
            $ebooks = glob("/pdf/$name/*.pdf");
            if (!empty($ebooks)) {
                foreach (array_slice($ebooks, $start, $pagin) as $i => $e) {
                    $e = basename($e);
                    $sel[$i]['title'] = basename($e, ".pdf");
                    $sel[$i]['booklink'] = "/pdf/$name/$e";
                }
                $buffer['count'] = count($ebooks);
            } else {
                $buffer['count'] = 0;
            }
        } elseif ($get['page']== "home" || $get['page'] == "books") {
            //$orderby = !empty($_COOKIE['orderby']) ? $_COOKIE['orderby'] : "RAND()";
            $orderby = !empty($_COOKIE['orderby']) ? $_COOKIE['orderby'] : "RAND()";
            $langQ = !empty($_COOKIE['LANG']) ? "AND vl_book.lang='" . $_COOKIE['LANG'] . "'" : "el";
            $libQ = $get['page'] == "book" ? "AND vl_libuser.libid=" . $get['libid'] : "";
            $tableQ = $get['page'] == "book" ? "FROM vl_libuser LEFT JOIN vl_book ON vl_libuser.bookid=vl_book.id" : "FROM vl_book";
            $qQ = $q!='' ? "AND (vl_book.title LIKE '%$q%' OR vl_writer.name LIKE '%$q%' OR vl_cat.name LIKE '%$q%' OR vl_publisher.name LIKE '%$q%')" : "";

            $query = "SELECT vl_book.*, CONCAT('/book?id=', vl_book.id) AS booklink, vl_writer.name AS writername, vl_cat.name AS catname, vl_publisher.name AS publishername
                      $tableQ
                      LEFT JOIN vl_writer ON vl_book.writer = vl_writer.id
                      LEFT JOIN vl_cat ON vl_book.cat = vl_cat.id
                      LEFT JOIN vl_publisher ON vl_book.publisher = vl_publisher.id
                      WHERE vl_book.img IS NOT NULL $langQ $libQ $qQ
                      ORDER BY $orderby";
//HIDDEN WHERE PARAMS FOR THE TEST

         //   $sel = $this->db->fa("$query ");
            $sel = $this->db->fa("$query $limit");
      //     $count = count($this->db->fa($query));

        } elseif ($get['page'] == "libraries") {
            $sel = $this->db->fa("SELECT * FROM vl_lib");
         //   $count = count($sel);

        } elseif ($get['page'] == "writer") {
            $query = "SELECT * FROM vl_writer ORDER BY name DESC";
            $list = $this->db->fa("$query $limit");
            foreach ($list as $i => $writer) {
                $sel[$i] = $writer;
                $id = (int) $writer['id'];
                $sel[$i]['books'] = $this->db->fl(["id", "title"], "vl_book", "WHERE writer=$id");
                $sel[$i]['categories'] = $this->db->fl(["vl_cat.id", "vl_cat.name"], "vl_cat", "LEFT JOIN vl_book ON vl_book.cat=vl_cat.id WHERE vl_book.writer=$id");
            }
       //     $count = count($this->db->fa($query));

        } elseif ($get['page'] == "publisher") {
            $query = "SELECT * FROM vl_publisher ORDER BY name DESC";
            $list = $this->db->fa("$query $limit");
            foreach ($list as $i => $publisher) {
                $sel[$i] = $publisher;
                $id = (int) $publisher['id'];
                $sel[$i]['books'] = $this->db->fl(["id", "title"], "vl_book", "WHERE publisher=$id");
                $sel[$i]['categories'] = $this->db->fl(["vl_cat.id", "vl_cat.name"], "vl_cat", "LEFT JOIN vl_book ON vl_book.cat=vl_cat.id WHERE vl_book.writer=$id");
            }
       //     $count = count($this->db->fa($query));
        }
        return $sel;
    }

    // Method to retrieve all categories
   protected function get_categories() {
        return $this->db->fa("SELECT * FROM vl_cat");
    }

    // Method to retrieve all libraries
   protected function get_libs(): array {
        return $this->db->fa("SELECT * FROM vl_lib");
    }

    // Method to retrieve the current user's library
   protected function get_mylib() {
        return $this->db->f("SELECT * FROM vl_lib WHERE userid=?", array($this->me));
    }

    // Method to retrieve a specific book's details
   protected function get_book() {
        return $this->db->f("SELECT vl_book.*, vl_libuser.notes, vl_libuser.isread,
                             vl_book_rating.stars, vl_writer.name AS writer, 
                             vl_cat.name AS cat, vl_publisher.name AS publisher 
                             FROM vl_book 
                             LEFT JOIN vl_book_rating ON vl_book.id=vl_book_rating.bookid AND vl_book_rating.uid=? 
                             LEFT JOIN vl_writer ON vl_book.writer=vl_writer.id 
                             LEFT JOIN vl_cat ON vl_book.cat=vl_cat.id 
                             LEFT JOIN vl_libuser ON vl_book.id=vl_libuser.bookid 
                             LEFT JOIN vl_publisher ON vl_book.publisher=vl_publisher.id 
                             WHERE vl_book.id=?", array($this->me, $this->id));
    }
}
