<style>
    /* Mobile styles */
    @media screen and (max-width: 600px) {
        #h .main-nav {
            display: none;
            flex-direction: column;
            width: 100%;
        }
        #h .main-nav a {
            display: block;
            text-align: left;
            padding: 10px;
            border-top: 1px solid #444;
        }

        #h .icon {
            display: block;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }

        #h.responsive .main-nav {
            display: flex;
        }

        .nav-drop, #searchbox {
            width: 100%;
        }

        #searchbox input {
            flex-grow: 1;
        }
    }

    ion-icon{
        cursor:pointer;
    }

    .nav-drop{
        width: 100px;
        height: 38px;
        font-size: 16px;
        border: none;
        background: #dcd2c2;
        float:left;
        border-radius: 10px;
    }
    .ion{
        height:30px;
        margin:-9px 0 0 0;
    }
    /* switch display */
    #ssearch_book{
        border:none;
        display:none;
    }
    #searchbox
    {
        display: block;
        float: left;
    }
    .switch {
        width: 60px;
        height: 38px;
        float: left;
        margin: 0 5px 0 32px;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        -webkit-transition: .4s;
        transition: .4s;
    }
    input:checked + .slider {
        background-color: #70400c;
    }
    input:focus + .slider {
        box-shadow: 0 0 1px #70400c;
    }
    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }
    /* Rounded sliders */
    .slider.round {
        border-radius: 10px;
    }
    .slider.round:before {
        border-radius: 50%;
    }
    .profile-nav {
        padding-top:10px;
    }
    .profile-menu {
        margin: 0px 15px 0 0;
        float:left;
    }
    .profile-container {
        position: relative; /* Makes it the reference point for the absolute positioning of the dropdown */
        display: inline-block;
    }
    .profile-image {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
    }
    .dropdown-menu {
        display: none;
        position: absolute;
        top: 100%; /* Places it directly below the profile image */
        right: 0;
        background-color: white;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        overflow: hidden;
        z-index: 1000; /* Ensures dropdown is on top of other content */
        width: 200px;
    }
    /* Dropdown menu items */
    .dropdown-menu a {
        width:100%;
        display: block;
        padding: 12px 16px;
        color: #333;
        text-decoration: none;
        font-size: 14px;
    }
    .dropdown-menu a:hover {
        background-color: #f1f1f1;
    }

    /* Show the dropdown when hovering over the profile container */
    .profile-container:hover .dropdown-menu {
        display: block;
    }
</style>
    <!---main navigation-->
<div class="main-nav">
    <a href="/" class="<?=$this->G['page']=='' || $this->G['page']=='books' ?'active':''?>">
        <img class="logo" src="<?=$this->G['logo']?>" />
    </a>
    <?php
        $menu=$this->getLinks();
        for($i=0;$i<count($menu);$i++){
            $icon=$menu[$i]['icon'];
            ?>
       <a href="/<?=$menu[$i]['uri']?>" class="<?=$this->G['page']==$menu[$i]['uri'] ?'active':''?>" >
       <?php if($icon!=null){ ?>
       <ion-icon style="vertical-align: middle;" alt="<?=$menu[$i]['title']?>" name="<?=$icon?>" size="medium"></ion-icon>
       <?php }else{ ?>
           <span><?=$menu[$i]['title']?></span>
           <?php } ?>
           <span class="c_<?=$menu[$i]['uri']?> bubPr"></span>
       </a>
        <?php } ?>
    <?php if(!$this->G['loggedin']){ ?>
    <a onclick="s.redirect(&quot;/login&quot;)"><span>Login</span></a>
    <?php } ?>
</div>
<!---profile navigation-->
<div class="profile-nav">
    <?php if($this->G['loggedin']){ ?>
        <div class="profile-menu">
            <div class="profile-container">
                <!-- Profile Image -->
                <img src="/media/<?=$this->G['my']['img']?>" alt="Profile" class="profile-image">
                <!-- Dropdown Menu -->
                <div class="dropdown-menu">
                    <a href="/book" class="<?=$this->G['page']==$menu[$i]['uri'] ?'active':''?>" >
                        <span>My library</span>
                        <span class="c_book bubPr"></span>
                    </a>
                    <a href="/profile" class="<?=$this->G['page']==$menu[$i]['uri'] ?'active':''?>">
                        <span>Profile</span>
                        <span class="c_profile bubPr"></span>
                    </a>
                    <a onclick="gs.init.logout()">Logout</a>
                </div>
            </div>
        </div>
    <?php } ?>
    <!---search box--->
    <div id="searchbox">
        <div style="display:flex">
            <input onkeyup="$('#reset_book').css('display','block');$('#search_book').css('display','block');" id="search_book" autocomplete="on" onkeydown="if (event.keyCode === 13){var q= $('#search_book').val().trim();coo('page',1);if(!!q){coo('q',q)}booklist(q);}" placeholder="search <?=$this->G['mode']?>">
            <ion-icon style="display:none" id="reset_book" alt="Search" alt="Reset" name="return-up-back" size="large"></ion-icon>
            <ion-icon style="display:none" id="ssearch_book" alt="Search" alt="Searcg" name="search" size="large"></ion-icon>
        </div>
    </div>
<!---apps-->
            <div class="profile-container" style="float: left;margin: 9px 16px 0 33px;">
                <!-- Profile Image -->
                <ion-icon style="vertical-align: middle;" alt="Apps" name="apps" size="medium"></ion-icon>
                <!-- Dropdown Menu -->
                <div class="dropdown-menu">
                    <a href="/profile" class="<?=$this->G['page']==$menu[$i]['uri'] ?'active':''?>">
                        <span>Profile</span>
                    </a>
                    <a href="/book" class="<?=$this->G['page']==$menu[$i]['uri'] ?'active':''?>" >
                        <span>My library</span>
                    </a>
                    <a onclick="s.init.logout()">
                        <span>Logout</span>
                    </a>
                </div>
            </div>
<!---settings-->
            <div class="profile-container" style="float: left;margin: 9px 8px 0 0;">
                <!-- Profile Image -->
                <ion-icon style="vertical-align: middle;" alt="Settings" name="settings" size="medium"></ion-icon>
                <!-- Dropdown Menu -->
                <div class="dropdown-menu">
                    <!---language switcher--->
                    <select class="nav-drop" onchange="if(!!this.value){coo('LANG',this.value)}else{coo.del('LANG')}booklist()">
                        <option <?=empty($_COOKIE['LANG']) ? 'selected:selected':''?>>Language</option>
                        <option value="el" <?=$_COOKIE['LANG']=='el' ? 'selected=selected':''?> >Ελληνικά</option>
                        <option value="en" <?=$_COOKIE['LANG']=='en' ? 'selected=selected':''?> >English</option>
                    </select>
                    <!---display switcher--->
                    <div class="switch">
                        <input name="display" type="checkbox" <?=$_COOKIE['display']=='dark' ? 'checked':''?> value=""/>
                        <span class="slider round"></span>
                    </div>
                </div>
            </div>
    <div id="indicator" class="red indicator"></div>
    <div id="indicator2" class="red indicator"></div>
    <div id="c_active_users"></div>
</div>
