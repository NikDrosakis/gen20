<?php
$directory = MEDIA_ROOT;
if (!is_dir($directory)) {
    echo json_encode(['error' => 'Directory does not exist']);
    exit;
}else{
    $files = array_diff(scandir($directory), array('..', '.'));
    if ($files === false) {
        echo json_encode(['error' => 'Failed to read directory']);
    } else {
        echo json_encode($files);
    }
}
?>