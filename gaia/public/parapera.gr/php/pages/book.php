<style>
.post-section {
	width: 96%;
	background-color: #F0F2F5;
    padding: 20px 20px 40px 20px;
}
</style>
   <div class="post-section">
<?php
if($G['id']!=''){ 
include "pages/book_edit.php";
// BOOK LIST 
}else{
  ?>
   <h2 style="cursor:pointer">My Library</h2>
   <div style="margin-top:14px;width:100%;border:none;background:none;">
   <button type="button" style="border:none;background:none;" id="newbks">New Book</button>
<?php include "pages/styles.php"; ?>
	</div>
  <div id="book">
    <!--APPEND BOXY OR ARCHIVE STYLE-->
  </div>
  <div id="pagination" class="paginikCon"></div>
<?php } ?>
	</div>
