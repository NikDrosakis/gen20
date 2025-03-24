<style>
.droppable .cubobox {
    width: 100% !important;
    height: 100% !important;
}
.delete-btn{
font-size: 12px;
    background: none;
    border: none;
    right: 0;
    position: absolute;
}
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
    .mainbox{width:100%;margin: 2px;border: 1px solid darkcyan;}
    .cubobox{min-width: 120px;cursor:pointer;margin: 2px;border: 1px solid darkcyan;}
    .wid{
width: 100%;
float: left;
        display: inline-block;
    }
    .wid > div{
        float: left;
        list-style: none;
            display: flex;
            flex-direction: column;
    }
    .wid > label {position:absolute}
    .sl, .sr{
    width:20%;
    height: 196px;
            border: 1px solid gray;
            background:white;
    }
    .sl > div, .sr > div{
    width:100%;
    }
    .m_container {width:60%;}
    .m {width:100%;background:white;
		border: 1px solid gray;
		display: flex;
        flex-direction: column;
		height: 200px !important;
		}
    .h,.f {width:100%;}
    .h1{
        height: 30px;
        border: 1px solid gray;
        width: 100%;
        background:white;
    }
    .f{
    height: 80px;
            width: 100%;
            border: 1px solid gray;
            background:white;
    }
    .list-group-item,.widheader{
background: aliceblue;
    font-size: 1em;
    color: #333;
    font-weight:700;
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
    <button class="bare right" id="create_new_page"><span class="glyphicon glyphicon-plus"></span>New Main</button>
    <a href="/cms/layout"><span class="glyphicon glyphicon-edit"></span>Main Page</a>
    <button onclick='location.href="/cms/menu"' class="bare" id="groups">Menus</button>
</h3>
<!-- stats -->
<div>
    Stats
    1) Count empty areas
    </div>

<!------------MAINS -------------------->
<div style="display:flex;flex-wrap: nowrap;">
<div style="min-width: 50%;max-height: 90vh;
                               overflow: scroll;">
<div style="font-strength:700">Main Pages of <?=TEMPLATE?>  (<?=count($pages)?>)         <span class="glyphicon glyphicon-plus"></span></div>
<?php //$pc = $this->getMaincubo($selectedPageName); //pagecubo ?>

<div style="display:flex;flex-wrap: wrap;">

