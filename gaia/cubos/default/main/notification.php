<style>
    header {
        font-size: 1.5em;
        margin-bottom: 20px;
        text-align: center;
    }

    .form-section {
        margin-bottom: 15px;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }

    input, select, textarea {
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    textarea {
        resize: vertical;
    }

    #preview {
        padding: 10px;
        border: 1px solid #ccc;
        background-color: #fff;
        min-height: 50px;
        margin-top: 5px;
    }

    button#execute {
        width: 100%;
        padding: 10px;
        font-size: 1em;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button#execute:hover {
        background-color: #0056b3;
    }

</style>
  <h3>
      <input id="notificationweb_panel" class="red indicator">
      <span class="glyphicon glyphicon-transfer"></span>
      Notification Send
      </h3>
    <div class="form-section">
        <label for="type">Message Type</label>
        <select id="type">
            <option value="activity">Activity</option>
            <option value="command">Command</option>
            <option value="notify">Notify</option>
            <option value="chat">Chat</option>
            <option value="html">HTML</option>
        </select>
    </div>

    <div class="form-section">
        <label for="cast">Broadcast Type</label>
        <select id="cast">
            <option value="broadcast">All Users</option>
            <option value="one">One User</option>
        </select>
    </div>

    <div class="form-section">
        <label for="userid">User ID (for "one" cast)</label>
        <input id="userid" type="text" placeholder="Enter User ID" disabled>
    </div>

    <div class="form-section">
        <label for="rule">Rule</label>
        <input id="rule" type="text" placeholder="Enter Rule">
    </div>

    <div class="form-section">
        <label for="system">System</label>
       <?php $systems = $this->db->flist("select id,name from gen_admin.systems ");?>
        <select id="system">
        <option>Select system</option>
        <?php foreach($systems as $smid =>$sm){ ?>
        <option value="<?=$sm?>"><?=$sm?></option>
        <?php } ?>
        </select>
    </div>

    <div class="form-section">
        <label for="verba">Message Text</label>
        <textarea id="verba" placeholder="Enter Text"></textarea>
    </div>

    <div class="form-section">
        <label for="preview">Message Preview</label>
        <div id="preview"></div>
    </div>

    <button id="execute">Send Message</button>
<script>
    function date(n,t){
        var e,r,o=["Sun","Mon","Tues","Wednes","Thurs","Fri","Satur","January","February","March","April","May","June","July","August","September","October","November","December"],
            u=/\\?(.?)/gi,i=function(n,t){return r[n]?r[n]():t},c=function(n,t){for(n=String(n);n.length<t;)n="0"+n;return n};
        return r={d:function(){return c(r.j(),2)},D:function(){return r.l().slice(0,3)},j:function(){return e.getDate()},
            l:function(){return o[r.w()]+"day"},N:function(){return r.w()||7},S:function(){var n=r.j(),t=n%10;return t<=3&&1==parseInt(n%100/10,10)&&(t=0),["st","nd","rd"][t-1]||"th"},
            w:function(){return e.getDay()},z:function(){var n=new Date(r.Y(),r.n()-1,r.j()),t=new Date(r.Y(),0,1);return Math.round((n-t)/864e5)},
            W:function(){var n=new Date(r.Y(),r.n()-1,r.j()-r.N()+3),t=new Date(n.getFullYear(),0,4);return c(1+Math.round((n-t)/864e5/7),2)},F:function(){return o[6+r.n()]},
            m:function(){return c(r.n(),2)},M:function(){return r.F().slice(0,3)},n:function(){return e.getMonth()+1},t:function(){return new Date(r.Y(),r.n(),0).getDate()},
            L:function(){var n=r.Y();return n%4==0&n%100!=0|n%400==0},o:function(){var n=r.n(),t=r.W();return r.Y()+(12===n&&t<9?1:1===n&&t>9?-1:0)},Y:function(){return e.getFullYear()},
            y:function(){return r.Y().toString().slice(-2)},a:function(){return e.getHours()>11?"pm":"am"},A:function(){return r.a().toUpperCase()},B:function(){var n=3600*e.getUTCHours(),
                t=60*e.getUTCMinutes(),r=e.getUTCSeconds();return c(Math.floor((n+t+r+3600)/86.4)%1e3,3)},g:function(){return r.G()%12||12},G:function(){return e.getHours()},
            h:function(){return c(r.g(),2)},H:function(){return c(r.G(),2)},i:function(){return c(e.getMinutes(),2)},s:function(){return c(e.getSeconds(),2)},
            u:function(){return c(1e3*e.getMilliseconds(),6)},e:function(){throw"Not supported (see source code of date() for timezone on how to add support)"},
            I:function(){return new Date(r.Y(),0)-Date.UTC(r.Y(),0)!=new Date(r.Y(),6)-Date.UTC(r.Y(),6)?1:0},O:function(){var n=e.getTimezoneOffset(),t=Math.abs(n);
                return(n>0?"-":"+")+c(100*Math.floor(t/60)+t%60,4)},P:function(){var n=r.O();return n.substr(0,3)+":"+n.substr(3,2)},T:function(){return"T"},Z:function(){return 60*-e.getTimezoneOffset()},
            c:function(){return"Y-m-d\\TH:i:sP".replace(u,i)},r:function(){return"D, d M Y H:i:s O".replace(u,i)},U:function(){return e/1e3|0}},this.date=function(n,t){return e=void 0===t?new Date:t instanceof Date?new Date(t):new Date(1e3*t),n.replace(u,i)},this.date(n,t)};

    function updatePreview() {
        const preview = document.getElementById('preview');
        const type = document.getElementById('type').value;
        const verba = document.getElementById('verba').value;
        const cast = document.getElementById('cast').value;
        const userid = document.getElementById('userid').value;
        const rule = document.getElementById('rule').value;
        const system = document.getElementById('system').value;

        let previewText = `Type: ${type}<br>`;
        previewText += `Cast: ${cast}<br>`;
        if (cast === 'one') previewText += `User ID: ${userid}<br>`;
        if (rule) previewText += `Rule: ${rule}<br>`;
        if (system) previewText += `System: ${system}<br>`;
        previewText += `Verba: ${verba}<br>`;
        previewText += `Time: ${date('Y-m-d H:i:s')}<br>`;

        preview.innerHTML = previewText;
    }

    // Enable or disable the User ID input based on cast type
    document.getElementById('cast').addEventListener('change', function() {
        const userInput = document.getElementById('userid');
        userInput.disabled = this.value !== 'one';
        updatePreview();
    });

    document.getElementById('type').addEventListener('change', updatePreview);
    document.getElementById('rule').addEventListener('input', updatePreview);
    document.getElementById('system').addEventListener('change', updatePreview);
    document.getElementById('verba').addEventListener('input', updatePreview);

    document.getElementById('execute').addEventListener('click', () => {
        const data = {
            userid: userid || 0,
            type: document.getElementById('type').value,
            cast: document.getElementById('cast').value,
            rule: document.getElementById('rule').value,
            system: document.getElementById('system').value,
            verba: document.getElementById('verba').value,
            time: date('Y-m-d H:i:s')
        };

        if (data.cast === 'one' && !document.getElementById('userid').disabled) {
            data.userid = document.getElementById('userid').value;
        }
        console.log(data);
        ws.send("ermis",JSON.stringify(data));
    });

    // Initialize preview
    updatePreview();

</script>