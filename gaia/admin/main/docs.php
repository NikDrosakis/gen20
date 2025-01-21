<style>
    header {
        background-color: #333;
        color: #fff !important;
        padding: 10px;
    }
    main {
        padding: 20px;
        margin: 10px;
            float: left;
            font-size: 16px !important;
            width:75%
    }
.sidebar {
    position: relative;
    float:left;
    left: 0;
    top: 0;
    width: 250px;
    height: 100%;
    background-color: #d9d9d9;
    padding-top: 20px;
    overflow-x: hidden;
    overflow-y: auto;
}

/* Navigation menu */
.nav-menu {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.nav-menu a {
    margin: 0;
        padding: 8px 16px;
        text-align: left;
    display: block;
    color: black;
    text-decoration: none;
    font-size: 16px;
    border:1px dotted #00000036;
}

.nav-menu a:hover {
    background-color: #575757;
    color: white;
}

/* Section headers (like system titles) */
.nav-header {
    font-weight: bold;
    font-size: 18px;
    padding: 12px 16px;
    color: #fff;
    background-color: #444;
}

/* Icons (use Font Awesome or similar) */
.icon {
    margin-right: 8px;
}

.icon-tasks:before {
    content: "\f0ae";
}
</style>


<div class="sidebar">
    <ul class="nav-menu">
    <?php
    $sys= $this->db->fa("select * from gen_admin.systems");
    //xecho($sys);
    //$subdoc= $this->db->f("select doc from alinks where name=?",[$sub]);
 //   $systms= file_get_contents(GSROOT."SYSTEMS.md");
   // $mdsystems= $this->md_decode($systms);
//    $lines = explode(PHP_EOL, $mdsystems);
//    foreach ($lines as $line){
//    $title=explode(':',$line)[0];
  //  $description=explode(':',$line)[1];
//    $link=strtolower(trim(explode(':',$line)[0]));
foreach($sys as $sysdat){
    ?>
    <a href="/admin/docs/<?=$sysdat['name']?>"><?=$sysdat['name']?></a>
    <?php } ?>
    </ul>
</div>
<main>
        <section id="content">
            <?php
            $sub=$this->sub;
               $subdoc= $this->db->f("select * from gen_admin.systems where name=?",[$sub]);
            ?>
            <!-- Page content goes here -->
            <h1>[<?=$subdoc['name']?>]</h1>

            <p>[Page Description]</p>
            <?php echo $this->md_decode($subdoc['doc']); ?>
        </section>
    </main>







