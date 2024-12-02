<?php
header('Content-Type: application/json');
// get_slides.php
include "../../config.old.php";
// Assuming you have a database connection setup as $db
$slides = $cms->db->fa("SELECT * FROM cubo_slideshow ORDER BY sort DESC");
echo json_encode($slides);
?>