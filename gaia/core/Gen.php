<?php
namespace Core;
class Gen extends Gaia {
use Head, Form, Media, My, WS, Template, Cubo, Book;

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

        } else if($this->isCuboRequest()){
          $this->handleCuboRequest();

        } else if($this->isWorkerRequest()){
                $this->handleWorkerRequest();

        }elseif ($_SERVER['SYSTEM'] == 'vivalibrocom') {
				$this->publicRouter();
    }
    }

/**
 * Public Router
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
		$this->buildBodyUI();
      		//load all widgets of the page to the body
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

protected function mainplanPublicEditor(){
     $main=$this->mainplan();
     $html = $this->renderFormField("mainplan",["type"=>"json","comment"=>"json","table"=>"{$this->publicdb}.main","id"=>$main['id']],$main['mainplan']);
      //   $html = json_encode($this->G['PAGECUBO']);
         //execute the plan to be included in core.Action switch cases
    return $html;
}

protected function buildBodyUI()
{
    $pc = $this->G['PAGECUBO'];

    // Determine visibility of sections
    $hasLeftSidebar  = !empty($pc['sl1']) || !empty($pc['sl2']) || !empty($pc['sl3']);
    $hasRightSidebar = !empty($pc['sr1']) || !empty($pc['sr2']) || !empty($pc['sr3']);
    $hasFooter       = !empty($pc['fc']) || !empty($pc['fr']) || !empty($pc['fl']);
    $hasMain         = !empty($pc['m']);

    // Define main content width dynamically
    $mainWidth = $hasLeftSidebar && $hasRightSidebar ? '60' : ($hasLeftSidebar || $hasRightSidebar ? '80' : '100');

    echo '<body class="' . ($_COOKIE['display'] ?? 'light') . '">';
    echo '<script type="text/javascript">var G=' . json_encode($this->G, JSON_UNESCAPED_UNICODE) . ';</script>';
    echo '<script src="' . ADMIN_URL . 'js/gen.js"></script><script src="/js/index.js"></script>';

    // Render header
    echo '<div id="h">';
    $this->safeInclude(CUBO_ROOT_DEFAULT . "menuweb.php");
    echo $this->safeCall('mainplanPublicEditor');
    if ($this->page !== 'home') {
        $this->safeInclude(CUBO_ROOT_DEFAULT . "search.php");
    }
    echo '</div>';

    // Render sidebars and main content
    if ($hasLeftSidebar) {
        $this->renderCubos($pc, ['sl1', 'sl2', 'sl3'], 'sl');
    }

    echo '<div id="m" style="width:' . $mainWidth . '%">';
    $this->renderMainContent($pc);
    echo '</div>';

    if ($hasRightSidebar) {
        $this->renderCubos($pc, ['sr1', 'sr2', 'sr3'], 'sr');
    }

    if ($hasFooter) {
        $this->renderCubos($pc, ['fl', 'fc', 'fr'], 'f');
    }

    echo '<script src="/js/load.js"></script></body></html>';
}

/**
 * Renders a section containing multiple cubos.
 */
protected function renderCubos($pc, $keys, $wrapperId)
{
    echo "<div id=\"$wrapperId\">";
    foreach ($keys as $key) {
        if (!empty($pc[$key]) && is_array($pc[$key])) {  // 🔹 Ensure it's an array
            foreach ($pc[$key] as $cubo) {
                echo "<div id=\"$cubo\" class=\"cubo\">";
                try {
                    $this->safeInclude(CUBO_ROOT . $cubo . "/public.php", "Error loading $cubo");
                } catch (\Throwable $e) {
                    echo "<!-- Error: " . $e->getMessage() . " -->";
                }
                echo "</div>";
            }
        }
    }
    echo "</div>";
}


/**
 * Renders the main content area.
 */
protected function renderMainContent($pc) {
    if (!empty($pc['m'])) {
        foreach ($pc['m'] as $cubo) {
            echo "<div id=\"$cubo\" class=\"row archive-content\">";
            try {
                // Check if the corresponding Router method exists dynamically
                $routerMethod = $cubo . 'Router';

                if (method_exists($this, $routerMethod)) {
                    echo $this->{$routerMethod}($this->page);
                } else {
                    // Fallback: Load the file from CUBO_ROOT
                    $file = CUBO_ROOT . $cubo . "/main/{$this->page}.php";
                    if (!file_exists($file)) {
                        throw new \Exception("File not found: $file");
                    }
                    include $file;
                }

            } catch (\Throwable $e) {
                echo "<!-- Error loading main content for $cubo: " . $e->getMessage() . " -->";
            }
            echo "</div>";
        }
    } else {
        try {
            // Handle 404 template logic
        } catch (\Throwable $e) {
            echo "<!-- Error loading 404 template: " . $e->getMessage() . " -->";
        }
    }
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

/**
 * Calls a method safely and reports errors.
 */
protected function safeCall($method, $errorMessage = "")
{
    try {
        return $this->$method();
    } catch (\Throwable $e) {
        return "<!-- $errorMessage: " . $e->getMessage() . " -->";
    }
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
        include CUBO_ROOT_DEFAULT . "menuweb.php";
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
            include CUBO_ROOT_DEFAULT . "search.php";
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
//                $main = $this->db->f("select * from {$this->publicdb}.main where name=?", [$this->page]);
  //              if ($main && $main['query_archive']) {
    //                echo $this->buildTemplateArchive($main);
      //          }
            } catch (\Throwable $e) {
                echo "<!-- Error building main content for $cubo: " . $e->getMessage() . " -->";
            }
            echo '</div>';
        }

    } elseif (!empty($this->G['PAGECUBO'])){
        try {
           // $pageTemplate = $this->db->f("select * from {$this->publicdb}.main where name=?", [$this->page]);
        } catch (\Throwable $e) {
            echo "<!-- Error fetching main template $this->page: " . $e->getMessage() . " -->";
        }

    } else {
        try {
      //      $template = $this->db->f("select template_read from {$this->publicdb}.main where name=?", ['404'])['template_read'];
       //     echo $this->renderTemplatePug($template);
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

}