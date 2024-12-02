<style>
.breadcrumb_container {
padding: 0 40px;
float:left;
}

.breadcrumb {
display: flex;
border-radius: 10px;
margin: auto;
text-align: center;
top: 50%;
width: 100%;
height: 40px;
transform: translateY(-50%);
z-index: 1;
justify-content: center;
}


.breadcrumb__item {
height: 100%;
background-color: white;
color: #252525;
font-family: 'Oswald', sans-serif;
border-radius: 7px;
letter-spacing: 1px;
transition: all 0.3s ease;
text-transform: uppercase;
position: relative;
display: inline-flex;
justify-content: center;
align-items: center;
font-size: 14px;
transform: skew(-21deg);
box-shadow: 0 2px 5px rgba(0,0,0,0.26);
margin: 5px;
padding: 0 40px;
cursor: pointer;
}


.breadcrumb__item:hover {
background: #490099;
color: #FFF;
}


.breadcrumb__inner {
margin: auto;
z-index: 2;
transform: skew(21deg);
}

.breadcrumb__title {
font-size: 14px;
text-overflow: ellipsis;
overflow: hidden;
white-space: nowrap;
}


@media all and (max-width: 1000px) {
.breadcrumb {
height: 35px;
}

.breadcrumb__title{
font-size: 11px;
}
.breadcrumb__item {
padding: 0 30px;
}
}

@media all and (max-width: 710px) {
.breadcrumb {
height: 30px;
}
.breadcrumb__item {
padding: 0 20px;
}

}
</style>
<div class="breadcrumb_container">
<ul class="breadcrumb">
<li class="breadcrumb__item breadcrumb__item-firstChild"><a href="/<?=$this->page?>">
<span class="breadcrumb__inner">
<span class="breadcrumb__title"><?=$this->page?></span>
</span></a></li>
<?php if($this->sub!=''){ ?>
<li class="breadcrumb__item breadcrumb__item-lastChild"><a href="/<?=$this->page?>/<?=$this->sub?>">
<span class="breadcrumb__inner">
<span class="breadcrumb__title"><?=$this->G['slug']?></span>
</span>
</a></li>
<?php } ?>

</ul>

</div>