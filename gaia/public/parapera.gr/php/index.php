<?php include 'pages/head.php'; ?>
<?php include 'pages/header.php'; ?>
<div id="wrapper_inner" style="display:block">

<?php
if($G['page']==""){
	include 'pages/book.php';
}else{ ?>
<?php include "pages/".$G['page'].'.php';
}

if($G['id']=="" && !in_array($G['page'],['login','register'])){
	    include 'pages/finfo.php';
}
?>
</div>
<?php include 'pages/footer.php'; ?>