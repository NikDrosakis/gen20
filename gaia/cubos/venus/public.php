<style>
    body, textarea {
        font-family: "Lucida Grande", Arial, Helvetica, sans-serif;
    }
    .chatBottomAll {
        float: right;
        width: 300px;
        position: fixed;
        bottom: 0;
        right: 1%;
        z-index: 9999;
        display: flex;
        justify-content: flex-end;
        flex-wrap: nowrap;
    }
    .chatBottom {
        float: right;
        min-width: 270px;
        width: 270px;
        position: relative;
        z-index: 99;
        margin: 0 3px;
    }
    .interviewsEr_messageFromEe {
        float: right;
        background-color: rgba(255, 255, 255, 1);
        width: 97%;
        margin: 0px 4px 0px 0px;
        border-left: 2px solid #122464;
        font-size: 13px;
        text-align: center;
        position: relative;
        z-index: 99;
        border-right: 2px solid #122464;
        border-top: 2px solid #122464;
        height: 100%;
    }

    .chatBoard_top {
        float: left;
        width: 100%;
        margin: 0px 0 0px 0px;
        position: relative;
        background-color: pink;
        padding: 5px 0px 6px 0px;
    }

    .chatBoard_topM {
        float: left;
        width: 95%;
        margin: 0px 0 0px 0px;
        position: relative;
        padding: 5px 0px 2px 5%;
    }

    .chatBoard_title {
        float: left;
        width: 64%;
        position: relative;
        text-align: left;
        font-weight: 900;
        font-size: 14px;
        color: #ffffff;
    }
    .chatBoard_title a {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 105%;
        float: left;
        color: #fff;
        text-decoration: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-all;
        display: block;
        padding: 2px 2% 0 2%;
    }
    .chatBoard_title2 {
        color: #414142;
        float: left;
        width: 76%;
        position: relative;
        text-align: left;
        font-weight: bold;
        font-size: 13px;
        margin: 8px 0 0 0px;
        word-break: break-all;
    }
    .chatBoard_title3 {
        float: left;
        width: 96%;
        position: relative;
        text-align: left;
        font-weight: 900;
        font-size: 14px;
        color: #414142;
        padding: 0 9px;
        min-height: 20px;
    }
    .chatBoard_title3:hover {
        color: #ec0f19;
    }

    .chatMCounter {
        font-weight: bold;
        color: #f1f6fb !important;
        margin: 0 !important;
        position: absolute;
        min-width: 12px;
        float: none;
        text-align: center;
        top: 4px;
        left: 3px;
        padding: 1px 6px 4px 3px;
        background-color: rgba(69, 145, 174, 0.84);
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 11px;
        border-radius: 20px;
        -moz-border-radius: 20px;
        -webkit-border-radius: 20px;
        -webkit-box-shadow: -2px 1px 8px 0px rgba(255, 255, 255, 0.7);
        -moz-box-shadow: -2px 1px 8px 0px rgba(255, 255, 255, 0.7);
        box-shadow: 0px 0px 8px 2px rgba(255, 255, 255, 0.7);
        font-style: italic !important;
        height: 11px;
    }

    .venus-dialogueBox{
        background-color: rgba(242, 242, 243, 0.21);
        font-size: 13px;
        color: #333;
        text-align: left;
        overflow-y: scroll;
        margin: 0px 0 0px 0px;
        -webkit-box-shadow: inset 0px 0px 35px -14px rgba(0,0,0,0.3);
        -moz-box-shadow: inset 0px 0px 35px -14px rgba(0,0,0,0.3);
        box-shadow: inset 0px 0px 35px -14px rgba(0,0,0,0.3);
        position: relative;
        overflow-x: hidden;

    }
    .chatOfLine {
        float: left;
        width: 100%;
        position: relative;
    }
    .chatOffer {
        float: left;
        width: 100%;
        position: relative;
        max-height: 48vh;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .chatOfDatetimeL, .chatOfDatetimeR {
        font-size: 10px;
        position: relative;
        margin: -2px 40px 4px 30px;
    }
    .chatOfDatetimeL {
        text-align: left;
        color: #58a1ec;
        float: left;
    }
    .chatOfDatetimeR {
        text-align: right;
        color: #f7685d;
        float: right;
    }
    .chatOfferText {
        background-color: transparent;
        width: 92%;
        max-height: 38px !important;
        font-size: 13px;
        color: #333;
        text-align: left;
        padding: 3px 3px 3px 16px;
        margin: 6px 0px 11px 18px;
        position: relative;
        border: 1px solid rgba(8, 63, 136, 0.2);
        bottom: 0;
        min-height: 36px !important;
        background-image: url(/img/arrowRov.png);
        background-repeat: no-repeat;
        background-position: 1px 1px;
        float: left;
    }
    .triangle-isoof {
        position: relative;
        padding: 4px;
        margin: 0em 0em 0.2em -1em;
        color: #515050;
        font-weight: normal;
    }
    .triangle-isoof.left {
        background: #cae4ff;
        float: left;
        width: 93%;
        margin: 0px 0px 4px 20px;
        word-wrap: break-word;
        height: auto;
        font-size: 13px;
    }
    .triangle-isoof.right {
        background: #5199c8;
        float: left;
        width: 93%;
        margin: 0 0px 4px 20px;
        word-wrap: break-word;
        height: auto;
        font-size: 13px;
    }
    .triangle-isoof:after {
        content: "";
        position: absolute;
        border-style: solid;
        display: block;
        width: 0px;
        margin-top: -6px;
    }
    .triangle-isoof.left:after {top: 10px;left: -10px;bottom: auto;border-width: 6px 9px 6px 0px;border-color: transparent #58a1ec;}
    .triangle-isoof.right:after {
        top: 10px;
        right: -10px;
        bottom: auto;
        left: auto;
        border-width: 6px 0px 6px 9px;
        border-color: transparent #f7685d;
    }
    .chatextarea {
        background-color: transparent;
        width: 100%;
        height: 36px;
        font-size: 13px;
        color: #333;
        text-align: left;
        padding: 3px 24px 3px 18px;
        margin: 2px 0px 11px 3px;
        position: relative;
        border: 1px solid rgba(8, 63, 136, 0.2);
        bottom: 0;
        background-repeat: no-repeat;
        background-position: 1px 1px;
        float: left;
    }
    .messi1, .messi2, .messi3, .messi4, .messi5 {
        font-size: 14px;
        line-height: 1;
        display: block;
        position: relative;
        color: rgb(69 144 173);
        margin: 0;
        padding: 0;
        float: left;
        height: 20px;
        width: 20px;
        text-align: center;
        border: 0;
        z-index: 9;
        font-weight: normal;
        border-bottom: 4px solid transparent;
        display: flex;
        justify-content: center;
        background-repeat: no-repeat;
        background-position: 0 50%;
        background-size: contain;
        margin: 0 0 0 3px;
    }
    .messi1 {
        background-image: url(/img/mailCategBtnjob.png);
    }
    .messi2 {
        background-image: url(/img/mailCategBtnb2b.png);
    }
    .messi3 {
        background-image: url(/img/mailCategBtnproperty.png);
    }
    .messi4 {
        background-image: url(/img/mailCategBtnloans.png);
    }
    .messi5 {
        background-image: url(/img/mailCategBtnEmpl.png);
    }
    .messBtnCont {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-content: space-between;
        justify-content: flex-start;
        align-items: flex-end;
    }
    .messBtn1, .messBtn2, .messBtn3, .messBtn4, .messBtn5, .messBtn1Act, .messBtn2Act, .messBtn3Act, .messBtn4Act, .messBtn5Act {
        font-size: 14px;
        line-height: 1;
        display: block;
        position: relative;
        color: rgb(69 144 173);
        margin: 0;
        padding: 0;
        float: left;
        height: 73px;
        width: 25%;
        text-align: center;
        border: 0;
        z-index: 9;
        font-weight: normal;
        border-bottom: 4px solid transparent;
        display: flex;
        justify-content: center;
        background-repeat: no-repeat;
        background-position: 0 50%;
        background-size: contain;
    }
    .messBtn1, .messBtn2, .messBtn3, .messBtn4, .messBtn5 {background-color: transparent;}
    .messBtn1Act, .messBtn2Act, .messBtn3Act, .messBtn4Act, .messBtn5Act {background-color: transparent; border-bottom:4px solid;}
    .messBtn1:hover, .messBtn2:hover, .messBtn3:hover, .messBtn4:hover, .messBtn5:hover, .messBtn1Act, .messBtn2Act, .messBtn3Act, .messBtn4Act, .messBtn5Act {
        border-bottom:4px solid;
        background-color: transparent;
    }
    .messBtn1 {
        background-image: url(/img/mailCategBtnjob.png);
        background-repeat: no-repeat;
        background-position: 0 50%;
    }
    .messBtn1:hover, .messBtn1Act {
        background-image: url(/img/mailCategBtnjobOv.png);
    }
    .messBtn2 {
        background-image: url(/img/mailCategBtnb2b.png);
        background-repeat: no-repeat;
        background-position: 0 50%;
    }
    .messBtn2:hover, .messBtn2Act {
        background-image: url(/img/mailCategBtnOv.png);
    }
    .messBtn3 {
        background-image: url(/img/mailCategBtnproperty.png);
        background-repeat: no-repeat;
        background-position: 0 50%;
    }
    .messBtn3:hover, .messBtn3Act {
        background-image: url(/img/mailCategBtnpropertyOv.png);
    }
    .messBtn4 {
        background-image: url(/img/mailCategBtnloans.png);
        background-repeat: no-repeat;
        background-position: 0 50%;
    }
    .messBtn4:hover, .messBtn4Act {
        background-image: url(/img/mailCategBtnloansOv.png);
    }
    .messBtn5 {
        background-image: url(/img/mailCategBtnEmpl.png);
        background-repeat: no-repeat;
        background-position: 0 54%;
    }
    .messBtn5:hover, .messBtn5Act {
        background-image: url(/img/mailCategBtnEmplOv.png);
    }
    .messBtn {
        background-color: rgb(69 144 173);
        float: left;
        width: 100%;
        cursor: pointer;
        position: relative;
        margin: 0 0 3px 0;
        border: 0;
        color: #fff;
        font-size: 14px;
        padding: 6px 6px;
        text-align: left;
    }
    .messBtnMenu {
        float: left;
        margin: 14px 0 0px 0;
        width: 98.5%;
        position: relative;
        box-shadow: inset 1px 1px 1px rgb(255 255 255 / 0%), inset 0 0 22px rgb(0 0 0 / 0%), 0 -2px 10px -2px rgb(0 0 0 / 10%);
        overflow: hidden;
        border: 2px solid #4591AE;
        padding: 0;
        background-color: var(--bg3);
    }
    .venus-dialogueBox {
        width: 100%;
        height: 178px;
        padding: 3px;
    }
    .chatBoardTextHistory2 {
        width: 93%;
        height: 71.1vh;
        padding: 8px 6px 8px 31px;
    }

    .chatBoardResponce {
        float: right;
        width: 100%;
        margin: 0px 0px 6px 0px;
        /* height: 117px; */
        position: relative;
    }
    #chati {
        /* height: 117px; */
    }

    .chatResponceCont, .chatLine {
        float: left;
        width: 100%;
        position: relative;
    }

    .chatDatetime {
        width: 80%;
        text-align: center;
        font-size: 10px;
        float: right;
        color: rgb(92, 176, 218);
        position: relative;
        margin: 1px 0 2px 0;
    }

    .chatDatetimeM {
        font-size: 10px;
        color: #4591ae;
        float: left;
        width: 76%;
        position: relative;
        text-align: left;
        margin: 8px 0 0px 0px;
        line-height: 1.2;
    }

    .chatBoardName1 {
        background-color: #dadada;
        height: auto;
        font-size: 13px;
        color: #191D67;
        font-weight: bold;
        text-align: center;
        padding: 2px;
        margin: 0px 7px 10px 0px;
        position: relative;
        float: left;
        top: 6px;
        clear: left;
        width: 35px;
        height: 35px;
    }
    .chatBoardName1M {
        background-color: #dadada;
        height: auto;
        font-size: 13px;
        color: #191D67;
        font-weight: bold;
        text-align: center;
        padding: 2px;
        margin: 7px 6px 1px -3px;
        position: relative;
        float: left;
        height: 36px;
        width: 36px;
    }

    .triangle-isosceles {
        position: relative;
        padding: 4px;
        margin: 0em 0em 0.2em -1em;
        color: #515050;
        border: 1px solid #4591AE;
        font-weight: normal;
    }
    .triangle-isosceles.left {
        background: #fff;
        float: right;
        width: 77% !important;
        margin: 8px 0px 0px 0px;
        word-wrap: break-word;
    }
    .triangle-isosceles.right {
        background: #F5F5F5;
        float: left;
        width: 93% !important;
        margin: 8px 0px 0px 0px;
        word-wrap: break-word;
    }
    .triangle-isosceles:after {
        content: "";
        position: absolute;
        border-style: solid;
        display: block;
        width: 0px;
        margin-top: -6px;
    }
    .triangle-isosceles.left:after {
        top: 10px;
        left: -10px;
        bottom: auto;
        border-width: 6px 9px 6px 0px;
        border-color: transparent #4591AE;
    }
    .triangle-isosceles.right:after {
        top: 10px;
        right: -10px;
        bottom: auto;
        left: auto;
        border-width: 6px 0px 6px 9px;
        border-color: transparent #4591AE;
    }

    .chatBoardText {
        background-color: transparent;
        width: 92%;
        max-height: 47px !important;
        font-size: 13px;
        color: #333;
        text-align: left;
        padding: 3px 3px 3px 16px;
        margin: 7px 0px 6px -1px;
        position: relative;
        border: 1px solid rgba(8, 63, 136, 0.2);
        bottom: 0;
        min-height: 47px !important;
        background-image: url(/img/arrowRov.png);
        background-repeat: no-repeat;
        background-position: 1px 1px;
    }
    .chatBoardText:focus {
        background-color: rgba(92, 176, 218, 0.1);
    }

    .chatBoardTextM {
        background-color: transparent;
        width: 95.2%;
        min-height: 104px !important;
        font-size: 13px;
        color: #333;
        text-align: left;
        padding: 3px 3px 3px 19px;
        margin: 7px 0px 6px 1px;
        position: relative;
        border: 1px solid rgba(8, 63, 136, 0.2);
        bottom: 0;
        background-image: url(/img/arrowRov.png);
        background-repeat: no-repeat;
        background-position: 4px 3px;
        float: left;
    }
    .chatBoardTextM:focus {
        background-color: rgba(92, 176, 218, 0.1);
    }

    .close_pop_ups_button {
        background-image: url(/img/pop_ups/close_button.png);
        background-repeat: no-repeat;
        width: 13px;
        height: 13px;
        border: 0;
        cursor: pointer;
        float: right;
        margin: 4px 7px 0px 0px;
        z-index: 99999;
        position: relative;
    }
    .close_pop_ups_button:hover	{
        background-image:url(/img/pop_ups/close_button_ov.png);
    }

    .minimize_chat {
        float: right;
        width: 11px;
        height: 10px;
        margin: 4px 7px 0px 0px;
        z-index: 99999;
        position: relative;
        border-bottom: 2px solid #fff;
        cursor: pointer;
    }
    .minimize_chat:hover {
        opacity:0.5;
    }


    .chatAll {
        float: left;
        width: 100%;
        position: relative;
        z-index: 9999;
    }

    .chatCon {
        float: right;
        width: 100%;
        position: relative;
        z-index: 99;
        bottom: 0;
    }

    .venusBox {
        float: left;
        background-color: rgba(255, 255, 255, 1);
        width: 300px;
        margin: 4px 8px 0px 0px;
        font-size: 13px;
        text-align: center;
        position: relative;
        z-index: 99;
        border-top-right-radius: 10%;
        border-top-left-radius: 10%;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
    }

    .chatBoardTextHistory3 {
        width: 98%;
        height: 55vh;
        padding: 1%;
        background-color: rgba(242, 242, 243, 0.21);
        font-size: 13px;
        color: #333;
        text-align: left;
        overflow-y: scroll;
        margin: 0px 0 0px 0px;
        -webkit-box-shadow: inset 0px 0px 35px -14px rgba(0,0,0,0.3);
        -moz-box-shadow: inset 0px 0px 35px -14px rgba(0,0,0,0.3);
        box-shadow: inset 0px 0px 35px -14px rgba(0,0,0,0.3);
        position: relative;
        overflow-x: hidden;
    }

    .chatBoard_title1 {
        float: left;
        width: 86%;
        position: relative;
        text-align: left;
        font-weight: 900;
        font-size: 14px;
    }
    .chatBoard_title1 a {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 103%;
        float: left;
        color: #122464;
        text-decoration: none;
    }

    .chatBoard_top1 {
        float: left;
        width: 100%;
        margin: 0px 0 0px 0px;
        position: relative;
        padding: 5px 0px 6px 0px;
    }

    .chatBoardText2 {
        background-color: white;
        width: 88%;
        font-size: 13px;
        color: #333;
        text-align: left;
        padding: 3px 3% 3px 6%;
        margin: 7px 1%;
        position: relative;
        border: 1px solid rgba(8, 63, 136, 0.2);
        bottom: 0;
        height: 16vh !important;
        background-image: url(/img/arrowRov.png);
        background-repeat: no-repeat;
        background-position: 1px 1px;
        left: 0;
        bottom: 0;
    }

    .sentChat {
        background-image: url(/img/pop_ups/sentChat.png);
        background-repeat: no-repeat;
        position: absolute;
        cursor: pointer;
        background-color: transparent;
        border: 0;
        bottom: 21px;
        right: 16px;
        width: 20px;
        height: 18px;
    }
    .sentChat:hover {
        opacity:0.5;
    }

    #wrapper, .wrapper {
        margin: 0px 0px 50px 0px;
    }
    .messagesTotal {
        margin: 0px 0 0px 0;
    }

    .mgt {
        border: 0;
        border-radius: 25px;
        background-color: #daa520;
        font-weight: bold;
        color: #fff;
        font-size: 12px;
        letter-spacing: 1px;
        float: right;
        height: 23px;
        margin: 2px 5px 0 0px;
        cursor: pointer;
    }
    .mgt:hover {
        -webkit-box-shadow: inset 5px 12px 9px -10px rgba(0,0,0,0.75);
        -moz-box-shadow: inset 5px 12px 9px -10px rgba(0,0,0,0.75);
        box-shadow: inset 5px 12px 9px -10px rgba(0,0,0,0.75);
    }

    .mgtin {
        float: left;
        margin: 1px 5px 0 16px;
    }
