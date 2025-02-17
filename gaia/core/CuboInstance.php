<?php
namespace Core;
class CuboInstance extends Gaia {
use System, Url, Meta, Manifest, Head, Ermis, Lang, Tree, Form, Domain, Kronos, WS, Action, Template, Bundle, Media, Filemeta, My, Cubo, Rethink, Template,Book;
public function __construct() {
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
        }
    }


/**
UPdate jsx support for react
usage https://vivalibro.com/cubos/index.php?cubo=menuweb&file=public.php
 */
protected function handleCuboRequest(): void {
    $cubo = basename($_GET['cubo']) ?? '';
    $file = basename($_GET['file']) ?? '';

    // Construct the full file path

    if($file==''){

    }elseif($file=='public.php'){
    $filePath = CUBO_ROOT. $cubo . '/' . $file;
    }else{
    $filePath = CUBO_ROOT. $cubo . '/main/' . $file;
    }

    // Determine file type
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);

    // Validate file existence and ensure it’s within allowed scope
    if (file_exists($filePath) && strpos(realpath($filePath), realpath(CUBO_ROOT)) === 0 &&   $file!='') {
        // Serve JSX as JavaScript
        if ($extension === 'jsx') {
            header("Content-Type: application/javascript");
            readfile($filePath);
            exit;
        }

        // Normal PHP include for PHP files
if ($extension === 'php') {
/*
if($_SERVER['SYSTEM']=='cubos'){
            // 🔹 Ensure <head> is included
            echo '<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="' . ADMIN_URL . 'css/core.css">
            </head>
            <body>';
}
  */          include $filePath;
/*if($_SERVER['SYSTEM']=='cubos'){
            // 🔹 Close body and HTML tags to ensure proper structure
            echo '</body></html>';
            exit;
}*/
        }


        // Unsupported file type
        http_response_code(415);

    } else {
            echo "url not exists";
    }
}


}