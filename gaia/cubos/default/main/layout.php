<?php
/**
LAYOUT SYSTEM HELP
=================

The layout system manages page structure and widget (cubo) placement across your application.

KEY CONCEPTS
------------
1. Pages - The main containers for content (e.g., home, about, contact)
2. Areas - Defined sections within each page (Header, Sidebars, Main, Footer)
3. Cubos - Reusable widget components that can be placed in areas

PAGE STRUCTURE
--------------
Each page contains these default areas:
- H (Header) - Top section of the page
- SL (Sidebar Left) - Left sidebar column
- M (Main) - Primary content area
- SR (Sidebar Right) - Right sidebar column
- F (Footer) - Bottom section of the page

WORKING WITH CUBOS
------------------
Cubos are modular components that can be:
- Dragged from the Cubos panel to page areas
- Configured with different settings
- Reused across multiple pages
- Removed by dragging to the trash bin

INTERFACE GUIDE
---------------
1. Pages Panel (Left)
   - Lists all available pages
   - Shows current cubo placements
   - Contains page management controls

2. Cubos Panel (Right) Default merged
   - Displays all available cubos
   - Shows usage count for each cubo
   - Search/filter functionality
   - Drag cubos here to remove them from pages
   - Provides visual feedback during removal

3. Main Controls
   - [New Main] - Create new pages
   - [Main Page] - Edit main layout template
   - [Menus] - Manage navigation menus

BEST PRACTICES
--------------
1. Use Header for navigation and branding
2. Place primary content in Main area
3. Use Sidebars for supplementary content
4. Keep Footer for meta information
5. Name cubos descriptively

TROUBLESHOOTING
---------------
Q: Cubo not appearing on page?
A: 1) Check if placed in correct area
   2) Verify cubo is properly configured
   3) Clear cache and refresh

Q: Layout looks broken?
A: 1) Check for overlapping cubos
   2) Verify responsive design settings
   3) Inspect browser console for errors

For detailed cubo-specific documentation, use:
<?= $this->help('cuboName.view', 'view') ?>

VERSION: <?= CMS_VERSION ?>
*/
?>
<style>
    .cuboview{
    height: 100%;
    }
.droppable{
background-color: #f8d7da;
    border: 1px dashed #dc3545;
}
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
    background: lightgray;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
#cubo_table > div{
    list-style: none;
    list-style: none;
    padding-top: 6px;
    padding-bottom: 6px;
    min-height: 60px;
}
.unwid{background: wheat;}
.pagebox{width:100%;margin: 2px;border: 1px solid darkcyan;padding: 8px;}
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
    height: 200px;

}
.sl > div, .sr > div{
    width:100%;
}
.m_container {width:60%;}
.m {
    width:100%;

    display: flex;
    flex-direction: column;
    height: 200px !important;
}
.h,.f {width:100%;}
.h1{
    height: 30px;

    width: 100%;
}
.h,.f{
    height: 80px;
    width: 100%;
}
.list-group-item,.widheader{
    background: aliceblue;
    font-size: 12px;
    color: #333;
    font-weight:500;
}
.widbody{
    font-size:12px;
    font-weight:500;
}
/* Default bin style */
.default-bin {
    right: 20px;
    top: 20px;
    min-width: 150px;
    min-height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    display: flex;
    right: 20px;
    top: 20px;
    /* min-width: 144px; */
    /* min-height: 150px; */
    justify-content: center;
    align-items: center;
    z-index: 1000;
    flex-wrap: wrap;
    flex-direction: column;
    max-height: 300px;
    max-width: 100%;
    overflow-x: scroll;
}

.default-bin-title {
    position: absolute;
    top: -20px;
    background: white;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 12px;
}
</style>

