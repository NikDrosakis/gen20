<?php
namespace Core;

//yaml methods
trait CuboAction {

protected function loadConfig($filePath) {
    return Yaml::parseFile($filePath);
}

protected function sendWsNotification($message) {
    $wsUrl = "wss://".$_SERVER['SERVER_NAME'].":3010/?userid=1";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $wsUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $message);
    curl_exec($ch);
    curl_close($ch);
}


protected function executeCuboAction($action) {
    $config = loadConfig(__DIR__ . '/../configs/cubo_example.yml');

    switch ($action) {
        case 'setup':
            $this->db->exec($config['setup']['sql']);
            echo "Setup Complete: " . $config['description'];
            sendWsNotification($config['notifications']['ws']);
            break;
        case 'update':
            $this->db->exec($config['update']['sql']);
            echo $config['update']['message'];
            sendWsNotification($config['notifications']['ws']);
            break;
        case 'uninstall':
            $this->db->exec($config['uninstall']['sql']);
            echo $config['uninstall']['message'];
            break;
        default:
            echo "Invalid action.";
    }
}

}
