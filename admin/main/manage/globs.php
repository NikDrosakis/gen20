<button id="newGlobalBtn" class="button">+</button>
<div id="newglobal"></div>

<?php  $globlist=$this->admin->fl(array("tag","id"),"globs");  ?>


<div class="table-container">
<div class="gs-databox">

<?php foreach($globlist as $tag => $tagcount){ ?>
<button id="globtitle<?=$tag?>" class="button<?=isset($_COOKIE['globs_tab']) && $_COOKIE['globs_tab']==$tag ? " active":""?>"><?=$tag?></button>
<?php } ?>

</div>

<?php foreach($globlist as $tag => $tagcount){
$sel= $this->admin->fa("SELECT * FROM globs WHERE tag=?",array($tag));
?>

<div id="globs_<?=$tag?>"  class="gs-databox-inside" style="display:<?=isset($_COOKIE['globs_tab']) && $_COOKIE['globs_tab']==$tag ?'block':'none'?>">

<?php for($i=0;$i<count($sel);$i++){
$id=$sel[$i]['id'];
$type=$sel[$i]['type'];
?>
<div class="globs-setBox" id="setBox<?=$id?>"  class="img-thumbnail">
	<button style="float: right;" class="btn btn-xs btn-danger" id="delpvar<?=$id?>">X</button>
	<!--TYPE SELECTION-->
		<select class="form-small" id="pvartype<?=$id?>">
		<option value=0>Select</option>
	<?php foreach($this->G['globs_types'] as $typeval){ ?>      <!-------------category loop --------------->
		<option value="<?=$typeval?>" <?=$typeval==$type ? "selected='selected'":''?>><?=$typeval?></option>
		<?php } ?>
	</select>
	        <label class="profile_title"><?=$sel[$i]['name']?></label>

			<?php if($type=='textarea' || $type=='html'){ ?>
				<textarea class="form-control input-sm" class="lang12" id="set<?=$id?>"><?=urldecode($sel[$i]["val"])?></textarea>

			<?php }elseif($type=='json'){ ?>
 <div id="jsoneditor-container-<?= $sel[$i]['id'] ?>" class="jsoneditor-container"></div>
 <textarea id="jsoneditor-<?=$sel[$i]['id'] ?>" style="display:none;" class="jsoneditor-textarea"> <?=json_encode($sel[$i]["val"], JSON_PRETTY_PRINT)?></textarea>
 <button id="save-json<?=$sel[$i]['id'] ?>" class="jsonvalidator btn btn-primary">Validate JSON</button>

			<?php }elseif($type=='code'){ ?>
			<textarea style="height:150px" id="codeditor<?=$id?>" class="codeditor form-control input-sm" class="lang12"><?=json_decode($sel[$i]["en"],true)?></textarea>

			<?php }elseif($type=='boolean'){ ?>
				<input id="set<?=$id?>" onclick="this.value=this.checked ? 1:0" <?=$sel[$i]["en"]=="1" ? 'checked':''?>  type="checkbox" switch="" <?=$sel[$i]["en"]=="1" ? 'checked':''?> class="switcher">

			<?php }elseif($type=='integer' || $type=='decimal2'){ ?>
			<input class="form-control input-sm" type="number" class="lang12" id="set<?=$id?>" value="<?=$sel[$i]["en"]?>">

			<?php }elseif($type=='read'){ ?>
			<label><?=$sel[$i]["en"]?></label>

			<?php }elseif($type=='color'){ ?>
			<input class="form-control input-sm" type="color" class="lang12" id="set<?=$id?>" value="<?=urldecode($sel[$i]["en"])?>">
			<!--UPLOAD-->

<?php }else{ ?>
    <button onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText || this.nextElementSibling.value)" class="glyphicon glyphicon-copy"></button>
			<input class="form-control input-sm" class="lang12" id="set<?=$id?>" value="<?=urldecode($sel[$i]["en"])?>">
	<?php }
	if($type=='img'){ ?>
				<button class="btn btn-xs" onclick="$('#attachinput<?=$id?>').click();"  class="attach" data-toggle="tooltip">Select Photo</button>
				<form action="/admin/xhr.php" onsubmit="s.ui.form.upload.file.submit(this,event,'<?=$id?>')" id="upload<?=$id?>" method="post" enctype="multipart/form-data">
					<input name="attach_file" onchange="s.ui.form.upload.file.opensubmit(this,'<?=$id?>')" id="attachinput<?=$id?>" type="file" style="display:none">
					<input type="hidden" name="a" value="media">
					<input type="hidden" name="mediagroupid" value="4">
					<input type="hidden" name="id" value="<?=$id?>">
					<input class="btn btn-xs" type="submit" style="display:none" name="submitUpload" id="submitAttach<?=$id?>" value="Upload" data-toggle="tooltip">
					</form>
			<a class="viewImage" href="<?=$sel[$i]['val']?>">
				<div id="imgView<?=$id?>">
					<img id="img<?=$id?>" class="img-thumbnail" src="<?=!$sel[$i]["en"] ? "/admin/img/post.jpg": urldecode($sel[$i]["en"])?>" style="max-height:150px;">
				</div>
			</a>
			<button class="btn btn-xs" onclick="$('#img<?=$id?>').attr('src',$('#set<?=$id?>').val())">Show me</button>
	<?php } ?>
</div>
<?php }	?>
</div>
<?php }	?>


