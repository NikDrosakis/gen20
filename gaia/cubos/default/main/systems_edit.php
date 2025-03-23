<script>
(function(){
let table=G.sub;
})()
</script>
<!-----------------------------------------------------
                user EDIT
------------------------------------------------------>
<?php
$user=$this->db->f("SELECT * from gen_admin.systems where id=?",[$this->id]);
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
         <button class="bare right" id="create_new_actiongrp"><span class="glyphicon glyphicon-plus"></span>New System</button>
         <button class="bare right" id="create_new_user"><span class="glyphicon glyphicon-plus"></span>New Ermisgroup</button>
        <button onclick='location.href="/system/actiongrp"' class="bare" id="groups">UserGroups</button>
        <button onclick='location.href="/system/action"' class="bare" id="groups">User</button>
<?php
echo $this->buildForm("gen_admin.systems",$user);
?>