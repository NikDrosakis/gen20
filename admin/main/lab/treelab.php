<?php
//$tree=$this->getBranches("gen_admin");
//xecho($tree);
//xecho($this->mainCuboBranch());

//xecho($this->gpm->listTables());
//xecho($this->db->listTables());


//xecho($this->createDefaultSchema("db","metadata"));
//echo $this->buildSchema("gen_admin.admin_sub");
//echo $this->insertTablesIntoMetadata("db");

//xecho($this->getSchemaQuery("gen_admin","systems"));
$table="tax";
//xecho($this->applySchemaStandards("links"));
?>
<?php
$fa=$this->db->f("SELECT * from user");
?>
<?=$this->buildForm("TEMPLATE.cubo",$fa,false,["name"],false)?>
<?php
xecho($this->db->fl(['id','name'],"user","where id=1"));

?>

<!---FROM HEREE START UPDATING $options  -->
<?=$this->renderSelectField("name",$fa['id'],$this->db->fl(['id,name',"user","where id=1"))?>
<!--------POST TABLE-------------->
<!----BUILD TABLE-->
   	<?php
    	echo $this->buildTable($table);
    	?>
<script>
(function(){
let table="metadata";
let newformlist= {
                   0: {row: 'name',placeholder: "Give a Title"}
                  };
})();
</script>


