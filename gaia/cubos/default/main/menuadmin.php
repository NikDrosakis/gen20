<style>
    th, td{color:black;}
</style>
<?php // Fetch existing menu list from the database
//echo $this->buildTable($this->pagetable);
$menulist = $this->db->fa("SELECT * FROM {$this->pagetable} WHERE menu=1");
?>
<!-- INSERT AND CREATE MENU -->
<div id="newmenuBox" style="display:none">
<?php
// Handle new menu submission
if (isset($_POST['submit_menu'])) {
    $title = trim($_POST['title']);
    $children = isset($_POST['children']) ? 1 : 0;
    $query = $this->db->q("INSERT INTO {$this->pagetable} (title, children) VALUES (?, ?)", [$title, $children]);
    if ($query) {
        location.reload();
    }
}
?>

<form method="POST" class="gform">
    <label>
        <input class="form-control" placeholder="Title" name="title" required>
    </label>
    <input type="checkbox" name="children"> Children Links
    <button type="submit" id="submit_menu" name="submit_menu" value="Create Menu">
        <span class="glyphicon glyphicon-save"></span>
    </button>
</form>
</div>

<?php
// Define orientation and status arrays
$orient = [1 => 'horizontal', 2 => 'vertical'];
$status = [0 => 'inactive', 1 => 'active'];
?>
// Display existing menus and menu links
    <div id="mBox<?=$menuid?>">
        <button onclick="gs.ui.switcher(['#mealias_<?=$menuid?>', '#malias_<?=$menuid?>'], '', 'inline-block')">
            <span class="glyphicon glyphicon-edit"></span>
        </button>
        <button style="float:right" id="delmenu<?=$menuid?>" onclick="deleteMenu(this)">
            <span class="glyphicon glyphicon-trash"></span>
        </button>
        <label>
            <span id="malias_<?=$menuid?>"><?= $menu?></span>
            <input id="mealias_<?=$menuid?>" style="display:none" value="<?= $menu?>">
        </label>
        <button id="newlinkbut<?=$menuid?>" onclick="gs.ui.switcher('#newlinkbox<?=$menuid?>')">
            <span class="glyphicon glyphicon-plus"></span>
        </button>

        <div id="newlinkbox<?=$menuid?>" style="display:none">
            <!-- Main page selection -->
            <select id="newmenuselector<?=$menuid?>" type="tax" class="gs-input">
                <option value="0">Select</option>
                <?php
                $pagemenus = [
                    "Home" => "",
                    "Static Page" => "",
                    "Login" => "login",
                    "Register" => "register",
                    "External Link" => "https://"
                ];
                $taxgrps= $this->db->fl(["id","name"], $this->publicdb.".taxgrp");
                foreach($taxgrps as $tagrpid =>$taxgrpval){
                $pagemenus[$taxgrpval]=$tagrpid;
                }
                foreach ($pagemenus as $pagemval => $pagem) { ?>
                    <option value="<?= $pagem ?>"><?= $pagemval ?></option>
                <?php } ?>
            </select>

            <!-- Input for 1st level -->
            <div style="display: inline-block;">
                <input class="gs-input" id="newmenupage<?=$menuid?>" placeholder="URI 1st level" value="">
                <select class="gs-input" id="subnewmenu1<?=$menuid?>" style="display:none"></select>
            </div>

            <!-- Input for 2nd level -->
            <div style="display: inline-block;">
                <input class="gs-input" id="newmenumode<?=$menuid?>" placeholder="URI 2nd level" value="">
                <select class="gs-input" id="subnewmenu2<?=$menuid?>" style="display:none"></select>
            </div>

            <input class="gs-input" id="newmenutitle<?=$menuid?>" placeholder="Title" value="">
            <button id="savenewmenu<?=$menuid?>">
                <span class="glyphicon glyphicon-save"></span>
            </button>
        </div>


        <div id="newlink<?=$menuid?>"></div>

