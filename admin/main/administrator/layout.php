<style>
    #areas{
width: 10%;
    max-width: 155px;
float:left;
        display: inline-block;
        background: lightgray;
    }
    #areas > div{
    list-style: none;
    margin: 1%;
    padding-top: 10px;
    padding-bottom: 10px;
    height: auto;
    border-radius: 10px;
    border-bottom: 1px solid black;
    overflow:hidden;
    }
    .unwid{background: wheat;}
    #wid{
width: 80%;
float: left;
        display: inline-block;
    }
    #wid > div{
        float: left;
        list-style: none;
        margin-bottom: 4px;
        border: 1px solid #d7d7d7;
        border-radius: 10px;
        text-align: center;
        color: #d7d7d7;
    }
    #wid > label {position:absolute}
    #sl, #sr{width:20%;height: 300px !important;}
    #m_container {width:60%;}
    #m {width:100%;background:white;
		border: 1px solid gray;
		display: flex;
        flex-direction: column;
        border-radius:10px;
		height: 360px !important;
		}
    #h,#f {width:100%;}
    #h {height:80px !important;}
    #h1{
        height: 60px;
        border: 1px solid gray;
        border-radius:10px;
        width: 100%;
        background:white;
    }
    #sl1,#sl2,#sl3,#sr1,#sr2,#sr3{
        height: 120px;
        border: 1px solid gray;
        width: 100%;
        border-radius:10px;
        background:white;
    }
    #f{}
    #fr,#fc,#fl{
        height: 150px;
        width: 33%;
        border: 1px solid gray;
        border-radius:10px;
        background:white;
    }
    .list-group-item,.widheader{
background: aliceblue;
    font-size: 1em;
    color: #333;
    height: 100%;
    width: 100%;
    text-align: center;
}
</style>

<!--------POST TABLE-------------->
<h3>
    <input id="cms_panel" class="red indicator">
    <button class="bare right" id="create_new_page"><span class="glyphicon glyphicon-plus"></span>New Page</button>
    <a href="/cms/layout"><span class="glyphicon glyphicon-edit"></span>Main Page</a>
    <button onclick='location.href="/cms/menu"' class="bare" id="groups">Menus</button>
</h3>

<!-- DROPDOWN OF MAIN -->
<div>
	Main Name:
	<select class="form-control" id="layoutpage">
        <?php
        //$pages=read_folder($this->MAINURI);
        $pages = $this->db->fa("SELECT * FROM main");
        $selectpageid=!empty($_COOKIE['page_selected']) ? (int)$_COOKIE['page_selected'] : 1;
        for($i=0;$i<count($pages);$i++){
        $selectedPageName=$selectpageid==$pages[$i]['id'] ? $pages[$i]['name'] : '';
        ?>
            <option value="<?=$pages[$i]['id']?>" <?=$selectpageid==$pages[$i]['id'] ? "selected='selected'":""?>><?=$pages[$i]['name']?></option>
        <?php } ?>
    </select>
</div>
<div style="width: 100%;">
<!-- WIDGETs -->
    <div id="areas" class="list-group nested-sortable">
        <?php
        $cubos= $this->db->fa("SELECT * from cubo order by name ASC LIMIT 10");
        for($i=0;$i<count($cubos);$i++){
            ?>
            <div style="cursor:pointer" class="draggable list-group-item global nested-<?=$cubos[$i]['name']?> wid" id="<?=$cubos[$i]['id']?>">
                <div class="widheader" cubo_id="<?=$cubos[$i]['id']?>">
                    <?=$cubos[$i]['name']?>
                 <?php if ($insideLayout) { ?>
                <span type="delete" value="1" title="delete" class="glyphicon glyphicon-trash" style="float:right;font-size: 12px;margin: 4px 0 0 0;"></span>
                <?php } ?>
                </div>
                <div style="background:antiquewhite;font-size: 12px;"></div>

            </div>
        <?php } ?>
    </div>

<!-- WIDGETIZED AREAS -->
<?php         $pc = $this->getMaincuboBypage($selectedPageName);
xecho($pc);

