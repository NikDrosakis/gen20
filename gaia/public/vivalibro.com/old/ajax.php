<?php
///assign to default TEMPLATE database of assign to other requested
$db=!isset($_REQUEST['db']) ? $this->db : $this->{$_REQUEST['db']};

$time=time();
$me=$this->G['my']['id'];
if($a=='buffer') { //f $file
    $buffer = "";
    if (!ob_start("ob_gzhandler")) ob_start();
    $f = $_GET['f'];
    $pms = json_decode($_GET['pms'], true);
    $arg = $_GET['arg'];
    $argpms = json_decode($_GET['argpms'], true);
    $class = explode('/', $f)[count(explode('/', $f)) - 1];
    if ($arg == '' && !class_exists($class)) {
        $this->G['mode'] = $pms[0];
        $this->G['param'] = $pms[1];
        include_once $f . '.php';
    } else { //class
        //$cont = new $_GET['f']($pms);
        $inst = $this->classInstance($class, $pms);
        if ($arg != '' && $argpms != '') {
            $inst->$arg(implode(',', $argpms));
        }
    }
    $buffer = ob_get_clean();
    flush();
    ob_end_clean();
    echo $buffer;
}elseif($a=='func2'){
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


}elseif($a=='func') {
$cq = $b == 'fl' ? explode(',', $c) : $c;
$data = $db->$b($cq);
echo $b=="q" && $data ? json_encode("yes") : json_encode($data);

}elseif($a=='bookedit') { //$b:param $c:id of writer $d:id of book
	$q= $db->q("UPDATE c_book set $b=? WHERE id=?",[$_GET['val'],$_GET['id']]);
	echo !$q ? "NO":"OK";

}elseif($a=='lookupsave') { //$b:param $c:id of writer $d:id of book
	$q= $db->q("UPDATE c_book set $b=? WHERE id=?",[$c,$_GET['id']]);
	echo !$q ? "NO":"OK";
	
}elseif($a=='lookup') {
	$sel= $db->fl(["name","id"],"c_$b","WHERE name LIKE '%$c%' ORDER BY name");
	echo json_encode($sel);
}elseif($a=='new') {
		   $ins=$db->inse("c_$b",["name"=>$c]);
		   	$q= $db->q("UPDATE c_book set $b=? WHERE id=?",[$ins,$_GET['id']]);
		   	echo $q && $ins ? "OK":"NO";	

}elseif($a=='newbkscat'){
	if($_POST['name']!=''){
	   $cat=array('name'=>$_POST['name'],'parent'=>$_POST['parent']);
	   $inscat=$db->inse('cat',$cat);
	   echo json_encode($inscat);	   
	}
}elseif($a=='del'){
	$b=!empty($b) ? "c_".$b : 'c_book';
	$db->q("DELETE FROM $b WHERE id=$c");

}elseif($a=='copy'){
   if ($_SERVER['REQUEST_METHOD'] === "POST" && isset($_POST['url'])){
       $url=$_POST['url'];
       $path = pathinfo($url);
       $ext=!empty($path['extension']) ? explode('?',$path['extension'])[0] : 'jpg';
       $img=$_POST['name'].'.'.$ext;
       if(copy($_POST['url'],$this->G['GAIABASE']."media/" .$img)){
           //save to db
           $id=(int)$_POST['id'];
		   $table=$_POST['table'];
			$query="UPDATE $table SET img=? WHERE id=?";
			$q=$db->q($query,[$img,$id]);
            if($q) {
                echo $query;
            }else{echo $query;}
       }else{
           echo $query;
       }
   }
}elseif($a=='cachereset'){
    $output=array();
    $output[]= opcache_reset();
//    $redispass = $this->GLOBAL['CONF']['redis_pass'];
//       $output[] = shell_exec("redis-cli -a $redispass flushall");
    echo implode('',$output);

    //$siteroot= SITE_ROOT.'gaia/c/test.c';
    //shell_exec("g++ $siteroot -o test1");
    //echo exec(SITE_ROOT.'gaia/c/test1');
}

