<?php
namespace Core;
/**
DOC
===
Setting update the <head> of Admin and any project

v.1 used build Public & Admin Head, encoding actiongrp


TODO
====
v.2 dive into Actions SEO Metadata
*/

trait Head{
use SEO;

protected function loadDynamicActions($libraries) {
    foreach ($libraries as $library) {
        $apiUrl = "https://api.cdnjs.com/libraries/$library";
        $response = file_get_contents($apiUrl);
        $libraryData = json_decode($response, true);

        if (isset($libraryData['assets'][0])) {
            $cssFiles = $libraryData['assets'][0]['css'];
            $jsFiles = $libraryData['assets'][0]['js'];


          // Load CSS files
            foreach ($cssFiles as $css) {
                echo "<link rel='stylesheet' href='$css'>\n";
            }

            // Load JS files
            foreach ($jsFiles as $js) {
                echo "<script src='$js'></script>\n";
            }
        }
    }
}

	protected function renderPublicHead() {
	   $copyright = html_entity_decode($this->is['copyright'] ?? '', ENT_QUOTES);

        $html = '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="robots" content="selection">
            <meta name="copyright" content="' . $copyright . '">
            <meta name="googlebot" content="all">
            <meta http-equiv="name" content="value">
            <meta name="ROBOTS" content="NOARCHIVE">
            <meta name="google" content="notranslate">
            <link href="/admin/css/core.css" rel="stylesheet" type="text/css">
            <link href="/style.css" rel="stylesheet" type="text/css">
            <link href="https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css" rel="stylesheet">
            <link href="atom.xml" type="application/atom+xml" rel="alternate" title="Sitewide ATOM Feed">
            <link rel="icon" href="/img/icon.png" />';

      //<!---loadHeadSetup-->

               $scripts=  $this->loadHeadSetup();
               if(!empty($scripts)){
               $html .= implode('',$scripts);
               }


    if (isset($_GET['page']) && $_GET['page'] === 'ebook') {
          $html .= '<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.7.570/pdf.min.js"></script>';
      }
            $html .= '<script type="module" src="https://unpkg.com/ionicons@7.3.1/dist/ionicons/ionicons.esm.js"></script>
            <script nomodule src="https://unpkg.com/ionicons@7.3.1/dist/ionicons/ionicons.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <title>Vivalibro</title>
            </head>';

        return $html;
    }


protected function renderAdminHead() {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <?php echo $this->buildMeta();?>
        <link rel="icon" href="/img/icon.png">
        <title>Admin GEN20</title>
        <!-- Main Styles -->
        <link rel="stylesheet" href="/admin/css/core.css">
      <!---loadHeadSetup-->
        <?php
               $scripts=  $this->loadHeadSetup();
               if(!empty($scripts)){
               echo implode('',$scripts);
               }
       ?>
              <!-- Dynamic CDN Actions-->
            <!-- $this->loadDynamicActions([]);-->
    <!-- Additional External Scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.3/Sortable.min.js" integrity="sha512-8AwTn2Tax8NWI+SqsYAXiKT8jO11WUBzTEWRoilYgr5GWnF4fNqBRD+hCr4JRSA1eZ/qwbI+FPsM3X/PQeHgpQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
       <script src="https://apis.google.com/js/api.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body>
        <script src="https://cdn.ckeditor.com/4.22.0/standard/ckeditor.js"></script>
                <script>
                      // Suppress CKEditor warning
                        (function() {
                            var originalWarn = console.warn;
                            console.warn = function(message) {
                                if (message.indexOf('not secure. Consider upgrading') === -1) {
                                    originalWarn.apply(console, arguments);
                                }
                            };
                        })();
                </script>
    <script type="text/javascript">var G=<?=json_encode($this, JSON_UNESCAPED_UNICODE)?>;</script>
    <script src="/admin/js/gen.js"></script>
    <script src="/admin/js/admin.js"></script>
    <?php
}

protected function loadHeadSetup() {
    $return = [];
    $table = $this->publicdb.".setup";

    // Load CSS files
    $cssArray = $this->db->flist("SELECT val FROM $table WHERE tag = 'head-css' AND status=2");
    foreach ($cssArray as $css) {
        $return[] = "<link rel='stylesheet' href='" . htmlspecialchars($css, ENT_QUOTES) . "'>\n";
    }
    // Load JS files
    $jsArray = $this->db->flist("SELECT val FROM $table WHERE tag = 'head-js' AND status=2");
    foreach ($jsArray as $js) {
        $return[] = "<script src='" . htmlspecialchars($js, ENT_QUOTES) . "'></script>\n";
    }
    return $return;
}


}