<!--
    @filemeta.updatelog
    v.1 manual with json class navigate
    v.2 automatical from admin_page & admin_sub
    v.3 updated to filemeta style
-->
<!--
    @filemeta.description
    admin horizontal & vertical navigation
    fired by Admin navigation method
-->
<!--<html>-->
<header>
    <nav class="navbar">
    <div id="progressBarContainer"><div id="progressBar"><p id="progressText"></p></div></div>
    <a href="/admin/home/profile" class="logo_image_id">
        <img src="<?=isset($_COOKIE['GSIMG']) ? MEDIA_URL.$_COOKIE['GSIMG'] : '/admin/img/user.png'?>" width="48" height="48" style="margin-top: 3px;border-radius:50px">
    </a>
<!------------- @filemeta.features HORIZONTAL_MENU ------------------------------------>
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
        </ul>

        <div id="indicator" class="red indicator"></div>
        <div id="c_active_users"></div>
<div id="signInDiv"></div>
<!-- @filemeta.doc dynamic change of layout currently not used.
<div id="layout-buttons">
    <button data-layout="1" class="buttonChannel" onclick="switchChannels(this.dataset.layout)" title="Single Channel"><span>Ⅰ</span></button>
    <button data-layout="2" class="buttonChannel" onclick="switchChannels(this.dataset.layout)" title="70/30 Layout"><span>⋮⋮|⋮</span></button>
    <button data-layout="3" class="buttonChannel" onclick="switchChannels(this.dataset.layout)" title="70/30 Layout"><span>⋮|⋮</span></button>
    <button data-layout="4" class="buttonChannel" onclick="switchChannels(this.dataset.layout)" title="Three Channels"><span>Ⅲ</span></button>
    <button data-layout="5" class="buttonChannel" onclick="switchChannels(this.dataset.layout)" title="Four Channels"><span>Ⅳ</span></button>
    <button data-layout="6" class="buttonChannel" onclick="switchChannels(this.dataset.layout)" title="Six Channels"><span>Ⅵ</span></button>
</div>
-->
<div style="position:absolute;left:0"><?php echo $this->renderCubo("metatags"); ?></div>
    </nav>

</header>
<!----------------------------@filemeta.features VERTICAL_MENU with Admin navigate method---------------------------->
<div id="dashbar">
	<div id="menuwrapper">
         <ul id="mainmenu">
            <?php
            foreach($this->navigate() as $mainpage =>$vals){
            $targ= $mainpage == $this->page ? 'style="color:darkred;"' : '';
            ?>
            <li <?=$mainpage==$this->page ? $targ : ''?>>
                <button style="border:none;background:transparent;" ondblclick="location.href='/admin/<?=$mainpage?>'" id="<?=$mainpage?>_page" ><span style="margin:0 4px 0 0" class="glyphicon glyphicon-<?=$vals['icon']?>" aria-hidden="true"></span>
                <span class="menu-text"><?=$vals['title']?></span>
                </button>
              <?php
                if(!empty($vals['subs'])){ 	   ?>
    				<ul class="submenu2">

						<?php foreach($vals['subs'] as $sublink=>$subvals){
						if($mainpage!='lab'){
							$sublinkhref= $subvals['mode']=="iframe" ? "/admin/$mainpage?mode=iframe&sub=$sublink&slug={$subvals['slug']}" : "/admin/$mainpage/$sublink";
						?>
					    <li>
                            <a href="<?=$sublinkhref?>" id="<?=$sublink?>_sub" class="<?=$sublink==$this->sub ? 'active':''?>">
						<span style="margin:0 4px 0 0" class="glyphicon glyphicon-<?=$subvals['icon']?>" aria-hidden="true"></span>
						<?=$subvals['slug']?></a>
						</li>
					<?php }}
/** @filemeta.features EXPERIMENTAL_PAGES */
						if($mainpage=='lab'){
						$experimental_pages=$this->experimental_pages($mainpage);
						if(!empty($experimental_pages)){
						 foreach($this->experimental_pages($mainpage) as $exp_page){
						?>
					    <li><a href="/admin/lab/<?=$exp_page?>" style="color:red" class="<?=$exp_page==$this->sub ? 'active':''?>">
                            <?=ucfirst($exp_page)?>
                            </a></li>
					<?php }}} ?>
					</ul>
				<?php } ?>
            </li>
              <?php } ?>
        </ul>
    </div>
</div>
<!--</html>-->