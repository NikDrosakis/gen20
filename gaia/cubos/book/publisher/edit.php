<!--writers edit--->
<?php
$sel= $bot->f("SELECT * FROM publisher WHERE id=?",array($this->G['id']));
$img = !$sel[$i]['img'] ? "/img/empty_publisher.png" : '/media/'. $sel[$i]['img'];
?>
	<!-- EDIT / SHOW-->
<a href="/publisher">Back to publishers</a>
<span style="float:left;" onclick="gs.ui..goto(['previous','writer','id',g.get.id,'/publisher?id='])" class="next glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
<span style="float:right" onclick="gs.ui..goto(['next','writer','id',g.get.id,'/publisher?id='])" class="next glyphicon glyphicon-chevron-right" aria-hidden="true"></span>

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