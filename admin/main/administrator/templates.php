<!---@templates.php----->
<h3>Templates</h3>

<table class="TFtable">
    <tbody>
    <tr class="board_titles">
        <th>id</th>
        <th>img</th>
        <th>Template</th>
        <th>Local date installed</th>
        <th>Local version</th>
        <th>Store date installed</th>
        <th>Store version</th>
        <th>domain</th>
        <th>new files rate</th>
        <th>changed files rate</th>
        <th>sync upload local to store</th>
    </tr>
    </tbody>
    <?php
    xecho($this->listTemplates());
    foreach($tree as $dom => $domarray){
        foreach(glob(GAIABASE.$dom."/templates/*") as $template){
            $name=basename($template);
            $PATH=REFERER.$dom."/templates/$name";
            $sim=$setup->templatesSimilar($template,$this->API_TEMPLATESURI);
            $version=jsonget("$template/template.json")['version'];
            $newver=number_format(floatval($version)+0.01, 2, '.', '');
            ?>
            <tbody>
            <tr>
                <td>id</td>
                <td><img src="<?="$PATH/screenshot.png"?>" style="width:50px"></td>
                <td><?=$name?></td>
                <td><?=date('Y-m-d H:i',filemtime($template))?></td>
                <td><?=$version?></td>

                <td><?=date('Y-m-d H:i',filemtime("/var/www/templates/$name"))?></td>
                <td><?=jsonget("/var/www/templates/$name/template.json")['version']?></td>
                <td><?=$dom?></td>
                <td><?=$sim['new_files_rate']?></td>
                <td><?=$sim['changed_files_rate']?></td>
                <td><?php if($sim['new_files_rate']> 0.00 || $sim['changed_files_rate']>0.00){ ?>
                        <button version="<?=$newver?>" id="synctemplate_<?=$dom?>_<?=$name?>" class="btn btn-danger">Sync to <?=$newver?></button>
                    <?php } ?>
                </td>
            </tr>
            </tbody>
        <?php }} ?>
</table>

<?php
/*function demo($tmp){ return '{
"name":"'.$tmp.'",
"version":1.0,
"summary": "Template details",
"designer": "HTML5 UP",
"developer": "Nikos Drosakis"
}';
}
*/
//$sup=new Setup();
//xecho($setup->isOs()); linux and windows ssh installation with php

	//$sup=$setup->gaia_install($c,$b);
	//echo $sup ? json_encode("ok") : json_encode($sup);
	

?>
<div id="mainpage">

<div id="installed" style="display:block;padding: 10px">
    <h3>Installed</h3>
	<span id="installed_sum" class="badge badge-danger"><?=count($this->listTemplates());?></span>
    <br/>
<?php    //THE LOOP OF INSTALLED TEMPLATES IN DOMAIN TEMPLATES FOLDER
    foreach ($this->templates as $temp){
        $template= jsonget($this->TEMPLATESURI.$temp.'/template.json');
        ?>
        <div id="box<?=$temp?>" class="box" style="background:#<?=$temp==$G['template'] ?'e7f9e5':'fbedda'?>">
            <span id="activeLabel<?=$temp?>" class="label label-success" style="display:<?=$temp==$this->G['template']?'inline-block':'none'?>;width: 78%;float: left;margin-right: 2px;">active</span>
            <span class="label label-default" style="float:right">v.<?=$template['version']?></span>

            <div class="title"><?=$template['name']!='' ? $template['name']:$temp?></div>

            <img class="img-thumbnail" style="width: 100%;height: 100px;" src="<?=link_exist(SITE_ROOT."templates/$temp/screenshot.png") ? "/templates/$temp/screenshot.png" : "/admin/img/templates.png"?>" width="160" height="160">
            <div class="details">
                <div><?=$template['summary']?></div>
                <div>Updated:<?=$template['updated']?></div>
                <div>Permissions:
                    <?php
                    $acceptable_perm=array('0777','0775');
                    echo substr(sprintf('%o', fileperms($this->TEMPLATESURI.$temp)), -4);
                    if (!in_array(substr(sprintf('%o', fileperms($this->TEMPLATESURI.$temp)), -4),$acceptable_perm)){ ?>
                        <button class="btn btn-xs" onclick="s.chmod('<?=$this->TEMPLATESURI.$temp?>','0777');location.reload()" class='red'>Fix</button>
                    <?php }else{ ?>
                        <span class='green'>OK</span>
                    <?php } ?>
                </div>
            </div>
            <div class="buttonBox">
                <a class="btn btn-xs btn-info preview" data="<?=$this->TEMPLATESPATH.$temp?>/index.html">Preview</a>
                <button style="<?=$temp!=$this->template ?'display:inline':'display:none'?>" class="btn btn-xs btn-success" id="binstall<?=$temp?>">Activate</button>
                <button class="btn btn-xs btn-danger" style="display:<?=$temp!=$this->template ?'inline':'none'?>" id="uninstall<?=$temp?>">X</button>
            </div>
        </div>

    <?php } ?>
