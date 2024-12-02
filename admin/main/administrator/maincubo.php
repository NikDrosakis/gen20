<style>
#maincubo-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px; 
    padding: 10px;
    box-sizing: border-box;
    position: relative;
z-index:0;
}

.maincubo-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 20px; /* Gap between the boxes */
    margin: 20px 0;
}


.maincubo-input, .maincubo-textarea, .maincubo-select {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 10px;
    border:none;
}

.maincubo-textarea {
    height: 100px;
}

label {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.maincubo-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
       font-size: 13px;
}

.maincubo-version {
background-color: #4CAF50;
    color: white;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 1em;
    margin: 2px;
    float:left;
}
</style>
<h3>
    <input id="maincubo_panel" class="red indicator">
    <span class="glyphicon glyphicon-th-large"></span>
    <a href="/cms/maincubo">Cubos Management</a>
</h3>
<button class="bare right" id="create_new_maincubo"><span class="glyphicon glyphicon-plus"></span>New Cubo</button>
    <a href="/cms/layout"><span class="glyphicon glyphicon-edit"></span>Layout</a>
        <button onclick='location.href="/cms/menu"' class="bare" id="groups">Menu</button>
<!--------NEW BOX-------------->
<div id="new_maincubo_box"></div>

<!---------TABS MENU ------------>
    <ul class="tabs maincubo_tabs">
        <li class="tab-link current" data-tab="tab-cubos_table" onclick="tab(this)" >Cubos Table</li>
        <li class="tab-link" data-tab="tab-cubos_list" onclick="tab(this)" >Cubos List</li>
    </ul>

    <div id="tab-cubos_list" class="tab-content">
    <!--------BOX CONTAINER-------------->
     <div id="maincubo-container"></div>
    </div>
<!---------TABS CONTAINERS ------------>
    <!-- Form for adding a new slide -->
    <div id="tab-cubos_table class="tab-content current">
    <!----BUILD automatic TABLE-->
    </div>

<!--------TABLE CONTAINER-------------->
<script>
(function(){
let table="maincubo";
let newformlist= {
                   0: {row: 'name',placeholder: "Give a Title"},
                   1: {row: 'created',type:'hidden',value: gs.date('Y-m-d H:i:s')},
                  };
})()
</script>