</div>

<script>
//globs
const globsMenu = document.getElementById('globs_menu');
// Add a click event listener to the element
if (globsMenu) {
    globsMenu.addEventListener('click', function() {opener('globals_menu');});
}
// Add event listener to all buttons whose id starts with 'globtitle'
document.querySelectorAll("button[id^='globtitle']").forEach(function(button) {
    button.addEventListener("click", function () {
        // Remove 'active' class from all elements with class 'gs-title active'
        document.querySelectorAll('.gs-title.active').forEach(function (title) {
            title.classList.remove('active');
            title.classList.add('gs-title');
        });
        // Add 'active' class to the clicked button
        this.classList.add('active');
        // Get the globname by removing 'globtitle' from the button's id
        var globname = this.id.replace('globtitle', '');
        // Hide all elements with class 'gs-databox-inside'
        document.querySelectorAll('.gs-databox-inside').forEach(function (element) {
            element.style.display = 'none';
        });
        // Call the switcher function (assuming s.ui.switcher is a custom function)
        gs.ui.switcher('#globs_' + globname);
        // Call the gs.coo function (assuming this is a custom function for setting cookies or other operations)
        gs.coo('globs_tab', globname);
    });
    });

//EXTEND USE OF IT, GREAT CODE
    document.getElementById("newGlobalBtn").addEventListener("click", async function () {
        // Check for 'globs_tab' in cookies
        if (gs.coo('globs_tab')) {
            let tagsIndex = G.globs_tags.indexOf(gs.coo('globs_tab'));
            if (tagsIndex !== -1) {
                let globs_tagsNew = G.globs_tags.splice(tagsIndex, 1)[0];
                G.globs_tags.unshift(globs_tagsNew);
            }
        }
        const newGlobalContainer = document.getElementById('newglobal');
        if (newGlobalContainer.innerHTML === "") {
            const createnewglob = await gs.form.generate({
                adata: "globs", nature: "new", append: "#newglobal",
                list: {
                    0: {
                        row: 'name',
                        placeholder: "Global Name",
                        params: "required onkeyup='this.value=gs.greeklish(this.value)'"
                    },
                    1: {row: G.LOC, placeholder: "Global Value"},
                    2: {row: 'tag', type: "drop", global: G.globs_tags, globalkey: false, placeholder: "Select Tag"},
                    3: {row: 'type', type: "drop", global: G.globs_types, globalkey: true, placeholder: "Select type"}
                }
            })
            if (createnewglob && createnewglob.success) {
                newGlobalContainer.innerHTML = '';
            };
        } else {
            newGlobalContainer.innerHTML = '';
        }
    })
    //REMOVE
    document.querySelectorAll("button[id^='switchSet']").forEach(function (button) {
        button.addEventListener("click", async function () {
            var id = this.id.replace('switchSet', '');
            var val = this.textContent.trim() === 'Open' ? 1 : 0;

            try {
                const updateglobs = await gs.api.maria.q("UPDATE globs SET status=? WHERE id=?", [val, id]);

                if (updateglobs.success) {
                    const setBox = document.getElementById('setBox' + id);
                    const switchSetBtn = document.getElementById('switchSet' + id);

                    if (val === 1) {
                        setBox.style.backgroundColor = '#d3ffb1';
                        switchSetBtn.textContent = 'Close';
                        switchSetBtn.classList.remove('btn-success');
                        switchSetBtn.classList.add('btn-danger');
                    } else {
                        setBox.style.backgroundColor = '#d8d6d6';
                        switchSetBtn.textContent = 'Open';
                        switchSetBtn.classList.remove('btn-danger');
                        switchSetBtn.classList.add('btn-success');
                    }
                } else {
                   gs.modal("Setting cannot be switched!");
                }
            } catch (error) {
                console.error("Error updating status:", error);
            }
        });
    });

    //EDIT
    // Keyup, change, click, keyup event for inputs with id starting with 'set'
    document.querySelectorAll("input[id^='set']").forEach(function (input) {
        input.addEventListener("keyup", async function () {
            handleSetUpdate(this);
        });
        input.addEventListener("change", async function () {
            handleSetUpdate(this);
        });
        input.addEventListener("click", async function () {
            handleSetUpdate(this);
        });
        input.addEventListener("keyup", async function () {
            handleSetUpdate(this);
        });
    });

    async function handleSetUpdate(element) {
        var id = element.id.replace('set', '');
        var query = 'UPDATE globs SET en=? WHERE id=?';
        const updateglobs = await gs.api.maria.q(query, [encodeURIComponent(element.value), id]);
        if (updateglobs.success) {
           gs.success();
        } else {
           gs.fail();
        }
    }

    // Click event for buttons with id starting with 'delpvar'
    document.querySelectorAll("button[id^='delpvar']").forEach(function (button) {
        button.addEventListener("click", async function () {
            var id = this.id.replace('delpvar', '');
            const delglobs = await gs.api.maria.q("DELETE FROM globs WHERE id=?", [id]);
            if (delglobs.success) {
                document.getElementById('setBox' + id).remove();
            }
        });
    });
    // Change event for selects with id starting with 'pvartype'
    document.querySelectorAll("select[id^='pvartype']").forEach(function (select) {
        select.addEventListener("change", async function () {
            var id = this.id.replace('pvartype', '');
            const updateglobs = await gs.api.maria.q("UPDATE globs SET type=? WHERE id=?", [this.value, id]);
            if (updateglobs.success) {
                gs.success("Globs updated!");
            } else {
                gs.fail("Globs failed!");
            }
        });
    });

    //JSONEditor for json fields
    document.addEventListener('DOMContentLoaded', ()=> {

        // Select all textareas with the class 'codeditor'
        const codeareas = document.querySelectorAll('.codeditor');

        // Loop through each textarea and initialize CodeMirror
        codeareas.forEach((textarea) => {
            CodeMirror.fromTextArea(textarea, {
                mode: {name: "javascript", json: true}, // JSON mode
                lineNumbers: true,
                theme: "material-darker", // Optional: Change theme
                autoCloseBrackets: true, // Auto-close brackets
                matchBrackets: true, // Highlight matching brackets
                lineWrapping: true // Wrap long lines
            });
        });
        // Select all textareas with the class 'jsoneditor-textarea'
        const jsontextareas = document.querySelectorAll('.jsoneditor-textarea');
        jsontextareas.forEach(textarea => {
            const textareaId = textarea.id;  // Get the unique ID of the textarea
            const containerId = textareaId.replace('jsoneditor-', 'jsoneditor-container-');
            const container = document.getElementById(containerId); // Find the container using the constructed ID
            const jsonContent = textarea.value;
            const dbid = textareaId.replace('jsoneditor-', '');
            // Define options for JSONEditor
            const options = {
                mode: 'tree',
                onError: function (err) {
                    console.warn(err.toString());
                },
                onModeChange: function (newMode, oldMode) {
                    console.log('Mode switched from', oldMode, 'to', newMode);
                },
                onChange: async function () {
                    //  console.log(textarea.value);
                    var value = JSON.stringify(editor.get());
                    var id = dbid;
                    const updateglobs =await gs.api.maria.q('UPDATE globs SET en="' + encodeURIComponent(value) + '" WHERE id=?', [id]);
                }
            };

            const editor = new JSONEditor(container, options);
            try {
                const json = JSON.parse(decodeURIComponent(jsonContent));
                editor.set(json);
            } catch (e) {
                console.log('textarea mistake')
            }


        })

        })

        // Button event to validate and format JSON
        /*document.getElementById('save-json' + dbid).addEventListener('click', function () {
            const jsonOutput = document.getElementById('save-json' + dbid);
            try {
                const json = JSON.parse(editor.getValue());
                jsonOutput.innerText = JSON.stringify(json, null, 2); // Pretty print JSON
                jsonOutput.className = ''; // Reset error class
            } catch (e) {
                jsonOutput.innerText = 'Invalid JSON format';
                jsonOutput.className = 'error';
            }
        });*/

/*
        //ONCLICK BUTTON
        const layoutButtons = document.getElementsByClassName('buttonChannel');
        layoutButtons.addEventListener('click', async (event) => {
            // 2. Check if the clicked element is a button with the class 'buttonChannel'
            console.log("Layout Button Clicked!", event.target.dataset.layout);
                try {
                    await switchChannels(event.target.dataset.layout);
                } catch (error) {
                    console.error("Error switching channels:", error);
                }

        });
*/
</script>