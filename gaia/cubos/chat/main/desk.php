<!-- @filemeta.description Compo UI used by Venus chat-->
<style>
#chatbox{
color:black;
}
#chatresponse > div{
    line-height:18px;
        margin-top: 16px;
}
.message_id{ float:right;font-size:12px;font-family: Verdana; font-style: italic;  }
.message_title{  font-size:18px;    color: #aabac8;  }
.message_lines{   font-size:14px;font-family: Verdana;  }

#chatresponse{
    width: 97%;
    max-height: 600px;
    margin: 8px;
    padding: 8px;
    /* font-size: 18px; */
    background: white;
    overflow-y: scroll;
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
    bottom: 0;
    min-height: 80px;
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
    width: 67%;
    float: left;
    border: none;
    /* border-radius: 5px; */
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


<!-- CHATBOX -->
<div id="chatbox" style="display: block;"> <!-- Default to visible -->
    <div id="chatresponse">
        <?php
        $rethinkGet = $this->fetchUrl(SITE_URL . "god/v1/rethink/actiongrp_chat");
        $dialogue = $rethinkGet['data'];
        if (!empty($dialogue)) {
            for ($i = 0; $i < count($dialogue); $i++) {
                $previousGroup = null;
                $id = $dialogue[$i]['id'];
                $fromid = $dialogue[$i]['fromid'];
                $toid = $dialogue[$i]['toid'];
                $text = $dialogue[$i]['text'];
                $from_name = $dialogue[$i]['from_name'];
                $to_name = $dialogue[$i]['to_name'];
                $created = $dialogue[$i]['created'];
                $conversation_id = $dialogue[$i]['conversation_id'];
                // Define the message group key
                $groupKey = $dialogue[$i]['from_name'] . ' -> ' . $dialogue[$i]['to_name'];
                $prevGroupKey = $dialogue[$i-1]['from_name'] . ' -> ' . $dialogue[$i-1]['to_name'];
                // Check if the group has changed
                if ($i == 0 || ($i > 0 && $groupKey !== $prevGroupKey)) { ?>
                    <div class="message_title"><?= $groupKey ?></div>
                <?php } ?>
                <?php if($text!=null){ ?>
                <span class="message_id">#id:<?= $id ?>-<?= $created ?>-conversation_id:<?= $conversation_id ?></span>
                <div class="message_lines"><?= $this->md_decode($text)?></div>
                <?php } ?>
            <?php }} ?>
    </div>

    <!-- CHAT INPUT -->
    <div class="chat-input-container">
        <div id="chatForm">
            <div class="chat-upload">
                <button src="/img/clip.png" alt="Upload" class="clip-icon">📤</button>
                <input type="file" id="fileUpload" style="display:none" />
            </div>
            <button id="send_message" class="button save-button">Send</button>
            <textarea id="chatMessage" rows="4" placeholder="Type your message..."></textarea>
            <div id="submenu_chat" style="display: none;">Submenu content here...</div>
        </div>
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
 function chatline(fromname, toname, created, conversation_id, text, id = '') {
     // Create message elements without overwriting any existing elements
     const divMessage = document.createElement('div');
     divMessage.classList.add('message'); // Adding a message container class

     const messageTitle = document.createElement('div');
     messageTitle.classList.add('message_title');
     messageTitle.innerText = `${fromname} - ${toname}`;

     const messageId = document.createElement('span');
     messageId.classList.add('message_id');
     messageId.innerText = `#id:${id}-${created}`;

     const messageLines = document.createElement('div');
     messageLines.classList.add('message_lines');
     messageLines.innerHTML = text; // Use innerHTML for rendering the text

     // Append all elements
     divMessage.appendChild(messageTitle);
     divMessage.appendChild(messageId);
     divMessage.appendChild(messageLines);

     return divMessage;
 }

 async function sendMessage(text) {
     const message = text || document.getElementById('chatMessage').value;
     if (message.length > 5) {
         try {
             // Save the message via API
             const messagesave = await gs.api.post("god/v1/actiongrp_chat", { text: message, fromid: 1, toid: 3 });
             if (!messagesave.success) throw new Error('Failed to save message');

             // Create new message and append it
             const chatResponse = document.getElementById('chatresponse');
             const newMessage = chatline(1, 3, new Date().toISOString().slice(0, 19).replace('T', ' '), message, messagesave.data.id);
             chatResponse.appendChild(newMessage); // Append new message

             // Clear textarea
             document.getElementById('chatMessage').value = '';

             // Send the message via another API
             const pms = { message: message };
             const url = `${G.SITE_URL}apy/v1/gemini/conversation`;
             const response = await fetch(url, {
                 method: 'POST',
                 body: JSON.stringify(pms),
                 headers: { 'Content-Type': 'application/json' }
             });

             if (!response.ok) throw new Error('HTTP error ' + response.status);
             const jsonData = await response.json();
             const messageReceived = jsonData.response;

             // Save the response message via API
             const responseSave = await gs.api.post("god/v1/actiongrp_chat", {
                 text: messageReceived,
                 fromid: 3,
                 toid: 1,
                 conversation_id: messageReceived.conversation_id
             });

             if (!responseSave.success) throw new Error('Failed to save response');

             // Append the response message
             const newResponseMessage = chatline(3, 1, new Date().toISOString().slice(0, 19).replace('T', ' '), messageReceived.conversation_id, marked(messageReceived), responseSave.data.id);
             chatResponse.appendChild(newResponseMessage); // Append response message

             return jsonData;

         } catch (error) {
             console.error('Error:', error);
             throw error;
         }
     }
 }

 document.addEventListener('click', function (event) {
     if (event.target && event.target.id === 'send_message') {
         const message = document.getElementById('chatMessage').value;
         sendMessage(message); // Send the message when the button is clicked
     }
 });

</script>