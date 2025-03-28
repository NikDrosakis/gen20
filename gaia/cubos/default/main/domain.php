<style>
    .file-list-container {
        padding: 10px;
    }

    .file-list-title {
        font-size: 1.5em;
        color: #333;
        margin-bottom: 15px;
        font-weight: bold;
        text-align: left;
    }

    .file-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 10px;
    }

    .file-item {
        float: left;
        padding: 15px;
        margin: 10px;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: #f9f9f9;
        text-align: center;
        transition: box-shadow 0.3s;
    }

    .file-item:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }

    .file-item input[type="checkbox"] {
        margin-bottom: 10px;
    }

    .file-name {
        display: block;
        font-size: 14px;
        color: #333;
        margin: 5px 0;
    }

    .delete-button {
        display: inline-block;
        background-color: #ff4d4d;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.3s;
    }

    .delete-button:hover {
        background-color: #e60000;
    }

</style>

<h3>Custom Domain</h3>


<h3>Domains installed on this system</h3>


<?php //echo $this->renderFileFormList($this->getPublicFilesystem(),"File System"); ?>

<?php //echo $this->renderFileFormList($this->getActiveNginx(),"Nginx"); ?>


<?php //xecho($this->getSSLs())?>
<?php
echo "Current User: " . get_current_user() . "\n";
echo "User ID: " . posix_getuid() . "\n";
//echo $this->renderFileFormList($this->getZones(),"Get Zones")
?>


<?php //echo $this->synchronizeDomains(); ?>
<?php //echo $this->renderFileFormList($this->getSSLs(),"GET SSLS")?>

<h3>Integrate existing domain</h3>

<h3>Create new </h3>

<h3>Platform to install</h3>