</div>

<?php 
/*
ok - get the list from couchdb templates for latest versions and template.json saved there

use php form to get copysshfile(template) => to new method

installsshtemplate(template) [add untar to template folder preserving files if exist]
//in UPDATE PROCESS
//JUST REFRESH NEWER FILES    
*/
?>
<div style="display:block;clear:both;padding: 10px;">
    <div class="gs-title" style="margin: 8px;">Αvailable</div>
	<span id="available_sum" class="badge badge-danger"></span
    <br/>
    <div id="templates-available" style="margin: 8px;"></div>
</div>

</div>
<script>
/*updated:2020-01-29 20:20:34 templates - v.0.73 - Author:Nikos Drosakis - License: GPL License*/

//batch create version template couch doc 
function add2couch(template,ver,sum){	
	var created=String(s.date('Y-m-d H:i'));
	var newdata={name:template,summary: sum, created: created,version:ver,"designer": "Nikos Drosakis",
			"developer": "Nikos Drosakis"};
	var _id= template+"-"+ver; 
	console.log(newdata)
	//admin:n130177!@
	gs.cors("https://api.nikosdrosakis.gr:6984/templates/"+_id,JSON.stringify(newdata),function(res){ console.log(res);},'PUT');
}
/*
s.cors('https://parapera.gr/php/?method=templates', {}, function (data) {
var templates=data.val;
		for (var t in templates) {
			add2couch(t,"0.5",templates[t].summary)
		}
})
*/
		//ΑVAILABLE TEMPLATE TO install
		//$.get("").done(function (data) {
		//COUCHDB NOT AVAILABLE
		/*
		s.cors('https://api.nikosdrosakis.gr:6984/templates/_all_docs?include_docs=true', {}, function (data) {
			var templates= data.rows;
			console.log(templates)
			//console.log(dat)
			//var templates =gs.array_diff(data.rows, G.templates),
			var box = '';
			var sum=0;
			//console.log(templates.length)
			for (var t in templates) {
				name=templates[t].doc.name;
				if(!s.in_array(name,G.templates)){
				sum+=1;
				var id=templates[t].id
				//var img=!G.API_TEMPLATESPATH + name + '/screenshot.png' ? '/admin/img/templates.png': G.API_TEMPLATESPATH + name + '/screenshot.png';
				var img=G.API_TEMPLATESPATH + name + '/screenshot.png';
				//console.log(jsonfile)	
				
					//console.log(data)
				box += '<div id="' + name + '" class="box" style="background:#dcfbfbd9">' +
					'<span id="activeLabel' + id + '" class="label label-success" style="display:none;width: 78%;float: left;margin-right: 2px;">active</span>' +
					'<span class="label label-default" style="float:right">'+templates[t].doc.version+'</span>' +
					'<div class="title">' + name +'</div>' +
					'<img id="template_'+name+'" class="img-thumbnail" style="width: 100%;height: 100px;" src="' +img+'" width="160" height="160">' +
					'<div class="details">' +
					'<div>'+templates[t].doc.summary+'</div>' + //summary
					'<div>Updated:'+templates[t].doc.created+'</div>' +
					'<div>Designer:'+templates[t].doc.designer+'</div>' +
					'<div>Developer:'+templates[t].doc.developer+'</div>' +
					'</div>' +
					'<div class="buttonBox">' +
					'<a class="btn btn-xs btn-info preview" title="'+id+'" data="'+G.API_TEMPLATESPATH + name + '/index.html">Preview</a>' +
					'<a style="margin: 0px 8px 0px 8px;" download class="btn btn-xs btn-info" title="'+id+'" href="'+G.API_TEMPLATESREPOPATH+templates[t].id+'.tar.gz"><span class="glyphicon glyphicon-download-alt" aria-hidden="true"></span></a>' +
					'<button style="display:inline;margin:3px" class="btn btn-xs btn-success" id="apinstall' + templates[t].id + '">Install</button>' +
					'</div></div></form>';					
		
				}
				}
				$('#templates-available').append(box);
				$('#available_sum').text(sum);
		});
*/
		$(document).on("click",".preview",function(data){
			event.preventDefault();						
			var link = $(this).attr('data');
			var title = $(this).attr('title');
			var name = title.split('-')[0];
			var photoimg ='<button id="screenshot_'+name+'">Screenshot</button>';
           gs.dialog({title: title ,success: {},callback: function () {},message: "<iframe id='iframe"+name+"' style='width:100%;float:left;position:relative;height:88vh;' frameBorder='0'  src='"+link+"' sandbox='allow-same-origin allow-scripts allow-popups allow-forms'></iframe>"})
		})
		.on("click","button[id^='screenshot_']",function(){
			var name= this.id.replace('screenshot_','');
			s.loadJS('/admin/lib/html2canvas.js','head',function(){
			html2canvas(document.getElementById("iframe"+name).contentWindow.document.body.innerHTML).then(canvas => {
			 dataURL = canvas.toDataURL("image/png");
               $("#template_"+name).attr('src',dataURL);               
                var expData = {a:"screenshot",b:"/var/www/api/store/templates/"+name+"/screenshot.png",c:dataURL};
                $.post(s.ajaxfile, expData,function(data){
                    console.log(data)
                });
			});
			})
		})