<?php
//cubo table contains the basic cubo details
//Main cuboview by default is inserted in the page
//page is the gen_admin.cuboview instance to this domain (gen_admin serves multiple domains)
$pages = $this->db->fa("SELECT * FROM {$this->publicdb}.page");
//gen_admin.cuboview contains the children view of cubo (cubo can have one public or multiple views)
$cubos = $this->db->fa("SELECT * from gen_admin.cuboview  order by name ASC");
//also pagecubo is the written instance of cuboviewid in any enum('m', 'h', 'sr', 'sl', 'f') part of the page.
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
    <div style="min-width: 50%;max-height: 90vh; overflow: scroll;">
        <div style="font-strength:700">Main Pages of <?=TEMPLATE?> (<?=count($pages)?>) <span class="glyphicon glyphicon-plus"></span></div>

        <div style="display:flex;flex-wrap: wrap;">
            <?php foreach($pages as $pag){
                $name=$pag['name'];
                $cuboviewid=$pag['cuboviewid'];
                $id=$pag['id'];
            ?>
            <div class="pagebox">
                <div style="background: antiquewhite;padding: 8px;display: flex;  justify-content: space-between;">
                    <button data-pageid="<?=$id?>" class="bare button">autoset</button>
                    <a href="/<?=$name?>"><?=$name?></a>
                    <button data-pageid="<?=$id?>" onclick="handleClear(this)" class="clear-cubos bare button">clear</button>
                </div>
                <div id="<?=$name?>-wid" pageid="<?=$id?>" class="wid list-group-item nested-1">

                    <!--Header(H)-->
                    <div id="<?=$name?>-h" pageid="<?=$id?>" class="h droppable" title="Header H"></div>

                    <!--Sidebar Left(SL)-->
                    <div id="<?=$name?>-sl" pageid="<?=$id?>" class="sl droppable" title="Sidebar SL"></div>

                    <!--MAIN(M)-->
                    <div id="<?=$name?>-m_container" class="m_container" title="Main M">

                        <div id="<?=$name?>-m" pageid="<?=$id?>" class="m droppable">

                        <div class="cuboview list-group-item global nested-book.book wid" id="cubo-16-1748589707141" draggable="true" title="This is the book.book widget." data-cuboviewid="<?=$cuboviewid?>" data-pageid="<?=$id?>">
                            <div class="widheader"><?=$name?><span id="cuboinstance_<?=$cuboviewid?>"><?=$cuboviewid?></span></div>
                            <div class="widbody"></div>
                        </div>

                        </div>
                   </div>

                    <!--Sidebar Right(SR)-->
                    <div id="<?=$name?>-sr" pageid="<?=$id?>" class="sr droppable" title="Sidebar SR"></div>

                    <!--Footer(F)-->
                    <div style="display:flex" pageid="<?=$id?>" class="f droppable" id="<?=$name?>-f" title="Footer F"></div>

                </div>
            </div>
            <?php } ?>
        </div>
    </div>



    <!--------cubo accordion-------------->

    <div>


        <div style="min-width: 100%;font-strength:700">Cubo Views (<?=count($cubos)?>) <span class="glyphicon glyphicon-plus"></span></div>
        <?php echo $this->formSearch('gen_admin.cubo','buildCoreTable2'); ?>

        <div id="cubo_table" class="list-group nested-sortable">
            <?php
            $count_instances = $this->db->fa("SELECT cuboviewid, COUNT(*) AS num
                                             FROM {$this->publicdb}.pagecubo
                                             GROUP BY cuboviewid");
            $cuboidCounts = [];
            foreach ($count_instances as $instance) {
                $cuboidCounts[$instance['cuboviewid']] = $instance['num'];
            }

            foreach($cubos as $cubo){ ?>
<div class="cuboview draggable list-group-item global nested-<?=$cubo['name']?> wid"
     id="cuboview_<?=$cubo['id']?>"
     data-cuboviewid="<?=$cubo['id']?>"
     draggable="true"
     title="This is the <?=$cubo['name']?> widget.">

    <div class="widheader">
        <?=$cubo['name']?>
        <span id="cuboinstance_<?=$cubo['id']?>"><?=$cuboidCounts[$cubo['id']] ?? 0?></span>
    </div>
    <div class="widbody">
        <?=$cubo['description']?>
    </div>
</div>
            <?php } ?>
        </div>

    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const cubocont = document.getElementById('cubo_table');
        const droppableAreas = document.querySelectorAll('.droppable');
        // Initialize Sortable for widgets container
        Sortable.create(cubocont, {
            group: {
                name: 'shared',
                pull: 'clone',  // Clone items when dragging out
                put: false      // Prevent dropping back into the original container
            },
            sort: false,
            animation: 150,
            onStart: function(evt) {
                // Add visual feedback when dragging starts
                evt.item.style.opacity = '0.5';
            },
            onEnd: function(evt) {
                // Restore opacity when dragging ends
                evt.item.style.opacity = '1';
            }
        });

        // Initialize Sortable for each droppable area with improved drag and drop
        droppableAreas.forEach(function (area) {
            Sortable.create(area, {
                group: 'shared',
                animation: 150,
                sort: false, // No reordering, just one slot
  onAdd: function (evt) {
            const target = evt.to;
            const item = evt.item;

            // Ensure only one item is in the drop zone
            if (target.children.length > 1) {
                const oldItem = target.children[0];
                const oldpagecuboid = oldItem.getAttribute('data-pagecuboid');
                const oldCuboid = oldItem.getAttribute('cuboviewid');

                // Move the old item back to the main cubo container
                cubocont.appendChild(oldItem);

                // If the old item has a database record, remove it
                if (oldpagecuboid) {
                    gs.api.maria.q(`DELETE FROM ${G.publicdb}.pagecubo WHERE id=?`, [oldpagecuboid])
                        .then(() => {
                            const instanceCountSpan = document.getElementById(`cuboinstance_${oldCuboid}`);
                            if (instanceCountSpan) {
                                const count = parseInt(instanceCountSpan.textContent, 10);
                                if (!isNaN(count) && count > 0) {
                                    instanceCountSpan.textContent = count - 1;
                                }
                            }
                        })
                        .catch(console.error); // Optional: log error
                }
            }

                    // Match Cubo size to target size
                    item.style.width = '100%';
                    item.style.height = '100%';

                    // Save state
                    saveState(evt);
                }
            });
        });

        // Improved drag and drop procedure
        async function handleCuboDrop(cuboview, targetArea) {
      //  console.log('cuboview',cuboview)
            const pageId = targetArea.getAttribute('pageid');
            const area = targetArea.id.split('-')[1];
            const cuboviewid = cuboview.id;

            try {
                // Check if this area already has a cubo
                const existing = await gs.api.maria.f(
                    `SELECT id FROM ${G.publicdb}.pagecubo
                     WHERE pageid=? AND area=?`,
                    [pageId, area]
                );

                if (existing && existing.data) {
                    // Update existing record
                    await gs.api.maria.q(
                        `UPDATE ${G.publicdb}.pagecubo SET cuboviewid=? WHERE id=?`,
                        [cuboviewid, existing.data.id]
                    );
                } else {
                    // Insert new record
                    await gs.api.maria.q(
                        `INSERT INTO ${G.publicdb}.pagecubo (pageid, cuboviewid, area) VALUES (?, ?, ?)`,
                        [pageId, cuboviewid, area]
                    );
                }

                // Update instance count
                const instanceCountSpan = document.getElementById(`cuboinstance_${cuboviewid}`);
                if (instanceCountSpan) {
                    instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) + 1;
                }

                return true;
            } catch (error) {
                console.error("Error handling cubo drop:", error);
                return false;
            }
        }

        // Function handling the delete action
        async function handleClear(event) {
            const pageid = event.target.getAttribute("data-pageid");
            if (!pageid) return;

            try {
                // Get all cubos for this page to update instance counts
                const pageCubos = await gs.api.maria.fa(
                    `SELECT cuboviewid FROM ${G.publicdb}.pagecubo WHERE pageid=?`,
                    [pageid]
                );

                // Delete from the database
                await gs.api.maria.q(
                    `DELETE FROM ${G.publicdb}.pagecubo WHERE pageid=?`,
                    [pageid]
                );

                // Update instance counts
                if (pageCubos && pageCubos.data) {
                    pageCubos.data.forEach(item => {
                        const instanceCountSpan = document.getElementById(`cuboinstance_${item.cuboviewid}`);
                        if (instanceCountSpan) {
                            instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) - 1;
                        }
                    });
                }

                // Clear all areas for this page
                const pageAreas = document.querySelectorAll(`[pageid="${pageid}"] .droppable`);
                pageAreas.forEach(area => {
                    while (area.firstChild) {
                        area.removeChild(area.firstChild);
                    }
                });

            } catch (error) {
                console.error("Error clearing page:", error);
            }
        }

        // Function to save the state
        async function saveState(evt) {

            const draggedItem = evt.item;
            const dropTarget = evt.to;
            const pageName = dropTarget.id.split('-')[0];
            const pageid = dropTarget.getAttribute('pageid');
            const cuboviewid = dropTarget.getAttribute('cuboviewid');
//            const draggedItemId = draggedItem.id;
//console.log('cuboviewid',cuboviewid)
            const draggedItemId = draggedItem.id.split('_')[1];
            const dropTargetId = dropTarget.id.split('-')[1];

            try {
                // Find the record in pagecubo
                const fetchResult = await gs.api.maria.f(
                    `SELECT id FROM ${G.publicdb}.pagecubo
                     WHERE pageid = ? AND area = ?`,
                    [pageid, dropTargetId]
                );

                // Check if a record was found
                if (fetchResult && fetchResult.data) {
                    // Record exists, update cuboviewid for the found id
                    const fetchId = fetchResult.data.id;
                    await gs.api.maria.q(
                        `UPDATE ${G.publicdb}.pagecubo SET cuboviewid = ? WHERE id = ?`,
                        [cuboviewid, fetchId]
                    );
                } else {
                    // No matching record, insert new row
                    await gs.api.maria.inse(`${G.publicdb}.pagecubo`,
                    {
                    pageid:pageid,
                    cuboviewid:draggedItemId,
                    area:dropTargetId
                    });
                }

                // Increase the cuboviewid count by 1 in the DOM
                const instanceCountSpan = document.getElementById(`cuboinstance_${draggedItemId}`);
                if (instanceCountSpan) {
                    instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) + 1;
                }

            } catch (error) {
                console.error("Error updating page:", error);
            }
        }

        // Function to restore state for all pages
