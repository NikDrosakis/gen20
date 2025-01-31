<?php
namespace Core;

class Gen extends Gaia {
use Head;
use Form;
use Media;
use My;
use WS;
use Template;
use Cubo;

 public $bookdefaultimg= "/img/empty.png";
 public $book_status=["0"=>"lost","1"=>"not owned","2"=>"desired","3"=>"shelve"];
 public $isread=[0=>"not read",1=>"reading",2=>"read"];

   public function __construct() { // Dependency Injection
           parent::__construct();
   }

/**
 * Undocumented function
 *
 * @return void
 */   
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

/**
 * Undocumented function
 *
 * @return void
 */
    protected function publicRouter() {

     echo  $this->renderPublicHead();
      try {
          $this->G['PAGECUBO'] = $this->getMaincubo($this->page);
		} catch (Exception $e) {
          // Handle exception and set error in buffer
          $this->catch_errors();
      }
		$this->getBody();
      		//load all widgets of the page to the body
    }


protected function getBody() {
    // Check if there are cubos for the current page
    $pc = $this->G['PAGECUBO'];

    $has_not_sl = !$pc['sl1'] && !$pc['sl2'] && !$pc['sl3'];
    $has_not_sr = !$pc['sr1'] && !$pc['sr2'] && !$pc['sr3'];
    $has_not_f = !$pc['fc'] && !$pc['fr'] && !$pc['fl'];
    $has_not_m = empty($pc['m']);
    $main_width = !$has_not_sl && !$has_not_sr ? '60' : (!$has_not_sl || !$has_not_sr ? '80' : '100');

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

    try {
        include PUBLIC_ROOT_WEB . "main/menuweb.php";
    } catch (\Throwable $e) {
        echo "<!-- Error loading menuweb.php: " . $e->getMessage() . " -->";
    }

    try {
        echo $this->mainplanPublicEditor();
    } catch (\Throwable $e) {
        echo "<!-- Error executing mainplanPublicEditor(): " . $e->getMessage() . " -->";
    }


    if ($this->page != 'home') {
        try {
            include PUBLIC_ROOT_WEB . "common/searchbox.php";
        } catch (\Throwable $e) {
            echo "<!-- Error loading searchbox.php: " . $e->getMessage() . " -->";
        }
    }
    echo '</div>';

    // Left sidebar
    if (!$has_not_sl) {
        echo '<div id="sl">';
        foreach ($slArray as $sl) {
            foreach ($sl as $cubo) {
                echo '<div id="' . $cubo . '" class="cubo">';
                try {
                    echo $this->buildCubo($cubo);
                } catch (\Throwable $e) {
                    echo "<!-- Error building cubo $cubo: " . $e->getMessage() . " -->";
                }
                echo '</div>';
            }
        }
        echo '</div>';
    }

    // Main content
    echo '<div id="m" style="width:' . $main_width . '%">';

    if (!$has_not_m) {
        foreach ($pc['m'] as $cubo) {
            echo '<div id="' . $cubo . '" class="row archive-content">';
            try {
                $main = $this->db->f("select * from {$this->publicdb}.main where name=?", [$this->page]);

                if ($main && $main['query_archive']) {
                    echo $this->buildTemplateArchive($main);
                }
            } catch (\Throwable $e) {
                echo "<!-- Error building main content for $cubo: " . $e->getMessage() . " -->";
            }
            echo '</div>';
        }
    } elseif (!empty($this->G['PAGECUBO'])) {
        try {
            $pageTemplate = $this->db->f("select * from {$this->publicdb}.main where name=?", [$this->page]);
        } catch (\Throwable $e) {
            echo "<!-- Error fetching main template $this->page: " . $e->getMessage() . " -->";
        }
    } else {
        try {
            $template = $this->db->f("select template_read from {$this->publicdb}.main where name=?", ['404'])['template_read'];
            echo $this->renderTemplatePug($template);
        } catch (\Throwable $e) {
            echo "<!-- Error loading 404 template: " . $e->getMessage() . " -->";
        }
    }

    echo '</div>';

    // Right sidebar
    if (!$has_not_sr) {
        echo '<div id="sr">';
        foreach ($srArray as $sr) {
            foreach ($sr as $cubo) {
                echo '<div id="' . $cubo . '" class="cubo">';
                try {
                    include CUBO_ROOT . $cubo . "/public.php";
                } catch (\Throwable $e) {
                    echo "<!-- Error loading right sidebar cubo $cubo: " . $e->getMessage() . " -->";
                }
                echo '</div>';
            }
        }
        echo '</div>';
    }

    // Footer
    if (!$has_not_f) {
        echo '<div id="f">';
        foreach ($fArray as $f) {
            foreach ($f as $cubo) {
                echo '<div id="' . $cubo . '" class="cubo">';
                try {
                    include CUBO_ROOT . $cubo . "/public.php";
                } catch (\Throwable $e) {
                    echo "<!-- Error loading footer cubo $cubo: " . $e->getMessage() . " -->";
                }
                echo '</div>';
            }
        }
        echo '</div>';
    }

    echo '<script src="/js/load.js"></script>
          </body>
          </html>';
}

protected function mainplanPublicEditor(){

		     $mainplan = $this->db->f("SELECT * FROM {$this->publicdb}.main WHERE name=?",[$this->page]);

             $plan= json_decode($mainplan['mainplan'],true) ?? $mainplan['mainplan'];
             $html = $this->renderFormField("mainplan",["type"=>"json","comment"=>"json","table"=>"{$this->publicdb}.main","id"=>$mainplan['id']],$mainplan['mainplan']);
             $html = json_encode($this->G['PAGECUBO']);
             //execute the plan to be included in core.Action switch cases

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

}