<?php
$steps=10;
?>
<style>
.step-progress-bar {
  display: flex;
  width: 100%;
  height: 3px; /* Base line height */
  background-color: #ccc;
  position: relative;
}

.step {
  flex: 1;
  position: relative;
  text-align: center;
  cursor: pointer;
}

.step .dot {
  width: 10px;
  height: 10px;
  background-color: #ccc;
  border-radius: 50%;
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
}

.step .label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666;
}

.step.active .dot {
  background-color: #4caf50;
  width: 14px; /* Larger dot for active steps */
  height: 14px;
}

.step.active .label {
  color: #4caf50;
}

.step::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 2px; /* Height of the progress line */
  background-color: #4caf50;
  width: 100%;
  z-index: -1;
}

.step.active::before {
  height: 3px; /* Thicker line for active steps */
}
</style>

<div class="step-progress-bar">
  <?php
  foreach (range(1, $steps) as $step) { ?>
    <div class="step" data-step="<?=$step?>" onclick="goToStep(<?=$step?>)">
      <div class="dot"></div>
      <span class="label"><?=$step?></span>
    </div>
  <?php } ?>
</div>

<script>
function goToStep(step) {
  // Remove 'active' class from all steps
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));

  // Add 'active' class to the clicked step and all previous steps
  for (let i = 1; i <= step; i++) {
    document.querySelector(`.step[data-step="${i}"]`).classList.add('active');
  }

  // Execute action for the specific step (optional)
  executeStepAction(step);
}

function executeStepAction(step) {
  switch (step) {
    case 1:
      console.log("Executing action for Step 1");
      break;
    case 2:
      console.log("Executing action for Step 2");
      break;
    case 3:
      console.log("Executing action for Step 3");
      break;
    case 4:
      console.log("Executing action for Step 4");
      break;
    case 5:
      console.log("Executing action for Step 5");
      break;
    default:
      console.log("Unknown step");
  }
}
</script>



<script>

/*
    async function updateForm(selectElement, method) {
        // Get selected database and table
        let name, getResult;
//TODO ABSTRACT actions or series of actions
        switch(method){
            //switch database and select tables
            case 'listMariaTables':
                //provide listMariaTables
                name = { "table" : selectElement.value}
                getResult = await gs.api.get(method, name);
                console.log(selectElement.value)
                gs.coo('selected_db',selectElement.value);
                gs.cooDel('selected_table');
                document.getElementById('listMariaTables').innerHTML='';
                document.getElementById('buildTable').innerHTML='';
                const db = selectElement.value;
                break;
            //switch tables and select columns table (buildTable)
            case 'buildTable':
                name = { "table" : gs.coo('selected_db')+'.'+selectElement.value}
                getResult = await gs.api.get(method, name);
                gs.coo('selected_table',selectElement.value);
                //provide compareWithStandardReport
                const compareWithStandardReport= await gs.api.get("compareWithStandardReport",name);
                const buildTableID = document.getElementById('compareWithStandardReport');
                if(compareWithStandardReport.data){
                    buildTableID.innerHTML=compareWithStandardReport.data.join('<br/>');
                }

                //provide buildSchema
                const buildSchema= await gs.api.get("buildSchema",name);
                const buildSchemaID = document.getElementById('buildSchema');
                if(buildSchema.data){
                    buildSchemaID.innerHTML=buildSchema.data;
                }
                break;
        }
//TODO ABSTRACT output appended
        console.log(name)
        // Fetch the corresponding tables for the selected database
        try {
            const getResult = await gs.api.get(method,name);
            //append result to id ...table-container
            // Ensure the container element exists
            // Get the next dropdown where the result will be appended
            const nextMethodElement = document.getElementById(method);
            nextMethodElement.innerHTML='';

            if(getResult.data){
                const emptyOption = document.createElement('option');
                emptyOption.value = '';  // Empty value
                emptyOption.textContent = '--Select--';  // Placeholder text
                nextMethodElement.appendChild(emptyOption);

                // Populate the dropdown or table depending on the method
                if (Array.isArray(getResult.data)) {
                    // Assuming you get an array for the next dropdown
                    getResult.data.forEach(item => {
                        const option = document.createElement('option');
                        option.value = item;
                        option.textContent = item;
                        nextMethodElement.appendChild(option);
                    });
                } else {
                    // If the next step is to build a table
                    if (method === 'buildTable') {
                        nextMethodElement.innerHTML = getResult.data;
                    }
                }
            }else{
                console.log("no result");
            }
        } catch (error) {
            console.error("Error fetching tables: ", error);
        }
    }
*/
</script>

