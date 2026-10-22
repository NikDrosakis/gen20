<?php
namespace Core;
use Exception;
/**

*/
trait Book {
    public $bookdefaultimg = "/img/empty.png";
    public $book_status = ["0" => "lost", "1" => "not owned", "2" => "desired", "3" => "shelve"];
    public $isread = [0 => "not read", 1 => "reading", 2 => "read"];


protected function bookRouter($page) {
    switch ($page) {
        case "publisher":
            return $this->buildPublisherLoop($page);
        case "writer":
            return $this->buildWriterLoop($page);
        default:
            return $this->buildBookLoop($page);
    }
}

protected function buildBookLoop($page) {
    $books = $this->booklists(["page" => $page]);
    ob_start(); // Start output buffering

    echo '<div class="row">';
    foreach ($books as $book) {
        $postid = $book['id'];
        $img = $book['img'] ? SITE_URL . 'media/' . $book['img'] : $this->bookdefaultimg;
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


    protected function get_book() {
        return $this->db->f(
            "SELECT c_book.*, c_book_libuser.notes, c_book_libuser.isread, c_book_rating.stars,
                    c_book_writer.name AS writer, c_book_cat.name AS cat, c_book_publisher.name AS publisher
             FROM c_book
             LEFT JOIN c_book_rating ON c_book.id = c_book_rating.bookid AND c_book_rating.userid = ?
             LEFT JOIN c_book_writer ON c_book.writer = c_book_writer.id
             LEFT JOIN c_book_cat ON c_book.cat = c_book_cat.id
             LEFT JOIN c_book_libuser ON c_book.id = c_book_libuser.bookid
             LEFT JOIN c_book_publisher ON c_book.publisher = c_book_publisher.id
             WHERE c_book.id = ?",
            [$this->me, $this->id]
        );
    }

    protected function booklists(array $get): array {
        $pagin = 12;
        $pagenum = $get['pagenum'] ?? 1;
        $start = ($pagenum - 1) * $pagin;
        $limit = " LIMIT $start, $pagin";
        $q = $get['q'] ?? '';
        $sel = [];

        switch ($get['page']) {
            case 'ebook':
                $name = $get['name'] ?? '';
                $ebooks = glob("/pdf/$name/*.pdf");
                foreach (array_slice($ebooks, $start, $pagin) as $e) {
                    $e = basename($e);
                    $sel[] = ['title' => basename($e, ".pdf"), 'booklink' => "/pdf/$name/$e"];
                }
                break;

            case 'home':
            case 'book':
                $orderby = $_COOKIE['orderby'] ?? "RAND()";
                $langQ = !empty($_COOKIE['LANG']) ? "AND c_book.lang='" . $_COOKIE['LANG'] . "'" : "";
                $libQ = $get['page'] === "book" ? "AND c_book_libuser.libid=" . $get['libid'] : "";
                $tableQ = $get['page'] === "book" ? "FROM c_book_libuser LEFT JOIN c_book ON c_book_libuser.bookid=c_book.id" : "FROM c_book";
                $qQ = $q ? "AND (c_book.title LIKE '%$q%' OR c_book_writer.name LIKE '%$q%'
                              OR c_book_cat.name LIKE '%$q%' OR c_book_publisher.name LIKE '%$q%')" : "";

                $query = "SELECT c_book.*, CONCAT('/book?id=', c_book.id) AS booklink,
                                 c_book_writer.name AS writername, c_book_cat.name AS catname, c_book_publisher.name AS publishername
                          $tableQ
                          LEFT JOIN c_book_writer ON c_book.writer = c_book_writer.id
                          LEFT JOIN c_book_cat ON c_book.cat = c_book_cat.id
                          LEFT JOIN c_book_publisher ON c_book.publisher = c_book_publisher.id
                          WHERE c_book.img IS NOT NULL $langQ $libQ $qQ
                          ORDER BY $orderby";

                $sel = $this->db->fa($query . $limit);
                break;

            case 'libraries':
                $sel = $this->db->fa("SELECT * FROM c_book_lib");
                break;

            case 'writer':
                $writers = $this->db->fa("SELECT * FROM c_book_writer ORDER BY name DESC $limit");
                foreach ($writers as &$writer) {
                    $writer['books'] = $this->db->fl(["id", "title"], "c_book", "WHERE writer={$writer['id']}");
                    $writer['categories'] = $this->db->fl(["c_book_cat.id", "c_book_cat.name"], "c_book_cat", "LEFT JOIN c_book ON c_book.cat=c_book_cat.id WHERE c_book.writer={$writer['id']}");
                }
                $sel = $writers;
                break;

            case 'publisher':
                $publishers = $this->db->fa("SELECT * FROM c_book_publisher ORDER BY name DESC $limit");
                foreach ($publishers as &$publisher) {
                    $publisher['books'] = $this->db->fl(["id", "title"], "c_book", "WHERE publisher={$publisher['id']}");
                    $publisher['categories'] = $this->db->fl(["c_book_cat.id", "c_book_cat.name"], "c_book_cat", "LEFT JOIN c_book ON c_book.cat=c_book_cat.id WHERE c_book.writer={$publisher['id']}");
                }
                $sel = $publishers;
                break;
        }
        return $sel;
    }

    protected function get_categories() {
        return $this->db->fa("SELECT * FROM c_book_cat");
    }

    protected function get_libs(): array {
        return $this->db->fa("SELECT * FROM c_book_lib");
    }

    protected function get_mylib() {
        return $this->db->f("SELECT * FROM c_book_lib WHERE userid=?", [$this->me]);
    }
}





}