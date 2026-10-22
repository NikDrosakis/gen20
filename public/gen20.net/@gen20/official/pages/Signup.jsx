import React, { useEffect, useRef, useState } from 'react';
import {useG} from "../contexts/GContext";

const Signup = () => {
    const { G } = useG();
    const path = window.location.pathname.split('/')[1] || 'home';
    const emailRef = useRef();
    const passRef = useRef();
    const nameRef = useRef();
    const [googleUser, setGoogleUser] = useState(null);
    const baseURL = import.meta.env.VITE_HTTP_API;

    useEffect(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: G.is['GOOGLE_DRIVE_CLIENT_ID'],
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('gsignup'),
                { theme: 'outline', size: 'large' }
            );
        }
    }, []);

    useEffect(() => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: 'YOUR_FACEBOOK_APP_ID',
                cookie: true,
                xfbml: false,
                version: 'v19.0',
            });
        };
    }, []);

    const loginWithFacebook = () => {
        window.FB.login(
            function (response) {
                if (response.authResponse) {
                    window.FB.api('/me', { fields: 'name,email,picture' }, function (userData) {
                        console.log('FB user:', userData);
                        setGoogleUser({ name: userData.name, email: userData.email }); // or setFacebookUser
                    });
                } else {
                    alert('Facebook login failed');
                }
            },
            { scope: 'email,public_profile' }
        );
    };
    const handleCredentialResponse = (response) => {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
        setGoogleUser(payload);
        console.log('Decoded Google JWT:', payload);
    };

    const signupWithEmail = () => {
        const payload = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passRef.current.value,
        };
        fetch(`${baseURL}signup?signup=1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then((res) => res.text())
            .then((text) =>
                alert(text === 'yes' ? 'ACCOUNT_CREATED' : 'Signup failed')
            )
            .catch(() => alert('Error during signup.'));
    };


    return (
        <div style={styles.signupStyle}>
            <div style={styles.moduleStyle}>
                <h1>{G.menupages[path]}</h1>
                <input ref={nameRef} style={styles.inputStyle} type="text" placeholder="Name" />
                <input ref={emailRef} style={styles.inputStyle} type="text" placeholder="Email" />
                <input ref={passRef} style={styles.inputStyle} type="password" placeholder="Password" />
                <div>
                    <button style={styles.buttonStyle} onClick={signupWithEmail}>Create Account</button>
                    <button style={styles.buttonStyle} onClick={() => window.location.href = '/login'}>Back to Login</button>
                </div>

                {!googleUser ? (
                    <>
                        <button style={styles.buttonStyle} onClick={loginWithFacebook}>Sign in with Facebook</button>
                        <div id="gsignup" style={styles.googleButtonContainer}></div>
                    </>
                ) : (
                    <div>
                        <p>Welcome, {googleUser.name}</p>
                        <button style={styles.buttonStyle} onClick={() => setGoogleUser(null)}>Logout</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    signupStyle: {
        fontFamily: '"Lucida Grande", Helvetica, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    moduleStyle: {
        padding: '3%',
        boxShadow: '0 0 15px rgba(0,0,0,.3)',
        borderRadius: '10px',
        animation: 'fadein 1.8s',
        textAlign: 'center',
        minWidth: '280px',
    },
    inputStyle: {
        width: '90%',
        margin: '6px 0',
        padding: '10px',
        fontSize: '1em',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    buttonStyle: {
        padding: '10px 15px',
        margin: '10px 5px',
        background: 'var(--bg2)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    googleButtonContainer: {
        marginTop: '20px',
    }
};

export default Signup;
