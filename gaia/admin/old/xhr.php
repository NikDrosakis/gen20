<-- @deprecated with core php8.3 API Gateway -->
<?php
///assign to default TEMPLATE database of assign to other requested
$db=!isset($_REQUEST['db']) ? $this->db : $this->{$_REQUEST['db']};

if($a=='exec'){
	echo exec("$b");
}elseif($a=='login'){
    $b= trim($b);
    $c= trim($c);
    echo json_encode($this->login($b,$c));
}elseif($a=='widget_get'){
    $select=$db->f("SELECT en FROM globs WHERE name=? AND tag=?",[$b,'widget']);
    echo !empty($select) ? json_decode($select,true) : json_decode('NO');

}elseif($a=='widget_save'){
    $b=$_POST['b'];
    $c=$_POST['c'];
    $select=$db->f("SELECT en FROM globs WHERE name=? AND tag=?",[$b,'widget']);
    if(!empty($select)){
        $query=$db->q("UPDATE globs SET en=? WHERE name=? and tag=?",[$c,$b,'widget']);
    }else{
        $query=$db->inse('globs',['name'=>$b,'lang'=>$c,'tag'=>'widget']);
    }
    echo !$query ? 'NO':'OK';
}elseif( $a=='gaia_update'){
	$sp=new Setup;
	$fileremote=AIMD5_API."repo/admin/$b.tar.gz";
	$filelocal=GAIABASE."$b.tar.gz";
	if($sp->copysshfile($fileremote,$filelocal)){
		$res=array();
		$res[]="copied";
		 $phar = new PharData($filelocal);
		// mkdir($this->TEMPLATESURI.$b, 0777, true);
		
		if($phar->extractTo(GAIAROOT)){
		$res[]="extracted"; // extract all files
		chmod(GAIAROOT, 0777);
		unlink($filelocal);
		}
	}else{ $res="nossh"; }
	echo json_encode($res);
	
}elseif($a=='chmod') {
    $c='0777';
    $sys_username= posix_getpwuid(fileowner(SITE_ROOT))['name'];
    $sys_groups=shell_exec("groups $sys_username");

    system ("chown -R $sys_groups $b");
    system ("chmod -R $c $b");

}elseif($a=='cli'){
    var_dump(shell_exec($b));

}elseif($a=='empty') {
    $_SERVER['cms']=$this;
    echo json_encode($_SERVER);
}elseif($a=='exec') {
    echo exec("$b");
}elseif($a=='shell_exec') {

    echo shell_exec($b);

}elseif($a=='unlink') {
    if(is_array($b)){
        foreach($b as $file){
            unlink($b);
        }
        echo 'yes';
    }else {
        if (unlink($b)) {
            echo 'yes';
        }
    }

}elseif($a=='glob'){
    echo json_encode(glob($b));

}elseif($a=='mkdir') {
    if(!mkdir($b, 0777, true)){
        echo 'no';
    };

}elseif($a=='sorting'){
    foreach ($_POST['order'] as $order => $id){$db->q($_POST['query'],array($order,$id));}

//}elseif($a=='dragcopy'){
    //  copy(TEMPLATES.$b.'/widgets/'.$c, TEMPLATES.$this->template.'/widgets/'.$c);
    //chmod(TEMPLATES.$this->widget.'/widgets/'.$c,0777);
    //echo $c;

}elseif($a=='media'){

//    require(SITE_ROOT.'gaia/lib/uploader/server/php/UploadHandler.php');
//    $upload_handler = new UploadHandler();

    //uploaded file info we need to proceed
    $name = $_FILES['attach_file']['name']; //file name
    $image_size = $_FILES['attach_file']['size']; //file size
    $image_temp = $_FILES['attach_file']['tmp_name']; //file temp

    //TO CREATE THE ICON IF IMAGE
    $thumb_square_size 		= 136; //Thumbnails will be cropped to 200x200 pixels
    $jpeg_quality 			= 90; //jpeg quality


    if(getimagesize($image_temp)){
        $image_size_info 	= getimagesize($image_temp); //get image size
        $image_width 		= $image_size_info[0]; //image width
        $image_height 		= $image_size_info[1]; //image height
        $image_type 		= $image_size_info['mime']; //image type
    }

    switch($image_type){
        case 'image/png':
            $image_res =  imagecreatefrompng($image_temp); break;
        case 'image/gif':
            $image_res =  imagecreatefromgif($image_temp); break;
        case 'image/jpeg': case 'image/pjpeg':
        $image_res = imagecreatefromjpeg($image_temp); break;
    }


    //CHECK NOT ALLOWED EXTENSIONS
    $not_allowed=array('exe','pif','application','gadget','msi','msp','com','scr','hta','cpl','msc','jar');

    //CHECK NAME
    $name = explode(".", $filename)[0];
    $ext = end((explode(".", $filename)));

    if(!in_array($ext,$not_allowed)){
        $tag=0;
        $key = true;
        while($key){
//                $filename=$tag !=0 ? greeklish($name).'_'.$tag.'.'.$ext : greeklish($filename).'.'.$ext;
            $filename=$tag !=0 ? greeklish($name).'_'.$tag : greeklish($filename);
            $count=$this->count_("id","media"," WHERE name=?",array($filename));
            if($count == 0) { $key = false; }
            $tag +=1;
        }

        //UPLOAD FILE
        //folder path to save resized images and thumbnails

        $image_save_folder 	= UPLOADS_ROOTPATH.$filename;
        if (move_uploaded_file($image_temp, $image_save_folder)){
//                $thumb_save_folder 	= UPLOADS_ROOTPATH_ICON.'icon_'.$filename;
            //if image create icon
            $img_extensions=array('jpg','jpeg','JPG','gif','png');
//                if (in_array($ext,$img_extensions)){
//                    Obj::crop_image_square($filename,$image_res, $thumb_save_folder, $image_type, $thumb_square_size, $image_width, $image_height, $jpeg_quality);
//                }

            $ins=$db->q("INSERT INTO media (uid,mediagrpid,filename,created) VALUES(?,?,?,?)",
                array($_COOKIE['GSID'], $_POST['mediagrpid'],$filename,time()));
            $query= $_POST['mediagrpid']==1 ? "UPDATE user SET img=? WHERE id=?"
                : ($_POST['mediagrpid']==3 ? "UPDATE post SET img=? WHERE id=?"
                    : "UPDATE globs SET en=? WHERE id=?");
            $ins2= $db->q($query,array(UPLOADS.$filename,$_POST['id']));
            ?>
            <img src="<?=UPLOADS.$filename;?>" style="height:250px;width:250px;">
            <?php
            @imagedestroy($image_res);

        }
    }
}elseif(in_array($a,array('f','fetchList1'))){
    $b= $a=='fetchList1' ? explode(',',$b) : $b;
    $sel= $db->$a($b);
    echo json_encode($sel);


    /*
     *      POST
     *
     * */
}elseif($a=='list'){
    //order table
    $table = isset($_REQUEST['table']) ? $_REQUEST['table'] :'';
    $order = isset($_REQUEST['order']) ? $_REQUEST['order'] :'';

    //pagination
    $pagin=$this->is('pagin'); //pagination num of result for each page
    $limit= " LIMIT ".(($_REQUEST['page'] - 1) * $pagin).",$pagin";

    //from to
    $date_filter = !empty($_REQUEST["date_filter"]) ?  $_REQUEST["date_filter"] : "";
    $from = !empty($_REQUEST["from"]) ?  $_REQUEST["from"] : "";
    $to = !empty($_REQUEST["to"]) ?  $_REQUEST["to"] : "";
    $fromto= $from!="" && $to!="" ? "WHERE ($table.$date_filter BETWEEN UNIX_TIMESTAMP('$from') AND UNIX_TIMESTAMP('$to'))" :"";

    //search
    $search = !empty($_REQUEST['search']) ? trim($_REQUEST['search']) :'';
    if ($search!=""){
        foreach($this->char_types($table) as $col){
            $s[]= "$table.$col LIKE '%$search%'";
        }
        $where= strpos("$fromto", 'WHERE')==false ?"WHERE":"AND";
        $searchQ= !empty($s) ? "$where (".implode(" OR ",$s).")":'';
    }

    //select by taxonomy
    $select= !empty($_REQUEST['select']) ? $_REQUEST['select'] :'';
    $selectby= !empty($_REQUEST['selectby']) ? $_REQUEST['selectby'] :'';
    $where= $fromto=='' && $searchQ=='' ?"WHERE":"AND";
    $selectQ= $select!="" ? "$where $selectby='$select'" :'';

    $sel=array();
    $query= $_REQUEST['q'];
    $groupby= !empty($_REQUEST['groupby']) ? $_REQUEST['groupby']:'';

    $sel['loop']= $db->fa("$query $fromto $searchQ $selectQ $groupby $order $limit");

    if(!empty($sel)){
        $sel['q'] = "$query $fromto $searchQ $selectQ $order $limit";
        $sel['count'] = $count = count($db->fa("$query $fromto $searchQ $selectQ $groupby"));
        echo json_encode($sel);
    }else{
        echo json_encode($sel);
    }
/*
}elseif($a=='fa'){
    $table = isset($_GET['table']) ? $_GET['table'] :'';
    $order = isset($_GET['order']) ? $_GET['order'] :'';
    $from = isset($_COOKIE["date{$table}from"]) ?  $_COOKIE["date{$table}from"] : "";
    $to = !empty($_COOKIE["date{$table}to"]) ?  $_COOKIE["date{$table}to"] : "";

    $where= strpos($b, 'WHERE')==false ?"WHERE":"AND";

    $fromto= $from!="" && $to!="" ? "$where $table.registered BETWEEN UNIX_TIMESTAMP('$from') AND UNIX_TIMESTAMP('$to')" :"";

    $search = !empty($_COOKIE['search']) ? trim($_COOKIE['search']) :'';

    if ($search!=""){
        foreach($db->char_types($table) as $col){
            $s[]= "$table.$col LIKE '%$search%'";
        }
        $where= strpos("$b $fromto", 'WHERE')==false ?"WHERE":"AND";
        $searchQ= !empty($s) ? $where."(".implode(" OR ",$s).")":'';
    }
    $pagin=$this->G['is']['pagin']; //pagination num of result for each page
    $limit= " LIMIT ".(($_REQUEST['page'] - 1) * $pagin).",$pagin";


    $sel= $db->$a("$b $fromto $searchQ $order $limit");

    if(!empty($sel)){
        $sel[0]['query'] = "$b $fromto $searchQ $order $limit";
        $sel[0]['count'] = $count = count($db->$a("$b $fromto $searchQ"));
        echo json_encode($sel);
    }else{
        echo json_encode("No");
    }

*/
}elseif($a=='querychain') {
    $querya= $db->q($b,array(),'id');
    $queryb= $db->q($c,array($querya));
    if($queryb){
        echo json_encode('yes');
    }

}elseif($a=='goto'){
    echo json_encode(explode(',',$c));

}elseif($a=='columns'){
  $sel = $db->columns($b);
	if($sel){echo json_encode($sel);}
}elseif($a=='query'){
    //a: 'query', value: obj.value,table:obj.table,where:obj.where
    //$table=$_REQUEST['table'];
    //$where=$_REQUEST['where'];
    //$value=$_REQUEST['value'];
    //$sel = $db->q("UPDATE $table SET $value WHERE $where");
    $sel = $db->q($c);
    if ($sel) {
        echo json_encode('Query executed');
    } else {
        echo json_encode('No');
    }

}elseif($a=='fa'){
echo json_encode($db->fa($_GET['query']));

}elseif($a=='fl'){
echo json_encode($db->fl($_GET['params'],$_GET['table']));

}elseif($a=='func'){
    //b:method c:param
    $cq = $b == 'fetchList1' ? explode(',', $c) : $c;
    if(in_array($b,array("name_not_exist","validate"))){
        $sel = $this->$b($cq);
        echo $sel ? json_encode("ok"): json_encode("no");
    }else{
        $sel = $db->$b($cq);
        echo $b=="q" && $sel ? json_encode("yes") : json_encode($sel);
        //echo $b!='get' ? ($b=='query' && $sel ? json_encode("yes") : json_encode($sel)) :$sel;
    }

}elseif($a=='get_imgs'){

    $sel= $db->fetchList(array('mediaview.linkid','media.filename'),"media",
        "LEFT JOIN mediaview ON media.id=mediaview.objid
        WHERE obj.mediagrpid=$c AND objview.linkid IN ($b)");

    echo json_encode($sel);

}elseif($a=='max') {
    echo (int)$db->fetchMax($b,$c);

}elseif($a=='inse') {
    $table =isset($_REQUEST['table']) ? $_REQUEST['table'] :"";
    unset($_REQUEST['table']);
    unset($_REQUEST['a']);
    $inserted_array=$_REQUEST;
    $insert=$db->inse($table,$_REQUEST);
    if(!$insert){echo json_encode("no");}else{echo json_encode($insert);}

}elseif($a=='new') {
    $table =isset($_POST['table']) ? $_POST['table'] :"";
    unset($_POST['a']);
    unset($_POST['table']);
    //    if($table !=""){
    //        $id=$db->fetchMax('id',$table)+1;
    //$pnames=array();
    //$pvalues=array();
    //        $pnames[]='id';
    //        $pvalues[]=$id;

    //        foreach($_POST as $name =>$value){
    //            if($name!='a' && $name!='table' && $name!='pass1'){
    //                $pnames[]=$name;
    //                $pvalues[]=$value;
    //            }}

    //        $pnamesQ=implode(',',$pnames);
    //        $pvaluesQ=implode(',',$pvalues);
    //        $ncol= count($pnames);
    //        $questionmarks =$this->pdo_questionmarks($table,$ncol);
    //        $qmk= implode(',', array_fill(0, count($pnames), '?'));
    //       $query ="INSERT INTO $table ($pnamesQ) VALUES ($qmk) ";
    //       $insert=$this->ins($table,array_combine($pnames,$pvalues),$id);
    //       $insert=$this->query($query,$pvalues);
    //xecho($_POST);
    $insert=$db->inse($table,$_POST);
    if(!$insert){echo "no";}else{echo $insert;}
    //        echo json_encode($query);
    //    }
    //    echo json_encode($_POST);
    /*
     * PAGEVARS
     * */
}elseif($a=='pvar') {
    //get max id+1
    //$new_pvar= (int)$db->fetchMax("id","globs")+1;
    //insert id
    $query= $db->q("INSERT INTO globs(name,tag) VALUES(?,?)",array($b,'pvar'));
    if (!$query){ echo "No";}

}elseif($a=='pvars_get') {
    $list=json_decode($b,true);
    //xecho($list);
    $implodedlist="'".implode("','",$list)."'";
    $impl=!empty($list) ? "WHERE name IN ($implodedlist)":'';

    $sel= $db->fa("SELECT * FROM globs $impl");
    //xecho($impl);
    if(!empty($sel)) {
        echo json_encode($sel);
    }

}elseif($a=='save-token'){  //FROM GOOGLE



}elseif($a=='login'){
    $b= trim($b);
    $c= trim($c);
    echo json_encode($this->login($b,$c));
    /*
    }elseif($a=='send_mail'){
        $data=array();
        $data['from']=		$_REQUEST['email'];
        $data['fromTitle']=	$_REQUEST['name'];
        $data['to']=		$this->is('site_mail');
        $data['toTitle']=	$this->is('site_mail');
        $data['subject']=	'mail send by user';
        $data['body']=		trim($_REQUEST['message']);
        $data['altbody']=	'mail body';
        if($this->send_mail($data)){
            echo json_encode('ok');
        }else{
            echo json_encode($this->send_mail($data));
        }
    */
}elseif($a=='getcontents'){
    foreach($b as $id){
        $array[]= file_get_contents(urldecode($id));
    }
    echo json_encode($array);

}elseif($a=='getcontent') {
    if($c=='encoded'){echo htmlspecialchars(file_get_contents($b));}else {
        echo file_get_contents($b);
    }
}elseif($a=='read_file') {
    $handle = @fopen($b, "r");
    if ($handle) {
        while (($buffer = fgets($handle, 4096)) !== false) {
            echo $buffer;
        }
        fclose($handle);
    }else{
        echo 'file cannot be read';
    }

}elseif($a=='parsehtml'){
    foreach($b as $file) {
        $array[] = file_get_contents($file);
    }
    echo json_encode($array);

}elseif($a=='save_html'){
    if (file_put_contents(urldecode($b), gajax . phphtmlspecialchars_decode($c) . PHP_EOL, FILE_APPEND)){
        echo 'ok';
    }else{
        echo urldecode($b);
    }

}elseif($a=='save_file'){
    if (file_put_contents(urldecode($b), htmlspecialchars_decode($c))){
        echo 'ok';
    }else{
        echo urldecode($b);
    }

    /*
     * ADMIN
     *
     * */
//create vars with cookies and sessions so that command is readable
//USAGE $mode, $key
}elseif($a=='mysqldump'){
    //domain
    $setup=new Setup();
    if(!empty($b)) {
        $replica = (int)$this->is('domain-version')+1;
        $setup->mysqldump($b, $replica);
    }else{
        //system
        $replica='gs-'.date('YmdHis').'.sql';
        $setup->mysqldump($this->DOMAIN, $replica,'gaia');
    }
    echo $replica;

}elseif($a=='backup'){
    $setup=new Setup();
    echo $setup->domainBackup($b,$c,rawurldecode($d));

}elseif($a=='sysbackup'){
    $thisdom= $this->DOMAIN;
    $setup=new Setup();
    echo $setup->sysBackup($thisdom,$b,rawurldecode($c));

}elseif ($a=='results') {
    $sqlfirst = strtolower(explode(' ', $c)[0]);
    if ($sqlfirst == 'select') {
        $sel = $this->sys($b)->fetchAll($c);
        if (!$sel || empty($sel)) {
            echo json_encode('No');
        } else {
            if (count($sel) > 1) {
                xecho(json_encode($sel));
            } else {
                echo($sel[0]);
            }
        }
    } elseif (in_array($sqlfirst, array('update', 'insert', 'delete'))) {
        $sel = $this->query($c);
        if ($sel) {
            echo json_encode('Query executed');
        } else {
            echo json_encode('No');
        }
    }
}elseif ($a=='update-all-dbs') {
    $res=array();
    $queries= str_replace("`", "", explode(';',$b));
    foreach($queries as $q) {
        if(trim($q)!='')
            foreach ($this->DOMAINS as $domid => $dom) {
                if ($this->conf[$dom]['mysql'] != 0) {
                    if ($this->sys($dom)->query($q)) {
                        echo "DB $dom updated OK!<br/>";
                    } else {
                        echo "Problem updating DB $dom!<br/>";
                    }
                }
            }
    }

}elseif ($a=='write_ini') {
    $ini=json_decode($b,true);
    if(write_ini($ini,$this->SERVEROOT.'setup.ini')){
        echo json_encode('yes');
    }

}elseif ($a=='newdomain') {
    //1) create domain folder with all subfolders and root files (if not exist)
    if(mkdir($this->SERVEROOT.$b,true)){
        echo $this->SERVEROOT.$b;
    };
    /*
     * SEO
     * */
}elseif($a=='deletexml'){
    $array=array('rss.xml','atom.xml','sitemap.xml');
    foreach($array as $arr){
        unlink(SITE_ROOT.$arr);
    }

}elseif($a=='createxml'){
    $seo=new SEO;
    foreach($this->xmls as $file) {
        $cr= $seo->create_xml($file);
    }
    echo $cr;

}elseif($a=='savexml'){
    if (file_put_contents(SITE_ROOT.$b.'.xml', html_entity_decode(ltrim($c)))) {
        echo 'ok';
    }
}elseif(in_array($a,array('title','uri','seodescription','seokeywords','seopriority','name','firstname','lastname'))) {
    $this->query("UPDATE $d SET $a=?, modified=? WHERE id=?", array($b, $time,$c));

    /*
     *  OBJECTS
     * */
//}elseif ($a=='select_obj'){
//    $sel= $this->fetch("SELECT filename FROM obj
//    WHERE linkid=? AND mediagrpid=? AND status=2",array($c,$b));
//    if(!empty($sel)) {
//        echo $sel['filename'];
//    }else{
//        echo 'no';
//    }
}elseif ($a=='insert_obj') {

    $upload_handler = new Upload();

    /*-------------------REGISTER---------------------------------*/
}elseif($a=='name_exist'){
    if($this->name_exist($b)==false){
        echo 'no';
    }else{
        echo 'yes';
    }

} elseif($a=='mail_validate'){
    if ($this->validate($b)==false){
        echo 'Email already exists!';
    }else{
        echo "Email address seems valid.";
    }
}elseif($a=='chart00'){
    $result=array(
        array('name'=>'nikos','bsvalue'=>34),
        array('name'=>'drosakis','bsvalue'=>45),
        array('name'=>'giorgos','bsvalue'=>45),
        array('name'=>'kostas','bsvalue'=>45)
    );
    echo json_encode($result);

}elseif($a=='chart02'){
    $result=array();
    $best=array(
        'nikos'=>12,
        'kyriakos'=>34,
        'giorgos'=> 45,
        'manolis'=> 22,
        'panagiotis'=> 22
    );
    foreach($best as $key => $counter_value){
        $result[]=array('name'=>$key,'value'=>$counter_value);
    }
    echo json_encode($result);
}elseif($a=='authenticate'){

    //check authentication, update user && return value
    if ($spd->user('auth',$b,'id')==$c){
        $update=$this->query("UPDATE user SET auth=?,status=? WHERE id=?",array(1,1,$b));
        if($update){
            echo 'yes';
        }else{
            echo 'no';
        }
    }else{
        echo 'no';
    }

    /*
     *          WIZARD

}elseif($a=='style'){

    $css1= SITE_ROOT.'gaia/css/dsh.css';
    $css2= $this->TEMPLATES.$this->template.'/css/style.css';

    foreach($b as $elid =>$elval) {
        $stil= $this->style()->getall(array($css2),$elval);
        $stils = explode(';',$stil);
      foreach($stils as $key =>$val) {
              $css[$elval][$key] = $val;
    }}
    echo json_encode($css);

}elseif($a=='newtemplate'){
    /*
     * create template folder
     * create index.html in the folder
     * create filesystem inside the folder

    $template_folder = $this->TEMPLATES. $b;
            if($this->template_new($b)){
               if (
                   file_put_contents($template_folder.'/index.php', htmlspecialchars_decode($c)) &&
                   file_put_contents($template_folder.'/css/style.css', $d)
               ) {
                    echo 'yes';
               }
        } else {
            echo urldecode($b);
        }

* */
}elseif($a=='worker'){
    echo json_encode($db->f("SELECT * FROM user WHERE id=?",array($b)));

    /*
    }elseif($a=='py'){
    $res= escapeshellcmd(SITE_ROOT.'gaia/py/routine1.py');
    echo shell_exec($res);
    //echo json_encode('here');
    */
}elseif($a=='cachereset'){
    $output=array();
    $output[]= opcache_reset();
//    $redispass = $this->GLOBAL['CONF']['redis_pass'];
//       $output[] = shell_exec("redis-cli -a $redispass flushall");
    echo implode('',$output);

    $siteroot= SITE_ROOT.'gaia/c/test.c';
    shell_exec("g++ $siteroot -o test1");
    echo exec(SITE_ROOT.'gaia/c/test1');

}elseif($a=='cacheset'){

    $this->set($b,$c);

}elseif($a=='tryextension'){
    $array= array("sesid"=>1,"content"=>$b,"url"=>$c);
    $db=new DB('bot','maria');
    $q= $db->inse("stexts",$array);
    if(!$q){echo "mistaken insert";}else{echo "ajax correct";}

//}elseif($a=='ele_create'){
    //$json= json_decode($c,true);
    //file_put_contents ($b,$this->style()->json2html($json));

}elseif($a=="load_widgetloop"){

    echo json_encode(include_buffer("dsh/widget_loop.php"));

}elseif($a=="load_posts"){

    /*
     * TEMPLATES
     * */
}elseif($a=='template_install'){
    //add more features as a gaiacms template eg folder page
    //template.json is basic

    $sp=new Setup;
    $name=explode('-',$b)[0]; //throw version
    $version=explode('-',$b)[1]; //throw version
    $fileremote=AIMD5_API."repo/templates/$b.tar.gz";
    $filelocal=$this->TEMPLATESURI."$b.tar.gz";
    if($sp->copysshfile($fileremote,$filelocal)){
        $res=array();
        $res[]="copied";
        $phar = new PharData($filelocal);
        // mkdir($this->TEMPLATESURI.$b, 0777, true);

        if($phar->extractTo($this->TEMPLATESURI)){
            $res[]="extracted"; // extract all files
            chmod($this->TEMPLATESURI.$name, 0777);
            unlink($filelocal);
        }
    }else{ $res="nossh"; }
    echo json_encode($res);

}elseif( $a=='gaia_update'){
    $sp=new Setup;
    $fileremote=AIMD5_API."repo/admin/$b.tar.gz";
    $filelocal=GAIABASE."$b.tar.gz";
    if($sp->copysshfile($fileremote,$filelocal)){
        $res=array();
        $res[]="copied";
        $phar = new PharData($filelocal);
        // mkdir($this->TEMPLATESURI.$b, 0777, true);

        if($phar->extractTo(GAIAROOT)){
            $res[]="extracted"; // extract all files
            chmod(GAIAROOT, 0777);
            unlink($filelocal);
            //update globs system_version
        }
    }else{ $res="nossh"; }
    echo json_encode($res);

//$this->q("UPDATE global ")

}elseif( $a=='template_uninstall'){
    //  $query= $db->q("DELETE FROM setup WHERE name=?",array(trim($b)));
    // if($query) {
    if(xrmdir($this->TEMPLATESURI . $b)){
        echo 'yes';
    }else{echo $b;}
//}elseif( $a=='template_setup'){
    //  $query= $db->q("INSERT INTO setup (name) VALUES(?)",array(trim($b)));
//    if($query) {
    //echo 'yes';
    //}
}elseif( $a=='template_new'){
    if($this->template_new($b)){
        echo 'yes';
    };

}elseif( $a=='template_activate'){

    echo $this->template_activate($b);

}elseif($a=='setupDomain'){
    $setup=new Setup;
    $sup=$setup->setupDomain($c,$b);
    echo $sup ? json_encode("ok") : json_encode($sup);


}elseif($a=='query'){
    //a: 'query', value: obj.value,table:obj.table,where:obj.where
    //$table=$_REQUEST['table'];
    //$where=$_REQUEST['where'];
    //$value=$_REQUEST['value'];
    //$sel = $db->q("UPDATE $table SET $value WHERE $where");
    $sel = $db->q($c);
    if ($sel) {
        echo json_encode('Query executed');
    } else {
        echo json_encode('No');
    }

    /*

                PAGE builder

    */
}elseif($a=='page_save'){

    define('MAX_FILE_LIMIT', 1024 * 1024 * 2);//2 Megabytes max html file size
    function sanitizeFileName($fileName)
    {
        //sanitize, remove double dot .. and remove get parameters if any
        $fileName = preg_replace('@\?.*$@' , '', preg_replace('@\.{2,}@' , '', preg_replace('@[^\/\\a-zA-Z0-9\-\._]@', '', $fileName)));
        return $fileName;
    }

    $html = "";
    if (isset($_POST['startTemplateUrl']) && !empty($_POST['startTemplateUrl']))
    {
        $startTemplateUrl = sanitizeFileName($_POST['startTemplateUrl']);
        $html = file_get_contents($startTemplateUrl);
    } else if (isset($_POST['html']))
    {
        $html = substr($_POST['html'], 0, MAX_FILE_LIMIT);
    }

//$fileName = $_SERVER['DOCUMENT_ROOT'].'/' . sanitizeFileName($_POST['fileName']);
//$fileName = $_SERVER['DOCUMENT_ROOT'].'/page1.php';
    $fileName = $_SERVER['DOCUMENT_ROOT'].'/page2.php';

    if (file_put_contents($fileName, $html))
        echo $fileName;
    else
        echo 'Error saving file '  . $fileName;

}elseif ($a=="upload_builder"){

    define('UPLOAD_FOLDER', $_SERVER['DOCUMENT_ROOT'].'/');
    define('UPLOAD_PATH', '/media/');

    move_uploaded_file($_FILES['file']['tmp_name'], UPLOAD_FOLDER . $_FILES['file']['name']);

    echo UPLOAD_PATH . $_FILES['file']['name'];

}elseif($a=="buffer_file"){
    ob_start();
    include $b;
    $buffer= ob_get_clean();
    flush();
    ob_end_clean();
    echo json_encode($buffer);

}elseif($a=="screenshot"){
    if (strpos($c, 'data:image/png;base64') === 0) {
        $img = str_replace('data:image/png;base64,', '', $c);
        $img = str_replace(' ', '+', $img);
        $data = base64_decode($img);
        if (file_put_contents($b, $data)) {
            echo json_encode($_POST);
        }
    }

}elseif($a=='tojsonfile') {
    //b: file, c:json|object, d:print parameters
    $finaljson= !$d ? $c : json_encode(json_decode($c,true),64 | 128);
    if (file_put_contents($b, $finaljson)) {echo 1;}else{echo -1;}

}elseif($a=='query2json') {
    $s= $db->fl(array("userid","name"),"user2","WHERE userid IN (1,300)");
    $enc= json_encode($s,64|128);
    if (file_put_contents($c,$enc)) {echo 1;}else{echo -1;}

}elseif($a=='errors') {

// Define the path to the error log file
$logFilePath = '/var/www/admin/error.log';

// Define the path to a temporary file to write logs before sending
$tempLogFilePath = '/var/www/admin/temp_error.log';

// Read the error log file
function readErrorLog($filePath) {
    if (!file_exists($filePath)) {
        return [];
    }
    $logEntries = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $errors = [];    
    // Filter out only critical PHP errors (E_ERROR)
    foreach ($logEntries as $entry) {
        if (strpos($entry, '[error]') !== false ) {
            $errors[] = $entry;
        }
    }    
    return $errors;
}

// Clean the error log file
function cleanErrorLog($filePath, $tempFilePath) {
    if (file_exists($filePath)) {
        copy($filePath, $tempFilePath); // Backup the log file
        //file_put_contents($filePath, ''); // Clear the original log file
		shell_exec("> $logFilePath");
    }
}
// Get the critical errors from the log file
$errors = readErrorLog($logFilePath);
// Clean the log file
cleanErrorLog($logFilePath, $tempLogFilePath);
// Send the errors as JSON response
echo json_encode($errors);
}