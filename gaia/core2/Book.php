<?php
namespace Core;
use Exception;

/**


*/
trait Book {
    public $bookdefaultimg = "/img/empty.png";
    public $book_status = ["0" => "lost", "1" => "not owned", "2" => "desired", "3" => "shelve"];
    public $isread = [0 => "not read", 1 => "reading", 2 => "read"];

//this->id
//mode =read edit
protected function bookRouter($page) {
    switch ($page) {
        case "lib":
        case "classifications":
            return $this->include_buffer(CUBO_ROOT."book/main/$page.php");
        case "publisher":
            return $this->id ? $this->buildPublisher($this->mode) : $this->buildPublisherLoop($page);
        case "writer":
            return $this->id ? $this->buildWriter($this->mode) : $this->buildWriterLoop($page);
        default:
            return $this->id ? $this->buildBook($this->mode) : $this->buildBookLoop($page);
    }
}

protected function buildWriterLoop($page) {
   $sel = $this->getBookLoop(["page" => $page]);
    ob_start(); // Start output buffering
    ?>
<div class="row">
<?php
for ($i=0;$i<count($sel);$i++) {
   $postid = $sel[$i]['id'];
    $img = !$sel[$i]['img'] ? $this->writerdefaultimg : SITE_URL.'media/'. $sel[$i]['img'];
        ?>
       <div id="nodorder1_<?=$postid?>"class="card">
            <div class="author"><?=$sel[$i]['name'] != null ? $sel[$i]['name'] : ''?></div>
            <div class="cover"><a href="/writer?id=<?=$postid?>&mode=read"><img id="img<?=$postid?>" src="<?=$img?>" /></a></div>
           <!---list of books--->
           <div class="description">
                <?php if(!empty($sel[$i]['book'])){ ?>
                <p class="title"><?=implode(',',$sel[$i]['book'])?></p>
                <span class="published"><?=$sel[$i]['publisher']?>, <?=$sel[$i]['published']?></span>
                <?php }else{ ?>
                    <div>No books listed</div>
                <?php } ?>
            </div>
        </div>
        <?php if($sel[$i]['bio']!=null){ ?>
            <div class="card-summary"><?=$sel[$i]['bio']?></div>
        <?php } ?>
    <?php } ?>
</div>
<?php
  return ob_get_clean();
}

protected function buildPublisherLoop($page) {
   $loop = $this->getBookLoop(["page" => $page]);
    ob_start(); // Start output buffering
    ?>
<div class="row">
        <?php
           foreach ($loop as $sel) {
           $postid = $sel['id'];
            $img = !$sel['img'] ? $this->writerdefaultimg : MEDIA_ROOT.$sel['img'];
        ?>
        <div class="card">
            <div class="author"><?=$sel['name'] != null ? $sel['name'] : ''?></div>
            <div class="cover">
                <a href="?id=<?=$postid?>&mode=read"><img id="img<?=$postid?>" src="<?=$img?>"></a>
            </div>
            <div class="description">
                <!---list of books--->
                <?php if(!empty($sel['books'])){ ?>
                    <p class="title"><?php if(!empty($sel['title'])){implode('</p><p class="title">',$sel['title']);}?></p>
                    <div class="published"><?=$sel['publisher']?>, <?=$sel['published']?></div>
                <?php }else{ ?>
                    <div>No books listed</div>
                <?php } ?>
            </div>
        </div>
<?php if (!empty($sel['summary']) && is_array($sel['summary'])) { ?>
    <div class="card-summary"><?= implode(',', $sel['summary']) ?></div>
<?php } ?>
<?php } ?>
</div>
<?php
  return ob_get_clean();
}

protected function buildBookLoop($page) {
   $loop = $this->getBookLoop(["page" => $page]);
    ob_start(); // Start output buffering

    echo '<div class="row">';
    foreach ($loop as $book) {
        $postid = $book['id'];
        $img = $book['img'] ? MEDIA_ROOT . $book['img'] : $this->bookdefaultimg;
        ?>
        <div id="nodorder1_<?= $postid ?>" class="card">
            <button type="button" class="close" aria-label="delete" id="del<?= $postid ?>">
                <span aria-hidden="true">&times;</span>
            </button>
            <div class="cover">
                <img id="img<?= $postid ?>" src="<?= $img ?>">
            </div>
            <div class="description">
                <span class="published">
                    <a href="/publisher?id=<?= $book['publisher'] ?>&mode=read">
                        <?= $book['publishername'] ?? '' ?>
                    </a>, <?= $book['published'] ?>
                </span>
                <span class="tag3"><?= $this->isread[$book['isread']] ?? '' ?></span>
                <span class="tag2"><?= $this->book_status[$book['status']] ?? '' ?></span>
            </div>
            <?php if (!empty($book['summary'])) { ?>
                <a href="/writer?id=<?= $book['writer'] ?>&mode=read">
                    <?= $book['writername'] ?? '' ?>
                </a>
                <a style="display: grid; margin: 35px 0; color: #000; font-size: 15px;"
                   href="<?= $book['booklink'] ?>&mode=read">
                    <?= $book['title'] ?>
                </a>
                <div class="card-summary"><?= $book['summary'] ?></div>
            <?php } ?>
        </div>
        <?php
    }
    echo '</div>';

    return ob_get_clean(); // Get buffered content and clear buffer
}

/**
$this->mode read & edit
 */
protected function buildBook($mode='read'){
// Retrieve the book details once
$sel =  $this->db->f(
                   "SELECT c_book.*, c_book_libuser.notes, c_book_libuser.isread, c_book_rating.stars,
                           c_book_writer.name AS writer, c_book_cat.name AS cat, c_book_publisher.name AS publisher
                    FROM {$this->publicdb}.c_book
                    LEFT JOIN {$this->publicdb}.c_book_rating ON c_book.id = c_book_rating.bookid AND c_book_rating.userid = ?
                    LEFT JOIN {$this->publicdb}.c_book_writer ON c_book.writer = c_book_writer.id
                    LEFT JOIN {$this->publicdb}.c_book_cat ON c_book.cat = c_book_cat.id
                    LEFT JOIN {$this->publicdb}.c_book_libuser ON c_book.id = c_book_libuser.bookid
                    LEFT JOIN {$this->publicdb}.c_book_publisher ON c_book.publisher = c_book_publisher.id
                    WHERE c_book.id = ?",
                   [$this->me, $this->id]
               );
$img = $sel['img'] == null ? $this->bookdefaultimg : (strpos($sel['img'], 'http') === 0 ? $sel['img'] : "/media/".$sel['img']);
?>

<!-- Back, Previous, and Next Buttons -->
<a class="button" href="/book">Back</a>
<span style="float:left;" onclick="s.ui.goto(['previous','book','id',G.id,'/book?id='])" class="next glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
<span style="float:right" onclick="s.ui.goto(['next','book','id',G.id,'/book?id='])" class="next glyphicon glyphicon-chevron-right" aria-hidden="true"></span>

<!-- Book Title with Edit Link -->
<h2 id="titlebig"><?=$sel['title']?>
    <a href="/<?=$this->page?>/<?=$this->id?>/<?=($mode == 'edit' ? 'edit' : 'read')?>">
        <ion-icon class="<?=($this->page == 'login' ? 'active' : '')?>" style="vertical-align: middle; color:#71400c;" alt="Edit" name="<?=($mode == 'edit' ? 'create' : 'book')?>" size="medium"></ion-icon>
    </a>
</h2>

<!-- Book Image and Form Fields -->
<div style="width:30%;float:left;margin:15px;">
    <img id="bookimg" src="<?=$img?>" style="max-height:550px;">
</div>

<!-- Book Details Form (Dynamic Content) -->
<div style="display:inline-block; float:left;width:56%;margin:2%">
    <!-- Title -->
    <label>Title:</label>
    <?php if ($mode == 'edit'): ?>
        <input class="input" id="title" value="<?=$sel['title']?>">
    <?php else: ?>
        <?=$sel['title']?>
    <?php endif; ?>

    <!-- Writer -->
    <div>
        <label>Writer:</label>
        <?php if ($mode == 'edit'): ?>
            <button fun="new" id="new_writer" class="but_new">New</button>
            <input class="input" fun="lookup" id="writer" value="<?=$sel['writer']?>">
            <ul id="loolist_writer" class="loolist"></ul>
        <?php else: ?>
            <?=$sel['writer']?>
        <?php endif; ?>
    </div>

    <!-- Publisher -->
    <div style="display:flex">
        <div style="width:75%">
            <label>Publisher:</label>
            <?php if ($mode == 'edit'): ?>
                <button fun="new" id="new_publisher" class="but_new">New</button>
                <input class="input" fun="lookup" id="publisher" value="<?=$sel['publisher']?>">
                <ul id="loolist_publisher" class="loolist"></ul>
            <?php else: ?>
                <?=$sel['publisher']?>
            <?php endif; ?>
        </div>

        <!-- Published Year -->
        <div>
            <label>Edition Year:</label>
            <?php if ($mode == 'edit'): ?>
                <input class="input" style="display:inline;" type="number" min="1977" max="2024" id="published" value="<?=$sel['published']?>">
            <?php else: ?>
                <?=$sel['published']?>
            <?php endif; ?>
        </div>
    </div>

    <!-- Category -->
    <div>
        <label>Category:</label>
        <?php if ($mode == 'edit'): ?>
            <button fun="new" id="new_category" class="but_new">New</button>
            <input class="input" fun="lookup" id="cat" value="<?=$sel['cat']?>">
            <ul id="loolist_cat" class="loolist"></ul>
        <?php else: ?>
            <?=$sel['cat']?>
        <?php endif; ?>
    </div>

    <!-- Volume -->
    <label>Volume:</label>
    <?php if ($mode == 'edit'): ?>
        <input class="input" id="vol" value="<?=$sel['vol']?>">
    <?php else: ?>
        <?=$sel['vol']?>
    <?php endif; ?>

    <!-- Tags -->
    <label>Tags:</label>
    <?php if ($mode == 'edit'): ?>
        <input class="input" id="tag" value="<?=$sel['meta']?>">
    <?php else: ?>
        <?=$sel['meta']?>
    <?php endif; ?>

    <!-- Summary -->
    <label>Summary:</label>
    <?php if ($mode == 'edit'): ?>
        <div contenteditable="true" class="textarea" id="summary" placeholder="Keep Notes"><?=html_entity_decode($sel['summary'])?></div>
        <button class="button" id="save_summary">Save</button>
    <?php else: ?>
        <div contenteditable="false" class="textarea" id="summary" placeholder="Keep Notes"><?=html_entity_decode($sel['summary'])?></div>
    <?php endif; ?>

    <!-- Is Read -->
    <label>Status:</label>
    <select class="input" id="status">
        <?php foreach ($this->book_status as $statusid => $statusval): ?>
            <option value="<?=$statusid?>" <?=$sel['status'] == $statusid ? "selected=selected" : ""?>><?=$statusval?></option>
        <?php endforeach; ?>
    </select>

    <!-- Notes (Editable in Edit Mode) -->
    <label>Notes:</label>
    <?php if ($mode == 'edit'): ?>
        <div contenteditable="true" class="textarea" id="notes" placeholder="Keep Notes"><?=$sel['notes'] ? html_entity_decode($sel['notes'],ENT_QUOTES, 'UTF-8'):''?></div>
        <button class="button" id="save_notes">Save</button>
    <?php else: ?>
        <div contenteditable="false" class="textarea" id="notes" placeholder="Keep Notes"><?=html_entity_decode($sel['notes'],ENT_QUOTES)?></div>
    <?php endif; ?>
</div>

<?php
// Include additional components based on login status
if ($this->loggedin) {
    include CUBO_ROOT."rating/rating.php";
    include CUBO_ROOT."default/comment.php";
}
}

protected function buildWriter($mode='read') {
    $sel = $this->db->f("SELECT * FROM {$this->publicdb}.c_book_writer WHERE id=?", array($this->id));
    $img = $sel['img'] == '' ? $this->writerdefaultimg : '/media/' . $sel['img'];
?>
<!-- EDIT / SHOW -->
<a href="/writer">Back to Writers</a>
<span style="float:left;" onclick="gs.ui.goto(['previous','writer','id',g.get.id,'/writer?id='])" class="next glyphicon glyphicon-chevron-left" aria-hidden="true"></span>
<span style="float:right" onclick="gs.ui.goto(['next','writer','id',g.get.id,'/writer?id='])" class="next glyphicon glyphicon-chevron-right" aria-hidden="true"></span>

<div style="width:98%; background:#fffef4; min-height: 600px;">
    <h2 id="titlebig"><?= $sel['name'] ?>
        <a href="?id=<?= $sel['id'] ?>&mode=<?= ($mode == 'edit' ? 'edit' : 'read') ?>">
            <ion-icon style="vertical-align: middle; color:#71400c;" name="<?= ($mode == 'edit' ? 'create' : 'book') ?>" size="medium"></ion-icon>
        </a>
    </h2>

    <div style="width:30%; float:left; margin:15px;">
        <a href="?id=<?= $sel['id'] ?>&mode=read"><img id="bookimg" src="<?= $img ?>" style="max-height:350px;"></a>
    </div>

    <div style="display:inline-block; width:56%; margin:2%;">
        <!-- Name -->
        <label>Name:</label>
        <?php if ($mode == 'edit'): ?>
            <input class="input" id="name" value="<?= $sel['name'] ?>">
        <?php else: ?>
            <?= $sel['name'] ?>
        <?php endif; ?>

        <!-- Summary -->
        <div>
            <label>Summary:</label>
            <?php if ($mode == 'edit'): ?>
                <textarea class="input" id="summary"><?= $sel['summary'] ?></textarea>
                <button class="btn btn-primary" id="update">Save Writer</button>
            <?php else: ?>
                <?= $sel['summary'] ?>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php
}

protected function buildPublisher($mode='read') {
    $publisher = $this->db->f("SELECT * FROM {$this->publicdb}.c_book_publisher WHERE id=?", array($this->id));
    $img = !$publisher['img'] ? $this->writerdefaultimg : SITE_URL . 'media/' . $publisher['img'];
?>
<div class="card">
    <div class="author"><?= $publisher['name'] != null ? $publisher['name'] : '' ?></div>
    <div class="cover">
        <img id="img<?= $this->id ?>" src="<?= $img ?>">
    </div>
    <div class="description">
        <!-- Editable Name and Description -->
        <?php if ($mode == 'edit'): ?>
            <label>Publisher Name:</label>
            <input class="input" id="publisher_name" value="<?= $publisher['name'] ?>">

            <label>Summary:</label>
            <textarea class="input" id="publisher_summary"><?= $publisher['summary'] ?></textarea>
            <button class="btn btn-primary" id="save_publisher">Save Publisher</button>
        <?php else: ?>
            <p><?= $publisher['name'] ?></p>
            <div><?= $publisher['summary'] ?></div>
        <?php endif; ?>
    </div>
</div>
<?php
}

