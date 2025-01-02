<!-- @filemeta.description Compo UI used by Venus chat-->
<style>
#chatbox{
color:black;
    overflow-y: auto;
}
#chatresponse > div{
    line-height:18px;
        margin-top: 16px;
}
.message_id{ float:right;font-size:12px;font-family: Verdana; font-style: italic;  }
.message_title{  font-size:18px;    color: #aabac8;  }
.message_lines{   font-size:14px;font-family: Verdana;  }

#chatresponse{
overflow-y: auto;
width:98%;
margin:1%;
background: aliceblue;
font-size:18px;
}
#chatForm{
width: 100%;
    height: 14px;
}
.chat-upload{
display: flex;
    align-items: center;
    margin-right: 10px;
}
    .chat-input-container {
display: table;
    align-items: center;
    background-color: #333333;
    border-radius: 10px;
    padding: 10px;
    position: fixed;
    width: 500px;
    bottom: 0;
    height: 30px;
    border-radius: 20px;
}
    .chat-upload {
    align-items: center;
    margin: 11px 4px 4px 0;
    float: left;
    position: absolute;
    }

    .clip-icon {
    width: 40px;
    cursor: pointer;
    background: transparent;
    margin: -11px 0 0 -3px;
    border-radius:40px;
       }

    #chatMessage {
    width: 78%;
    float: left;
    border: none;
    border-radius: 5px;
    padding: 8px;
    font-size: 16px;
    height: 40px;
    margin-left: 42px;
    }

    .chat-btn {
    float:right;
    margin: 0;
    background: aliceblue;
    cursor: pointer;
    padding: 10px;
    display: block;
    width: 100%;
    font-size: 16px;
    border: 1px solid;
    border-radius: 8px;
    width: 60px;
    color: black;
    }
    .send-btn:hover {
        background-color: #45a049;
    }
</style>
<!-- <html/> -->
<div id="chatbox">
      <button onclick="gs.scrollToBottom('chatresponse')">Scroll to Bottom</button>
    <div id="chatresponse">
    <?php
    $dialogue=$this->admin->fa("
        SELECT actiongrp_chat.*, s1.name AS from_name, s2.name AS to_name
        FROM actiongrp_chat
        LEFT JOIN actiongrp AS s1 ON s1.id = actiongrp_chat.fromid
        LEFT JOIN actiongrp AS s2 ON s2.id = actiongrp_chat.toid
        order by id asc
    ");
    if(!empty($dialogue)){
    for($i=0;$i<count($dialogue);$i++){
    $previousGroup = null;
    $id=$dialogue[$i]['id'];
    $fromid=$dialogue[$i]['fromid'];
    $toid=$dialogue[$i]['toid'];
    $text=$dialogue[$i]['text'];
    $from_name=$dialogue[$i]['from_name'];
    $to_name=$dialogue[$i]['to_name'];
    $created=$dialogue[$i]['created'];
    $conversation_id=$dialogue[$i]['conversation_id'];
// Define the message group key
    $groupKey = $dialogue[$i]['from_name'] . ' -> ' . $dialogue[$i]['to_name'];
    $prevGroupKey = $dialogue[$i-1]['from_name'] . ' -> ' . $dialogue[$i-1]['to_name'];
    // Check if the group has changed
 if ($i==0 || ($i>0 && $groupKey !== $prevGroupKey)) { ?>
    <div class="message_title"><?=$groupKey?></div>
    <?php } ?>
    <span class="message_id">#id:<?=$id?>-<?= $created ?>-conversation_id:<?=$conversation_id?></span>
    <div class="message_lines"><?=$this->md_decode($text)?></div>
<?php }} ?>
   </div>



   </div>
   <!---------CHAT INPUT------->
<div class="chat-input-container">
    <div id="chatForm">
        <div class="chat-upload">
            <label for="fileUpload">
                <img src="/img/clip.png" alt="Upload" class="clip-icon" />
            </label>
            <input type="file" id="fileUpload" style="display:none" />
        </div>
        <button id="send_message" class="chat-btn">Send</button>
       <textarea id="chatMessage" rows="4" placeholder="Type your message..."></textarea>
       <div id="submenu_chat" style="display: none;">Submenu content here...</div>
    </div>
</div>


<script>
       const chatMessage = document.getElementById('chatMessage');
        const submenuChat = document.getElementById('submenu_chat');

        // Show submenu when typing
        chatMessage.addEventListener('keyup', function() {
            submenuChat.style.display = 'block';
        });

        // Hide submenu when losing focus
        chatMessage.addEventListener('blur', function() {
            submenuChat.style.display = 'none';
        });

        function chatline(fromname,toname,created,conversation_id,text,id=''){
        var html=`<div class="message_title">${fromname} - ${toname}</div>
            <span class="message_id">#id:${id}-${created}</span>
            <div class="message_lines">${text}</div>`
            return html;
        }
 async function sendMessage(text) {
     const message = text || document.getElementById('chatMessage').value;
     if (message.length > 5) {
         try {
             // Save the message
             const messagesave = await gs.api.admin.inse("actiongrp_chat", { text: message, fromid: 1, toid: 3 });
             if (!messagesave.success) throw new Error('Failed to save message');

             // Append to div
             document.getElementById('chatresponse').innerHTML += chatline(1, 3, new Date().toISOString().slice(0, 19).replace('T', ' '), message, messagesave.data.id);
             document.getElementById('chatMessage').value = '';

             const pms = { message: message };
             const url = `${G.SITE_URL}apy/v1/gemini/conversation`;
             console.log(pms);
             console.log(url);

             // Send the message via fetch
             const response = await fetch(url, {
                 method: 'POST',
                 body: JSON.stringify(pms),
                 headers: { 'Content-Type': 'application/json' }
             });

             if (!response.ok) {
                 throw new Error('HTTP error ' + response.status);
             }

             const jsonData = await response.json();
             const messageReceived = jsonData.response;
             console.log("GPY Response:", messageReceived);

             // Save the response
             const responseSave = await gs.api.admin.inse("actiongrp_chat", { text: messageReceived, fromid: 3, toid: 1,conversation_id:messageReceived.conversation_id });
             if (!responseSave.success) throw new Error('Failed to save response');

             // Append response to div
             document.getElementById('chatresponse').innerHTML += chatline(3, 1, new Date().toISOString().slice(0, 19).replace('T', ' '), marked(messageReceived), messageReceived.conversation_id,responseSave.data.id);

             return jsonData;

         } catch (error) {
             console.error('Error:', error);
             throw error; // Re-throw error to be caught by caller
         }
     }
 }

 document.addEventListener('click', function (event) {
     if (event.target && event.target.id === 'send_message') {
         const message = document.getElementById('chatMessage').value;
         sendMessage(message);
     }
 });
</script>