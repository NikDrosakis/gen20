<style>
    .cubo-metadata {
        border: 1px solid #ddd;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 5px;
        max-width: 600px;
        margin: 10px auto;
    }
    .cubo-metadata h3 {
        font-family: "Times New Roman", Times, serif;
        font-weight: bold;
        font-size: 1.2em;
        margin-bottom: 8px;
        color: #333;
    }
    .metadata-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-family: Arial, sans-serif;
        font-size: 0.9em;
        line-height: 1.4;
        color: #555;
    }
    .metadata-content span {
        display: inline-block;
        background-color: #e3e3e3;
        padding: 5px 10px;
        border-radius: 3px;
        color: #444;
    }
</style>

<!--Cubo template for displaying metadata with tagified results-->

<?php if($_SERVER['SYSTEM']=='admin'){ ?>
    <div class="metadata-content">
    <span class="meta-tag"><a style="color:darkred" href="<?=$this->SITE_URL?>">Public</a></span>
        <?php $tags = $this->getPageMetatags();
        echo !empty($tags) ? implode('', array_map(fn($tag) => "<span class='meta-tag'>$tag</span>", $tags)) : "No metadata";
        ?>
    </div>
<?php }else{ ?>
<div class="cubo-metadata">
    <h3>Metadata</h3>
    <div class="metadata-content">
        <?php
        $tags = $this->getPageMetatags();
        echo !empty($tags) ? implode('', array_map(fn($tag) => "<span class='meta-tag'>$tag</span>", $tags)) : "No metadata";
        ?>
    </div>
</div>
<?php } ?>