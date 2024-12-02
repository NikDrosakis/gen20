<?php
//Todo UPDATE WITH uid request in an array of tables
$data=array();
$table= $this->method; //t for table
$id= $this->id;

if($table=='user') {
    $query = "SELECT * FROM user WHERE id=?";
    //$dat=array();
    //$dat= $this->db->f($query,array($id));
    //$grp= $dat['grp'];
    $dat= $this->db->f("SELECT * FROM ur WHERE uid=?",array($dat['id']));


//many posts
}elseif($table=='post' && isset($id)){
    $data= $this->db->f("SELECT post.*,postb.* FROM post LEFT join postb ORDER BY postb.sort ASC WHERE post.id=?",[$id]);

}elseif (!isset($id) && !isset($uid)){
	 $query = "SELECT * FROM $table";
    $dat= $this->db->fa($query);
}else{
    $query = "SELECT * FROM $table WHERE id=?";
    $dat= $this->db->f($query,array($id));
}
$data=$dat;
?>