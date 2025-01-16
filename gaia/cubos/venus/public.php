<?php
//xecho("here");
$mode='';
$ui='1';
?>
<!---BUTTON-TO FIRE CHAT--->
<button class="button" data-uid="1" data-cid="3701232" data-uid0="2" data-mode="1" id="chat_3701232" onclick="venus.fire(this,1)" title="Chat"><div class="totalChatNum chatc_3701232"></div>CHAT WITH ai</button>

<!---CHATBOX---->
<div id="wrapperchat" class="chatBottomAll"></div>

<script>
    //OBJECT
const  venus = {
            fire: function (obj, act) {
                console.log(obj, act)
                if (obj.id.startsWith('chat_')) {
                    const line = obj.id.split('_'); // e.g. chat_1 -> [ 'chat', '1' ]
                    const chatline = parseInt(line[1]); // 1
                    const data = obj.dataset;
                    console.log(data)
                    let chats = [];
                    const mode = !!data.mode ? data.mode : G.ui;
                    console.log('mode', mode)
                    if (chatline !== 0) {
                        if (!gs.coo('chatline')) { // not other chat
                            if (act == '1') {
                                gs.coo('chatline', JSON.stringify({[mode]: [chatline]}));
                                if (!!obj) {
                                    venus.render(obj, data);
                                }
                            }
                            return true;
                        } else { // other chat
                            console.log(gs.coo('chatline'));
                            chats = JSON.parse(gs.coo('chatline'));
                            venus.render(obj, data);
                            if (act === 1) { // add
                                if (!chats[mode]) {
                                    chats[mode] = [];
                                }
                                if (!chats[mode].includes(chatline)) {
                                    chats[mode].push(chatline);
                                    gs.coo('chatline', JSON.stringify(chats));
                                    console.log('not other chat')
                                    if (!!obj) {
                                        venus.render(obj, data);
                                    }
                                    return true;
                                } else {
                                    return false;
                                }
                            } else { // close
                                chats[mode].splice(chats[mode].indexOf(chatline), 1);
                                if (chats[mode].length > 0) {
                                    gs.coo('chatline', JSON.stringify(chats));
                                } else {
                                    gs.cooDel("chatline");
                                }
                                return true;
                            }
                        }
                    }
                }
            },
            render: function (obj, data) {
                const mode = data.mode;
                console.log(data.cid);
                const wrappercontainer = document.getElementById('wrapperchat');
                // Define chatbox as a string of HTML
                let chatbox = `
            <div id="chatDial${mode}${data.cid}" class="venusBox" placeholder="Reason of changing time">
                <div class="chatBoard_top"><input id="venus_panel" class="red indicator">
                    <span style="cursor:pointer" class="chatBoard_title">
                        <div id="messi${mode}${data.cid}"></div>
                        <a class="fn" id="chatitle${mode}${data.cid}"></a>
                    </span>
                    <button id="closechat${mode}${data.cid}"  onclick="closeVenusBox(this)" class="bare glyphicon glyphicon-remove"  style="float:right"></button>
                    <button id="minchat${mode}${data.cid}" onclick="minmaxVenusBox(this)" class="bare glyphicon glyphicon-minus" style="float:right"></button>
                    <div class="chatcam">
                        <button id="chatcamera${mode}${data.cid}" class="bare glyphicon glyphicon-camera" style="float:right"></button>
                    </div>
                </div>
                <div id="chato${mode}${data.cid}" class="venus-dialogueBox"></div>
                <div class="answerOfferEoi">
                    <div id="chatinput${mode}${data.cid}" contenteditable="true" style="white-space: pre-wrap; overflow-y: scroll;" class="chatextarea"></div>
                    <button id="chatsend${mode}${data.cid}" onclick="venus.send(this,1)" class="bare glyphicon glyphicon-envelope"></button>
                </div>
            </div>
        `;
                // Append the chatbox HTML
                wrappercontainer.innerHTML += chatbox;

                const cid = !!data.cid ? data.cid : (exp.length == 2 ? exp[1] : (exp.length == 4 ? exp[3] : exp[2]));
                //api.mo.get("chat" + mode, criteria, function(d) {
                if (!!cid) {
                    // wsvenus.send(JSON.stringify({ type:"get",cast:'one',cid: 3701232,uid:1,to:1})).then(res => {
                    // Prepare the message to send
                    const messageToSend = JSON.stringify({type: "get", cast: 'one', cid: data.cid, uid: 1, to: 1});
                    // Send the message over WebSocket
                    wsvenus.send(messageToSend);
                    //api.mo.getOne('chat' + data.mode, {cid: parseInt(cid)}, d => {
                    // Listen for messages from the server
                    wsvenus.onmessage = function (event) {
                        //  const res = JSON.parse(event.data); // Parse the received message
                        const eventdata = JSON.parse(event.data);
                        console.log("eventdata", eventdata)
                        const res = eventdata.text;
                        if (res == "NO") {
                            console.log("data.mode" + data.mode)
                            //console.log(data)
                            venus.createline(data).then(ins => {
                                if (ins != 'NO') {
                                    venus.start(ins, data.mode)
                                }
                            })
                        } else {
                            venus.start(res, data.mode)
                        }
                    }
                }
            },
            box: (data) => {
                let chatbox = '', fn = my.userid === data.uid0 ? data.fn : data.fn0;
                for (let i in data.chat) {
                    console.log(my.userid)
                    console.log(data.chat[i].u)
                    if (my.userid === data.chat[i].u) {
                        chatbox += `
                         <div id="chatLine_${data.chat[i].t}" class="chatLine">
                             <p class="triangle-isosceles right" id="localMember${data.chat[i].u}">${data.chat[i].c}</p>
                             <div class="chatDatetime">${gs.date('Y-m-d H:i', data.chat[i].t)}</div>
                         </div>`;
                    } else {
                        chatbox += `
                         <div id="chatLine_${data.chat[i].t}" class="chatLine">
                             <div class="chatResponceCont">
                                 <img id="thatImage${data.chat[i].u}" class="but138" src="${fn.img}">
                                 <p class="triangle-isosceles left" id="remoteMember${data.chat[i].u}">${data.chat[i].c}</p>
                                 <div class="chatDatetime">${gs.date('Y-m-d H:i', data.chat[i].t)}</div>
                             </div>
                         </div>`;
                    }
                }
                // console.log("chatbox",chatbox)
                // const chatboxcont=document.getElementById('chato' + data.mode + data.cid);
                //if(chatboxcont){chatboxcont.innerHTML = chatbox;}
                return chatbox;
                // const wrapperchat=document.getElementById('wrapperchat');
                //   if(wrapperchat){ wrapperchat.innerHTML += chatbox;}
            },
            // list must check contact instead of chat
            loop: function (mode, q, wrapper, order) {
                wrapper = 'wrapperchat';
                let list = '',
                    search = !q ? '' : (typeof (q) === 'object' ? q : "%" + q + "%"),
                    grpOp = my.grp === 1 ? 2 : 1,
                    chatorder = !!order ? order : "modified-";

                let criteria;
                if (typeof (search) === 'object') {
                    criteria = q;
                    criteria['order'] = chatorder;
                } else {
                    criteria = {order: chatorder};

                    if (!q) {
                        criteria["$or"] = [{uid: my.userid}, {uid0: my.userid}];
                    } else {
                        criteria["$or"] = [{uid: my.userid, "fn0.fname": q + "*"}, {uid0: my.userid, "fn.fname": q + "*"}];
                    }
                }
                //console.log(criteria);
                criteria = {cid: 3701232};
                wsvenus.send(JSON.stringify({system:G.SYSTEM,page:G.page,type: "get", type:'update',cast: 'one', query: criteria, uid: 1, to: 1}))
                    //api.mo.get("chat" + mode, criteria, function(d) {
                    .then(d => {
                        console.log(d);
                        if (d.length > 0) {
                            let list = '',
                                oline = !gs.coo('chatline' + mode) ? [] : gs.coo('chatline' + mode);

                            for (let i in d) {
                                let uid = my.userid === d[i].uid0 ? d[i].uid : d[i].uid0;
                                let fn = my.userid === d[i].uid0 ? d[i].fn : d[i].fn0;
                                let policy = 1,
                                    u = d[i].uid === my.userid ? '0' : '',
                                    uop = d[i].uid === my.userid ? '' : '0',
                                    count = d[i]['unread' + uop],
                                    img = d[i].uid === my.userid ? (!!d[i].fn0 ? d[i].fn0.img : G.default_user_img) : (!!d[i].fn ? d[i].fn.img : G.default_user_img);
                                let lastchatkey = d[i].chat.length - 1;
                                let lastchatime = !d[i].chat ? '' : date('Y-m-d H:i', d[i].modified);
                                let lastchat = !d[i].chat ? '' : d[i].chat[lastchatkey].c;
                                console.log(lastchat.length);

                                // Create a button element and set attributes
                                let button = document.createElement('button');
                                button.setAttribute("data-cid", d[i].cid);
                                button.className = "chatListOEMesLoop" + (oline.includes(d[i].cid) ? 'act' : '');
                                button.setAttribute("data-uid", d[i].uid);
                                button.setAttribute("data-uid0", d[i].uid0);
                                button.setAttribute("data-mode", mode);
                                button.setAttribute("id", "chat_" + d[i].cid + '_' + policy + '_' + uid);
                                button.style.backgroundColor = "rgb(142 120 53 / 10%)";

                                // Set inner HTML for the button
                                button.innerHTML = `
                                   <div class="chatNameImgOfferMes">
                                       <img src="${img}" width="100%">
                                   </div>
                                   <div class="adPostOfferMesTit2" id="listname${d[i].cid}">${(!!d[i]['fn' + u] ? d[i]['fn' + u].fname : 'DEFAULT NAME')}</div>
                                   <div>${lastchat.slice(0, 30)}</div>
                                   ${count > 0 ? `<div unread${(my.grp === d[i].uid0 ? 0 : '')}_${d[i].cid} class="offerMesCounter">${count}</div>` : ''}
                                   <div class="chatDatetimeM">${lastchatime}</div>
                               `;

                                // Add click event to the button
                                button.onclick = function () {
                                    this.className = "chatListOEMesLoopact";
                                };

                                list += button.outerHTML;
                            }
                            document.getElementById(wrapper).innerHTML = `<div style="overflow-y: auto;"><label class="chatlabel">${G.chatmodes[mode]} List</label>${list}</div>`;
                        } else {
                            document.getElementById(wrapper).innerHTML = '';
                        }
                    });
            },
            start: (data, ui) => {
                console.log('start', data)
                document.getElementById('chato' + ui + data.cid).innerHTML = venus.box(data);
                document.getElementById('chatitle' + ui + data.cid).innerHTML = data.uid0 === my.userid ? data.fn.fname : data.fn0.fname;
                document.getElementById('chatitle' + ui + data.cid).setAttribute('data-mode', ui);
                document.getElementById('chato' + ui + data.cid).setAttribute('data-uid', data.uid);
                document.getElementById('chato' + ui + data.cid).setAttribute('data-uid0', data.uid0);
                //      document.getElementById('chatcamera' + data.cid).setAttribute('uid', data.uid);
                //     document.getElementById('chatcamera' + data.cid).setAttribute('onclick', `stream(${data.uid},${data.uid0},"prop",${data.cid})`);
                //    document.getElementById('messi' + data.cid).classList.add("messi" + ui);
                //    document.getElementById('chatsend' + data.cid).setAttribute('mode', "messi" + ui);
                let privacy = my.userid === data.uid ? data.privacy0 : data.privacy;
                if (privacy === 0) {
                    document.getElementById('chatinput' + ui + data.cid).innerHTML = '<span style="color:red">Communication blocked by user</span>';
                    document.getElementById('chatinput' + ui + data.cid).setAttribute("contenteditable", "false");
                    document.getElementById('chatsend' + ui + data.cid).style.display = 'none';
                }
                document.getElementById('closechat' + ui + data.cid).setAttribute('data-mode', ui);
                gs.scrollToBottom('chato' + ui + data.cid);
                // focusing
                const unr = data.uid0 === my.userid ? "unread0" : "unread";
            },
            send: (button, ui) => {
                console.log(button);
                console.log(ui);
                const cid = button.id.replace('chatsend' + ui, '');
                //    const mode = button.getAttribute('mode').replace('messi', '');
                var chatInput = document.getElementById('chatinput' + ui + cid);
                var txt = chatInput.innerText.trim();  // Use innerText to get the text content

                if (txt.length > 0) {
                    chatInput.innerText = '';  // Clear the chat input

                    // Create a new chat line element
                    var chatLine = document.createElement('div');
                    chatLine.id = 'chatLine_' + gs.time();
                    chatLine.innerHTML = `<p class='triangle-isosceles right'>${txt}</p>
                          <div class='chatDatetime'>${gs.date('Y-m-d H:i')}</div>`;

                    // Append the new chat line to the chat container
                    var chatContainer = document.getElementById('chato' + ui + cid);
                    chatContainer.appendChild(chatLine);
                    gs.scrollToBottom('chato' + ui + cid);  // Scroll to the bottom of the chat container
                    // Send to peer
                    const unr = button.uid0 === my.userid ? "unread" : "unread0";
                    const who = button.uid0 === my.userid ? parseInt(button.uid0) : parseInt(button.uid);
                    const whom = button.uid0 === my.userid ? parseInt(button.uid) : parseInt(button.uid0);
                    const details = {
                        system: G.SYSTEM,
                        page: G.page,
                        to: whom,
                        collection: 'chat' + ui,
                        type: "update",
                        where: {cid: cid},
                        query: {
                            $set: {modified: gs.time()},
                            $push: {chat: {u: who, c: txt, t: gs.time()}},
                            $inc: {[unr]: 1}
                        },
                        cast: 'one',
                        cid: parseInt(cid),
                        text: txt,
                        uid: my.userid,
                        to: 2
                    };
                    wsvenus.send(JSON.stringify(details));
                }
            },
            createline: (data) => {
                console.log('chat.createline');
                console.log(data);
                const whom = data.uid0 === my.userid ? parseInt(data.uid) : parseInt(data.uid0);
                var starting = data.hasOwnProperty("title") ? data.title : "Starting chat";
                var details = {
                    system: G.SYSTEM,
                    page: G.page,
                    to: whom,
                    collection: 'chat' + ui,
                    type: "insert",
                    to: data.uid0,
                    query: {
                        cid: parseInt(data.cid),
                        modified: time(),
                        uid0: parseInt(d[0].uid),
                        uid: parseInt(d[1].uid),
                        privacy: 1,
                        privacy0: 1,
                        unread0: 0,
                        unread: 1,
                        chat: [{u: my.uid, c: starting, t: time()}],
                        fn0: {name: data[0].name, fname: data[0].fname, img: data[0].img},
                        fn: {name: data[1].name, fname: data[1].fname, img: data[1].img}
                    }
                };
                wsvenus.send(JSON.stringify(details));
            },
        },venus : {
                  fire: function (obj, act) {
                      console.log(obj, act)
                      if (obj.id.startsWith('chat_')) {
                          const line = obj.id.split('_'); // e.g. chat_1 -> [ 'chat', '1' ]
                          const chatline = parseInt(line[1]); // 1
                          const data = obj.dataset;
                          console.log(data)
                          let chats = [];
                          const mode = !!data.mode ? data.mode : G.ui;
                          console.log('mode', mode)
                          if (chatline !== 0) {
                              if (!gs.coo('chatline')) { // not other chat
                                  if (act == '1') {
                                      gs.coo('chatline', JSON.stringify({[mode]: [chatline]}));
                                      if (!!obj) {
                                          venus.render(obj, data);
                                      }
                                  }
                                  return true;
                              } else { // other chat
                                  console.log(gs.coo('chatline'));
                                  chats = JSON.parse(gs.coo('chatline'));
                                  venus.render(obj, data);
                                  if (act === 1) { // add
                                      if (!chats[mode]) {
                                          chats[mode] = [];
                                      }
                                      if (!chats[mode].includes(chatline)) {
                                          chats[mode].push(chatline);
                                          gs.coo('chatline', JSON.stringify(chats));
                                          console.log('not other chat')
                                          if (!!obj) {
                                              venus.render(obj, data);
                                          }
                                          return true;
                                      } else {
                                          return false;
                                      }
                                  } else { // close
                                      chats[mode].splice(chats[mode].indexOf(chatline), 1);
                                      if (chats[mode].length > 0) {
                                          gs.coo('chatline', JSON.stringify(chats));
                                      } else {
                                          gs.cooDel("chatline");
                                      }
                                      return true;
                                  }
                              }
                          }
                      }
                  },
                  render: function (obj, data) {
                      const mode = data.mode;
                      console.log(data.cid);
                      const wrappercontainer = document.getElementById('wrapperchat');
                      // Define chatbox as a string of HTML
                      let chatbox = `
                  <div id="chatDial${mode}${data.cid}" class="venusBox" placeholder="Reason of changing time">
                      <div class="chatBoard_top"><input id="venus_panel" class="red indicator">
                          <span style="cursor:pointer" class="chatBoard_title">
                              <div id="messi${mode}${data.cid}"></div>
                              <a class="fn" id="chatitle${mode}${data.cid}"></a>
                          </span>
                          <button id="closechat${mode}${data.cid}"  onclick="closeVenusBox(this)" class="bare glyphicon glyphicon-remove"  style="float:right"></button>
                          <button id="minchat${mode}${data.cid}" onclick="minmaxVenusBox(this)" class="bare glyphicon glyphicon-minus" style="float:right"></button>
                          <div class="chatcam">
                              <button id="chatcamera${mode}${data.cid}" class="bare glyphicon glyphicon-camera" style="float:right"></button>
                          </div>
                      </div>
                      <div id="chato${mode}${data.cid}" class="venus-dialogueBox"></div>
                      <div class="answerOfferEoi">
                          <div id="chatinput${mode}${data.cid}" contenteditable="true" style="white-space: pre-wrap; overflow-y: scroll;" class="chatextarea"></div>
                          <button id="chatsend${mode}${data.cid}" onclick="venus.send(this,1)" class="bare glyphicon glyphicon-envelope"></button>
                      </div>
                  </div>
              `;
                      // Append the chatbox HTML
                      wrappercontainer.innerHTML += chatbox;

                      const cid = !!data.cid ? data.cid : (exp.length == 2 ? exp[1] : (exp.length == 4 ? exp[3] : exp[2]));
                      //api.mo.get("chat" + mode, criteria, function(d) {
                      if (!!cid) {
                          // wsvenus.send(JSON.stringify({ type:"get",cast:'one',cid: 3701232,uid:1,to:1})).then(res => {
                          // Prepare the message to send
                          const messageToSend = JSON.stringify({type: "get", cast: 'one', cid: data.cid, uid: 1, to: 1});
                          // Send the message over WebSocket
                          wsvenus.send(messageToSend);
                          //api.mo.getOne('chat' + data.mode, {cid: parseInt(cid)}, d => {
                          // Listen for messages from the server
                          wsvenus.onmessage = function (event) {
                              //  const res = JSON.parse(event.data); // Parse the received message
                              const eventdata = JSON.parse(event.data);
                              console.log("eventdata", eventdata)
                              const res = eventdata.text;
                              if (res == "NO") {
                                  console.log("data.mode" + data.mode)
                                  //console.log(data)
                                  venus.createline(data).then(ins => {
                                      if (ins != 'NO') {
                                          venus.start(ins, data.mode)
                                      }
                                  })
                              } else {
                                  venus.start(res, data.mode)
                              }
                          }
                      }
                  },
                  box: (data) => {
                      let chatbox = '', fn = my.userid === data.uid0 ? data.fn : data.fn0;
                      for (let i in data.chat) {
                          console.log(my.userid)
                          console.log(data.chat[i].u)
                          if (my.userid === data.chat[i].u) {
                              chatbox += `
                               <div id="chatLine_${data.chat[i].t}" class="chatLine">
                                   <p class="triangle-isosceles right" id="localMember${data.chat[i].u}">${data.chat[i].c}</p>
                                   <div class="chatDatetime">${gs.date('Y-m-d H:i', data.chat[i].t)}</div>
                               </div>`;
                          } else {
                              chatbox += `
                               <div id="chatLine_${data.chat[i].t}" class="chatLine">
                                   <div class="chatResponceCont">
                                       <img id="thatImage${data.chat[i].u}" class="but138" src="${fn.img}">
                                       <p class="triangle-isosceles left" id="remoteMember${data.chat[i].u}">${data.chat[i].c}</p>
                                       <div class="chatDatetime">${gs.date('Y-m-d H:i', data.chat[i].t)}</div>
                                   </div>
                               </div>`;
                          }
                      }
                      // console.log("chatbox",chatbox)
                      // const chatboxcont=document.getElementById('chato' + data.mode + data.cid);
                      //if(chatboxcont){chatboxcont.innerHTML = chatbox;}
                      return chatbox;
                      // const wrapperchat=document.getElementById('wrapperchat');
                      //   if(wrapperchat){ wrapperchat.innerHTML += chatbox;}
                  },
                  // list must check contact instead of chat
                  loop: function (mode, q, wrapper, order) {
                      wrapper = 'wrapperchat';
                      let list = '',
                          search = !q ? '' : (typeof (q) === 'object' ? q : "%" + q + "%"),
                          grpOp = my.grp === 1 ? 2 : 1,
                          chatorder = !!order ? order : "modified-";

                      let criteria;
                      if (typeof (search) === 'object') {
                          criteria = q;
                          criteria['order'] = chatorder;
                      } else {
                          criteria = {order: chatorder};

                          if (!q) {
                              criteria["$or"] = [{uid: my.userid}, {uid0: my.userid}];
                          } else {
                              criteria["$or"] = [{uid: my.userid, "fn0.fname": q + "*"}, {uid0: my.userid, "fn.fname": q + "*"}];
                          }
                      }
                      //console.log(criteria);
                      criteria = {cid: 3701232};
                      wsvenus.send(JSON.stringify({system:G.SYSTEM,page:G.page,type: "get", type:'update',cast: 'one', query: criteria, uid: 1, to: 1}))
                          //api.mo.get("chat" + mode, criteria, function(d) {
                          .then(d => {
                              console.log(d);
                              if (d.length > 0) {
                                  let list = '',
                                      oline = !gs.coo('chatline' + mode) ? [] : gs.coo('chatline' + mode);

                                  for (let i in d) {
                                      let uid = my.userid === d[i].uid0 ? d[i].uid : d[i].uid0;
                                      let fn = my.userid === d[i].uid0 ? d[i].fn : d[i].fn0;
                                      let policy = 1,
                                          u = d[i].uid === my.userid ? '0' : '',
                                          uop = d[i].uid === my.userid ? '' : '0',
                                          count = d[i]['unread' + uop],
                                          img = d[i].uid === my.userid ? (!!d[i].fn0 ? d[i].fn0.img : G.default_user_img) : (!!d[i].fn ? d[i].fn.img : G.default_user_img);
                                      let lastchatkey = d[i].chat.length - 1;
                                      let lastchatime = !d[i].chat ? '' : date('Y-m-d H:i', d[i].modified);
                                      let lastchat = !d[i].chat ? '' : d[i].chat[lastchatkey].c;
                                      console.log(lastchat.length);

                                      // Create a button element and set attributes
                                      let button = document.createElement('button');
                                      button.setAttribute("data-cid", d[i].cid);
                                      button.className = "chatListOEMesLoop" + (oline.includes(d[i].cid) ? 'act' : '');
                                      button.setAttribute("data-uid", d[i].uid);
                                      button.setAttribute("data-uid0", d[i].uid0);
                                      button.setAttribute("data-mode", mode);
                                      button.setAttribute("id", "chat_" + d[i].cid + '_' + policy + '_' + uid);
                                      button.style.backgroundColor = "rgb(142 120 53 / 10%)";

                                      // Set inner HTML for the button
                                      button.innerHTML = `
                                         <div class="chatNameImgOfferMes">
                                             <img src="${img}" width="100%">
                                         </div>
                                         <div class="adPostOfferMesTit2" id="listname${d[i].cid}">${(!!d[i]['fn' + u] ? d[i]['fn' + u].fname : 'DEFAULT NAME')}</div>
                                         <div>${lastchat.slice(0, 30)}</div>
                                         ${count > 0 ? `<div unread${(my.grp === d[i].uid0 ? 0 : '')}_${d[i].cid} class="offerMesCounter">${count}</div>` : ''}
                                         <div class="chatDatetimeM">${lastchatime}</div>
                                     `;

                                      // Add click event to the button
                                      button.onclick = function () {
                                          this.className = "chatListOEMesLoopact";
                                      };

                                      list += button.outerHTML;
                                  }
                                  document.getElementById(wrapper).innerHTML = `<div style="overflow-y: auto;"><label class="chatlabel">${G.chatmodes[mode]} List</label>${list}</div>`;
                              } else {
                                  document.getElementById(wrapper).innerHTML = '';
                              }
                          });
                  },
                  start: (data, ui) => {
                      console.log('start', data)
                      document.getElementById('chato' + ui + data.cid).innerHTML = venus.box(data);
                      document.getElementById('chatitle' + ui + data.cid).innerHTML = data.uid0 === my.userid ? data.fn.fname : data.fn0.fname;
                      document.getElementById('chatitle' + ui + data.cid).setAttribute('data-mode', ui);
                      document.getElementById('chato' + ui + data.cid).setAttribute('data-uid', data.uid);
                      document.getElementById('chato' + ui + data.cid).setAttribute('data-uid0', data.uid0);
                      //      document.getElementById('chatcamera' + data.cid).setAttribute('uid', data.uid);
                      //     document.getElementById('chatcamera' + data.cid).setAttribute('onclick', `stream(${data.uid},${data.uid0},"prop",${data.cid})`);
                      //    document.getElementById('messi' + data.cid).classList.add("messi" + ui);
                      //    document.getElementById('chatsend' + data.cid).setAttribute('mode', "messi" + ui);
                      let privacy = my.userid === data.uid ? data.privacy0 : data.privacy;
                      if (privacy === 0) {
                          document.getElementById('chatinput' + ui + data.cid).innerHTML = '<span style="color:red">Communication blocked by user</span>';
                          document.getElementById('chatinput' + ui + data.cid).setAttribute("contenteditable", "false");
                          document.getElementById('chatsend' + ui + data.cid).style.display = 'none';
                      }
                      document.getElementById('closechat' + ui + data.cid).setAttribute('data-mode', ui);
                      gs.scrollToBottom('chato' + ui + data.cid);
                      // focusing
                      const unr = data.uid0 === my.userid ? "unread0" : "unread";
                  },
                  send: (button, ui) => {
                      console.log(button);
                      console.log(ui);
                      const cid = button.id.replace('chatsend' + ui, '');
                      //    const mode = button.getAttribute('mode').replace('messi', '');
                      var chatInput = document.getElementById('chatinput' + ui + cid);
                      var txt = chatInput.innerText.trim();  // Use innerText to get the text content

                      if (txt.length > 0) {
                          chatInput.innerText = '';  // Clear the chat input

                          // Create a new chat line element
                          var chatLine = document.createElement('div');
                          chatLine.id = 'chatLine_' + gs.time();
                          chatLine.innerHTML = `<p class='triangle-isosceles right'>${txt}</p>
                                <div class='chatDatetime'>${gs.date('Y-m-d H:i')}</div>`;

                          // Append the new chat line to the chat container
                          var chatContainer = document.getElementById('chato' + ui + cid);
                          chatContainer.appendChild(chatLine);
                          gs.scrollToBottom('chato' + ui + cid);  // Scroll to the bottom of the chat container
                          // Send to peer
                          const unr = button.uid0 === my.userid ? "unread" : "unread0";
                          const who = button.uid0 === my.userid ? parseInt(button.uid0) : parseInt(button.uid);
                          const whom = button.uid0 === my.userid ? parseInt(button.uid) : parseInt(button.uid0);
                          const details = {
                              system: G.SYSTEM,
                              page: G.page,
                              to: whom,
                              collection: 'chat' + ui,
                              type: "update",
                              where: {cid: cid},
                              query: {
                                  $set: {modified: gs.time()},
                                  $push: {chat: {u: who, c: txt, t: gs.time()}},
                                  $inc: {[unr]: 1}
                              },
                              cast: 'one',
                              cid: parseInt(cid),
                              text: txt,
                              uid: my.userid,
                              to: 2
                          };
                          wsvenus.send(JSON.stringify(details));
                      }
                  },
                  createline: (data) => {
                      console.log('chat.createline');
                      console.log(data);
                      const whom = data.uid0 === my.userid ? parseInt(data.uid) : parseInt(data.uid0);
                      var starting = data.hasOwnProperty("title") ? data.title : "Starting chat";
                      var details = {
                          system: G.SYSTEM,
                          page: G.page,
                          to: whom,
                          collection: 'chat' + ui,
                          type: "insert",
                          to: data.uid0,
                          query: {
                              cid: parseInt(data.cid),
                              modified: time(),
                              uid0: parseInt(d[0].uid),
                              uid: parseInt(d[1].uid),
                              privacy: 1,
                              privacy0: 1,
                              unread0: 0,
                              unread: 1,
                              chat: [{u: my.uid, c: starting, t: time()}],
                              fn0: {name: data[0].name, fname: data[0].fname, img: data[0].img},
                              fn: {name: data[1].name, fname: data[1].fname, img: data[1].img}
                          }
                      };
                      wsvenus.send(JSON.stringify(details));
                  },
              },venus : {
                        fire: function (obj, act) {
                            console.log(obj, act)
                            if (obj.id.startsWith('chat_')) {
                                const line = obj.id.split('_'); // e.g. chat_1 -> [ 'chat', '1' ]
                                const chatline = parseInt(line[1]); // 1
                                const data = obj.dataset;
                                console.log(data)
                                let chats = [];
                                const mode = !!data.mode ? data.mode : G.ui;
                                console.log('mode', mode)
                                if (chatline !== 0) {
                                    if (!gs.coo('chatline')) { // not other chat
                                        if (act == '1') {
                                            gs.coo('chatline', JSON.stringify({[mode]: [chatline]}));
                                            if (!!obj) {
                                                venus.render(obj, data);
                                            }
                                        }
                                        return true;
                                    } else { // other chat
                                        console.log(gs.coo('chatline'));
                                        chats = JSON.parse(gs.coo('chatline'));
                                        venus.render(obj, data);
                                        if (act === 1) { // add
                                            if (!chats[mode]) {
                                                chats[mode] = [];
                                            }
                                            if (!chats[mode].includes(chatline)) {
                                                chats[mode].push(chatline);
                                                gs.coo('chatline', JSON.stringify(chats));
                                                console.log('not other chat')
                                                if (!!obj) {
                                                    venus.render(obj, data);
                                                }
                                                return true;
                                            } else {
                                                return false;
                                            }
                                        } else { // close
                                            chats[mode].splice(chats[mode].indexOf(chatline), 1);
                                            if (chats[mode].length > 0) {
                                                gs.coo('chatline', JSON.stringify(chats));
                                            } else {
                                                gs.cooDel("chatline");
                                            }
                                            return true;
                                        }
                                    }
                                }
                            }
                        },
                        render: function (obj, data) {
                            const mode = data.mode;
                            console.log(data.cid);
                            const wrappercontainer = document.getElementById('wrapperchat');
                            // Define chatbox as a string of HTML
                            let chatbox = `
                        <div id="chatDial${mode}${data.cid}" class="venusBox" placeholder="Reason of changing time">
                            <div class="chatBoard_top"><input id="venus_panel" class="red indicator">
                                <span style="cursor:pointer" class="chatBoard_title">
                                    <div id="messi${mode}${data.cid}"></div>
                                    <a class="fn" id="chatitle${mode}${data.cid}"></a>
                                </span>
                                <button id="closechat${mode}${data.cid}"  onclick="closeVenusBox(this)" class="bare glyphicon glyphicon-remove"  style="float:right"></button>
                                <button id="minchat${mode}${data.cid}" onclick="minmaxVenusBox(this)" class="bare glyphicon glyphicon-minus" style="float:right"></button>
                                <div class="chatcam">
                                    <button id="chatcamera${mode}${data.cid}" class="bare glyphicon glyphicon-camera" style="float:right"></button>
                                </div>
                            </div>
                            <div id="chato${mode}${data.cid}" class="venus-dialogueBox"></div>
                            <div class="answerOfferEoi">
                                <div id="chatinput${mode}${data.cid}" contenteditable="true" style="white-space: pre-wrap; overflow-y: scroll;" class="chatextarea"></div>
                                <button id="chatsend${mode}${data.cid}" onclick="venus.send(this,1)" class="bare glyphicon glyphicon-envelope"></button>
                            </div>
                        </div>
                    `;
                            // Append the chatbox HTML
                            wrappercontainer.innerHTML += chatbox;

                            const cid = !!data.cid ? data.cid : (exp.length == 2 ? exp[1] : (exp.length == 4 ? exp[3] : exp[2]));
                            //api.mo.get("chat" + mode, criteria, function(d) {
                            if (!!cid) {
                                // wsvenus.send(JSON.stringify({ type:"get",cast:'one',cid: 3701232,uid:1,to:1})).then(res => {
                                // Prepare the message to send
                                const messageToSend = JSON.stringify({type: "get", cast: 'one', cid: data.cid, uid: 1, to: 1});
                                // Send the message over WebSocket
                                wsvenus.send(messageToSend);
                                //api.mo.getOne('chat' + data.mode, {cid: parseInt(cid)}, d => {
                                // Listen for messages from the server
                                wsvenus.onmessage = function (event) {
                                    //  const res = JSON.parse(event.data); // Parse the received message
                                    const eventdata = JSON.parse(event.data);
                                    console.log("eventdata", eventdata)
                                    const res = eventdata.text;
                                    if (res == "NO") {
                                        console.log("data.mode" + data.mode)
                                        //console.log(data)
                                        venus.createline(data).then(ins => {
                                            if (ins != 'NO') {
                                                venus.start(ins, data.mode)
                                            }
                                        })
                                    } else {
                                        venus.start(res, data.mode)
                                    }
                                }
                            }
                        },
                        box: (data) => {
                            let chatbox = '', fn = my.userid === data.uid0 ? data.fn : data.fn0;
                            for (let i in data.chat) {
                                console.log(my.userid)
                                console.log(data.chat[i].u)
                                if (my.userid === data.chat[i].u) {
                                    chatbox += `
                                     <div id="chatLine_${data.chat[i].t}" class="chatLine">
                                         <p class="triangle-isosceles right" id="localMember${data.chat[i].u}">${data.chat[i].c}</p>
                                         <div class="chatDatetime">${gs.date('Y-m-d H:i', data.chat[i].t)}</div>
                                     </div>`;
                                } else {
                                    chatbox += `
                                     <div id="chatLine_${data.chat[i].t}" class="chatLine">
                                         <div class="chatResponceCont">
                                             <img id="thatImage${data.chat[i].u}" class="but138" src="${fn.img}">
                                             <p class="triangle-isosceles left" id="remoteMember${data.chat[i].u}">${data.chat[i].c}</p>
                                             <div class="chatDatetime">${gs.date('Y-m-d H:i', data.chat[i].t)}</div>
                                         </div>
                                     </div>`;
                                }
                            }
                            // console.log("chatbox",chatbox)
                            // const chatboxcont=document.getElementById('chato' + data.mode + data.cid);
                            //if(chatboxcont){chatboxcont.innerHTML = chatbox;}
                            return chatbox;
                            // const wrapperchat=document.getElementById('wrapperchat');
                            //   if(wrapperchat){ wrapperchat.innerHTML += chatbox;}
                        },
                        // list must check contact instead of chat
                        loop: function (mode, q, wrapper, order) {
                            wrapper = 'wrapperchat';
                            let list = '',
                                search = !q ? '' : (typeof (q) === 'object' ? q : "%" + q + "%"),
                                grpOp = my.grp === 1 ? 2 : 1,
                                chatorder = !!order ? order : "modified-";

                            let criteria;
                            if (typeof (search) === 'object') {
                                criteria = q;
                                criteria['order'] = chatorder;
                            } else {
                                criteria = {order: chatorder};

                                if (!q) {
                                    criteria["$or"] = [{uid: my.userid}, {uid0: my.userid}];
                                } else {
                                    criteria["$or"] = [{uid: my.userid, "fn0.fname": q + "*"}, {uid0: my.userid, "fn.fname": q + "*"}];
                                }
                            }
                            //console.log(criteria);
                            criteria = {cid: 3701232};
                            wsvenus.send(JSON.stringify({system:G.SYSTEM,page:G.page,type: "get", type:'update',cast: 'one', query: criteria, uid: 1, to: 1}))
                                //api.mo.get("chat" + mode, criteria, function(d) {
                                .then(d => {
                                    console.log(d);
                                    if (d.length > 0) {
                                        let list = '',
                                            oline = !gs.coo('chatline' + mode) ? [] : gs.coo('chatline' + mode);

                                        for (let i in d) {
                                            let uid = my.userid === d[i].uid0 ? d[i].uid : d[i].uid0;
                                            let fn = my.userid === d[i].uid0 ? d[i].fn : d[i].fn0;
                                            let policy = 1,
                                                u = d[i].uid === my.userid ? '0' : '',
                                                uop = d[i].uid === my.userid ? '' : '0',
                                                count = d[i]['unread' + uop],
                                                img = d[i].uid === my.userid ? (!!d[i].fn0 ? d[i].fn0.img : G.default_user_img) : (!!d[i].fn ? d[i].fn.img : G.default_user_img);
                                            let lastchatkey = d[i].chat.length - 1;
                                            let lastchatime = !d[i].chat ? '' : date('Y-m-d H:i', d[i].modified);
                                            let lastchat = !d[i].chat ? '' : d[i].chat[lastchatkey].c;
                                            console.log(lastchat.length);

                                            // Create a button element and set attributes
                                            let button = document.createElement('button');
                                            button.setAttribute("data-cid", d[i].cid);
                                            button.className = "chatListOEMesLoop" + (oline.includes(d[i].cid) ? 'act' : '');
                                            button.setAttribute("data-uid", d[i].uid);
                                            button.setAttribute("data-uid0", d[i].uid0);
                                            button.setAttribute("data-mode", mode);
                                            button.setAttribute("id", "chat_" + d[i].cid + '_' + policy + '_' + uid);
                                            button.style.backgroundColor = "rgb(142 120 53 / 10%)";

                                            // Set inner HTML for the button
                                            button.innerHTML = `
                                               <div class="chatNameImgOfferMes">
                                                   <img src="${img}" width="100%">
                                               </div>
                                               <div class="adPostOfferMesTit2" id="listname${d[i].cid}">${(!!d[i]['fn' + u] ? d[i]['fn' + u].fname : 'DEFAULT NAME')}</div>
                                               <div>${lastchat.slice(0, 30)}</div>
                                               ${count > 0 ? `<div unread${(my.grp === d[i].uid0 ? 0 : '')}_${d[i].cid} class="offerMesCounter">${count}</div>` : ''}
                                               <div class="chatDatetimeM">${lastchatime}</div>
                                           `;

                                            // Add click event to the button
                                            button.onclick = function () {
                                                this.className = "chatListOEMesLoopact";
                                            };

                                            list += button.outerHTML;
                                        }
                                        document.getElementById(wrapper).innerHTML = `<div style="overflow-y: auto;"><label class="chatlabel">${G.chatmodes[mode]} List</label>${list}</div>`;
                                    } else {
                                        document.getElementById(wrapper).innerHTML = '';
                                    }
                                });
                        },
                        start: (data, ui) => {
                            console.log('start', data)
                            document.getElementById('chato' + ui + data.cid).innerHTML = venus.box(data);
                            document.getElementById('chatitle' + ui + data.cid).innerHTML = data.uid0 === my.userid ? data.fn.fname : data.fn0.fname;
                            document.getElementById('chatitle' + ui + data.cid).setAttribute('data-mode', ui);
                            document.getElementById('chato' + ui + data.cid).setAttribute('data-uid', data.uid);
                            document.getElementById('chato' + ui + data.cid).setAttribute('data-uid0', data.uid0);
                            //      document.getElementById('chatcamera' + data.cid).setAttribute('uid', data.uid);
                            //     document.getElementById('chatcamera' + data.cid).setAttribute('onclick', `stream(${data.uid},${data.uid0},"prop",${data.cid})`);
                            //    document.getElementById('messi' + data.cid).classList.add("messi" + ui);
                            //    document.getElementById('chatsend' + data.cid).setAttribute('mode', "messi" + ui);
                            let privacy = my.userid === data.uid ? data.privacy0 : data.privacy;
                            if (privacy === 0) {
                                document.getElementById('chatinput' + ui + data.cid).innerHTML = '<span style="color:red">Communication blocked by user</span>';
                                document.getElementById('chatinput' + ui + data.cid).setAttribute("contenteditable", "false");
                                document.getElementById('chatsend' + ui + data.cid).style.display = 'none';
                            }
                            document.getElementById('closechat' + ui + data.cid).setAttribute('data-mode', ui);
                            gs.scrollToBottom('chato' + ui + data.cid);
                            // focusing
                            const unr = data.uid0 === my.userid ? "unread0" : "unread";
                        },
                        send: (button, ui) => {
                            console.log(button);
                            console.log(ui);
                            const cid = button.id.replace('chatsend' + ui, '');
                            //    const mode = button.getAttribute('mode').replace('messi', '');
                            var chatInput = document.getElementById('chatinput' + ui + cid);
                            var txt = chatInput.innerText.trim();  // Use innerText to get the text content

                            if (txt.length > 0) {
                                chatInput.innerText = '';  // Clear the chat input

                                // Create a new chat line element
                                var chatLine = document.createElement('div');
                                chatLine.id = 'chatLine_' + gs.time();
                                chatLine.innerHTML = `<p class='triangle-isosceles right'>${txt}</p>
                                      <div class='chatDatetime'>${gs.date('Y-m-d H:i')}</div>`;

                                // Append the new chat line to the chat container
                                var chatContainer = document.getElementById('chato' + ui + cid);
                                chatContainer.appendChild(chatLine);
                                gs.scrollToBottom('chato' + ui + cid);  // Scroll to the bottom of the chat container
                                // Send to peer
                                const unr = button.uid0 === my.userid ? "unread" : "unread0";
                                const who = button.uid0 === my.userid ? parseInt(button.uid0) : parseInt(button.uid);
                                const whom = button.uid0 === my.userid ? parseInt(button.uid) : parseInt(button.uid0);
                                const details = {
                                    system: G.SYSTEM,
                                    page: G.page,
                                    to: whom,
                                    collection: 'chat' + ui,
                                    type: "update",
                                    where: {cid: cid},
                                    query: {
                                        $set: {modified: gs.time()},
                                        $push: {chat: {u: who, c: txt, t: gs.time()}},
                                        $inc: {[unr]: 1}
                                    },
                                    cast: 'one',
                                    cid: parseInt(cid),
                                    text: txt,
                                    uid: my.userid,
                                    to: 2
                                };
                                wsvenus.send(JSON.stringify(details));
                            }
                        },
                        createline: (data) => {
                            console.log('chat.createline');
                            console.log(data);
                            const whom = data.uid0 === my.userid ? parseInt(data.uid) : parseInt(data.uid0);
                            var starting = data.hasOwnProperty("title") ? data.title : "Starting chat";
                            var details = {
                                system: G.SYSTEM,
                                page: G.page,
                                to: whom,
                                collection: 'chat' + ui,
                                type: "insert",
                                to: data.uid0,
                                query: {
                                    cid: parseInt(data.cid),
                                    modified: time(),
                                    uid0: parseInt(d[0].uid),
                                    uid: parseInt(d[1].uid),
                                    privacy: 1,
                                    privacy0: 1,
                                    unread0: 0,
                                    unread: 1,
                                    chat: [{u: my.uid, c: starting, t: time()}],
                                    fn0: {name: data[0].name, fname: data[0].fname, img: data[0].img},
                                    fn: {name: data[1].name, fname: data[1].fname, img: data[1].img}
                                }
                            };
                            wsvenus.send(JSON.stringify(details));
                        },
                    };
