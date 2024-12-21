<!--------POST TABLE-------------->
<h3>
    <input id="cms_panel" class="red indicator">
    <button class="bare right" id="create_new_post"><span class="glyphicon glyphicon-plus"></span></button>
    <a href="/system/actiongrp"><span class="glyphicon glyphicon-edit"></span>ErmisGroups</a>
          <button class="bare right" id="create_new_action"><span class="glyphicon glyphicon-plus"></span>New Ermis</button>
             <button class="bare right" id="create_new_actiongrp"><span class="glyphicon glyphicon-plus"></span>New Ermisgroup</button>
            <button onclick='location.href="/system/actiongrp"' class="bare" id="groups">ErmisGroups</button>
</h3>
<!----BUILD TABLE-->
   	<?php
    	echo $this->buildTable("gen_admin.actiongrp");
    	?>
<script>
(function(){
let table="actiongrp";
let newformlist= {
                   0: {row: 'title',placeholder: "Give a Title"},
                   1: {row: 'created',type:'hidden',value: gs.date('Y-m-d H:i:s')},
                  };
})();
</script>