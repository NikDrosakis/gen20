<!---@seopanel.php----->
<?php
$mod= $G['mode'];
$seop= $this->db->f("SELECT * FROM $mod WHERE id=?",array($G['id']));
?>

<div id="box_seo">
    <div class="gs-title">SEO</div>
    <label style="color:red">seo priority</label>
    <input table="post" id="priority1" value="1.0" type="number" step="0.1" min="0.1" max="1" class="form-control input-sm" style="width: 60px;">
    <input table='post' id="priority<?=$seop['id']?>" value="<?=$seop['seo_priority']?>" type="number" step="0.1" min="0.1" max="1" class="form-control input-sm" style="width: 80px;">

    <label style="color:red">seo description</label>
    <textarea onkeyup="s.ajax(s.ajaxfile,{a:'seo_description',b:this.value,c:<?=$seop['id']?>,d:'post'})" class="form-control input-sm"><?=$seop['seo_description']?></textarea>

    <label style="color:red">seo keywords</label>
    <input onkeyup="s.ajax(s.ajaxfile,{a:'seo_keywords',b:this.value,c:<?=$seop['id']?>,d:'post'})" class="form-control input-sm" value="<?=$seop['seo_keywords']?>">
</div>
<script src="/admin/admin/seo.js"></script>