<script>
  const CLIENT_ID = G.is.GOOGLE_DRIVE_CLIENT_ID;
          const API_KEY = G.is.GOOGLE_PICKER_API_KEY;
        const SCOPES = 'https://www.googleapis.com/auth/drive.file';
        const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
        let authInstance;
        window.onload = function() {
            google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleLoginOrCreateUser,
                auto_select: true,
                 cancel_on_tap_outside: false
            });

            google.accounts.id.renderButton(
                document.getElementById('signInDiv'),
                { theme: 'outline', size: 'large' }  // customization attributes
            );

         //   google.accounts.id.prompt();  // Optional: Display the One Tap UI
        };
    function handleLoginOrCreateUser(userInfo) {
       const userDetails = parseJwt(userInfo.credential); // Parse the JWT
       userDetails.credential= userInfo.credential;
        console.log(userDetails);
$.post(`/index.php?a=save-token&file=${G.ADMIN_ROOT}main/gpm/google_login_xhr`,userDetails,function(data) {
        console.log(data);
                 if (data.success) {
                            // setTimeout(activateGoogleSession, 500);
                         //   location.reload()
                        } else {
                            console.error('Subscription save failed.');
                        }
    },'json');
}

function openGoogleDoc(docId) {
    const url = `https://docs.google.com/document/d/${docId}/edit`;
    window.open(url, '_blank');
}
</script>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<!--END OF HEAD-->

