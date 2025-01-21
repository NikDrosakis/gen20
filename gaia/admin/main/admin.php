<style>
.widget-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
width:100%;
}

.widget-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px; 
    margin: 10px 0;

}

.widget-box {
    border: 1px solid #ccc;
    padding: 15px;
    background-color: aliceblue;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    width: 24.3%;
    box-sizing: border-box;
    margin-bottom: 20px;
}

.widget-input, .widget-textarea, .widget-select {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 10px;
    border:none;
}

.widget-textarea {
    height: 100px;
}

label {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 5px;
}

.widget-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.widget-version {
background-color: #4CAF50;
    color: white;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 1em;
    margin: 2px;
}

/* Responsive Design */
@media screen and (max-width: 768px) {
    .widget-box {
        width: calc(50% - 20px);
    }
}

@media screen and (max-width: 480px) {
    .widget-box {
        width: 100%;
    }
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
    <input id="admin_panel" class="red indicator">
    <a href="/admin"><span class="glyphicon glyphicon-stats"></span>GPM</a>
    </h3>
<a href="/kronos">GPY</a><button id="newkronos" class="bare right">Versioning</button>
<a href="/kronos">GPY</a><button id="newkronos" class="bare right">Packaging</button>
<a href="/kronos">GPY</a><button id="newkronos" class="bare right">CI/CD</button>
<blockquote>Connect with github</blockquote>
 <div class="widget-container">
     <?php
     //$sel= $this->getSystemLogsBuffer();
       //        include ADMIN_ROOT."main/admin/system_buffer.php";
               ?>
     </div>
<script>
//s.ajaxfile = "/index.php";
          //    var params={a: 'system_get'};
            //  params.file=G.ADMIN_ROOT+"main/admin/xhr";
             // worker(params,function(res){
       //      $(".widget-container").html(res.html);
         //       opener('globals_menu');


              //},'GET');
document.addEventListener('input', function(event) {
    // Check if the event target matches the selector
    if (event.target.matches("textarea[id^='widget-'], input[id^='widget-'], select[id^='widget-']")) {
        const exp = event.target.id.split('-');
        const id = exp[2];
        const col = exp[1];
        const query = `UPDATE systems SET ${col}=? WHERE id=?`;

        console.log(query);

        // Call the API and handle the response
        gs.api.maria.q(query, [event.target.value, id])
            .then(res => {
                console.log(res);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});

</script>