/*
if in droserver (api in the same server with domain)
*/ 
		$(document)
			.on("click", "button[id^='apinstall']", function () {
				var template = this.id.replace('apinstall', '');
				var templatename =gs.explode('-',template)[0];
				//var command = 'bash '+G.GAIAROOT+'dsh/templates.sh "'+ G.API_TEMPLATESURI + template +'" "'+G.TEMPLATESURI+'"';
				//console.log(command)
			//	s.shell_exec(command,function(res){
				//	gs.ui.notify('info','Template installation',res)
				//});
				console.log({a:"template_install",b:template});
				$.get(s.ajaxfile,{a:"template_install",b:template},function(res){
					console.log(res);
					if(res[0]=="copied" && res[1]=="extracted"){
						//moveTo installed
						var thtml = $('#' + templatename).html();
						$('#installed').append('<div id="box' + templatename + '" class="box" style="background:#f9e5e5">' + thtml + '</div>');
						$('#' + templatename).remove();		
						//del setup entry
					//		s.db().query("INSERT INTO setup (name,created) VALUES('" + template + "','" +gs.time() + "')");
					}else if (res=='nossh'){
					gs.ui.notify("danger","SSH is not working on this system. Try download template and extract folder to domain/templates folder")
					}
				},"JSON")								
			});
	
