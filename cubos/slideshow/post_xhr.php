<?php
$a=$_POST['a'];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update sort order
if ($a=='order') {
        foreach ($_POST['order'] as $slide) {
            $q = $cms->db->q("UPDATE cubo_slideshow SET sort = ? WHERE id = ?",[$slide['sort'],$slide['id']]);
        }
        echo json_encode(['status' => 'success']);
// Update caption
}elseif ($a=='caption') {
        $q = $cms->db->q("UPDATE cubo_slideshow SET caption = ? WHERE id = ?",[$_POST['caption'],$_POST['id']]);
        echo json_encode(['status' => 'success']);
    // Handle slide deletion
}elseif ($a=='delete') {
    if (isset($_POST['delete'])) {
        $q =$cms->db->q("DELETE FROM cubo_slideshow WHERE id = ?",[$_POST['delete']]);
        echo json_encode(['status' => 'success']);
    }
}elseif ($a=='upload_media') {
        // Adding from media folder
        $filename = $_POST['filename'];
        $caption = $_POST['caption'] ?? '';
        $q = $cms->db->inse("cubo_slideshow",["name"=> $filename, "caption"=> $caption, "sort"=>9999]);
    echo !$q
        ? json_encode(['status' => 'fail'])
        : json_encode([
            'status' => 'success',
            'name'=>$filename,
            'caption'=>$caption,
            'sort'=>9999,
            'id'=>$q
        ]);
}elseif ($a=='upload_file') {

}elseif ($a=='upload_url') {

}
}