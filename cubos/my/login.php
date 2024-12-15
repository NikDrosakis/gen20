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
