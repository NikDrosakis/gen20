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
                    <span class="published"><a href="/publisher?id=<?=$sel[$i]['publisher']?>&mode=read"><?=$sel[$i]['publishername'] != null ? $sel[$i]['publishername'] : ''?></a>, <?=$sel[$i]['published']?></span>
                    <span class="tag3"><?=$G['isread'][$sel[$i]['isread']]?></span>
                    <span class="tag2"><?=$G['book_status'][$sel[$i]['status']]?></span>
            </div>
        </div>
        <?php if($sel[$i]['summary']!=null){ ?>
            <a href="/writer?id=<?=$sel[$i]['writer']?>&mode=read"><?=$sel[$i]['writername'] != null ? $sel[$i]['writername'] : ''?></a>
            <a style="display:grid;margin:35px 0px 35px 0px;color:#000000;font-size:15px;" href="<?=$sel[$i]['booklink']?>&mode=read"><?=$sel[$i]['title']?></a>
            <div class="card-summary"><?=$sel[$i]['summary']?></div>
        <?php } ?>
    <?php } ?>
</div>