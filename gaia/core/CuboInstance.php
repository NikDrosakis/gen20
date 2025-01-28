<?php
namespace Core;
class CuboInstance extends Gaia {
use Head;
use Ermis;
use Lang;
use Tree;
use Form;
use Domain;
use Kronos;
use WS;
use Action;
use Template;
use Bundle;
use Media;
use Filemeta;
use My;
use Cubo;
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
        }else{
        // VL-specific normal request handling:
        if ($_SERVER['SYSTEM'] == 'admin') {

            $this->dbDomWrap();
        }
	  //else{
         //   $this->publicUI_router();
     //      }
        }
    }
}