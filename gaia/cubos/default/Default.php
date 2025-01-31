<?php
namespace Core;


trait Default {
protected function getUsers() {
        return $this->db->fa("SELECT * FROM {$this->publicdb}.user");
    }

    protected function postlist(){

        $orderby = !empty($_COOKIE['orderby']) ? $_COOKIE['orderby'] : "post.sort";
        //pagination
        //$pagin=$bot->is('pagin'); //pagination num of result for each page
        $pagin=12; //pagination num of result for each page
        $limit= " LIMIT ".(($_GET['page'] - 1) * $pagin).",$pagin";

        $q=!empty($_GET['q']) ? $_GET['q']: '';
        $qq=$q!="" ? "WHERE post.title LIKE '%$q%'
            OR user.name LIKE '%$q%'
            OR tax.name LIKE '%$q%' "
            :"";

        $sub= isset($_GET['sub']) ? $_GET['sub']:'';
        $taxQ= $sub!="" ? "WHERE tax.name='$sub'":"";
        $query= "SELECT post.*,tax.name as taxname,user.name as username FROM post
        LEFT JOIN user ON post.uid=user.id LEFT JOIN tax ON post.taxid=tax.id $taxQ GROUP BY post.id ORDER BY $orderby";

        $sel= $db->fa("$query $limit");
        $buffer['count']= count($db->fa($query));
        if(empty($_COOKIE['list_style']) || $_COOKIE['list_style']=='table'){
            $buffer['html']=include_buffer($this->G['SITE_ROOT']."post_loop_table.php",$sel);
        }elseif($_COOKIE['list_style']=='archieve'){
            $buffer['html']=include_buffer($this->G['SITE_ROOT']."post_loop_archive.php",$sel);
        }
        return json_encode($buffer);

        }

        // Method to retrieve comments for a specific type and ID
       protected function getComments($type = 'book') {
            $sel = $this->db->fa("SELECT comment.*, CONCAT(user.firstname, ' ', user.lastname) AS fullname, user.img
              FROM {$this->publicdb}.comment
              LEFT JOIN user ON comment.uid=user.id
              WHERE comment.type=? AND comment.typeid=? AND comment.reply_id=0
              ORDER BY comment.created DESC", [$type, $_GET['id']]);
            // Insert replies into comments
            if (!empty($sel)) {
                foreach ($sel as $i => $comment) {
                    $sel[$i]['replies'] = $this->db->fa("SELECT comment.*, CONCAT(user.firstname,' ',user.lastname) AS fullname, user.img
                                                         FROM {$this->publicdb}.comment
                                                         LEFT JOIN user ON comment.uid=user.id
                                                         WHERE comment.reply_id=?
                                                         ORDER BY comment.created DESC", [$comment['id']]);
                }
            }

            return $sel;
        }

    protected function getLinks() {
            return $this->db->fa("SELECT * FROM {$this->publicdb}.links WHERE linksgrpid=2 ORDER BY sort");
    }


}