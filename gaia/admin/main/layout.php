<style>
.plus{
    font-size: 50px;
    color: gray;
    top: 30%;
    left: 30%;
}
    #cubo_table{
width: 50%;
    background: lightgray;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    }
    #cubo_table > div{
    list-style: none;
    max-width: 10%;
    list-style: none;
    padding-top: 6px;
    padding-bottom: 6px;
    min-height: 120px;
    }
    .unwid{background: wheat;}
    .mainbox{min-width:32%;margin: 2px;border: 1px solid darkcyan;}
    .cubobox{min-width: 120px;cursor:pointer;margin: 2px;border: 1px solid darkcyan;}
    .wid{
width: 100%;
float: left;
        display: inline-block;
    }
    .wid > div{
        float: left;
        list-style: none;
    }
    .wid > label {position:absolute}
    .sl, .sr{width:20%;}
    .m_container {width:60%;}
    .m {width:100%;background:white;
		border: 1px solid gray;
		display: flex;
        flex-direction: column;
        border-radius:10px;
		height: 200px !important;
		}
    .h,.f {width:100%;}
    .h1{
        height: 30px;
        border: 1px solid gray;
        width: 100%;
        background:white;
    }
    .sl1,.sl2,.sl3,.sr1,.sr2,.sr3{
        height: 66px;
        border: 1px solid gray;
        width: 100%;
        background:white;
    }
    .f{}
    .fr,.fc,.fl{
        height: 80px;
        width: 33%;
        border: 1px solid gray;
        background:white;
    }
    .list-group-item,.widheader{
background: aliceblue;
    font-size: 1em;
    color: #333;
    font-weight:700;
    text-align: center;
}
.widbody{
font-size:12px;
    font-weight:500;
}
</style>


<?php
$pages = $this->db->fa("SELECT * FROM {$this->publicdb}.main");
$cubos= $this->db->fa("SELECT * from gen_admin.cubo order by name ASC");
?>

<!--------layout-------------->
<h3>
    <input id="cms_panel" class="red indicator">
    Domain: <?=TEMPLATE?> Layout
    <button class="bare right" id="create_new_page"><span class="glyphicon glyphicon-plus"></span>New Page</button>
    <a href="/cms/layout"><span class="glyphicon glyphicon-edit"></span>Main Page</a>
    <button onclick='location.href="/cms/menu"' class="bare" id="groups">Menus</button>
</h3>

<!-- DROPDOWN ->accordion OF MAIN -->
<div>
	<select class="form-control" id="layoutpage">
        <?php
        //$pages=read_folder($this->MAINURI);
        $selectpageid=!empty($_COOKIE['page_selected']) ? (int)$_COOKIE['page_selected'] : 1;
        for($i=0;$i<count($pages);$i++){
        $selectedPageName=$selectpageid==$pages[$i]['id'] ? $pages[$i]['name'] : '';
        ?>
            <option value="<?=$pages[$i]['id']?>" <?=$selectpageid==$pages[$i]['id'] ? "selected='selected'":""?>><?=$pages[$i]['name']?></option>
        <?php } ?>
    </select>
</div>


<div style="display:flex;flex-wrap: nowrap;">
<div style="min-width: 50%;">
<div style="font-strength:700">Main Pages of <?=TEMPLATE?>  (<?=count($pages)?>)         <span class="glyphicon glyphicon-plus"></span></div>
<?php $pc = $this->getMaincuboBypage($selectedPageName); //pagecubo ?>

<div style="display:flex;flex-wrap: wrap;">