<!------ αυτός ο κώδικας αν και λειτουργικός έχει δύο ελλαττώματα
a) χρησιμοποιεί σύνθετη non standardized js
b) χρησιμοποιεί cookie για να κάνει ένα απλό chain
implement ActionPlan =  applySchemaStandards
plan([
<drop> db->show("databases") ==tableList==>
<drop>db->show("tables",publicdb) ==tableName==>
    1) <table>compareWithStandard($dbtable)
    2) <table>buildTable($dbtable);
    3) <button>applySchemaStandards
        ==tableName==>
        D
])
----------------------------------------------->

<?php echo $this->buildTable("gen_admin.plan") ?>
<?php echo $this->buildTable("gen_admin.actionplan") ?>

<script>
document.addEventListener('DOMContentLoaded', async function() {
        await gs.api.run('tree','runPlan','runPlantree1');
    });
</script>
<?php //xecho($this->runPlan(["key"=>"tree"]));?>
<div id="runPlantree1"></div>
<div id="runActiontree"></div>
<!---------DATABASE DROP DOWN A) Action A change database to to runAction table drop --------------->
<?php //echo $this->drop($this->db->show("databases"),$dbtable,'getMariaTree',"listMariaTables") ?>

<!---------DATABASE DROP DOWN B) A) Action B change table drop to runAction $this->compareWithStandard and $this->buildTable  --------------->
<div id="getBranches"><?php //xecho($this->getBranches($params)) ?></div>

<!---------TABLESS DROP DOWN
drop(array $options, $dbtable, string $method="", string $onchangeMethod="")
--------------->
<?php //$this->drop($this->db->show("tables",$this->publicdb),$dbtable,'listMariaTables',"buildTable") ?>

<!---------COMPARE WITH STANDARD--------------->
<div id="compareWithStandardReport">
<?php

$table=$this->publicdb.".post";
//xecho($this->buildChart($table,'pie'));
//xecho($this->buildChart($table,'bar'));
//xecho($this->buildChart($table,'line'));

?>

<script>
document.addEventListener('DOMContentLoaded', async function() {

  })
  </script>

</div>

<!---------BUILD SCHEMA--------------->
<div id="buildSchema"><?php
//$assoc= $this->db->tableMeta($dbtable);
//echo $this->table($assoc);
?>
</div>

<!---------BUILD TABLE--------------->
<div id="buildTable">
    <?php //$this->buildTable($dbtable) ?>
</div>

<?php
/*
//SET UP METADATA and table code in main/folders tables are not needed any more ,  just each page from database will work with each metadata
//setup new column
//setup gen_admin to main server administration (instead of gpm)
//setup gen_vivalibrocom as the public


$id="getMariaTree";
$request=["value"=>$domain];
  if (method_exists($this, $id)) {
         // Use reflection to get method signature
         $reflection = new ReflectionMethod($this, $id);
         $parameters = $reflection->getParameters();
         // Determine the number of parameters and their types
         if (count($parameters) == 1 && $parameters[0]->getType() && $parameters[0]->getType()->getName() === 'array') {
             // If method expects a single array parameter
             $execute = $this->{$id}($request);
         } else {
               // Otherwise, spread array values as arguments
             $execute = $this->{$id}(...array_values($request));
         }
         $response = [
             "status" => 200,
             "success" => true,
             "code" => 'LOCAL',
             "data" => $execute,
             "error" => $execute['error'] ?? null
         ];
     } else {
         // Method not found
         $response = [
             "status" => 403,
             "success" => false,
             "code" => 'LOCAL',
             "error" => "Method {$id} not found"
         ];
     }
 */
//xecho($response['data']);
//echo $this->drop($response['data'],$domain,'listMariaTables2',"buildTable2","buildTable2");

//require_once '/var/www/gs/core/API.php';
//$api=new API();
//$execute= $api->executeLocalMethod($request);
//correct now a way to append


//$tree=$this->getBranches("gen_admin");
//xecho($tree);
//xecho($this->pagecuboBranch());



//xecho($this->createDefaultSchema("db","metadata"));

//echo $this->insertTablesIntoMetadata("db");

//xecho($this->getSchemaQuery("gen_admin","systems"));
//$table="systems";
//xecho($this->compareWithStandardReport($table);
//xecho($this->applySchemaStandards("links"));
?>

<!---FROM HEREE START UPDATING $options  -->
<?php //$this->renderSelectField("name",$fa['id'],$this->db->flist("SELECT id,name from user where id=1")) ?>
<!--------POST TABLE-------------->
<!----BUILD TABLE-->
<?php //	echo $this->buildTable($table); ?>