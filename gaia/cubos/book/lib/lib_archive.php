<div class="row">
    <?php for ($i=0;$i<count($sel);$i++) {
        $postid = $sel[$i]['id'];
        $img = !$sel[$i]['img'] ? "/img/empty.png" : SITE_URL.'media/'. $sel[$i]['img']; ?>
        <div id="nodorder1_<?=$postid?>"class="card">
            <button  type="button" class="close" aria-label="delete" id="del<?=$sel[$i]['id']?>"><span aria-hidden="true">&times;</span></button>
            <div class="cover">
                <img id="img<?=$postid?>" src="<?=$img?>">
            </div>
            <div class="description">
                <span class="published"><a href="/mylibrary/<?=$sel[$i]['id']?>/read"><?=$sel[$i]['name'] != null ? $sel[$i]['name'] : ''?></a>, <?=$sel[$i]['created']?></span>
                <span class="tag3"><?=$G['isread'][$sel[$i]['status']]?></span>
            </div>
        </div>
    <?php } ?>
</div>