<?php for($i=0;$i<count($pages);$i++){
$name=$pages[$i]['name'];
$id=$pages[$i]['id'];
?>

<div class="mainbox">
<div style="text-align:center;background: antiquewhite;"><?=$name?></div>
<div id="<?=$name?>-wid" mainid="<?=$id?>" class="wid list-group-item nested-1">
        <!--Header(H)-->
        <div id="<?=$name?>-h" class="h" title="Header H">
            <div id="<?=$name?>-h1" mainid="<?=$id?>" class="h1 droppable" title="H1"></div>
        </div>
        <!--Sidebar Left(SL)-->
        <div id="<?=$name?>-sl" class="sl" title="Sidebar SL">
            <div id="<?=$name?>-sl2" mainid="<?=$id?>" class="sl2 droppable" title="SL2"></div>
            <div id="<?=$name?>-sl3" mainid="<?=$id?>" class="sl3 droppable" title="SL3"></div>
        </div>
        <!--MAIN(M)-->
        <div id="<?=$name?>-m_container" class="m_container" title="Main M">
        <div id="<?=$name?>-m" mainid="<?=$id?>" class="m droppable">
            <?php
         //   foreach ($pc['m'] as $mcubos) {
           // foreach ($mcubos as $cubo) {
            //echo '<div class="widheader" cubo_id="1" id="' . $cubo . '" class="row archive-content">';
            //echo $cubo;
            //echo '</div>';
             //}}
           ?>
<!---			<div id="m1" class="droppable">M1</div>----->
        </div>
        </div>
        <!--Sidebar Left(SL)-->
        <div id="<?=$name?>-sr" class="sr" title="Sidebar SR">
            <div id="<?=$name?>-sr1" mainid="<?=$id?>" class="sr1 droppable" title="SR1"></div>
            <div id="<?=$name?>-sr2" mainid="<?=$id?>" class="sr2 droppable" title="SR2"></div>
            <div id="<?=$name?>-sr3" mainid="<?=$id?>" class="sr3 droppable" title="SR3"></div>
        </div>
        <!--Footer(F)-->
        <div id="<?=$name?>-f" class="f" title="Footer F">
            <div style="display:flex">
            <div id="<?=$name?>-fl" mainid="<?=$id?>" class="fl droppable" title="FL"></div>
            <div id="<?=$name?>-fc" mainid="<?=$id?>" class="fc droppable" title="FC"></div>
            <div id="<?=$name?>-fr" mainid="<?=$id?>" class="fr droppable" title="FR"></div>
            </div>
        </div>
    </div>
</div>


<?php } ?>
</div>
</div>

<!--------cubo accordion-------------->
<div style="min-width: 100%;">
<div style="style="font-strength:700">Cubos Accordion (<?=count($cubos)?>) <span class="glyphicon glyphicon-plus"></span></div>

<?php echo $this->formSearch('gen_admin.cubo','buildCoreTable2'); ?>

<div id="cubo_table" class="list-group nested-sortable">

<?php
for($i=0;$i<count($cubos);$i++){             ?>

    <div class="cubobox draggable list-group-item global nested-<?=$cubos[$i]['name']?> wid"
     id="<?=$cubos[$i]['id']?>"
     title="This is the <?=$cubos[$i]['name']?> widget. Drag and drop it to the desired area.">
    <div class="widheader" cuboid="<?=$cubos[$i]['id']?>">
        <?=$cubos[$i]['name']?> (<?=$cubos[$i]['id']?>)
    </div>
    <div class="widbody" cuboid="<?=$cubos[$i]['id']?>">
        <?=$cubos[$i]['description']?>
    </div>
    </div>

    <?php } ?>

</div>
</div>

</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
    //check if name exists
//  const page_selected=!gs.coo('page_selected') ? "book" : gs.coo('page_selected');
       const cubocont = document.getElementById('cubo_table');
     //   const pageSelect = document.getElementById('layoutpage');
        const droppableAreas = document.querySelectorAll('.droppable');

    async function restoreAllStates() {
    try {
   const getpages = await gs.api.maria.fa(`SELECT * FROM ${G.publicdb}.main`);
          // Get all available pages
        const pageOptions = getpages.data || [];

        for (let i = 0; i < pageOptions.length; i++) {
            const pageId = pageOptions[i].id;

            await restoreState(pageId, pageOptions[i].name, cubocont, droppableAreas);
        }
    } catch (error) {
        console.error('Error restoring states for all pages:', error);
    }
    }

//new page
    // Initialize Sortable for widgets container
    Sortable.create(cubocont, {
        group: {
            name: 'shared',
            pull: true,  // Allow dragging out of the container
            put: false   // Prevent dropping back into the original container
        },
        sort: false,
        animation: 150,
        handle: '.draggable'
    });
    // Initialize Sortable for each droppable area
    droppableAreas.forEach(function (area) {
        Sortable.create(area, {
            group: 'shared',
            animation: 150,
            sort: true,  // Allow sorting within droppable areas
            onAdd: function (evt) {
                var target = evt.to;
                var item = evt.item;
                // Check if target container already has an item
                if (target.children.length > 1) {
                    // Swap the existing item with the new one
                    var existingItem = target.children[0];
                    evt.from.insertBefore(existingItem, evt.from.children[evt.oldIndex]);
                    target.appendChild(item);
                }
                // Save the state
                 saveState(evt);
            },
            onUpdate: function (evt) {
                // Save the state when items are reordered
                 saveState(evt);
            }
        });
    });
    // Restore state on page load
 //(async function () {
   //      await restoreState(pageSelect.value, cubocont, droppableAreas);
     //})();
