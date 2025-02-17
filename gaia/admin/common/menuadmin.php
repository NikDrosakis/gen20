<header>
    <nav id="mainmenu" class="navbar">
        <div id="progressBarContainer">
            <div id="progressBar">
                <p id="progressText"></p>
            </div>
        </div>
        <a href="/admin/user/user?id=<?=$this->me?>" class="logo_image_id">
            <img src="<?=isset($_COOKIE['GSIMG']) ? MEDIA_URL.$_COOKIE['GSIMG'] : '/admin/img/user.png'?>" width="48" height="48" style="margin-top: 3px;border-radius:50px">
        </a>
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
        <li class="menu-item">
            <a class="menu-text" data-uid="1" data-cid="3701232" data-uid0="2" data-mode="1" id="chat_3701232" onclick="gs.venus.fire(this,1)" title="Chat">
                <div class="totalChatNum chatc_3701232"></div>Chat
            </a>
            <ul class="submenu">
                <li>Short Sidebar<input style="float:left" type="checkbox" switch="" class="switcher"></li>
                <li>Wide Sidebar<input style="float:left" type="checkbox" switch="" class="switcher"></li>
                <li>Short Navigation<input style="float:left" type="checkbox" switch="" class="switcher"></li>
                <li>Dark<input type="checkbox" style="float:left" switch="" class="switcher"></li>
            </ul>
        </li>
                    <?php
                    foreach($this->navigate() as $mainpage =>$vals){

                    $targ= $mainpage == $this->page ? 'style="color:darkred;"' : '';
                    ?>
                    <li  class="menu-item" <?=$mainpage==$this->page ? $targ : ''?>>
                        <a class="menu-text" style="border:none;background:transparent;" ondblclick="location.href='/admin/<?=$mainpage?>'" id="<?=$mainpage?>_page" >
                        <span style="margin:0 4px 0 0" class="glyphicon glyphicon-<?=$vals['icon']?>" aria-hidden="true"></span>
                        <?=$vals['title']?>
                        </a>
                      <?php
                        if(!empty($vals['subs'])){ 	   ?>
            				<ul class="submenu">

        						<?php foreach($vals['subs'] as $sublink=>$subvals){
        						if($mainpage!='lab'){
        							$sublinkhref= $subvals['mode']=="iframe" ? "/admin/$mainpage?mode=iframe&sub=$sublink&slug={$subvals['slug']}" : "/admin/$mainpage/$sublink";
        						?>
        					    <li>
                                    <a href="<?=$sublinkhref?>" id="<?=$sublink?>_sub" class="<?=$sublink==$this->sub ? 'active':''?>">
        						<span style="margin:0 4px 0 0" class="glyphicon glyphicon-<?=$subvals['icon']?>" aria-hidden="true"></span>
        						<?=$subvals['slug']?></a>
        						</li>
        					<?php }} ?>
        					<li>
                                <button class="bare" onclick="gs.new('alinks')">
                                 <span class="glyphicon glyphicon-plus">New</span></button>
                            </li>
        <?php
        						if($mainpage=='lab'){
        						$pages= glob(ADMIN_ROOT . 'main/*.php');

        						if(!empty($pages)){
        						 foreach($pages as $exp_page){
        						 $file = basename($exp_page);
        						?>
        					    <li><a href="/admin/lab/<?=$file?>" style="color:red" class="<?=$file==$this->sub ? 'active':''?>">
                                    <?=ucfirst($file)?>
                                </a></li>
        					<?php }}} ?>
        					</ul>
        				<?php } ?>
                    </li>
                      <?php } ?>
                <li class="menu-item" ><a class="menu-text" onclick="openPanel('common/guide.php');gs.coo('openGuideChannel',1)">Question<span style="margin:0 4px 0 0" class="glyphicon glyphicon-question-sign"></span></a></li>
                <li class="menu-item" ><a class="menu-text" onclick="openPanel('common/doc.php');gs.coo('openDocChannel',1)">Info<span style="margin:0 4px 0 0" class="glyphicon glyphicon-info-sign bare"></span></a></li>
                <div id="indicator" class="red indicator"></div>
                <div id="c_active_users"></div>
                <div id="signInDiv"></div>


    </nav>
</header>

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