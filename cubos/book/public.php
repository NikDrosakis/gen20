<style>
    .booktitle{
display:grid;margin:35px 0px 35px 0px;color:#000000;font-size:15px;
    }
</style>

   <h2 style="cursor:pointer">My Library</h2>
   <button type="button" style="border:none;background:none;" id="newbks">New Entry</button>
   <div id="book">
       <?php

       $params['page']=$page=$this->page;
       $params['pagenum']=$_COOKIE['pagenum'] ?? 1;
       $params['q']=$_COOKIE['q'] ?? '';
       //IS THIS HERE ?


      // $sel=$this->booklists($params);
       //SERVER RENDER WORKS LIKE THAT?
       include CUBOS_ROOT."{$page}/{$page}_archive.php";

       ?>

  </div>
  <div id="pagination" class="paginikCon"></div>