</style>
<?php
//xecho("here");
$mode='';
$ui='1';
$cid=1;
?>


<!---CHATBOX---->
<div id="wrapperchat" class="chatBottomAll">

<div id="chatDial<?= $mode . $cid ?>" class="venusBox" placeholder="Reason of changing time">
    <div class="chatBoard_top">
        <input id="venus_panel" class="red indicator">
        <span style="cursor:pointer" class="chatBoard_title">
            <div id="messi<?= $mode . $cid ?>"></div>
            <a class="fn" id="chatitle<?= $mode . $cid ?>"></a>
        </span>
        <button id="closechat<?= $mode . $cid ?>" onclick="gs.venus.closeVenusBox(this)" 
            class="bare glyphicon glyphicon-remove" style="float:right"></button>
        <button id="minchat<?= $mode . $cid ?>" onclick="gs.venus.minmaxVenusBox(this)" 
            class="bare glyphicon glyphicon-minus" style="float:right"></button>
        <div class="chatcam">
            <button id="chatcamera<?= $mode . $cid ?>" class="bare glyphicon glyphicon-camera" style="float:right"></button>
        </div>
    </div>
    <div id="chato<?= $mode . $cid ?>" class="venus-dialogueBox"></div>
    <div class="answerOfferEoi">
        <div id="chatinput<?= $mode . $cid ?>" contenteditable="true" 
            style="white-space: pre-wrap; overflow-y: scroll;" class="chatextarea"></div>
        <button id="chatsend<?= $mode . $cid ?>" onclick="gs.venus.send(this,1)" 
            class="bare glyphicon glyphicon-envelope"></button>
    </div>
</div>


</div>
