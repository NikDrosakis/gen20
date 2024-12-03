<!-- EDIT / SHOW-->
<a class="button" href="/book">Back</a>
<span style="float:left;" onclick="s.ui.goto(['previous','book','id',G.id,'/book?id='])" class="next glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
<span style="float:right" onclick="s.ui.goto(['next','book','id',G.id,'/book?id='])" class="next glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
<?php
$sel= $this->get_book();

$img=$sel['img']==null ? $this->bookdefaultimg: (strpos($sel['img'], 'http') === 0 ? $sel['img']: "/media/".$sel['img']);
?>
<h2 id="titlebig"><?=$sel['title']?>
<a href="/<?=$this->G['page']?>/<?=$this->G['id']?>/edit">
    <ion-icon class="<?=$this->G['page']=='login'?'active':''?>"  style="vertical-align: middle;color:#71400c;"  alt="Edit" name="create" size="medium"></ion-icon>
</a>
</h2>

<div style="width:30%;float:left;margin:15px 15px 15px 15px;">

    <!--rating compo-->
    <?php
    if($this->G['loggedin']){
    include $this->G['SITE_ROOT']."compos/rating.php";
    }
    ?>

    <img id="bookimg" src="<?=$img?>" style="max-height:550px;">
</div>

<div style="display:inline-block; float:left;width:56%;margin:2%">
    <label>Title:</label>
    <?=$sel['title']?>

    <div>
        <label>Writer:</label>
        <?=$sel['writer']?>
    </div>

    <div style="display:flex"> <div style="width:75%">
    <label>Publisher:</label>
    <?=$sel['publisher']?>
    </div>

        <div>
            <label>Edition Year:</label>
            <?=$sel['published']?>
        </div>
    </div>

    <div>
        <label>Category: </label>
        <?=$sel['cat']?>
    </div>

    <label>Volume:</label>
    <?=$sel['vol']?>

    <label>Tags: </label>
    <?=$sel['meta']?>

    <label>Summary: </label>
    <div contenteditable='false' class="textarea" id='summary' placeholder='Keep Notes'><?=html_entity_decode($sel['summary'])?></div>
</div>
<!--rating compontent-->
<?php
if ($this->G['loggedin']){
include SITE_ROOT."compos/comment.php";
}
?>