//pagecubo ?>
<div id="wid" class="list-group-item nested-1">
        <!--Header(H)-->
        <div id="h">
            <label>Header H</label>
            <div id="h1" class="droppable">H1</div>
        </div>
        <!--Sidebar Left(SL)-->
        <div id="sl">
            <label>Sidebar SL</label>
            <div id="sl1" class="droppable">SL1</div>
            <div id="sl2" class="droppable">SL2</div>
            <div id="sl3" class="droppable">SL3</div>
        </div>
        <!--MAIN(M)-->
        <div id="m_container"  >
         <label>Main M</label>
        <div id="m" class="droppable">
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
        <div id="sr">
            <label>Sidebar SR</label>
            <div id="sr1" class="droppable">SR1</div>
            <div id="sr2" class="droppable">SR2</div>
            <div id="sr3" class="droppable">SR3</div>
        </div>
        <!--Footer(F)-->
        <div id="f">
            <label>Footer F</label>
            <div style="display:flex">
            <div id="fl" class="droppable">FL</div>
            <div id="fc" class="droppable">FC</div>
            <div id="fr" class="droppable">FR</div>
            </div>
        </div>
    </div>


    <div id="areas" class="list-group nested-sortable">
        <?php
        $cubos= $this->db->fa("SELECT * from cubo order by name DESC LIMIT 10");
        for($i=0;$i<count($cubos);$i++){
            //$wid=explode('.',basename($wid))[0];
            ?>
            <div style="cursor:pointer" class="draggable list-group-item global nested-<?=$cubos[$i]['name']?> wid" id="<?=$cubos[$i]['id']?>">
                <div class="widheader" cubo_id="<?=$cubos[$i]['id']?>">
                    <?=$cubos[$i]['name']?>
                 <?php if ($insideLayout) { ?>
                <span type="delete" value="1" title="delete" class="glyphicon glyphicon-trash" style="float:right;font-size: 12px;margin: 4px 0 0 0;"></span>
                <?php } ?>
                </div>
                <div style="background:antiquewhite;font-size: 12px;"></div>
                </div>
        <?php } ?>
</div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {

    //check if name exists
    const page_selected=!gs.coo('page_selected') ? "book" : gs.coo('page_selected');
    // Event listener for page selection change
       const cubocont = document.getElementById('areas');
        const pageSelect = document.getElementById('layoutpage');
        const droppableAreas = document.querySelectorAll('.droppable');
         if (pageSelect) {
                pageSelect.addEventListener('change', async function () {
                    gs.coo('page_selected',pageSelect.value);
            		await restoreState(pageSelect.value,cubocont,droppableAreas);
                });
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
 (async function () {
         await restoreState(pageSelect.value, cubocont, droppableAreas);
     })();
});

    // Function to save the state
       //find mainid in maincubo=fetchid > if !=false in mainid update maincubo SET cuboid=draggedItemId where id=fetchid > else INSERT maincubo (mainid,cuboid,area)
      //  const updatepage= await gs.api.maria.q(`UPDATE maincubo SET ${dropTargetId}=? WHERE id=?`,[draggedItemId,selectedPageName]);
async function saveState(evt) {
  var draggedItem = evt.item;  // The dragged element
    const dropTarget = evt.to;     // The droppable area it was dropped into
    const draggedItemId = draggedItem.id;
    const dropTargetId = dropTarget.id;
 const pageSelect = document.getElementById('layoutpage');
    const selectedPageName = pageSelect.options[pageSelect.selectedIndex].text;
    const mainid=pageSelect.value;
       try {
            // Find the record in maincubo
            const fetchResult = await gs.api.maria.q(
                'SELECT id FROM maincubo WHERE mainid = ? AND area = ?',
                [mainid, dropTargetId]
            );

            // Check if a record was found
            if (fetchResult && fetchResult.length > 0) {
                // Record exists, update cuboid for the found id
                const fetchId = fetchResult[0].id;
                await gs.api.maria.q(
                    'UPDATE maincubo SET cuboid = ? WHERE id = ?',
                    [draggedItemId, fetchId]
                );
            } else {
                // No matching record, insert new row
                await gs.api.maria.q('INSERT INTO maincubo (mainid, cuboid, area) VALUES (?, ?, ?)',[mainid, draggedItemId, dropTargetId]);
                }
            //auto render page on change of layout > send reload message to Ermis
                gs.soc.send('action',{system:"vivalibrocom",page:G.page, to:my.uid,type:"reload",cast:"all"})
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
     //   console.log('Set to starting point');
    }
  function makeDraggable(item) {
        item.classList.add('draggable');  // Ensure the item has the draggable class
        item.setAttribute('draggable', 'true');  // Ensure draggable attribute is set to true
        item.style.cursor = 'move';  // Set cursor to move
    }
// Function to restore the state
async function restoreState(layoutpage, cubocont, dropareas) {
    try {
        var selectedPage = layoutpage || pageSelect.value;
        const getpage = await gs.api.maria.fa(`
            SELECT cubo.id as cuboid,maincubo.area, cubo.name as cubo
            FROM maincubo
            LEFT JOIN main ON main.id = maincubo.mainid
            LEFT JOIN cubo ON cubo.id = maincubo.cuboid
            WHERE main.id = ?`, [selectedPage]);
console.log(getpage);
        const state = getpage.data || [];

        // Clear all droppable areas
        dropareas.forEach(function(area) {
            while (area.firstChild) {
                cubocont.appendChild(area.firstChild);
            }
        });

        // Place cubos in their saved positions
        state.forEach((item) => {
            var area = document.getElementById(item.area);
            var cubohtml = document.getElementById(item.cuboid);
console.log(item.area)
console.log(item.cubo)
            if (cubohtml && area) {
                area.appendChild(cubohtml);
                makeDraggable(cubohtml); // Ensure this function exists and is correctly defined
            } else {
                console.warn(`Cubo or area not found for: ${item.cubo}, ${item.area}`);
            }
        });
    } catch (error) {
        console.error('Error restoring state:', error);
    }
}
</script>