<table id="table<?=$menuid?>" class="table table-striped table-bordered table-hover">
    <thead>
        <tr>
            <th>Sort</th>
            <th>ID</th>
            <th>Title</th>
            <th>Name</th>
            <th>URI</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody id="tableBody<?=$menuid?>">
        <?php foreach ($menulist as $link) {
        ?>
            <tr id="nodorder<?=$menuid?>_<?= $link['id'] ?>" class="menuBox<?=$menuid?>" style="cursor:move">
                <td><span id="menusrt<?=$menuid?><?= $link['id'] ?>"><?= $link['sort'] ?></span></td>
                <td><?= $link['id'] ?></td>
                <td>
                    <div id="read_<?=$menuid?><?= $link['id'] ?>">
                        <strong id="menuals<?=$menuid?>_<?= $link['id'] ?>"><?= $link['title' . $this->G['langprefix']] ?></strong>
                    </div>
                    <div id="edit_<?=$menuid?><?= $link['id'] ?>" style="display:none">
                        <input class="gs-input" id="title<?=  $this->G['langprefix'] ?>_<?=$menuid?>_<?= $link['id'] ?>" value="<?= $link['title' . $this->G['langprefix']] ?>">
                    </div>
                </td>
                <td>
                    <div id="read_uri<?=$menuid?><?= $link['id'] ?>">
                        <span style="color:red" id="menulink<?=$menuid?>_<?= $link['id'] ?>"><?= $link['name'] ?></span>
                    </div>
                    <div id="edit_<?=$menuid?>_uri<?= $link['id'] ?>" style="display:none">
                        <input class="gs-input" id="uri_<?=$menuid?>_<?= $link['id'] ?>" value="<?= $link['name'] ?>">
                    </div>
                </td>
                <td>
                    <div id="read_uri<?=$menuid?><?= $link['id'] ?>">
                        <span style="color:red" id="menulink<?=$menuid?>_<?= $link['id'] ?>"><?= $link['uri'] ?></span>
                    </div>
                    <div id="edit_<?=$menuid?>_uri<?= $link['id'] ?>" style="display:none">
                        <input class="gs-input" id="uri_<?=$menuid?>_<?= $link['id'] ?>" value="<?= $link['uri'] ?>">
                    </div>
                </td>
                <td>
                    <button onclick="gs.ui.switcher(['#read_<?=$menuid?><?= $link['id'] ?>', '#edit_<?=$menuid?><?= $link['id'] ?>', '#read_uri<?=$menuid?><?= $link['id'] ?>', '#edit_<?=$menuid?>_uri<?= $link['id'] ?>'], '', 'inline-block')">
                        <span class="glyphicon glyphicon-edit"></span>
                    </button>
                    <button style="float:right" id="delink_<?=$menuid?>_<?= $link['id'] ?>" onclick="deleteLink(this)">
                        <span class="glyphicon glyphicon-trash"></span>
                    </button>
                </td>
            </tr>
        <?php } ?>
    </tbody>
</table>


    </div>


<script>
/**
parameters for all the form
declare vars
*/
var menu_list = <?php echo !empty($menulist) ? json_encode($menulist, JSON_UNESCAPED_UNICODE) : '[]'; ?>;
var menu_obj = {
    adata: 'menu',
    fetch: "SELECT * FROM menu",
    query:"UPDATE post SET $row=? WHERE id="+G.id,
    form: {
        1: {type: "text", row: "title", key: 'key', global: ''},
        2: {type: "drop", row: "orient", alias: "Orientation", key: 'key', global: G.orient},
        3: {type: "drop", row: "status", key: 'key', global: G.status},
        4: {type: "drop", row: "style", key: '', global: G.menu_styles}
    }
};
var links_obj = {
    adata: 'links',
    fetch: "SELECT * FROM links",
    query:"UPDATE post SET $row=? WHERE id="+G.id,
    form: {
        1: {type: "text", row: "title",key: 'key'},
        2: {type: "text", row: "link", key: 'key'},
        5: {type: "number", row: "sort", key: 'key'}
    }
}
// Make sortable
gs.ui.sort("UPDATE links SET sort=? WHERE id=?", "list");

// Edit menu link
document.addEventListener("keyup", function (event) {
var target = event.target;
if (target.id.startsWith('title' + G.langprefix + '_') || target.id.startsWith('uri_')) {
    var exp = target.id.split('_');
    var val = target.value;
    console.log("UPDATE links SET " + exp[0] + "='" + val + "' WHERE id=" + exp[2]);
    gs.api.maria.q(`UPDATE ${G.publicdb}.links SET ${exp[0]}=${val} WHERE id=${exp[2]}`).then(function (updatemenu) {
        if (updatemenu.success) {
            if (exp[0] === 'title' + G.langprefix) {
                document.getElementById('menuals' + exp[1] + "_" + exp[2]).textContent = val;
            } else {
                document.getElementById('menulink' + exp[1] + "_" + exp[2]).textContent = val;
            }
        }
    });
}
});

// Edit menu title
document.addEventListener("keyup", function (event) {
var target = event.target;
if (target.id.startsWith('mealias_')) {
var exp = target.id.split('_');
var val = target.value;
console.log("UPDATE menu SET title" + G.langprefix + "='" + val + "' WHERE id=" + exp[1]);
gs.api.maria.q(`UPDATE menu SET title${G.langprefix}=${val} WHERE id=?`, [exp[1]]).then(function (updatemenu) {
    if (updatemenu.success) {
        document.getElementById('malias_' + exp[1]).textContent = val;
    }
});
}
});


