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

2. Cubos Panel (Right)
   - Displays all available cubos
   - Shows usage count for each cubo
   - Search/filter functionality

3. Default Bin (Top Right)
   - Drag cubos here to remove them from pages
   - Provides visual feedback during removal

4. Main Controls
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
    max-width: 10%;
    list-style: none;
    padding-top: 6px;
    padding-bottom: 6px;
    min-height: 120px;
}
.unwid{background: wheat;}
.mainbox{width:100%;margin: 2px;border: 1px solid darkcyan;padding: 8px;}
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
.f{
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
$pages = $this->db->fa("SELECT * FROM {$this->publicdb}.page");
$cubos = $this->db->fa("SELECT * from gen_admin.cubo where id>1 order by name ASC");
        $defaults = $this->db->fa("SELECT * FROM gen_admin.cuboview WHERE cuboid=1 ORDER BY name ASC");
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
            <?php for($i=0;$i<count($pages);$i++){
                $name=$pages[$i]['name'];
                $id=$pages[$i]['id'];
            ?>
            <div class="mainbox">
                <div style="background: antiquewhite;padding: 8px;display: flex;  justify-content: space-between;">
                    <button data-mainid="<?=$id?>" class="bare button">autoset</button>
                    <a href="/<?=$name?>"><?=$name?></a>
                    <button data-mainid="<?=$id?>" onclick="handleClear(this)" class="clear-cubos bare button">clear</button>
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
                    <!--Sidebar Right(SR)-->
                    <div id="<?=$name?>-sr" mainid="<?=$id?>" class="sr droppable" title="Sidebar SR"></div>
                    <!--Footer(F)-->
                    <div style="display:flex" mainid="<?=$id?>" class="f droppable" id="<?=$name?>-f" title="Footer F"></div>
                </div>
            </div>
            <?php } ?>
        </div>
    </div>

    <!--------cubo accordion-------------->

    <div>
    <!-- Default Bin for deleted cubos -->
    <div class="default-bin list-group nested-sortable" id="default_bin" title="Drop here to remove cubos from pages">
        <span class="default-bin-title">Cubo Bin</span>
        <?php foreach ($defaults as $default) { ?>
            <div class="cuboview list-group-item global nested-<?=$default['name']?> wid"
                 id="default_<?=$default['id']?>"
                 title="This is the default <?=$default['name']?> widget.">
                <div class="widheader" cuboid="<?=$default['id']?>">
                    <?=$default['name']?>
                </div>
                <div class="widbody" cuboid="<?=$default['id']?>">
                    <?=$default['description']?>
                </div>
            </div>
        <?php } ?>
    </div>


        <div style="min-width: 100%;font-strength:700">Cubo Views (<?=count($cubos)?>) <span class="glyphicon glyphicon-plus"></span></div>
        <?php echo $this->formSearch('gen_admin.cubo','buildCoreTable2'); ?>

        <div id="cubo_table" class="list-group nested-sortable">
            <?php
            $count_instances = $this->db->fa("SELECT cuboid, COUNT(*) AS num
                                             FROM {$this->publicdb}.pagecubo
                                             GROUP BY cuboid");
            $cuboidCounts = [];
            foreach ($count_instances as $instance) {
                $cuboidCounts[$instance['cuboid']] = $instance['num'];
            }

            foreach($cubos as $cubo){ ?>
                <div class="cuboview draggable list-group-item global nested-<?=$cubo['name']?> wid"
                     id="<?=$cubo['id']?>"
                     title="This is the <?=$cubo['name']?> widget. Drag and drop it to the desired area.">
                    <div class="widheader" cuboid="<?=$cubo['id']?>">
                        <?=$cubo['name']?> <span id="cuboinstance_<?=$cubo['id']?>"><?=$cuboidCounts[$cubo['id']] ?? 0?></span>
                    </div>
                    <div class="widbody" cuboid="<?=$cubo['id']?>">
                        <?=$cubo['description']?>
                        <!-- Additional view information can be added here -->
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
        const defaultBin = document.getElementById('default_bin');

        // Initialize default bin as a droppable area
        Sortable.create(defaultBin, {
            group: 'shared',
            onAdd: async function(evt) {
                const cubo = evt.item;
                const mcid = cubo.getAttribute('data-mcid');
                const cuboid = cubo.getAttribute('cuboid');

                if (mcid) {
                    try {
                        // Delete from database
                        await gs.api.maria.q(`DELETE FROM ${G.publicdb}.pagecubo WHERE id=?`, [mcid]);

                        // Update instance count
                        const instanceCountSpan = document.getElementById(`cuboinstance_${cuboid}`);
                        if (instanceCountSpan) {
                            instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) - 1;
                        }
                    } catch (error) {
                        console.error("Error deleting cubo:", error);
                    }
                }

                // Remove the cubo from DOM after a short delay for visual feedback
                setTimeout(() => cubo.remove(), 300);
            }
        });

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
                    var target = evt.to;
                    var item = evt.item;

                    // Remove any existing item in the drop zone
                    if (target.children.length > 1) {
                        const oldItem = target.children[0];
                        const oldMcid = oldItem.getAttribute('data-mcid');
                        const oldCuboid = oldItem.getAttribute('cuboid');

                        // Move old item back to cubo container
                        cubocont.appendChild(oldItem);

                        // Delete old record from database if it existed
                        if (oldMcid) {
                            gs.api.maria.q(`DELETE FROM ${G.publicdb}.pagecubo WHERE id=?`, [oldMcid])
                                .then(() => {
                                    // Update instance count
                                    const instanceCountSpan = document.getElementById(`cuboinstance_${oldCuboid}`);
                                    if (instanceCountSpan) {
                                        instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) - 1;
                                    }
                                });
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
        async function handleCuboDrop(cubo, targetArea) {
            const pageId = targetArea.getAttribute('mainid');
            const area = targetArea.id.split('-')[1];
            const cuboId = cubo.id;

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
                        `UPDATE ${G.publicdb}.pagecubo SET cuboid=? WHERE id=?`,
                        [cuboId, existing.data.id]
                    );
                } else {
                    // Insert new record
                    await gs.api.maria.q(
                        `INSERT INTO ${G.publicdb}.pagecubo (pageid, cuboid, area) VALUES (?, ?, ?)`,
                        [pageId, cuboId, area]
                    );
                }

                // Update instance count
                const instanceCountSpan = document.getElementById(`cuboinstance_${cuboId}`);
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
            const pageid = event.target.getAttribute("data-mainid");
            if (!pageid) return;

            try {
                // Get all cubos for this page to update instance counts
                const pageCubos = await gs.api.maria.fa(
                    `SELECT cuboid FROM ${G.publicdb}.pagecubo WHERE pageid=?`,
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
                        const instanceCountSpan = document.getElementById(`cuboinstance_${item.cuboid}`);
                        if (instanceCountSpan) {
                            instanceCountSpan.textContent = parseInt(instanceCountSpan.textContent) - 1;
                        }
                    });
                }

                // Clear all areas for this page
                const pageAreas = document.querySelectorAll(`[mainid="${pageid}"] .droppable`);
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
            const pageId = dropTarget.getAttribute('mainid');
            const draggedItemId = draggedItem.id;
            const dropTargetId = dropTarget.id.split('-')[1];

            try {
                // Find the record in pagecubo
                const fetchResult = await gs.api.maria.f(
                    `SELECT id FROM ${G.publicdb}.pagecubo
                     WHERE pageid = ? AND area = ?`,
                    [pageId, dropTargetId]
                );

                // Check if a record was found
                if (fetchResult && fetchResult.data) {
                    // Record exists, update cuboid for the found id
                    const fetchId = fetchResult.data.id;
                    await gs.api.maria.q(
                        `UPDATE ${G.publicdb}.pagecubo SET cuboid = ? WHERE id = ?`,
                        [draggedItemId, fetchId]
                    );
                } else {
                    // No matching record, insert new row
                    await gs.api.maria.q(
                        `INSERT INTO ${G.publicdb}.pagecubo (pageid, cuboid, area) VALUES (?, ?, ?)`,
                        [pageId, draggedItemId, dropTargetId]
                    );
                }

                // Increase the cuboid count by 1 in the DOM
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

                for (let i = 0; i < pageOptions.length; i++) {
                    const pageId = pageOptions[i].id;
                    const pageName = pageOptions[i].name;

                    await restoreState(pageId, pageName, cubocont, droppableAreas);
                }
            } catch (error) {
                console.error('Error restoring states for all pages:', error);
            }
        }

        // Function to restore the state
        async function restoreState(pageId, pageName, cubocont, dropareas) {
            try {
                const getpage = await gs.api.maria.fa(
                    `SELECT cubo.id as cuboid, pagecubo.id as mcid, pagecubo.fixed,
                     page.id as pageid, pagecubo.area, cubo.name as cubo
                     FROM ${G.publicdb}.pagecubo
                     LEFT JOIN ${G.publicdb}.page ON page.id = pagecubo.pageid
                     LEFT JOIN gen_admin.cubo ON cubo.id = pagecubo.cuboid
                     WHERE page.id = ?`,
                    [pageId]
                );

                const state = getpage.data || [];

                state.forEach((item) => {
                    const areaId = `${pageName}-${item.area}`;
                    const area = document.getElementById(areaId);
                    const originalCubo = document.getElementById(item.cuboid);

                    if (originalCubo && area) {
                        // Clone the original Cubo
                        const newCubo = originalCubo.cloneNode(true);
                        newCubo.classList.add('cuboview'); // Add cuboview class

                        // Assign a unique ID
                        newCubo.id = `cubo-${item.cuboid}-${Date.now()}`;

                        // Store mcid and pageid in data attributes
                        newCubo.setAttribute("data-mcid", item.mcid);
                        newCubo.setAttribute("data-pageid", item.pageid);

                        // Append the Cubo to the area
                        area.appendChild(newCubo);

                        // Make the Cubo draggable if not fixed
                        if(!item.fixed) {
                            makeDraggable(newCubo);
                        }
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
                    const mcid = cubo.getAttribute("data-mcid");
                    const cuboid = cubo.getAttribute("cuboid");

                    if (mcid) {
                        try {
                            await gs.api.maria.q(
                                `DELETE FROM ${G.publicdb}.pagecubo WHERE id=?`,
                                [mcid]
                            );

                            // Update instance count
                            const instanceCountSpan = document.getElementById(`cuboinstance_${cuboid}`);
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