    protected function getBookLoop(array $get) {
        $pagin = 12;
        $pagenum = $get['pagenum'] ?? 1;
        $start = ($pagenum - 1) * $pagin;
        $limit = " LIMIT $start, $pagin";
        $q = $get['q'] ?? '';
        $sel = [];

        switch ($get['page']) {
            case 'ebook':
                $name = $get['name'] ?? '';
                $sel = glob("/pdf/$name/*.pdf");
                foreach (array_slice($ebooks, $start, $pagin) as $e) {
                    $e = basename($e);
                    $sel[] = ['title' => basename($e, ".pdf"), 'booklink' => "/pdf/$name/$e"];
                }
                break;
            case 'home':
            case 'lib':
                $sel = $this->db->fa("SELECT * FROM {$this->publicdb}.c_book_lib");
                break;

            case 'writer':
                $sel = $this->db->fa("SELECT * FROM {$this->publicdb}.c_book_writer ORDER BY name DESC $limit");
                foreach ($sel as &$writer) {
                    $writer['books'] = $this->db->fl(["id", "title"], "{$this->publicdb}.c_book", "WHERE writer={$writer['id']}");
                    $writer['categories'] = $this->db->fl(["c_book_cat.id", "c_book_cat.name"], "{$this->publicdb}.c_book_cat", "LEFT JOIN {$this->publicdb}.c_book ON c_book.cat=c_book_cat.id WHERE c_book.writer={$writer['id']}");
                }
                break;
            case 'publisher':
                $sel = $this->db->fa("SELECT * FROM {$this->publicdb}.c_book_publisher ORDER BY name DESC $limit");
                foreach ($sel as &$publisher) {
                    $publisher['books'] = $this->db->flist("SELECT id,title FROM {$this->publicdb}.c_book WHERE publisher={$publisher['id']}");
                    $publisher['categories'] = $this->db->flist("SELECT c_book_cat.id,c_book_cat.name FROM {$this->publicdb}.c_book_cat
                    LEFT JOIN {$this->publicdb}.c_book ON c_book.cat=c_book_cat.id
                    WHERE c_book.writer={$publisher['id']}");
                }
                break;
                default:
                    $orderby = $_COOKIE['orderby'] ?? "RAND()";
                    $langQ = !empty($_COOKIE['LANG']) ? "AND c_book.lang='" . $_COOKIE['LANG'] . "'" : "";
                    $libQ = $get['page'] === "book" ? "AND c_book_libuser.libid=" . $get['libid'] : "";
                    $tableQ =
                    //$get['page'] === "book"
                   // ? "FROM {$this->publicdb}.c_book_libuser
                  //  LEFT JOIN {$this->publicdb}.c_book ON c_book_libuser.bookid=c_book.id"
                    //:
                    "FROM {$this->publicdb}.c_book";
                    $qQ = $q ? "AND (c_book.title LIKE '%$q%' OR c_book_writer.name LIKE '%$q%'
                                  OR c_book_cat.name LIKE '%$q%' OR c_book_publisher.name LIKE '%$q%')" : "";
                    $query = "SELECT c_book.*, CONCAT('/book?id=', c_book.id) AS booklink,
                                     c_book_writer.name AS writername, c_book_cat.name AS catname, c_book_publisher.name AS publishername
                              $tableQ
                              LEFT JOIN {$this->publicdb}.c_book_writer ON c_book.writer = c_book_writer.id
                              LEFT JOIN {$this->publicdb}.c_book_cat ON c_book.cat = c_book_cat.id
                              LEFT JOIN {$this->publicdb}.c_book_publisher ON c_book.publisher = c_book_publisher.id
                              WHERE c_book.img IS NOT NULL $langQ $qQ
                              ORDER BY $orderby";
                              //libQ
                    $sel = $this->db->fa($query . $limit);
                    break;
        }
        return $sel;
    }

    protected function get_categories() {
        return $this->db->fa("SELECT * FROM {$this->publicdb}.c_book_cat");
    }

    protected function get_libs(): array {
        return $this->db->fa("SELECT * FROM {$this->publicdb}.c_book_lib");
    }

    protected function get_mylib() {
        return $this->db->f("SELECT * FROM {$this->publicdb}.c_book_lib WHERE userid=?", [$this->me]);
    }
}
