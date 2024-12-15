<div class="row">
        <?php
        for ($i=0;$i<count($sel);$i++) {
           $postid = $sel[$i]['id'];
            $img = !$sel[$i]['img'] ? $this->G['writerdefaultimg'] : SITE_URL.'media/'. $sel[$i]['img'];
        ?>
        <div class="card">
            <div class="author"><?=$sel[$i]['name'] != null ? $sel[$i]['name'] : ''?></div>
            <div class="cover">
                <img id="img<?=$postid?>" src="<?=$img?>">
            </div>
            <div class="description">
                <!---list of books--->
                <?php if(!empty($sel[$i]['books'])){ ?>
                    <p class="title"><?php if(!empty($sel[$i]['title'])){implode('</p><p class="title">',$sel[$i]['title']);}?></p>
                    <div class="published"><?=$sel[$i]['publisher']?>, <?=$sel[$i]['published']?></div>
                <?php }else{ ?>
                    <div>No books listed</div>
                <?php } ?>
            </div>
        </div>
        <?php if($sel[$i]['summary']!=null){ ?>
            <div class="card-summary"><?=implode(',',$sel[$i]['summary'])?></div>
        <?php } ?>
<?php } ?>
</div>