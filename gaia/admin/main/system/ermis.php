<!--------POST TABLE-------------->
<h3>
    <input id="cms_panel" class="red indicator">
    <button class="bare right" id="create_new_post"><span class="glyphicon glyphicon-plus"></span></button>
    <a href="/system/action"><span class="glyphicon glyphicon-edit"></span>Ermis</a>
          <button class="bare right" id="create_new_postgrp"><span class="glyphicon glyphicon-plus"></span>New Ermis</button>
             <button class="bare right" id="create_new_post"><span class="glyphicon glyphicon-plus"></span>New Ermisgroup</button>
            <button onclick='location.href="/system/actiongrp"' class="bare" id="groups">ErmisGroups</button>
</h3>
<!----BUILD TABLE-->
   	<?php
 //  	xecho($this->db);
   //	xecho($this->db->tableMeta("gen_admin.action"));
    	echo $this->buildTable("gen_admin.action");
    	?>
<script>
(function(){
let table="action";
let newformlist= {
                   0: {row: 'title',placeholder: "Give a Title"},
                   1: {row: 'created',type:'hidden',value: gs.date('Y-m-d H:i:s')},
                  };
})();
</script>