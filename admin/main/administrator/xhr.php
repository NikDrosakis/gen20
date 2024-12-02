<?php 
if($a=='page_save'){    
    $query=$this->db->q("UPDATE page SET $c=? WHERE main=?",[$d,$b]);
    
}elseif($a=='page_get'){
    $select=$this->db->f("SELECT * FROM page WHERE main=?",[$b]);
    echo !$select ? json_encode('NO'): json_encode($select);
}
?>