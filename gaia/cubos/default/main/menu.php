<nav id="mainmenu" class="navbar">
    <div id="progressBarContainer">
        <div id="progressBar">
            <p id="progressText"></p>
        </div>
    </div>
    <a href="/user?id=<?=$this->me?>" class="logo_image_id">
        <img src="<?=isset($_COOKIE['GSIMG']) ? MEDIA_URL.$_COOKIE['GSIMG'] : '/asset/img/user.png'?>" width="48" height="48" style="margin-top: 3px;border-radius:50px">
    </a>

    <!-- Static items -->
    <li class="menu-item">
        <a class="menu-text">View</a>
        <ul class="submenu">
            <li><input style="float:left" type="checkbox" switch="" class="switcher">Short Sidebar</li>
            <li><input style="float:left" type="checkbox" switch="" class="switcher">Short Navigation</li>
            <li><input style="float:left" type="checkbox" switch="" class="switcher">Dark</li>
        </ul>
    </li>
    <li class="menu-item">
        <a class="menu-text">Settings</a>
        <ul class="submenu">
            <li>Short Sidebar<input style="float:left" type="checkbox" switch="" class="switcher"></li>
            <li>Wide Sidebar<input style="float:left" type="checkbox" switch="" class="switcher"></li>
            <li>Short Navigation<input style="float:left" type="checkbox" switch="" class="switcher"></li>
            <li>Dark<input type="checkbox" style="float:left" switch="" class="switcher"></li>
        </ul>
    </li>

    <!-- Dynamic Menu Items -->
    <?php
    $pages = $this->getMenu();
    foreach ($pages as $pagegrpname => $vals):
        $targ = $pagegrpname == $this->page ? 'style="color:darkred;"' : '';
    ?>
        <li class="menu-item" <?=$targ?>>
            <a class="menu-text" style="border:none;background:transparent;" onclick="location.href='/<?=$pagegrpname?>'" id="<?=$pagegrpname?>_page">
                <span style="margin:0 4px 0 0" class="glyphicon glyphicon-<?=$vals['icon']?>" aria-hidden="true"></span>
                <?=$vals['title']?>
            </a>

            <?php if (!empty($vals['subs'])): ?>
                <ul class="submenu">
                    <?php foreach ($vals['subs'] as $subvals):
                        $view= $subvals['view'];
                        if($subvals['view']!='public'){
                        $sublinkhref = $subvals['mode'] == "iframe" ? "/$mainpage?mode=iframe&page=$pagegrpname&view={$view}" : "/$view";

                    ?>
                        <li>
                            <a href="<?=$sublinkhref?>" id="<?=$subvals['view']?>_sub" class="<?=$subvals['view'] == $this->page ? 'active' : ''?>">
                                <span style="margin:0 4px 0 0" class="glyphicon glyphicon-<?=$subvals['icon']?>" aria-hidden="true"></span>
                                <?=$subvals['view']?>
                            </a>
                        </li>
                    <?php } ?>
                    <?php endforeach; ?>
                  <!--  <li>
                        <button class="bare" onclick="gs.new('main')">
                            <span class="glyphicon glyphicon-plus">New</span>
                        </button>
                    </li>-->
                </ul>
            <?php endif; ?>
        </li>
    <?php endforeach; ?>

    <!-- Static Items -->
    <li class="menu-item">
        <a class="menu-text" onclick="openPanel('common/guide.php');gs.coo('openGuideChannel',1)">Question
            <span style="margin:0 4px 0 0" class="glyphicon glyphicon-question-sign"></span>
        </a>
    </li>
    <li class="menu-item">
        <a class="menu-text" onclick="openPanel('common/doc.php');gs.coo('openDocChannel',1)">Info
            <span style="margin:0 4px 0 0" class="glyphicon glyphicon-info-sign bare"></span>
        </a>
    </li>

    <div id="indicator" class="red indicator"></div>
    <div id="c_active_users"></div>
    <div id="signInDiv"></div>
</nav>

<script>
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".menu-item > .menu-text").forEach(menuText => {
            menuText.addEventListener("click", function (e) {
                e.preventDefault(); // Prevent default link behavior if needed
                let parent = this.closest(".menu-item");
                let submenu = parent.querySelector(".submenu");

                // Close other open menus
                document.querySelectorAll(".menu-item.open").forEach(item => {
                    if (item !== parent) item.classList.remove("open");
                });

                // Toggle this one
                parent.classList.toggle("open");
            });
        });

        // Close submenu when clicking outside
        document.addEventListener("click", function (e) {
            if (!e.target.closest(".menu-item")) {
                document.querySelectorAll(".menu-item.open").forEach(item => item.classList.remove("open"));
            }
        });
    });
</script>
