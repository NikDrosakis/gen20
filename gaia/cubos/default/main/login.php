<style>
    body{
        font-family: "Lucida Grande", Helvetica, sans-serif;
    	 margin:0;
    	 padding:0;
    	 margin-left: auto;
    	margin-right: auto;
    	 color:#666;
    	  background: cornsilk;
      -webkit-background-size: cover;
      -moz-background-size: cover;
      -o-background-size: cover;
      background-size: cover;
    }


    a {
    font-size: 1em;
    	text-decoration:none;
    	color:#2d3b97;
    }
    a:hover {
    	text-decoration:none;
    	color:red;
    }

    h1 {
    	font-family:"Lucida Grande", Helvetica, sans-serif;
        font-size: 2em;
    	padding: 5%;
        margin: 0;
    	text-align:center;
    }

    h1 small{
    	font: 0.2em normal  Arial, Helvetica, sans-serif;
    	text-transform:uppercase; letter-spacing: 0.2em; line-height: 5em;
    	display: block;
    }


    .top_logo {
    	width: 400px;
    	height: 103px;
    background-image: url(<?php echo IMAGES;?>logo1.png);
    	background-repeat: no-repeat;
    	margin-left: auto;
    	margin-right: auto;
    	position: relative;
    }


    h2 {
        color:#bbb;
        font-size:2em;
    	text-align:center;
    	text-shadow:0 1px 3px #161616;
    }

    .textbox label {
    	display:block;
    	padding-bottom:7px;
    }

    .textbox span {
    	display:block;
    }

    .textbox input {
    	font: 1em "Lucida Grande", Helvetica, sans-serif;
    	padding: 6px 6px 4px;
    	width: 340px;
    	text-align: center;
    	margin: 8px 0px 0px 0px;
    }

    input:-moz-placeholder { color:#bbb; text-shadow:0 0 2px #000; }
    input::-webkit-input-placeholder { color:#bbb;  }

    .button:hover { opacity:0.9; }


    .step_text_logo_style1 {
    color: #be1e2d;
    font-family: "Lucida Grande", Gadget, sans-serif;
    font-weight: 900;
    }

    .step_text_logo_style2 {
    color: #023e88;
    font-family: "Lucida Grande", Gadget, sans-serif;
    font-weight: 900;
    }


    .textMessage {
    color: #fff;
    margin: 0px 0px 6px 0px;
    }


    #image_confirm {
    	margin:-11px 0px 0px 0px;
    }

    .module{
        text-align: center;
    animation: fadein 2s;
        -moz-animation: fadein 2s;
        -webkit-animation: fadein 2s;
        -o-animation: fadein 2s;
        margin-top: 5%;
        margin-left: auto;
        margin-right: auto;
        background: RGBA(255,255,255,1);
        -webkit-box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .45);
        box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, .45);
        padding: 1%;
    }

    @media screen and (max-width: 500px) {
        .module{
            width: 95%;
            height: 95%;
        }
    }
    @media screen and (min-width: 501px) {
        .module{
            width: 450px;
        }
    }


    .alert{
        margin-bottom:15px;
    }
    @keyframes fadein {
        from {
            opacity:0;
        }
        to {
            opacity:1;
        }
    }
    @-moz-keyframes fadein { /* Firefox */
        from {
            opacity:0;
        }
        to {
            opacity:1;
        }
    }
    @-webkit-keyframes fadein { /* Safari and Chrome */
        from {
            opacity:0;
        }
        to {
            opacity:1;
        }
    }
    @-o-keyframes fadein { /* Opera */
        from {
            opacity:0;
        }
        to {
            opacity: 1;
        }
    }


    .button{
        width: 95%;
        border: rgba(0,0,0,.3) 0px solid;
        box-sizing: border-box;
        padding: 15px;
        background: #90c843;
        color: #FFF;
        font-weight: bold;
        font-size: 12pt;
        transition: background .4s;
        cursor: pointer;
        margin-bottom: 40px;
    }

    .button:hover{
      background:#80b438;

    }

    #bg{
      position:relative;
      background-size:cover;
      margin:0 auto;
    }
</style>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<style>
.post-section {
	background-color: #F0F2F5;
    padding: 40px;
}
</style>
<div id="bg">
    <div class="module">
        <div id="login-box">
            <h1>Login</h1>
        </div>

        <input class="input" required id="email" required type="text" autocomplete="on" placeholder="Email">
        <input class="input" required id="pass" required type="password" placeholder="Password">
        <div style="inline-flex;">
            <button class="button" type="button" onclick="gs.login()" id="loginf">Enter</button>
            <button class="button" onclick="location.href='/signup'">Signup</button>
        </div>

        <!-- Login with Google -->
        <div id="g_id_onload"
             data-client_id="<?=$G['is']['GOOGLE_CLIENT_ID']?>"
             data-login_uri="<?=$G['is']['GOOGLE_LOGIN_REDIRECT_URI']?>"
             data-auto_prompt="false">
        </div>
        <div class="g_id_signin" data-type="standard"></div>
    </div>
</div>

<script>
function exchangeAuthCodeForToken(authCode) {
    const data = {
        code: authCode,
        client_id: '<?=$G['is']['GOOGLE_CLIENT_ID']?>',
        client_secret: '<?=$G['is']['GOOGLE_CLIENT_SECRET_ID']?>',
        redirect_uri: '<?=$G['is']['GOOGLE_LOGIN_REDIRECT_URI']?>',
        grant_type: 'authorization_code'
    };

    // Send the POST request using jQuery's $.post
    $.post('https://oauth2.googleapis.com/token', data, function(tokenResponse) {
        console.log('Access Token:', tokenResponse.access_token);
        // You can now use the access token to make authorized requests
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error:', errorThrown);
    });
}

// Extract the authorization code from the URL
const urlParams = new URLSearchParams(window.location.search);
const authCode = urlParams.get('code');
console.log(authCode); // Debug: Check if authCode is available
if (authCode) {
    // Exchange the authorization code for an access token
    exchangeAuthCodeForToken(authCode);
}

document.getElementById('forgot_password').addEventListener('click', function() {
    // Create modal dialog box
    var modalContent = `
        <div class="modal-content">
            <h2>INSERT_EMAIL_ADDRESS</h2>
            <input type='text' id='forgotmail' placeholder='Enter your email'>
            <button id="sendEmailBtn" class="btn-primary">Send</button>
        </div>
    `;

    // Append modal to body
    var modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);

    // Add event listener to the 'Send' button
    document.getElementById('sendEmailBtn').addEventListener('click', function() {
        var forgotmail = document.getElementById('forgotmail').value;

        if (forgotmail !== '') {
            // AJAX-like request (fetch) to the backend
            var xhr = new XMLHttpRequest();
            xhr.open('GET', `your-backend-endpoint?a=forgot_password&b=${encodeURIComponent(forgotmail)}`, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var response = xhr.responseText;
                    if (response === 'yes') {
                        alert("EMAIL_SENT_MAILBOX");
                    } else {
                        alert('Email cannot be sent right now');
                    }
                } else {
                    alert('Error sending email');
                }
            };
            xhr.onerror = function() {
                alert('Request error...');
            };
            xhr.send();
        }
    });
});

</script>