<?php for($i=0;$i<count($pages);$i++){
$name=$pages[$i]['name'];
$id=$pages[$i]['id'];
?>
<div class="mainbox">
<div style="background: antiquewhite;">
    <a href="/<?=$name?>" style="margin-left:33%;"><?=$name?></a>
<button style="float:right" data-mainid="<?=$id?>" onclick="handleClear(this)" class="clear-cubos bare button">clear</button>
<button style="float:left" data-mainid="<?=$id?>" class="bare button">autoset</button>
</div>
<div id="<?=$name?>-wid" mainid="<?=$id?>" class="wid list-group-item nested-1">
        <!--Header(H)-->
        <div id="<?=$name?>-h" mainid="<?=$id?>" class="h droppable" title="Header H"></div>
        <!--Sidebar Left(SL)-->
        <div id="<?=$name?>-sl" mainid="<?=$id?>" class="sl droppable" title="Sidebar SL"></div>
        <!--MAIN(M)-->
        <div id="<?=$name?>-m_container" class="m_container" title="Main M">
        <div id="<?=$name?>-m" mainid="<?=$id?>" class="m droppable"></div>
        </div>
        <!--Sidebar Left(SL)-->
        <div id="<?=$name?>-sr" mainid="<?=$id?>" class="sr" class="sr droppable" title="Sidebar SR"></div>
        <!--Footer(F)-->
        <div style="display:flex" mainid="<?=$id?>" class="f droppable" id="<?=$name?>-f" title="Footer F"></div>
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
$count_instances = $this->db->fa("SELECT cuboid, COUNT(*) AS num
                                 FROM {$this->publicdb}.maincubo
                                 group by cuboid
                                ");
$cuboidCounts = [];
foreach ($count_instances as $instance) {
    $cuboidCounts[$instance['cuboid']] = $instance['num'];
}


foreach($cubos as $cubo){             ?>
    <div class="cubobox draggable list-group-item global nested-<?=$cubo['name']?> wid"
     id="<?=$cubo['id']?>"
     title="This is the <?=$cubo['name']?> widget. Drag and drop it to the desired area.">
    <div class="widheader" cuboid="<?=$cubo['id']?>">
        <?=$cubo['name']?> (<span id="cuboinstance_<?=$cubo['id']?>"><?=$cuboidCounts[$cubo['id']] ?? 0?></span>)
    </div>
    <div class="widbody" cuboid="<?=$cubo['id']?>">
        <?=$cubo['description']?>
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
        sort: false, // No reordering, just one slot
        onAdd: function (evt) {
            var target = evt.to;
            var item = evt.item;

            // Remove any existing item in the drop zone
            if (target.children.length > 1) {
                target.removeChild(target.children[0]);
            }

            // Match Cubo size to target size
            item.style.width = target.clientWidth + 'px';
            item.style.height = target.clientHeight + 'px';

            // Save state
            saveState(evt);
        }
    });
});

    // Function handling the delete action
    async function handleClear(event) {
        const mainid = event.target.getAttribute("data-mainid");
        if (!mainid) return;
        try {
            // Delete from the database
            await gs.api.maria.q(`DELETE FROM ${G.publicdb}.maincubo WHERE mainid=? and area!=?`, [mainid, 'm']);

            // Remove all associated cubobox elements
            document.querySelectorAll(`.cubobox[data-mainid='${mainid}']`).forEach((cubo) => cubo.remove());

            // Remove the main section from the UI
            document.getElementById(`main-${mainid}`).remove();
        } catch (error) {
            console.error("Error deleting main section:", error);
        }
    }

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
             // Increase the cuboid count by 1 in the DOM
                    const instanceCountSpan = document.getElementById(`cuboinstance_${draggedItemId}`);
                    if (instanceCountSpan) {
                        instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) + 1;
                    }
            //auto render page on change of layout > send reload message to Ermis
           //     gs.soc.send('action',{system:"vivalibrocom",page:G.page,verba:"layout notification", to:G.my.uid,type:"reload",cast:"all"})
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
function makeDraggable(cubo) {
    cubo.setAttribute("draggable", "true");

    // Ensure the Cubo has a delete button
    if (!cubo.querySelector(".delete-btn")) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✖";
        deleteBtn.classList.add("delete-btn");
        // Async deletion from database & UI
        deleteBtn.onclick = async () => {
            const mcid = cubo.getAttribute("data-mcid");
            if (mcid) {
                try {
                    await gs.api.maria.q(`DELETE FROM ${G.publicdb}.maincubo WHERE id=?`, [mcid]);
                    cubo.remove();
                } catch (error) {
                    console.error("Error deleting cubo:", error);
                }
            } else {
                cubo.remove();
            }
        };
        cubo.appendChild(deleteBtn);
    }

    cubo.addEventListener("dragstart", (event) => {
        event.preventDefault(); // Prevent default drag behavior

        // Clone the Cubo
        const newCubo = cubo.cloneNode(true);
        newCubo.id = `cubo-${cubo.id}-${Date.now()}`;

        // Copy `mcid` to cloned Cubo
        newCubo.setAttribute("data-mcid", cubo.getAttribute("data-mcid"));

        // Ensure cloned Cubo has a delete button
newCubo.querySelector(".delete-btn").onclick = async () => {
    const mcid = newCubo.getAttribute("data-mcid");
    const cuboidId = newCubo.getAttribute("cuboid");  // Get the cuboid ID
    const instanceCountSpan = document.getElementById(`cuboinstance_${cuboidId}`);  // Find the span showing the count

    if (mcid) {
        try {
            await gs.api.maria.q(`DELETE FROM ${G.publicdb}.maincubo WHERE id=?`, [mcid]);
            newCubo.remove();

            // Decrease the cuboid count by 1
            if (instanceCountSpan) {
                instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) - 1;
            }
        } catch (error) {
            console.error("Error deleting cubo:", error);
        }
    } else {
        newCubo.remove();

        // Decrease the cuboid count by 1
        if (instanceCountSpan) {
            instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) - 1;
        }
    }
};

        newCubo.style.position = "absolute";
        newCubo.style.zIndex = 1000;

        document.body.appendChild(newCubo);

        document.addEventListener("mousemove", onMouseMove);
        function onMouseMove(e) {
            newCubo.style.left = `${e.pageX - newCubo.offsetWidth / 2}px`;
            newCubo.style.top = `${e.pageY - newCubo.offsetHeight / 2}px`;
        }

        document.addEventListener("mouseup", onMouseUp, { once: true });

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove);
            newCubo.style.position = "static";
            newCubo.style.zIndex = "auto";

            const dropArea = document.elementFromPoint(event.pageX, event.pageY);
            if (dropArea && dropArea.classList.contains("drop-area")) {
                dropArea.appendChild(newCubo);
                makeDraggable(newCubo);
            } else {
                newCubo.remove();
            }
        }
    });
}



// Function to restore the state
async function restoreState(layoutpage, pageName, cubocont, dropareas) {
    try {
        const getpage = await gs.api.maria.fa(`
            SELECT cubo.id as cuboid, maincubo.id as mcid, maincubo.fixed, main.id as mainid, maincubo.area, cubo.name as cubo
            FROM ${G.publicdb}.maincubo
            LEFT JOIN ${G.publicdb}.main ON main.id = maincubo.mainid
            LEFT JOIN gen_admin.cubo ON cubo.id = maincubo.cuboid
            WHERE main.id = ?`, [layoutpage]);

        const state = getpage.data || [];

        state.forEach((item) => {
            const areaId = item.area.startsWith(pageName + '-') ? item.area : pageName + '-' + item.area;
            const area = document.getElementById(areaId);
            const originalCubo = document.getElementById(item.cuboid);

            if (originalCubo && area) {
                // Clone the original Cubo
                const newCubo = originalCubo.cloneNode(true);

                // Assign a unique ID
                newCubo.id = `cubo-${item.cuboid}-${Date.now()}`;

                // Store `mcid` in a data attribute for deletion
                newCubo.setAttribute("data-mcid", item.mcid);
                newCubo.setAttribute("data-mainid", item.mainid);

                // Append the Cubo to the area
                area.appendChild(newCubo);

                // Make the Cubo draggable and attach delete functionality
                if(!item.fixed){
                makeDraggable(newCubo);
                }
            } else {
                console.warn(`Cubo or area not found for: ${item.cubo}, ${areaId}`);
            }
        });

    } catch (error) {
        console.error("Error restoring state:", error);
    }
}


</script>