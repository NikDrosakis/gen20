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