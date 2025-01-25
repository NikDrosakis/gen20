<body>
<div style="height:60px;margin:0;padding:0"><img style="width:100%" src="https://bookriot.com/wp-content/uploads/2017/05/bookstore-lightbulbs-shelves-470x248.png"></div>
<div class="topnav" id="myTopnav">
<?php if($my['libid']!=0){ ?>
    <a href="/" class="<?=$G['page']==''?'active':''?>">My library</a>
<?php } ?>
    <a href="/libraries" class="<?=$G['page']=='libraries'?'active':''?>">Libraries</a>
    <a class="<?=$G['page']=='ebook'?'active':''?>" href="/ebook">Ebooks</a>
    <a class="<?=$G['page']=='writer'?'active':''?>" href="/writer">Writers</a>
    <a class="<?=$G['page']=='editor'?'active':''?>" href="/editor">Editors</a>
    <a class="<?=$G['page']=='cat'?'active':''?>" href="/cat">Categories</a>

	<div id="searchbox">
    <input id="search_book" placeholder="search <?=$G['mode']?>">
    <button type="button" style="border:none;background:none;margin:0 0 0 -32px" aria-hidden="true" id="ssearch_book">GO</button><button type="button" onclick="coo('pagenum');$('#search_book').val('');booklist()" style="border:none;background:none;margin:0 0 0 0" aria-hidden="true" id="ssearch_book">RESET</button>
</div>
	<?php if($loggedin){ ?>
	<a class="<?=$G['page']=='profile'?'active':''?>" href="/profile">Profile</a>
<a onclick="s.init.logout()" id="logout">Logout</a>
<?php }else{ ?>
<a class="<?=$G['page']=='login'?'active':''?>" style="cursor:pointer" onclick="s.redirect(&quot;/login&quot;)">Login</a>
<?php } ?>


</div>
