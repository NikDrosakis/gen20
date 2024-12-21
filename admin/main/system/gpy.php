<style>
#kronos-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
width:100%;
}


.kronos-input, .kronos-textarea, .kronos-select {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 10px;
    border:none;
}

.kronos-textarea {
    height: 100px;
}

label {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.kronos-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.kronos-version {
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
        <input id="kronos_panel" class="red indicator">
        <a href="/system/kronos"><span class="glyphicon glyphicon-transfer"></span>GPY</a>
        </h3>
    <button id="newkronos" class="bare right" style="float:right">New Integration</button>
<blockquote>Python Resources</blockquote>

	<div id="newkronosbox"></div>
	<div id="newkronos_container"></div>
	 <div id="kronos-container"></div>
<script>
//WORKER BUFFER METHOD combined with APY
async function getkronosloop(){
 const loop= await gs.api.gpm.fa("SELECT * FROM actiongrp ");
if(loop.success){
    var html='';
    for(var i in loop.data) {
    html +=`<div class="gs-box">
        <div class="kronos-header">
            <label style="color:darkblue">ID: ${loop.data[i].id}</label>
            <span class="kronos-version">Created: ${gs.date('Y-m-d',loop.data[i].added)}</span>
            <span class="kronos-version">Modified: ${gs.date('Y-m-d',loop.data[i].updated)}</span>
        </div>
        <label style="color:darkblue" for="kronos-name-<?=$id?>">${loop.data[i].name}</label>
        <label style="color:darkblue" for="kronos-name-<?=$id?>">${loop.data[i].company}</label>
    </div>`;
    }
    }    else{
             html ="No results";
    }
document.getElementById('kronos-container').innerHTML = html;
}
document.addEventListener('DOMContentLoaded', function () {
getsaturnloop();
})


 </script>