async function restoreAllStates() {
    try {
        const getpages = await gs.api.maria.fa(
            `SELECT * FROM ${G.publicdb}.page`
        );
        const pageOptions = getpages.data || [];

        // Create parallel restore promises
        const restorePromises = pageOptions.map(({ id, name }) =>
            restoreState(id, name, cubocont, droppableAreas)
        );

        await Promise.all(restorePromises); // Run all in parallel

    } catch (error) {
        console.error('Error restoring states for all pages:', error);
    }
}
        // Function to restore the state
        async function restoreState(pageid, pageName, cubocont, dropareas) {
            try {
            const query = `SELECT pagecubo.id as pagecuboid, pagecubo.cuboviewid,
                                               page.id as pageid, pagecubo.area,
                                               cuboview.name as cuboview
                                               FROM ${G.publicdb}.pagecubo
                                               LEFT JOIN ${G.publicdb}.page ON page.id = pagecubo.pageid
                                               LEFT JOIN gen_admin.cuboview ON cuboview.id = pagecubo.cuboviewid
                                               WHERE page.id = ?`;
                const getpage = await gs.api.maria.fa(query,[pageid]);

                const state = getpage.data || [];

                state.forEach((item) => {
                    const areaId = `${pageName}-${item.area}`;
                    const area = document.getElementById(areaId);
                     const templateId = `cuboview_${item.cuboviewid}`; // Adjust prefix if needed
                      const originalCubo = document.getElementById(templateId);
                    //const originalCubo = document.getElementById(item.cuboviewid);

                    if (originalCubo && area) {
                    console.log({
                      areaId,
                      areaExists: !!area,
                      originalCuboExists: !!originalCubo,
                      cuboviewid: item.cuboviewid,
                      area: item.area,
                      pagecuboid: item.pagecuboid,
                    });
                        // Clone the original Cubo
                        const newCubo = originalCubo.cloneNode(true);
                        newCubo.classList.add('cuboview'); // Add cuboview class

                        // Assign a unique ID
                        newCubo.id = `cubo-${item.cuboviewid}-${Date.now()}`;

                        // Store pagecuboid and pageid in data attributes
                        newCubo.setAttribute("data-pagecuboid", item.pagecuboid);
                        newCubo.setAttribute("data-pageid", item.pageid);

                        // Append the Cubo to the area
                        area.appendChild(newCubo);
                        makeDraggable(newCubo);
                    }
                });

            } catch (error) {
                console.error("Error restoring state:", error);
            }
        }

        // Make elements draggable with improved functionality
        function makeDraggable(cubo) {
            cubo.setAttribute("draggable", "true");

            // Add delete button if not present
            if (!cubo.querySelector(".delete-btn")) {
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "✖";
                deleteBtn.classList.add("delete-btn");
                deleteBtn.title = "Remove this cubo from the page";

                deleteBtn.onclick = async () => {
                    const pagecuboid = cubo.getAttribute("data-pagecuboid");
                    const cuboviewid = cubo.getAttribute("cuboviewid");

                    if (pagecuboid) {
                        try {
                            await gs.api.maria.q(
                                `DELETE FROM ${G.publicdb}.pagecubo WHERE id=?`,
                                [pagecuboid]
                            );

                            // Update instance count
                            const instanceCountSpan = document.getElementById(`cuboinstance_${cuboviewid}`);
                            if (instanceCountSpan) {
                                instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) - 1;
                            }
                        } catch (error) {
                            console.error("Error deleting cubo:", error);
                        }
                    }

                    cubo.remove();
                };

                cubo.appendChild(deleteBtn);
            }

            cubo.addEventListener("dragstart", function(e) {
                e.dataTransfer.setData("text/plain", cubo.id);
                e.dataTransfer.effectAllowed = "move";

                // Visual feedback
                cubo.style.opacity = "0.4";
            });

            cubo.addEventListener("dragend", function() {
                cubo.style.opacity = "1";
            });
        }

        // Restore state for all pages on page load
        (async function () {
            await restoreAllStates();

            // Make all cubos draggable
            document.querySelectorAll('.cuboview').forEach(cubo => {
                makeDraggable(cubo);
            });
        })();
    });
</script>
