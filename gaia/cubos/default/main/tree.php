<?php
$steps=10;
//echo $this->renderCP("default.steps");
?>
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

<?php //echo $this->buildTable("gen_admin.plan") ?>
<?php //echo $this->buildTable("gen_admin.actionplan") ?>

<script>
//document.addEventListener('DOMContentLoaded', async function() {
  //      await gs.api.run('tree','runPlan','runPlantree1');
//    });
</script>

<?php //xecho($this->runPlan(["key"=>"tree"]));?>
<div id="runPlantree1"></div>
<div id="runActiontree"></div>
<!---------DATABASE DROP DOWN A) Action A change database to to runAction table drop --------------->
<?php
//$dbtable= "gen_admin.systems";
//echo $this->drop($this->db->show("databases"),$dbtable,'getMariaTree',"listMariaTables");
?>

<?php
$dbtable = "gen_admin.systems";
$selectedDatabase = explode('.', $dbtable)[0]; // Παίρνουμε το "gen_admin"
$databases = $this->db->show("databases");
//  onchange="gs.api.run('$dbtable ','getMariaTree','listMariaTables',{ value: this.value });"
?>

<select id="databases" class="gs-select">
    <option value="">Select</option>
    <?php foreach ($databases as $db): ?>
        <?php
            $safeDb = htmlspecialchars($db, ENT_QUOTES, 'UTF-8');
            $isSelected = ($db === $selectedDatabase) ? ' selected="selected"' : '';
        ?>
        <option value="<?= $safeDb ?>"<?= $isSelected ?>><?= $safeDb ?></option>
    <?php endforeach; ?>
</select>


<!---------DATABASE DROP DOWN B) A) Action B change table drop to runAction $this->compareWithStandard and $this->buildTable  --------------->
<div id="getBranches"><?php //xecho($this->getBranches($params)) ?></div>

<!---------TABLESS DROP DOWN
drop(array $options, $dbtable, string $method="", string $onchangeMethod="")
--------------->
<?php
$selectedTable = explode('.', $dbtable)[1] ?? ''; // Παίρνουμε το "systems"
$tables = $this->db->show("tables", $selectedDatabase);
//onchange="gs.api.run('$dbtable ','listMariaTables','buildTable',{ value: this.value });">
?>

<select id="listMariaTables" class="gs-select">
    <option value="">Select</option>
    <?php foreach ($tables as $table): ?>
        <?php
            $safeTable = htmlspecialchars($table, ENT_QUOTES, 'UTF-8');
            $isSelected = ($table === $selectedTable) ? ' selected="selected"' : '';
        ?>
        <option value="<?= $safeTable ?>"<?= $isSelected ?>><?= $safeTable ?></option>
    <?php endforeach; ?>
</select>




<!---------COMPARE WITH STANDARD--------------->
<div id="compareWithStandardReport">
<?php $table=$this->publicdb.".post"; ?>
</div>
<!---------BUILD SCHEMA--------------->
<div id="buildSchema">
<?php
$assoc= $this->db->tableMeta($dbtable);
echo $this->table($assoc);
?>
</div>

<!---------BUILD TABLE--------------->
<div id="buildTable">
    <?=$this->buildTable($dbtable) ?>
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

<script>
document.addEventListener('DOMContentLoaded', function () {
    const API_BASE = `https://${G.DOMAIN}/api/v1/`;
     const username = 'nikos';
     const password = '130177';
     const credentials = btoa(`${username}:${password}`); // base64 encode
    const dbSelectElement = document.getElementById('databases'); // db dropdown
    const tableSelectElement = document.getElementById('listMariaTables'); // table dropdown
    const applyBtn = document.getElementById('applySchemaBtn');

    let selectedDB = '';
    let selectedTable = '';

    // A) DB → Tables
    dbSelectElement.addEventListener('change', async function () {
        selectedDB = this.value;
        if (!selectedDB) return;
        try {
        const REQUEST = `${API_BASE}maria/show?key=tables&db=${selectedDB}`;
     const res = await fetch(REQUEST, {
         method: 'GET',
         headers: {
             'Authorization': `Basic ${credentials}`,
             'Content-Type': 'application/json'
         }
     });
            const json = await res.json();

            tableSelectElement.innerHTML = '<option value="">-- Select Table --</option>';
            (json.data || []).forEach(tbl => {
                const opt = document.createElement('option');
                opt.value = tbl;
                opt.textContent = tbl;
                tableSelectElement.appendChild(opt);
            });

            selectedTable = '';
            document.getElementById('compareWithStandardReport').innerHTML = '';
            document.getElementById('buildSchema').innerHTML = '';
            document.getElementById('buildTable').innerHTML = '';

        } catch (err) {
            console.error("DB → Tables failed", err);
        }
    });

tableSelectElement.addEventListener('change', async function () {
    selectedTable = this.value;
    if (!selectedDB || !selectedTable) return;

    const fullTable = `${selectedDB}.${selectedTable}`;
    const REQUEST = `${API_BASE}local/getMariaTree?key=${fullTable}`;

    try {
        const res = await fetch(REQUEST, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        const json = await res.json();

        // Check if response has all parts
        const compareHTML = (json.compareWithStandardReport || []).join('<br/>');
        const schemaHTML = json.buildSchema || '';
        const tableHTML = json.buildTable || '';

        document.getElementById('compareWithStandardReport').innerHTML = compareHTML;
        document.getElementById('buildSchema').innerHTML = schemaHTML;
        document.getElementById('buildTable').innerHTML = tableHTML;

    } catch (err) {
        console.error("Table → Unified getMariaTree failed", err);
    }
});

    // C) Apply schema
    if (applyBtn) {
        applyBtn.addEventListener('click', async function () {
            if (!selectedDB || !selectedTable) return;
            const fullTable = `${selectedDB}.${selectedTable}`;

            try {
                const res = await fetch(`${API_BASE}applySchemaStandards?key=${API_KEY}&table=${fullTable}`);
                const json = await res.json();
                alert("Schema applied: " + (json.success ? "Success" : "Error"));
            } catch (err) {
                console.error("Apply schema failed", err);
                alert("Schema application failed");
            }
        });
    }

});
</script>
