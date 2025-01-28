<?php

if($this->G['id']!=''){
include $this->G['SITE_ROOT'] . "main/writer_edit.php";

} else{

$params['page']=$page=$this->page;
$sel=$this->booklists($params);
?>
<div id="writer">
<?php include PUBLIC_ROOT_WEB."main/{$page}/{$page}_archive.php"; ?>
</div>
<div id="pagination" class="paginikCon"></div>

<?php } ?>


<div class="row">
<?php
for ($i=0;$i<count($sel);$i++) {
   $postid = $sel[$i]['id'];
    $img = !$sel[$i]['img'] ? $this->G['writerdefaultimg'] : SITE_URL.'media/'. $sel[$i]['img'];
        ?>
       <div id="nodorder1_<?=$postid?>"class="card">
            <div class="author"><?=$sel[$i]['name'] != null ? $sel[$i]['name'] : ''?></div>
            <div class="cover"><img id="img<?=$postid?>" src="<?=$img?>" /></div>
           <!---list of books--->
           <div class="description">
                <?php if(!empty($sel[$i]['book'])){ ?>
                <p class="title"><?=implode(',',$sel[$i]['book'])?></p>
                <span class="published"><?=$sel[$i]['publisher']?>, <?=$sel[$i]['published']?></span>
                <?php }else{ ?>
                    <div>No books listed</div>
                <?php } ?>
            </div>
        </div>
        <?php if($sel[$i]['bio']!=null){ ?>
            <div class="card-summary"><?=$sel[$i]['bio']?></div>
        <?php } ?>
    <?php } ?>
</div>


<!--writers edit--->
<?php
$sel= $bot->f("SELECT * FROM writer WHERE id=?",array($G['id']));
$img=$sel['img']=='' ? $G['writerdefaultimg']: '/media/'.$sel['img'];
?>
	<!-- EDIT / SHOW-->
<a href="/writer">Back to Writers</a>
<span style="float:left;" onclick="gs.ui.goto(['previous','writer','id',g.get.id,'/writer?id='])" class="next glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
<span style="float:right" onclick="gs.ui.goto(['next','writer','id',g.get.id,'/writer?id='])" class="next glyphicon glyphicon-chevron-right" aria-hidden="true"></span>

<div style="width:98%;background:#fffef4;min-height: 600px">
<h2 id="titlebig"><?=$sel['name']?></h2>
<?php include 'public.php'; ?>
    <div style="width:30%;float:left;margin:15px 15px 15px 15px;">
        <img id="bookimg" src="<?=$img?>" style="max-height:350px;">
    </div>

<div style="display:inline-block; width:56%;margin:2%">
<label>Name:</label><input class="input" id="name" value="<?=$sel['name']?>">

<div>
<label>Summary: </label><textarea class="input" id="summary"><?=$sel['summary']?></textarea>
<button class="btn btn-primary" id="update">Save Writer</button>
</div>


</div>
</div>