// Replace with your WebSocket URL
document.addEventListener('DOMContentLoaded', () => {
})
// Minimize chat button handling
function minmaxVenusBox(button) {
    // Find the closest parent chatbox container ('.venusBox')
    var chatbox = button.closest('.venusBox');
    // Get the current bottom position of the chatbox
    var bottomPosition = window.getComputedStyle(chatbox).bottom;
    // Toggle the chatbox position
    if (bottomPosition === '0px') {
        chatbox.style.transition = "bottom 0.08s ease";
        chatbox.style.bottom = "-239px"; // Hide
    } else if (bottomPosition === '-239px') {
        chatbox.style.transition = "bottom 0.08s ease";
        chatbox.style.bottom = "0px"; // Show
    }
}

// Close chat button handling
function closeVenusBox(button) {
    var id = button.id.replace('closechat', '');
    var chatbox = document.getElementById("chatbox" + id);
    if (chatbox) chatbox.remove();
    venus.fire(id, 0, button);
}
function closeVenusBox(button) {
    // Find the closest parent chatbox container ('.venusBox')
    var chatbox = button.closest('.venusBox');
    // Remove the chatbox if it exists
    if (chatbox) {
        chatbox.remove();
    }
    // Optionally call the `coo` function with the ID
    // You might need to adjust this based on your actual implementation
    var id = chatbox ? chatbox.getAttribute('data-id') : null; // Use a data attribute for the ID if necessary
    venus.fire(id, 0, button);
}

// Example usage
// chat.start({ cid: 'exampleCid', uid: 'userId' }, 'uiMode');

   // EVENTS
   // Add event listener to buttons with IDs starting with 'chat_'
</script>
