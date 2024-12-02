<!---@ermis.php----->
<style>
.ermis-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
width:100%;
}

.ermis-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
    margin: 10px 0;

}


.ermis-input, .ermis-textarea, .ermis-select {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 10px;
    border:none;
}

.ermis-textarea {
    height: 100px;
}

label {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.ermis-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.ermis-version {
background-color: #4CAF50;
    color: white;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 1em;
    margin: 2px;
}

.logs-section {
    margin-top: 15px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

.logs-section h3 {
    margin-top: 0;
}

.logs-section ul {
    list-style: none;
    padding: 0;
}

.logs-section ul li {
    padding: 5px 0;
    border-bottom: 1px solid #ddd;
}

.logs-section ul li:last-child {
    border-bottom: none;
}
</style>


    <h3>
        <input id="wsy_panel" class="red indicator">
        <a href="/ermis/ermis"><span class="glyphicon glyphicon-transfer"></span>WSI</a>
        </h3>
    <button id="newermis" class="bare right" style="float:right">New Integration</button>
<blockquote>Web Socket Nodejs resources</blockquote>

	<div id="newermisbox"></div>
	<div id="newermis_container"></div>
	 <div id="ermis-container"></div>



<script>

async function getermisloop(){
 const loop= await gs.api.gpm.fa("SELECT * FROM resources ");
if(loop.success){
    var html='';
    for(var i in loop.data) {
    html +=`<div class="gs-box">
        <div class="ermis-header">
            <label style="color:darkblue">ID: ${loop.data[i].id}</label>
            <span class="ermis-version">Created: ${gs.date('Y-m-d',loop.data[i].added)}</span>
            <span class="ermis-version">Modified: ${gs.date('Y-m-d',loop.data[i].updated)}</span>
        </div>
        <label style="color:darkblue" for="ermis-name-<?=$id?>">${loop.data[i].name}</label>
        <label style="color:darkblue" for="ermis-name-<?=$id?>">${loop.data[i].company}</label>
    </div>`;
    }
       document.getElementById('ermis-container').innerHTML = html;
    }    else{
             html ="No results";
    }
}

async function handleNewWSIForm(event) {
  const box = document.getElementById('newermisbox');
  if (box.innerHTML === '') {
    try {
      const response = await gs.form.generate({
        adata: "ermis_integrations",
        nature: "new",
        append: '#newermisbox',
        database: 'gpm',
        list: {
          0: { row: 'name', placeholder: "Name", params: "required" },
          1: { row: "company", placeholder: "Company" },
          2: {
            row: 'status',
            type: "drop",
            global: { 1: "under integration", 2: "integrated but not working", 3: "working, under upgrade", 4: "fully working" },
            globalkey: true,
            placeholder: "Select status"
          }
        }
      });

      console.log("Form submission response:", response);

      if (response && response.success) {
        box.innerHTML = '';
      } else {
        console.error("Form submission failed:", response);
      }

    } catch (error) {
      console.error('Error generating or submitting form:', error);
    }
  } else {
    box.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', async function () {
await getermisloop();

document.getElementById("newermis").addEventListener("click", handleNewWSIForm);
})


 </script>