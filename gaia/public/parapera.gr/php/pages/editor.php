<style>
.post-section {
	width: 96%;
	background-color: #F0F2F5;
    padding: 20px 20px 40px 20px;
}
</style>
<div class="post-section">
<?php include "pages/styles.php"; ?>
<?php if($G['id']!=''){
include "pages/editor_edit.php";
 } else{ ?>

  <div id="editor">
    <!--APPEND BOXY OR ARCHIVE STYLE-->
  </div>
    <div id="pagination" class="paginikCon"></div>
 <?php } ?>
</div>