<link href="/admin/lib/editor/summernote.css" rel="stylesheet">
<script src="/admin/lib/editor/summernote.js"></script>

<div id="mainpage">
<a class="btn btn-success" href="/admin/user?sub=new">New User</a>

<?php if($this->sub=='superusers'){ ?>
    <a class="btn btn-primary" href="/admin/user">All users</a>
<?php }else{ ?>
    <a class="btn btn-primary" href="/admin/user?sub=superusers">Superusers</a>
<?php } ?>

<button class="btn btn-info" id="groups">Usergroups</button>

<div class="post_container">

<?php if($this->uid!=""){ ?>
<!-----------------------------------------------------
                    USER EDIT
------------------------------------------------------>
    <span style="float:left;" onclick="gs.ui.goto(['previous','user','id',s.get.uid,'/admin/user?uid='])" class="next glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
    <span style="float:right" onclick="gs.ui.goto(['next','user','id',g.get.uid,'/admin/user?uid='])" class="next glyphicon glyphicon-chevron-right" aria-hidden="true"></span>

    <?php $sel= $this->db->f("SELECT user.*,usergrp.name as usergrp FROM {$this->publicdb}.user
  LEFT JOIN {$this->publicdb}.usergrp ON user.grp=usergrp.id
    WHERE user.id=?",array($this->uid));
    ?>
    <div class="pagetitle" id="title"><?=$sel['name']?></div>
	<?php  $cols= $this->db->columns('user'); ?>
    <?=$this->form($this->mode,$cols,false,$sel)?>

<?php }elseif($this->sub=='new'){ ?>
    <!-----------------------------------------------------
                    USER NEW
    ------------------------------------------------------>

    <?=$this->form($this->mode,array('name','firstname','lastname','status','uri','grp'),true);?>

<?php }elseif($this->sub=='' || $this->sub=="superusers"){ ?>
<!-----------------------------------------------------
                    USER LIST
------------------------------------------------------>

    <div id="pagination" class="paginikCon"></div>

    <div class="table-container">
        <table class="styled-table"><thead>
                <tr class="board_titles">
                    <th><button onclick="gs.table.orderby(this);" class="orderby" id="order_id">id</button></th>
                    <th>img</th>
                    <th><button onclick="gs.table.orderby(this);" class="orderby" id="order_name">name</button></th>
                    <th><button onclick="gs.table.orderby(this);" class="orderby" id="order_name">fullname</button></th>
                    <th><button onclick="gs.table.orderby(this);" class="orderby" id="order_status">status</button></th>
                    <th><button onclick="gs.table.orderby(this);" class="orderby" id="order_uri">uri</button></th>
                    <th><button onclick="gs.table.orderby(this);" class="orderby" id="order_usergrpid">usergrp</button></th>
                    <th><button onclick="gs.table.orderby(this);" class="orderby" id="order_published">registered</button></th>
                    <th><button onclick="gs.table.orderby(this);" class="orderby" id="order_delete">delete</button></th>
                </tr></thead>
                <?php
                $supQ= $G['sub']=="superusers" ? "WHERE grp > 2":"";
                $sel= $this->db->fa("SELECT user.* FROM user $supQ ORDER BY user.id");
                ?>
                <tbody id="list1">
                <?php for($i=0;$i<count($sel);$i++){
                    $userid=$sel[$i]['id'];
                    ?>
                    <tr id="nodorder1_<?=$userid?>" style="cursor:move;">
                        <td id="id<?=$userid?>"><span id="id<?=$userid?>"><?=$userid?></span></td>
                        <td><img id="img<?=$userid?>" src="<?=$sel[$i]['img']!='' ? '/media/'.$sel[$i]['img'] : '/admin/img/user.png'?>" width="30" height="30"></td>
                        <td><a href="/admin/user?uid=<?=$sel[$i]['id']?>"><?=$sel[$i]['name']?></a></td>
                        <td><a href="/admin/user?uid=<?=$sel[$i]['id']?>"><?=$sel[$i]['firstname'].' '.$sel[$i]['lastname']?></a></td>
                        <td id="status<?=$userid?>"><span id="status<?=$userid?>"><?=$G['status'][$sel[$i]['status']]?></span></td>
                        <td><a href="/<?=$sel[$i]['uri']?>"><?=$sel[$i]['uri']?></a></td>
                        <td><?=$this->usergrps[$sel[$i]['grp']]?></td>
                        <td id="published<?=$userid?>"><?=date('Y-m-d H:i',$sel[$i]['registered'])?></td>
                        <td><button id="delete<?=$userid?>" value="<?=$userid?>" title="delete" class="btn btn-default btn-xs" >Delete</button></td>
                    </tr>
                <?php } ?>
                </tbody></table></div>


<?php }elseif($this->sub=="groups") { ?>
<!---------------------------------------------------------
                            GROUPS
---------------------------------------------------------->
   <!-- <button class="btn btn-info" id="newgroupsbtn">New Usergroup</button>-->
<?php $sel=$this->db->fa("SELECT * FROM usergrp"); ?>
    <table class="TFtable"><thead>
    <tr class="board_titles">
        <th>id</th>
        <th>name</th>
        <th>permissions</th>
    </tr>
        </thead>
    <tbody>
    <?php for($i=0;$i<count($sel);$i++){ ?>
        <tr>
            <td><?=$sel[$i]['id']?></td>
            <td><?=$sel[$i]['name']?></td>
            <td>
                <?php
                if($sel[$i]['id'] > 1){
                    $perm= json_decode($sel[$i]['permissions'],true);
                    foreach ($this->apages as $page){ ?>
                        <span style="margin-left:2%;margin-right:10px;float: left;"><?=$page?>
                            <input id="per-<?=$sel[$i]['id']?>-<?=$page?>" <?=!empty($perm) && in_array($page,$perm) ? "checked" :""?> type="checkbox" style="float: left;margin-right:4px;" >
</span>
                    <?php }} ?>
            </td>
        </tr>
    <?php } ?>
    </tbody></table>
<?php } ?>
</div>
</div>
<script>
/*updated:2020-01-29 20:20:34 user - v.0.73 - Author:Nikos Drosakis - License: GPL License*/

/*
@user Page Javascript-- Dashboard
developed by Nikos Drosakis
*/
 $('.wysiwyg').summernote();
 
$(document).ready(function() {
//set new post group

	/*********************************************
	 * TOP BUTTONS
	 ***********************************************/
	$("#newuserbtn").click(function(){location.href='/admin/user?sub=new';})
	$("#groups").click(function(){location.href='/admin/user?sub=groups';})

/*	$("#newgroupsbtn").click(function(){
		if(!$('#submitnewusergrp').html()) {
			$("<input class='form-control' placeholder='New usergroup name' id='newusergrp'><button class='btn btn-success' id='submitnewusergrp'>Create</button>").insertAfter(this)
		}else{
			$("#newusergrp").remove();
			$("#submitnewusergrp").remove();
		}
	})
	$(document).on('click',"#submitnewusergrp",function(){
		var grpname= $('#newusergrp').val().trim();
		if(grpname!=""){
			s.db().query('INSERT INTO usergrp (name) VALUES("'+grpname+'")',function(){
				location.reload();
			});
		}else{
			gs.ui.notify('danger','Please insert a usergroup name.')
		}
	})
*/
	/*********************************************
	 * USER EDIT
	 ***********************************************/
if(my.userid!=""){
	var table= 'user';

	$(document).on('keyup', "#name,#url,#email,#tel,#firstname,#lastname,#title,#seodescription", async function () {
		if (this.id == 'name') {
			$('#name').text(this.value)
		}		
		var value=this.value.trim();
		 const updateuser=awaitgs.api.maria.q(`UPDATE user SET ${this.id}=? WHERE id=?`,[value, my.userid]);
		  if(updateuser && updateuser.success){
         		gs.success("User updated!");
         		 }else{
         		gs.failed("User failed!");
         		 }
	})
	.on('change', "#status,#grp,#seopriority", function () {
		s.db().queryone(table, this, my.userid);
	})
	.on('click', "#submit_content", async function () {
		var row =this.id.replace('submit_', '');
		var value=$('#' + row).summernote('code');
		 const updateuser=awaitgs.api.maria.q(`UPDATE user SET ${row}=? WHERE id=?`,[value,my.userid]);
		 if(updateuser && updateuser.success){
		gs.success("User updated!");
		 }else{
		gs.failed("User failed!");
		 }
	})
	//uploader
	var mediagroup=3; //user
       gs.media.uploader(my.mode, mediagroup, my.userid,function(data){console.log(data)});
}else if(my.sub=='new'){
	/*********************************************
	 * USER NEW
	 ***********************************************/
//greeklish (sql name is set as unique)
	$(document).on('keyup', "#name", function () {
		this.value=s.greeklish(this.value)
	})	
	$(document).on('click', "#submit_user", function () {
		var formid=$("#form_user");
		event.preventDefault();
		var form = formid.serializeArray();
		form[s.size(form)]={name:'registered',value:gs.time()}
		form[s.size(form)]={name:'modified',value:gs.time()}
		console.log(form)
		$.post(s.ajaxfile, form, function (data, textStatus, jqXHR) {
			console.log(data)
			if (data == 'no') {
				console.log(textStatus)
				console.log(jqXHR)
				gs.ui.notify("danger","Form cannot be submitted or username exists.");
			} else {
				// console.log(data)
				location.href="/admin/user?uid="+data;
				// formid.reset();
			}
		},'json');
	})

}else if(my.sub=='groups'){
	/*********************************************
	 * USER groups
	 ***********************************************/
	$(document).on("click","input[id^='per']",function(){
		var e=s.explode('-',this.id),
		id= e[1],
		page= e[2];
		
	if(!$(this).is(':checked')){		
		s.api.maria.q("UPDATE usergrp SET permissions= JSON_REMOVE(permissions, REPLACE(JSON_SEARCH(permissions, 'one', '"+page+"'),\'\"','')) WHERE id="+id,function(data){console.log(data)});
	}else{
		s.api.maria.q("UPDATE usergrp SET permissions= JSON_ARRAY_APPEND(permissions, '$', '"+page+"') WHERE id="+id,function(data){console.log(data)});
	}
		
		/*
		value= this.checked ? 1 : 0;		
		s.db().func('fetchList1', "permissions,usergrp",function (p) {
			
			if(p.length >0){
				p =gs.json_decode(p);
			console.log(p)	
				if(value==1) {
					p.push(page);
				}else{
					var index = p.indexOf(page);
					if (index > -1) {
						p.splice(index, 1);
					}
				}				
				
				s.db().query("UPDATE usergrp SET permissions='"+s.json_encode(p)+"' WHERE id="+id);
			}else{
				pageq= '["'+page+'"]';
				s.db().query("UPDATE usergrp SET permissions='"+pageq+"' WHERE id="+id);
			}
		})
		*/
	})

}

	 //delete
	$(document).on('click', "button[id^='delete']", async function () {
		var id=this.id.replace('delete','');
		s.confirm("This user will be deleted. Are you sure?",function(res){
		if(res){
  	   const data = await gs.api.maria.q(`DELETE FROM ${G.publicdb}.user WHERE id=?`,[id]);
		if(data!='No'){
			$('#nodorder1_'+id).hide();
			}else{
			s.modal("problem deleting");
			}
			 })
			 }
		})	

})
</script>