<!--------POST TABLE-------------->
<h3>
    <input id="systems_panel" class="red indicator">
    <button class="bare right" id="create_new_post"><span class="glyphicon glyphicon-plus"></span></button>
    <a href="/system/systems"><span class="glyphicon glyphicon-edit"></span>Systems</a>
          <button class="bare right" id="create_new_systems"><span class="glyphicon glyphicon-plus"></span>New System</button>
            <button onclick='location.href="/system/actiongrp"' class="bare" id="groups">ErmisGroups</button>
</h3>
<!----BUILD TABLE-->
   	<?php
 //  	xecho($this->dbForm);
   //	xecho($this->dbForm->tableMeta("gen_admin.action"));
    	echo $this->buildTable("gen_admin.systems");
    	?>
<script>
(function(){
let table="systems";
let newformlist= {
                   0: {row: 'name',placeholder: "Give a Title"},
                   1: {row: 'created',type:'hidden',value: gs.date('Y-m-d H:i:s')},
                  };
})();
</script>