/************************
NEW MENU
*************************/
document.addEventListener("change", async function (event) {
var target = event.target;
if (target.id.startsWith('subnewmenu1')) {
var menuid = target.id.replace('subnewmenu1', '');
document.getElementById('newmenupage' + menuid).value = target.value;
}
if (target.id.startsWith('subnewmenu2')) {
var menuid = target.id.replace('subnewmenu2', '');
document.getElementById('newmenumode' + menuid).value = target.value;
}
if (target.id.startsWith('newmenuselector')) {
var menuid = target.id.replace('newmenuselector', '');
// If TAX
if (target.type === "taxgrp") {
const taxgrplist= await gs.api.maria.fl(["id","name"],"tax",`where ${G.publicdb}.tagrpid=${target.value}`);
console.log(taxgrplist)
    if(taxgrplist.success){
    var newo = target.value + '_uri';
    var newohtml = "<option>Select</option>";
    for (var o in taxgrplist.data) {
        newohtml += '<option value="' + o + '">' + taxgrplist.data[o] + '</option>';
    }
    }
    document.getElementById('newmenupage' + menuid).value = target.value;
    document.getElementById('subnewmenu2' + menuid).innerHTML = newohtml;
    document.getElementById('subnewmenu2' + menuid).style.display = "block";

}
// If STATIC
else if (target.value.indexOf(',') > -1) {
    var newo = target.value.split(',');
    var newohtml = "<option>Select</option>";
    for (var o in newo) {
        newohtml += '<option value="' + newo[o] + '">' + newo[o] + '</option>';
    }
    document.getElementById('subnewmenu1' + menuid).innerHTML = newohtml;
    document.getElementById('newmenupage' + menuid).value = '';
    document.getElementById('subnewmenu2' + menuid).style.display = "none";
} else {
    document.getElementById('newmenupage' + menuid).value = target.value;
    document.getElementById('subnewmenu1' + menuid).style.display = "none";
    document.getElementById('subnewmenu2' + menuid).style.display = "none";
}
target.value = 0;
}
});

document.addEventListener("click", function (event) {
var target = event.target.parentNode;
console.log(target)
if (target.id.startsWith('savenewmenu')) {
var linksgrpid = target.id.replace('savenewmenu', '');
var input1 = document.getElementById('newmenupage' + linksgrpid).value.trim();
var input2 = document.getElementById('newmenumode' + linksgrpid).value.trim();
var title = document.getElementById('newmenutitle' + linksgrpid).value.trim();
var uri = input1 + (input2 !== '' ? "/" + input2 : '');
const params= { linksgrpid: linksgrpid, title: title , uri: uri };
console.log(params);
gs.api.maria.inse("links", params).then(function (insertlinks) {
    if (insertlinks.success) {
        location.reload();
    }
});
}
});
async function deleteMenu(button) {
// Get the menu ID from the button's id
const menuId = button.id; // e.g., "delmenu15"
const id = menuId.replace('delmenu', ''); // Extract the ID (e.g., "15")

// Confirm deletion
const confirm=await gs.confirm('Are you sure you want to delete this menu?');
if(confirm){
try {
    // Send an AJAX request to delete the menu
    const response = await gs.api.maria.q(`DELETE FROM ${G.publicdb}.linksgrp WHERE id=${id}`);

    // Check response to confirm deletion success
    if (response) {
        // Optionally remove the menu item from the DOM
        const menuBox = document.getElementById(`mBox${id}`);
        if (menuBox) {
            menuBox.remove();
        }
        gs.success('Menu deleted successfully.');
    } else {
        gs.fail('Error deleting menu. Please try again.');
    }
} catch (error) {
    console.error('Error deleting menu:', error);
    alert('Error deleting menu. Please check the console for details.');
}
}
}
async function deleteLink(button) {
// Get the link ID from the button's id (format: delink_menuid_linkid)
const linkId = button.id; // e.g., "delink_12_45"

// Split to get the specific menu ID and link ID
const ids = linkId.split('_');
const menuId = ids[1];  // Extracted menu ID
const linkID = ids[2];  // Extracted link ID

// Confirm deletion
const confirm= await gs.confirm('Are you sure you want to delete this link?');
if(confirm){
try {
    // Send an AJAX request to delete the link from the database
    const response = await gs.api.maria.q(`DELETE FROM ${G.publicdb}.links WHERE id=${linkID}`);

    // Check response to confirm deletion success
    if (response) {
        // Optionally remove the link item from the DOM
        const linkBox = document.getElementById(`nodorder${menuId}_${linkID}`);
        if (linkBox) {
            linkBox.remove();
        }
        gs.success('Link deleted successfully.');
    } else {
        gs.fail('Error deleting link. Please try again.');
    }
} catch (error) {
    console.error('Error deleting link:', error);
    alert('Error deleting link. Please check the console for details.');
}
}
}

</script>