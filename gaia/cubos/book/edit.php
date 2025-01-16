	<!-- EDIT / SHOW-->
    <a class="button" href="/book">Back</a>
    <span style="float:left;" onclick="s.ui.goto(['previous','book','id',G.id,'/book?id='])" class="next glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
    <span style="float:right" onclick="s.ui.goto(['next','book','id',G.id,'/book?id='])" class="next glyphicon glyphicon-chevron-right" aria-hidden="true"></span>
    <?php
$sel= $this->get_book();

$img=$sel['img']==null ? $this->G['bookdefaultimg']: (strpos($sel['img'], 'http') === 0 ? $sel['img']: "/media/".$sel['img']);
    ?>
<h2 id="titlebig"><?=$sel['title']?><a href="/<?=$this->G['page']?>/<?=$this->G['id']?>/read">
        <ion-icon class="<?=$this->G['page']=='login'?'active':''?>"  style="vertical-align: middle;color:#71400c;"  alt="Edit" name="book" size="medium"></ion-icon>
    </a></h2>
<?php include 'main_buffers/public.php'; ?>
        <div style="width:30%;float:left;margin:15px 15px 15px 15px;">
            <img id="bookimg" src="<?=$img?>" style="max-height:550px;">
        </div>

	
<div style="display:inline-block; float:left;width:56%;margin:2%">
<label>Title:</label><input class="input" id="title" value="<?=$sel['title']?>">

<div>
<label>Writer:</label>
<button fun="new" id="new_writer"  class="but_new">New</button>
<input class="input" fun="lookup" id="writer" value="<?=$sel['writer']?>">
<ul id="loolist_writer" class="loolist"></ul>
<!--<div class="vertical-menu"  id="writerlist"></div>
<button class="btn btn-primary" id="savewri">Save Writer</button>-->
</div>
    <div style="display:flex"> <div style="width:75%">
<label>Publisher:</label>
<button fun="new" id="new_publisher" class="but_new">New</button>
<input class="input" fun="lookup" id="publisher" value="<?=$sel['publisher']?>">
<ul id="loolist_publisher" class="loolist"></ul>
<!--<div class="vertical-menu"  id="publisherlist"></div>
<button class="btn btn-primary" id="savedi">Save publisher</button>-->
   </div>
   <div>
<label>Edition Year:</label>
<input class="input" style="display:inline;" type="number" min="1977" max="2024" id="published" value="<?=$sel['published']?>">
      </div>
      </div>
	  
    <div>
<label>Category: </label>
<button fun="new" id="new_publisher" class="but_new">New</button>
<input class="input" fun="lookup" id="cat" value="<?=$sel['cat']?>">
<ul id="loolist_cat" class="loolist"></ul>
<!--<div class="vertical-menu"  id="catlist"></div>
<button class="btn btn-primary" id="savecat">Save Category</button>-->
        </div>

<label>Status:  </label>
<select class="input" id="status">
<?php foreach($this->G['book_status'] as $statusid => $statusval){ ?>
<option value="<?=$statusid?>" <?=$sel['status']==$statusid ? "selected=selected" :""?>><?=$statusval?></option>
<?php } ?>
</select>

<label>Volume:</label><input class="input" id="vol" value="<?=$sel['vol']?>">
<label>Tags: </label><input class="input" id="tag" value="<?=$sel['meta']?>">
<label>Summary: </label>
    <div contenteditable='true' class="textarea" id='summary' placeholder='Keep Notes'><?=html_entity_decode($sel['summary'])?></div>
    <button class='button' id='save_summary'>Save</button>
</div>

<div id="fimgbox">
<label>Is Read:  </label>
<select class="input" id="isread">
<?php foreach($this->G['isread'] as $readid => $readval){ ?>
<option value="<?=$readid?>" <?=$sel['isread']==$readid ? "selected=selected" :""?>><?=$readval?></option>
<?php } ?>
</select>
<label>Notes: </label>
      <div contenteditable='true' class="textarea" id='notes' placeholder='Keep Notes'><?=html_entity_decode($sel['notes'])?></div>
      <button class='button' id='save_notes'>Save</button>
</div>