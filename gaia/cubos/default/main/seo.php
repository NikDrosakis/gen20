<?php
//xecho($post);
//xecho($user);
//xecho($seo->create_xml('rss'));
$post=$this->seoPosts();
$user=$this->seoUsers();
xecho($this->xmls);
?>
<button class="btn btn-success" id="createxml" style="clear:both">Create all xmls</button>
<button class="btn btn-danger" id="deletexml" style="clear:both">Delete all xmls</button>

<!-------------------XML--------------------->
<?php foreach ($this->xmls as $file){
    $filename= $file.".xml"; ?>
    <div class="gs-databox" style="display:block">
        <div class="gs-title" onclick="gs.ui.switcher('#content<?=$file?>','slide')"><?=$filename?>
            <?php if(file_exists(PUBLIC_ROOT_WEB.$filename)){ ?>
                <a target="_blank" href="<?="/".$filename?>">View</a>
                <span style="color:yellow;margin-left: 15px"><?=systime(filemtime($filename),true)?> modified</span>
            <?php }else{ ?>
                <span style="color:yellow;margin-left: 15px">file not created</span>
            <?php } ?>
            <button class="console-save" id="savexml<?=$file?>" style="display: block;">
			<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>
			</button>
        </div>
        <!-----editor------>

            <code contenteditable="true" class="language-php line-numbers gs-databox-inside" id="content<?=$file?>">
                <?=file_exists(PUBLIC_ROOT_WEB.$filename) ? htmlentities(file_get_contents(PUBLIC_ROOT_WEB.$filename)):''?>
                </code>
    </div>
<?php } ?>

<!------------SEO POSTS--------------------->
<div class="gs-databox" style="margin-bottom:10px;display:block">
    <div id="btn_post" class="gs-title">post table
        <span style="color:yellow;margin-left: 15px"><?=count($post)?> recs</span>
    </div>
<div id="seo_post" class="gs-databox-inside" style="display:none">
    <table class="TFtable table-responsive">
        <tr id="delA<?=$id?>" class="board_titles">
            <th>id</th>
            <th>priority</th>
            <th>title</th>
            <th>uri</th>
            <th>description</th>
            <th>modified</th>
        </tr>

        <?php for($i=0;$i<count($post);$i++){
            $id=$post[$i]['id'];
            ?>
            <tr id="delB<?=$id; ?>" >
                <!----------DELETE BUTTON------------>
                <td><?=$id;?></td>
                <td><input table='post' id="priority<?=$id?>" value="<?=$post[$i]['sort']?>" type="number" step="0.1" min="0.1" max="1" class="form-control input-sm" style="width: 60px;"></td>
                <td><input onkeyup="g.ajax(g.ajaxfile,{a:'title',b:this.value,c:<?=$id;?>,d:'post'})" class="form-control input-sm" value="<?=$post[$i]['title']?>"></td>
                <td><input onkeyup="g.ajax(g.ajaxfile,{a:'uri',b:this.value,c:<?=$id?>,d:'post'})" class="form-control input-sm" value="<?=$post[$i]['uri'];?>"></td>
                <td><textarea onkeyup="g.ajax(g.ajaxfile,{a:'seodescription',b:this.value,c:<?=$id;?>,d:'post'})" class="form-control input-sm"><?=$post[$i]['description']?></textarea></td>
                <td><?=$post[$i]['modified']?></td>
            </tr>
        <?php } ?>
    </table>
</div>
</div>
<!------------SEO USERS--------------------->
<div class="gs-databox" style="margin-bottom:10px;display:block">
    <div id="btn_user" class="gs-title">user table
        <span style="color:yellow;margin-left: 15px"><?=count($user)?> recs</span>
    </div>
<div id="seo_user"  class="gs-databox-inside"  style="display:none">
    <table class="TFtable">
        <tr id="delA<?=$id?>" class="board_titles">
            <th>id</th>
            <th>priority</th>
            <th>name</th>
            <th>firstname</th>
            <th>lastname</th>
            <th>uri</th>
            <th>description</th>
            <th>modified</th>
        </tr>
        <?php for($i=0;$i<count($user);$i++){
            $id=$user[$i]['id'];
            ?>
            <tr id="delB<?=$id; ?>" >
                <!----------DELETE BUTTON------------>
                <td><?=$id;?></td>
                <td><input table='user' id="priority<?=$id?>" value="<?=$user[$i]['sort']?>" type="number" step="0.1" min="0.1" max="1" class="form-control input-sm" style="width: 60px;"></td>
                <td><input onkeyup="g.ajax(g.ajaxfile,{a:'name',b:this.value,c:<?=$id;?>,d:'user'})" class="form-control input-sm" value="<?=$user[$i]['name']?>"></td>
                <td><input onkeyup="g.ajax(g.ajaxfile,{a:'firstname',b:this.value,c:<?=$id;?>,d:'user'})" class="form-control input-sm" value="<?=$user[$i]['firstname']?>"></td>
                <td><input onkeyup="g.ajax(g.ajaxfile,{a:'lastname',b:this.value,c:<?=$id;?>,d:'user'})" class="form-control input-sm" value="<?=$user[$i]['lastname']?>"></td>
                <td><input onkeyup="g.ajax(g.ajaxfile,{a:'uri',b:this.value,c:<?=$id?>,d:'user'})" class="form-control input-sm" value="<?=$user[$i]['uri'];?>"></td>
                <td><textarea onkeyup="g.ajax(g.ajaxfile,{a:'seodescription',b:this.value,c:<?=$id;?>,d:'user'})" class="form-control input-sm"><?=$user[$i]['seodescription']?></textarea></td>
                <td><?=date('Y-m-d H:i',$user[$i]['modified'])?></td>
            </tr>
        <?php } ?>
    </table>
