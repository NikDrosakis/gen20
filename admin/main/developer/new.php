<h3>New Installation</h3>
<form id="gaiaform_install" method="POST">
    <label>Domain name and folder</label>
    <input class="form-control" placeholder="domain name" onkeyup="$('#email').val('webmaster@'+this.value);var dbname='gs_'+this.value.replace(/\./g,'');$('#dbname').val(dbname)"  name="domain_name" id="domain_name" class="sectionSimulate1b">
    <input type="hidden" name="type" id="domtype" value="<?=MAIN_SETUP_EXIST ? 'main':'parent'?>">
    <input class="form-control" placeholder="ip" name="ip" value="<?=$_SERVER['REMOTE_ADDR']?>">
    <input class="form-control" placeholder="superuser" name="suser" value="<?=$_SERVER['USER']?>">
    <input class="form-control" placeholder="email" name="email" id="email" value="">
    <input class="form-control" placeholder="domain folder"  name="domain_folder" value="<?=GAIABASE?>" class="sectionSimulate1b">
    <label>Insert Mysql username and password</label>
    <input class="form-control" placeholder="db host" name="dbhost" id="dbhost" value="localhost">
    <input class="form-control" placeholder="db name" id="dbname" name="dbname" value="">
    <input class="form-control" placeholder="db user"  name="dbuser" id="dbuser" value="<?=$_SERVER['USER']?>" class="sectionSimulate1b">
    <input class="form-control" placeholder="db password"  name="dbpass" id="dbpass" class="sectionSimulate1b"><br/>
    <button class="btn btn-success" id="setupDomain">Start Domain Installation</button>
</form>