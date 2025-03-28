<div>
    <h3>Update Cubo Images</h3>
    <?php
    echo $this->buildTable(["key"=>"gen_admin.cubo","cols"=>["id","img","name","mains","description","meta"]]);
    if($this->id!=''){
    echo $this->buildForm(["key"=>"gen_admin.cubo","id"=>$this->id,"cols"=>["id","img","name","mains","description","meta"]]);

    }
    //εδώ τι φτιάχνουμε;;;
  //      echo   $this->updateCuboImg('findimage');
    //    echo   $this->updateCuboImg('trelingo');
///        echo   $this->updateCuboImg('venus');

    ?>
    <button onclick="gs.form.loadButton('updateCuboImg','<?= htmlspecialchars($cubo) ?>')">Update</button>
</div>