</div>
</div>

<!---------robots.txt--------------->
<?php $filename=PUBLIC_ROOT_WEB.'robots.txt';?>
<div class="gs-databox" style="margin-bottom:10px;display:block">
<div class="gs-title" id="btn_robots">Robots.txt
    <?php  if(!file_exists($filename)){ ?>
        <button class="console-save" id="createrobots" style="display: block;">Create</button>
    <?php }else{ ?>
        <span style="color:yellow;margin-left: 15px"><?=systime(filemtime($filename),true)?> modified</span>
        <button class="console-save" id="saverobots" style="display: block;">
				<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>
		</button>
    <?php } ?>
</div>
<!-----editor------>
<textarea class="form-control" style="display:none" id="seo_robots"><?php if(file_exists(SITE_ROOT.'robots.txt')){ echo file_get_contents(SITE_ROOT.'robots.txt');}?></textarea>
</div>
<!---------GOOGLE TAG MANAGER--------------->
<div class="gs-databox" style="margin-bottom:10px;display:block">
<div class="gs-title" id="btn_googletag">Google Tag Manager
    <button class="console-save" id="googlemetasave">
	<span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"></span>
	</button>
</div>
<div id="seo_googletag" style="margin-bottom:10px;display:none">
    <pre contenteditable="true" id='tagmanagerdata' style="height:180px !important;width:600px !important;"><?php echo trim($this->is['google_tag_manager']);?></pre>
</div>
</div>
</div>


<script>
document.addEventListener('DOMContentLoaded', function() {

    // Toggling sections
    document.querySelectorAll('div[id^="btn_"]').forEach(function(button) {
        button.addEventListener('click', function() {
            const id = this.id.replace('btn_', '');
            gs.ui.switcher('#seo_' + id, 'slide');
        });
    });

    // Delete XML files
    document.getElementById('deletexml').addEventListener('click', function() {
        if (confirm("The xml root files will be deleted. Are you sure?")) {
            gs.ajax(s.ajaxfile, { a: 'deletexml' });
            location.reload();
        }
    });

    // Create XML files
    document.getElementById('createxml').addEventListener('click', function() {
        if (confirm("New xml root files will be created. Are you sure?")) {
            fetch(s.ajaxfile + '?a=createxml')
                .then(response => response.text())
                .then(() => location.reload())
                .catch(error => console.log('Error:', error));
        }
    });

    // Save XML files
    document.querySelectorAll("button[id^='savexml']").forEach(function(button) {
        button.addEventListener('click', function() {
            const file = this.id.replace('savexml', '');
            const content = document.getElementById('content' + file).innerHTML;

            fetch(s.ajaxfile, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    a: 'savexml',
                    b: file,
                    c: content,
                }),
            })
            .then(response => response.text())
            .then(data => {
                if (data !== 'ok') {
                    gs.alert('FILE NOT SAVED!');
                } else {
                    gs.alert('FILE SAVED!');
                }
            })
            .catch(error => console.log('Error:', error));
        });
    });

    /*
    * Robots
    */
    document.getElementById('saverobots')?.addEventListener('click', function() {
        gs.file.file_put_contents(
            s.get.PUBLIC_ROOT_WEB + 'robots.txt',
            document.getElementById('seo_robots').value.trim(),
            function(suc) {
                gs.alert('robots.txt saved');
            }
        );
    });

    document.getElementById('createrobots')?.addEventListener('click', function() {
        const robots = 'User-agent: *\n Disallow: / \n';
        gs.file.put_contents(G.PUBLIC_ROOT_WEB + 'robots.txt', robots, function(suc) {
            location.reload();
        });
    });

    /*
    * Google Tag Manager save
    */
    document.getElementById('googlemetasave').addEventListener('click', function() {
        const datastring = document.getElementById('tagmanagerdata').innerHTML;

        fetch('//admin/ajax/ajax_update_setting.php?a=googleTagManager', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: datastring }),
        })
        .then(response => response.json())
        .then(data => {
            gs.alert('success');
        })
        .catch(() => {
            gs.alert('error handling here');
        });
    });

    // Priority change
    document.querySelectorAll('input[id^="priority"]').forEach(function(input) {
        input.addEventListener('keyup', updatePriority);
        input.addEventListener('change', updatePriority);

        function updatePriority() {
            const id = this.id.replace('priority', '');
            let table = this.getAttribute('table');
            console.log(['seo_priority', this.value, id, table]);
            gs.ajax(s.ajaxfile, { a: 'seo_priority', b: this.value, c: id, d: table });
        }
    });

});
</script>

