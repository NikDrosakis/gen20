<script>
(function(){
let table=G.sub;
})()
</script>
<!-----------------------------------------------------
                user EDIT
------------------------------------------------------>
<?php
$user=$this->gpm->f("SELECT * from action where id=?",[$this->id]);
?>
    <!-- Page Title and Navigation Buttons -->
    <div class="pagetitle-container">
        <span onclick="previousid(this)" class="btn btn-secondary">
            <i class="glyphicon glyphicon-chevron-left"></i> Previous
        </span>
        <div id="title" class="pagetitle">
            <?=$user['name']?>
            <a href="/architecture" target="_blank" class="btn btn-link" style="font-size: small;">Public View</a>
        </div>
        <span onclick="nextid()" class="btn btn-secondary">
            Next <i class="glyphicon glyphicon-chevron-right"></i>
        </span>
    </div>
         <button class="bare right" id="create_new_action"><span class="glyphicon glyphicon-plus"></span>New Ermis</button>
         <button class="bare right" id="create_new_actiongrp"><span class="glyphicon glyphicon-plus"></span>New Ermisgroup</button>
        <button onclick='location.href="/system/actiongrp"' class="bare" id="groups">ErmisGroups</button>
        <button onclick='location.href="/system/action"' class="bare" id="groups">Ermis</button>
<?php
echo $this->buildForm("action",$user);
?>