// var file1=G.TEMPLATES+'dopetrope/index.html';
// var file2=G.TEMPLATES+'dopetrope/no-sidebar.html';
// var nheader=G.TEMPLATES+'dopetrope/header1.php';
// var nfooter=G.TEMPLATES+'dopetrope/footer1.php';
// function areEqual(arguments){
// 		var len = arguments.length;
// 		for (var i = 1; i< len; i++){
// 			if (arguments[i] === null || arguments[i] !== arguments[i-1])
// 				return false;
// 		}
// 		return true;
// }
//
// function equality(array,i){
// 	var equals=[];
// 	for (k in array) {
// 		equals.push(array[k][i]);
// 	}
// 	console.log(equals)
// 	return areEqual(equals)
// }
//
// 	//break html to pieces
// 	s.file.glob(G.TEMPLATES+'dopetrope/*.html',function(htmlfiles){
// 		// console.log(data)
// 	$.ajax({
// 		type: "POST",
// 		dataType: "json",
// 		url:gs.ajaxfile,
// 		data: {a: 'parsehtml', b: htmlfiles},
// 		success: function (data) {
// 			console.log(data)
// 			var html = [], array = [], nbody=[],equalityBool=[];
// 			for (i in data) {
// 				html[i] = $.parseHTML(data[i]);
// 				array[i] = [];
// 				for (j in html[i]) {
// 					if (html[i][j].nodeType != '3' && typeof (html[i][j].innerHTML) != 'undefined' && html[i][j].innerHTML != '') {
// 						array[i].push(html[i][j].innerHTML.trim())
// 					}
// 				}
// 				//gs.file.file_put_contents(nheader, gs.ui.sethead + '<title>' + array[k][i] + '</title>\n' +gs.file.htmldecode(array[k][i]) + '\n</head>\n<body>\n');
// 				//gs.file.file_put_contents(nbody1, array[i][2] + array[i][3])
// 				//gs.file.file_put_contents(nfooter, array[i][4])
// 				//check and create files
// 				nbody[i]=G.TEMPLATES+'dopetrope/file'+[i]+'.php';
// 				equalityBool[i]=equality(array,i);
// 			}
// 			console.log(equalityBool)
// 					// console.log(areEqual([array[0][0],array[1][0],array[2][0],array[3][0]]))
// 					// console.log(areEqual([array[0][1],array[1][1],array[2][1],array[3][1]]))
// 					// console.log(areEqual([array[0][2],array[1][2],array[2][2],array[3][2]]))
// 					// console.log(areEqual([array[0][3],array[1][3],array[2][3],array[3][3]]))
// 					// console.log(areEqual([array[0][4],array[1][4],array[2][4],array[3][4]]))
//
// 			}
// 	});
// 	});
//
// 	$('#main_window').append('<div id="newtemplates" style="display:block"></div>');

//new templates form

        $(document)
        //    .on("click", "#newtemplatesbtn", function () {
          //      location.href = '/admin/templates?sub=wizard';
//            })
            //uninstall
            .on("click", "button[id^='uninstall']", function () {
                var template = this.id.replace('uninstall', '');
               gs.confirm("Warning! Are you sure you want to delete the template <b>" + template + "</b>? This action will be irreversible.", function (res) {
                    if (res == true) {
					 	$.ajax({
					 		type: "GET",
					 	//	dataType: "json",
					 		url:gs.ajaxfile,
					 		data:  {a: 'template_uninstall', b: template},
							success: function (data) {
					 			console.log(data);
							//if (data == 'yes') {
                                //moveTo available
                                var thtml = $('#box' + template).html();
                                $('#templates-available').append('<div id="' + template + '" class="box">' + thtml + '</div>');
                                $('#box' + template).remove();
                                gs.ui.notify('success', 'Template ' + template + ' Uninstalled', 'successfully.')
                            //}
							},error:function(xhr,error){
								console.log(xhr)
								console.log(error)
							}
							})
					}
                    })
                })            
			/*setup
            .on("click", "button[id^='setup']", function () {
                var th=$(this);
            	var template = this.id.replace('setup', '');

                        $.get(s.ajaxfile, {a: 'template_setup', b: template}, function (data) {
                            console.log(data)
                            if (data == 'yes') {
                                th.attr('id','uninstall'+template).text('Uninstall');
                                gs.ui.notify('success', 'Template ' + template + ' Setup', 'successfully.')
                            }
                        })
            })
			*/
            //install
            .on("click", "button[id^='binstall']", function () {
                var template = G.template;
                var name = this.id.replace('binstall', '');
               gs.confirm("Your template will be changed. Are you sure?", function (res) {
                    if (res) {				
                        $.get(s.ajaxfile, {a: 'template_activate', b: name}, function (data) {
                           console.log({a: 'template_activate', b: name});
                           console.log(data);
						   if(data.trim()=='OK'){
							   gs.coo.del('template');
							   gs.coo('template',name);
							   G.template=name;
                                $('#binstall' + name).text('Edit');
                                $('#binstall' + template).show().text('Activate');
                                $('#box' + name).css('background', '#e7f9e5'); //green
                                $('#box' + template).css('background', '#f9e5e5'); //red
                                $('#activeLabel' + name).css('display', 'block');
                                $('#activeLabel' + template).css('display', 'none');
                                $('#uninstall' + name).css('display', 'none');
                                $('#uninstall' + template).css('display', 'block');
                            }
                        });
                    }
                })
            });
</script>