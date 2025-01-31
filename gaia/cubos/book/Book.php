<?php
namespace Core;
use Exception;
/**

*/
trait Book {
public $bookdefaultimg= "/img/empty.png";
public $book_status=["0"=>"lost","1"=>"not owned","2"=>"desired","3"=>"shelve"];
public $isread=[0=>"not read",1=>"reading",2=>"read"];


protected function buildLoop(){

<div class="row">
    <?php for ($i=0;$i<count($sel);$i++) {
        $postid = $sel[$i]['id'];
        $img = !$sel[$i]['img'] ? "/img/empty.png" : SITE_URL.'media/'. $sel[$i]['img']; ?>
        <div id="nodorder1_<?=$postid?>"class="card">
            <button  type="button" class="close" aria-label="delete" id="del<?=$sel[$i]['id']?>"><span aria-hidden="true">&times;</span></button>
            <div class="cover">
                <img id="img<?=$postid?>" src="<?=$img?>">
            </div>
            <div class="description">
                    <span class="published"><a href="/publisher?id=<?=$sel[$i]['publisher']?>&mode=read"><?=$sel[$i]['publishername'] != null ? $sel[$i]['publishername'] : ''?></a>, <?=$sel[$i]['published']?></span>
                    <span class="tag3"><?=$G['isread'][$sel[$i]['isread']]?></span>
                    <span class="tag2"><?=$G['book_status'][$sel[$i]['status']]?></span>
            </div>
        </div>
        <?php if($sel[$i]['summary']!=null){ ?>
            <a href="/writer?id=<?=$sel[$i]['writer']?>&mode=read"><?=$sel[$i]['writername'] != null ? $sel[$i]['writername'] : ''?></a>
            <a style="display:grid;margin:35px 0px 35px 0px;color:#000000;font-size:15px;" href="<?=$sel[$i]['booklink']?>&mode=read"><?=$sel[$i]['title']?></a>
            <div class="card-summary"><?=$sel[$i]['summary']?></div>
        <?php } ?>
    <?php } ?>
</div>

}

// Method to retrieve a specific book's details
protected function get_book() {
    return $this->db->f("SELECT c_book.*, c_book_libuser.notes, c_book_libuser.isread,
                         c_book_rating.stars, c_book_writer.name AS writer,
                         c_book_cat.name AS cat, c_book_publisher.name AS publisher
                         FROM c_book
                         LEFT JOIN c_book_rating ON c_book.id=c_book_rating.bookid AND c_book_rating.userid=?
                         LEFT JOIN c_book_writer ON c_book.writer=c_book_writer.id
                         LEFT JOIN c_book_cat ON c_book.cat=c_book_cat.id
                         LEFT JOIN c_book_libuser ON c_book.id=c_book_libuser.bookid
                         LEFT JOIN c_book_publisher ON c_book.publisher=c_book_publisher.id
                         WHERE c_book.id=?", array($this->me, $this->id));
}




    // Method to generate a list of books based on the current page type
  protected function booklists(array $get): array {
        $pagin = 12; // number of results per page
        $pagenum=$get['pagenum'] ?? 1;
        $start = ($pagenum - 1) * $pagin;
        $limit = " LIMIT $start, $pagin";
        $q = $get['q'] ?? '';
        $buffer = array();
        $sel = array();

        if ($get['page'] == 'ebook') {
            $name = isset($get['name']) ? $get['name'] : '';
            $ebooks = glob("/pdf/$name/*.pdf");
            if (!empty($ebooks)) {
                foreach (array_slice($ebooks, $start, $pagin) as $i => $e) {
                    $e = basename($e);
                    $sel[$i]['title'] = basename($e, ".pdf");
                    $sel[$i]['booklink'] = "/pdf/$name/$e";
                }
                $buffer['count'] = count($ebooks);
            } else {
                $buffer['count'] = 0;
            }
        } elseif ($get['page']== "home" || $get['page'] == "book") {
            //$orderby = !empty($_COOKIE['orderby']) ? $_COOKIE['orderby'] : "RAND()";
            $orderby = !empty($_COOKIE['orderby']) ? $_COOKIE['orderby'] : "RAND()";
            $langQ = !empty($_COOKIE['LANG']) ? "AND c_book.lang='" . $_COOKIE['LANG'] . "'" : "el";
            $libQ = $get['page'] == "book" ? "AND c_book_libuser.libid=" . $get['libid'] : "";
            $tableQ = $get['page'] == "book" ? "FROM c_book_libuser LEFT JOIN c_book ON c_book_libuser.bookid=c_book.id" : "FROM c_book";
            $qQ = $q!='' ? "AND (c_book.title LIKE '%$q%' OR c_book_writer.name LIKE '%$q%' OR c_book_cat.name LIKE '%$q%' OR c_book_publisher.name LIKE '%$q%')" : "";

            $query = "SELECT c_book.*, CONCAT('/book?id=', c_book.id) AS booklink, c_book_writer.name AS writername, c_book_cat.name AS catname, c_book_publisher.name AS publishername
                      $tableQ
                      LEFT JOIN c_book_writer ON c_book.writer = c_book_writer.id
                      LEFT JOIN c_book_cat ON c_book.cat = c_book_cat.id
                      LEFT JOIN c_book_publisher ON c_book.publisher = c_book_publisher.id
                      WHERE c_book.img IS NOT NULL $langQ $libQ $qQ
                      ORDER BY $orderby";
//HIDDEN WHERE PARAMS FOR THE TEST

         //   $sel = $this->db->fa("$query ");
            $sel = $this->db->fa("$query $limit");
      //     $count = count($this->db->fa($query));

        } elseif ($get['page'] == "libraries") {
            $sel = $this->db->fa("SELECT * FROM c_book_lib");
         //   $count = count($sel);

        } elseif ($get['page'] == "writer") {
            $query = "SELECT * FROM c_book_writer ORDER BY name DESC";
            $list = $this->db->fa("$query $limit");
            foreach ($list as $i => $writer) {
                $sel[$i] = $writer;
                $id = (int) $writer['id'];
                $sel[$i]['books'] = $this->db->fl(["id", "title"], "c_book", "WHERE writer=$id");
                $sel[$i]['categories'] = $this->db->fl(["c_book_cat.id", "c_book_cat.name"], "c_book_cat", "LEFT JOIN c_book ON c_book.cat=c_book_cat.id WHERE c_book.writer=$id");
            }
       //     $count = count($this->db->fa($query));

        } elseif ($get['page'] == "publisher") {
            $query = "SELECT * FROM c_book_publisher ORDER BY name DESC";
            $list = $this->db->fa("$query $limit");
            foreach ($list as $i => $publisher) {
                $sel[$i] = $publisher;
                $id = (int) $publisher['id'];
                $sel[$i]['books'] = $this->db->fl(["id", "title"], "c_book", "WHERE publisher=$id");
                $sel[$i]['categories'] = $this->db->fl(["c_book_cat.id", "c_book_cat.name"], "c_book_cat", "LEFT JOIN c_book ON c_book.cat=c_book_cat.id WHERE c_book.writer=$id");
            }
       //     $count = count($this->db->fa($query));
        }
        return $sel;
    }

    // Method to retrieve all categories
   protected function get_categories() {
        return $this->db->fa("SELECT * FROM c_book_cat");
    }

    // Method to retrieve all libraries
   protected function get_libs(): array {
        return $this->db->fa("SELECT * FROM c_book_lib");
    }

    // Method to retrieve the current user's library
   protected function get_mylib() {
        return $this->db->f("SELECT * FROM c_book_lib WHERE userid=?", array($this->me));
    }








}