// Function to restore state for all pages

    // Restore state for all pages on page load
    (async function () {
        await restoreAllStates();
    })();
});

    // Function to save the state
       //find mainid in maincubo=fetchid > if !=false in mainid update maincubo SET cuboid=draggedItemId where id=fetchid > else INSERT maincubo (mainid,cuboid,area)
      //  const updatepage= await gs.api.maria.q(`UPDATE ${G.publicdb}.maincubo SET ${dropTargetId}=? WHERE id=?`,[draggedItemId,selectedPageName]);
async function saveState(evt) {
  var draggedItem = evt.item;  // The dragged element

    const dropTarget = evt.to;     // The droppable area it was dropped into
    const mainName=dropTarget.id.split('-')[0];
    const mainId=dropTarget.getAttribute('mainid');
    const draggedItemId = draggedItem.id;
    const dropTargetId = dropTarget.id.split('-')[1];
       try {
            // Find the record in maincubo
            const fetchResult = await gs.api.maria.f(`
                SELECT id FROM ${G.publicdb}.maincubo
                    WHERE mainid = ? AND area = ?`,[mainId, dropTargetId]);

            // Check if a record was found
            if (fetchResult && fetchResult.length > 0) {
                // Record exists, update cuboid for the found id
                const fetchId = fetchResult.data.id;
                await gs.api.maria.q(`UPDATE ${G.publicdb}.maincubo SET cuboid = ? WHERE id = ?`,[draggedItemId, fetchId]);
            } else {
                // No matching record, insert new row
                await gs.api.maria.q(`INSERT INTO ${G.publicdb}.maincubo (mainid, cuboid, area) VALUES (?, ?, ?)`,[mainId, draggedItemId, dropTargetId]);
                }
            //auto render page on change of layout > send reload message to Ermis
                gs.soc.send('action',{system:"vivalibrocom",page:G.page,verba:"layout notification", to:my.uid,type:"reload",cast:"all"})
        } catch (error) {
          console.error("Error updating page:", error);
        }
}
    // Function to set droppable areas to starting point
    function setStartingPoint(dropareas,cubocont) {
        dropareas.forEach(function (area) {
            // Clear all droppable areas
            while (area.firstChild) {
                cubocont.appendChild(area.firstChild);
            }
        });
    }
  function makeDraggable(item) {
        item.classList.add('draggable');  // Ensure the item has the draggable class
        item.setAttribute('draggable', 'true');  // Ensure draggable attribute is set to true
        item.style.cursor = 'move';  // Set cursor to move
    }



// Function to restore the state
async function restoreState(layoutpage, pageName, cubocont, dropareas) {
    try {
        const getpage = await gs.api.maria.fa(`
            SELECT cubo.id as cuboid, maincubo.area, cubo.name as cubo
            FROM ${G.publicdb}.maincubo
            LEFT JOIN ${G.publicdb}.main ON main.id = maincubo.mainid
            LEFT JOIN gen_admin.cubo ON cubo.id = maincubo.cuboid
            WHERE main.id = ?`, [layoutpage]);

        const state = getpage.data || [];

        // Clear all droppable areas
       // const prefixedDropAreas = Array.from(dropareas).filter(area => area.id.startsWith(pageName + '-'));
        //prefixedDropAreas.forEach(function (area) {
          //  while (area.firstChild) {
            //    cubocont.appendChild(area.firstChild);
            //}
        //});

        // Place cubos in their saved positions
        state.forEach((item) => {
      //{"cuboid": 18,"area": "sr1","cubo": "journal"}
            // Correcting the areaId based on pageName
            const areaId = item.area.startsWith(pageName + '-') ? item.area : pageName + '-' + item.area;
            const area = document.getElementById(areaId);
            const cubohtml = document.getElementById(item.cuboid); // Use the correct ID of the draggable
            if (cubohtml && area) {
                area.appendChild(cubohtml);
                makeDraggable(cubohtml);
            } else {
                console.warn(`Cubo or area not found for: ${item.cubo}, ${areaId}`);
            }
        });
    } catch (error) {
        console.error('Error restoring state:', error);
    }
}

</script>