<?php foreach ($sel as $id => $logs) { ?>
<div class="widget-box">
    <div class="widget-header">
        <label style="color:darkblue">ID: <?=$id?></label>
        <span class="widget-version">v<?=$logs[0]['version']?></span>
        <span class="widget-version">Created: <?=$logs[0]['created']?></span>
        <span class="widget-version">Modified: <?=$logs[0]['modified']?></span>
    </div>
    <label style="color:darkblue" for="widget-name-<?=$id?>"><?=$logs[0]['name']?></label>

    <label style="display:block;clear:left" for="widget-description-<?=$id?>">Description:</label>
    <textarea id="widget-description-<?=$id?>" class="widget-textarea" placeholder="Description"><?=$logs[0]['description'] ? $logs[0]['description'] : ''?></textarea>
    <label style="display:block;clear:left" for="widget-description-<?=$id?>">engineering_scope:</label>
    <textarea id="widget-description-<?=$id?>" class="widget-textarea" placeholder="engineering_scope"><?=$logs[0]['engineering_scope'] ? $logs[0]['engineering_scope'] : ''?></textarea>
    <label style="display:block;clear:left" for="widget-description-<?=$id?>">user_experience:</label>
    <textarea id="widget-description-<?=$id?>" class="widget-textarea" placeholder="user_experience"><?=$logs[0]['user_experience'] ? $logs[0]['user_experience'] : ''?></textarea>
<textarea id="widget-description-<?=$id?>" class="widget-textarea" placeholder="scalability_level"><?=$logs[0]['scalability_level'] ? $logs[0]['scalability_level'] : ''?></textarea>

    <div class="logs-section">
        <h3>System Logs</h3>
        <ul>
            <?php for($i=0;$i<count($logs);$i++) { ?>
                <li><strong><?=$logs[$i]['created']?>:</strong> <?=$logs[$i]['report']?></li>
                <li><strong><?=$logs[$i]['created']?>:</strong> <?=$logs[$i]['suggest']?></li>
            <?php } ?>
        </ul>
    </div>
</div>
<?php } ?>