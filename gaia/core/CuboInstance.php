<?php
namespace Core;

use Core\Traits\System;
use Core\Traits\Url;
use Core\Traits\Meta;
use Core\Traits\Manifest;
use Core\Traits\Head;
use Core\Traits\Ermis;
use Core\Traits\Lang;
use Core\Traits\Tree;
use Core\Traits\Form;
use Core\Traits\Domain;
use Core\Traits\Kronos;
use Core\Traits\WS;
use Core\Traits\Action;
use Core\Traits\Template;
use Core\Traits\Bundle;
use Core\Traits\Media;
use Core\Traits\Filemeta;
use Core\Traits\My;
use Core\Traits\CuboAdmin;
use Core\Traits\CuboPublic;
use Core\Traits\Share;
use Core\Traits\Doc;
use Core\Cubo\Book;

class CuboInstance extends Gaia {
    use Doc, System, Url, Meta, Manifest, Head, Ermis, Lang, Tree, Form, Domain, Kronos, WS, Action, Template, Media, Filemeta, My, CuboAdmin, CuboPublic, Book, Share;

    public function __construct() {
        parent::__construct();
    }
    public function handleRequest() {
        if ($this->isXHRRequest()) {
            $this->handleXHRRequest();
        } else if ($this->isCuboRequest()) {
            $this->handleCuboRequest();
        }
    }

    /**
     * Update JSX support for React
     * Usage: https://vivalibro.com/cubos/index.php?cubo=menuweb&file=public.php
     */
    protected function handleCuboRequest(): void {
        $cubo = basename($_GET['cubo'] ?? '');
        $file = basename($_GET['file'] ?? '');

        if (!$cubo) {
            $this->sendResponse(400, 'INVALID_REQUEST', null, 'Missing cubo parameter');
            return;
        }

        if (!$file) {
            $this->sendResponse(400, 'INVALID_REQUEST', null, 'Missing file parameter');
            return;
        }
        // Construct the full file path
        $filePath = CUBO_ROOT . $cubo . '/main/' . $file;

        // Determine file type
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);

        // Validate file existence and ensure it’s within allowed scope
        if (file_exists($filePath) && strpos(realpath($filePath), realpath(CUBO_ROOT)) === 0) {
            if ($extension === 'jsx') {
                header("Content-Type: application/javascript");
                readfile($filePath);
                exit;
            } elseif ($extension === 'php') {
                ob_start();
                include $filePath;
                $output = ob_get_clean();
                // Remove unwanted \r and \n characters
            //    $output = str_replace(["\r", "\n"], '', $output);
                $this->sendResponse(200, 'EXECUTED', $output);
            } else {
                $this->sendResponse(415, 'UNSUPPORTED_MEDIA_TYPE', null, 'Unsupported file type');
            }
        } else {
            $this->sendResponse(404, 'NOT_FOUND', null, 'Requested file does not exist');
        }
    }

    /**
     * Sends a standardized API response
     */
    private function sendResponse(int $status, string $code, $data = null, string $error = null): void {
        header("Content-Type: application/json");
        http_response_code($status);
        echo json_encode([
            "status" => $status,
            "success" => ($status === 200),
            "code" => $code,
            "data" => $data,
            "error" => $error
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