<script>
function template(loopi){
var html=`
        <span class="maincubo-version">v${loopi.version}</span>
        <div class="maincubo-header">
        <label style="color:darkblue">ID:${loopi.id}</label>
        <span class="maincubo-version">Systems Used:${loopi.system_used}</span>
        <span class="maincubo-version">Layout Views:${loopi.layout_views}</span>
        <span class="maincubo-version">Total Duration:${loopi.total_duration}</span>
        <span class="maincubo-version">Provide Admin:<input style="float:left" type="checkbox" switch="" class="switcher"></span>
        </div>`
        if(loopi=='new'){
html+=  `<input id="namecorrect" class="red indicator">
<input type="text" name="name" onkeyup="checkname(this.value)" required placeholder="Enter Name" id="maincubo-name-${loopi.id}" class="maincubo-input" value="">`
        }else{
 html+= `<h3 style="color:darkblue" for="maincubo-name-${loopi.id}">${loopi.name}</h3>`
        }
html+= `<textarea name="description" required id="maincubo-description-${loopi.id}" class="maincubo-textarea" placeholder="Enter description">${loopi.description || ''}</textarea>
        <button class="arrow-toggle button2" onclick="gs.ui.opener('body${loopi.id}')">&#9654;</button>
        <div class="maincubo-body" style="display:block" id="body${loopi.id}">
        <label style="display:block;clear:left" for="maincubo-status-${loopi.id}">Status:</label>
        <select id="maincubo-status-${loopi.id}" name="status" class="maincubo-select">`
        for(var j in G.status){
html+= `<option value="${j}" ${j==loopi.status ? 'selected="selected"':''} >${G.status[j]}</option>`
        }
 html+= `</select>
        <label style="display:block;clear:left" for="maincubo-valuability-${loopi.id}">Valuability (1-10):</label>
        <input type="number" name="valuability" id="maincubo-valuability-${loopi.id}" class="maincubo-input" value="${loopi.valuability || 0}">
        <label style="display:block;clear:left" for="maincubo-ideally-${loopi.id}">Ideally:</label>
        <textarea name="ideally" id="maincubo-ideally-${loopi.id}" class="maincubo-textarea" placeholder="Enter ideally">${loopi.ideally || ''}</textarea>
        </div>
        `;
        return html;
}
async function checkname(name){
const checkname= await gs.api.maria.f("SELECT count(name) as num FROM maincubo where name=?",[name]);
 if(name.length>2 && checkname.success && checkname.data.num==0){
document.getElementById('namecorrect').className = 'green indicator';
 }else{
document.getElementById('namecorrect').className = 'red indicator';
 }
}
async function getcuboloop(){
 const loop= await gs.api.db.fa("SELECT * FROM cubo");
let html='';
    let table='maincubo';
if(loop.success){
    if(loop.data.length>0){
        for(var i in loop.data) {
    var loopi=loop.data[i];
   // var line= await gs.form.template(template(loopi),"cubos","maria");
    //    html +=line
     html +=`<div id="${table}box${loopi.id}" class="${table}-box">
           <span class="maincubo-version">v${loopi.version}</span>
            <h3 style="color:darkblue" for="maincubo-name-${loopi.id}">${loopi.name} #ID${loopi.id}</h3>
           <span class="maincubo-version">Provide Admin<br/>
           <input style="float:left" type="checkbox" switch=""  ${loopi.has_admin ? "checked":""} value=${loopi.has_admin ? 1:0} class="switcher"></span>
            <div class="maincubo-header">
            <span class="maincubo-version">Systems Used:${loopi.system_used}</span>
            <span class="maincubo-version">Layout Views:${loopi.layout_views}</span>
            <span class="maincubo-version">Total Duration:${loopi.total_duration}</span>
            </div>
            <textarea name="description" id="maincubo-description-${loopi.id}" class="maincubo-textarea" placeholder="Enter description">${loopi.description || ''}</textarea>
            <button class="arrow-toggle button2" onclick="gs.ui.opener('body${loopi.id}')">&#9654;</button>
            <div class="maincubo-body" style="display:none" id="body${loopi.id}">
            <label style="display:block;clear:left" for="maincubo-status-${loopi.id}">Status:</label>
            <select id="maincubo-status-${loopi.id}"  name="status" class="maincubo-select">`
            for(var j in G.status){
    html+= `<option value="${j}" ${j==loopi.status ? 'selected="selected"':''} >${G.status[j]}</option>`
            }
     html+= `</select>
            <label style="display:block;clear:left" for="maincubo-valuability-${loopi.id}">Valuability (1-10):</label>
            <input type="number" name="valuability" id="maincubo-valuability-${loopi.id}" class="maincubo-input" value="${loopi.valuability || 0}">
            <label style="display:block;clear:left" for="maincubo-ideally-${loopi.id}">Ideally:</label>
            <textarea name="ideally" id="maincubo-ideally-${loopi.id}" class="maincubo-textarea" placeholder="Enter ideally">${loopi.ideally || ''}</textarea>
            <button class="button" id="delete-${table}-${loopi.id}">Delete ${table}</button>
            </div></div>
            `;
  		}
        }else{
        fail();
        }
    }else{
         html ="No results";
    }
  // Check if element exists before assigning HTML
        const container = document.getElementById('maincubo-container');
        if (container) {
            container.innerHTML = html;
        } else {
            console.error('Element "maincubo-container" not found.');
        }
}

document.addEventListener('DOMContentLoaded', async function () {
const create_loop= await getcuboloop();
})

document.addEventListener('click', async function (e) {
    if (e.target && e.target.tagName === 'BUTTON' && e.target.id.startsWith('delete-maincubo-')) {
        var id = e.target.id.split('-')[2];
        var query = `DELETE FROM maincubo WHERE id=?`;
        console.log(query);
        try {
            const deletecubo = await gs.api.maria.q(query, [id]);
            if (deletecubo && deletecubo.success) {
               gs.success();
                document.getElementById(`maincubobox${id}`).remove();
            } else {
               gs.fail();
            }
        } catch (error) {
            console.error(error);
           gs.fail();
        }
    }
});

document.addEventListener('input', function (e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') && e.target.id.startsWith('maincubo-')) {
        var exp = e.target.id.split('-');
        var id = exp[2];
        var col = exp[1];
        if (id != 0 && id != 'undefined') {
            var query = `UPDATE maincubo SET ${col}=? WHERE id=?`;
            console.log(query);
            gs.api.maria.q(query, [e.target.value, id]);
        }
    }
});

</script>