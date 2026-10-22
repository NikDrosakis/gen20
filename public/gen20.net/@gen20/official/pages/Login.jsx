import React, { useEffect, useRef, useState } from 'react';
import {useG} from "../contexts/GContext";

const Login = () => {
    const path = window.location.pathname.split('/')[1] || 'home';
    const { G } = useG();
    const emailRef = useRef();
    const passRef = useRef();
    const forgotRef = useRef();
    const [showForgot, setShowForgot] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);

    useEffect(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID',
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('glogin'),
                { theme: 'outline', size: 'large' }
            );
        }
    }, []);

    const handleLogin = async () => {
        const baseURL = import.meta.env.VITE_HTTP_API;
        const email = emailRef.current.value;
        const pass = passRef.current.value;

        const username = 'nikos';
        const password = '130177';

        console.log(`${baseURL}local/login?email=${encodeURIComponent(email)}&pass=${encodeURIComponent(pass)}`);

        try {
            const res = await fetch(`${baseURL}local/login?email=${encodeURIComponent(email)}&pass=${encodeURIComponent(pass)}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });

            const json = await res.json();

            if (json.data && json.data.success) {
                alert(`Welcome back, ${json.data.data.name}!`);
                window.location.href = '/';
            } else {
                alert('Login failed: ' + (json.data?.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Login error: ' + e.message);
        }
    };

    const handleCredentialResponse = (response) => {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
        setGoogleUser(payload);
        console.log('Decoded JWT:', payload);
    };

    const sendPasswordReset = () => {
        const email = forgotRef.current.value;
        fetch(`/api?forgot_password=${encodeURIComponent(email)}`)
            .then((res) => res.text())
            .then((text) =>
                alert(text === 'yes' ? 'EMAIL_SENT_MAILBOX' : 'Cannot send...')
            )
            .catch(() => alert('Request error...'));
    };

    return (
        <div style={styles.login}>
            <div style={styles.module}>
                <h1>{G.menupages[path]}</h1>
                <input ref={emailRef} style={styles.input} type="text" placeholder="Email" />
                <input ref={passRef} style={styles.input} type="password" placeholder="Password" />
                <div>
                    <button style={styles.button} onClick={handleLogin}>Enter</button>
                    <button style={styles.button} onClick={() => window.location.href = '/signup'}>Signup</button>
                </div>

                {!googleUser ? (
                    <div id="glogin" style={{ margin: '20px auto' }}></div>
                ) : (
                    <div>
                        <p>Welcome, {googleUser.name}</p>
                        <button style={styles.button} onClick={() => setGoogleUser(null)}>Logout</button>
                    </div>
                )}

                <button style={styles.button} onClick={() => setShowForgot(true)}>
                    Forgot Password?
                </button>

                {showForgot && (
                    <div style={styles.modal}>
                        <div style={styles.modalContent}>
                            <h2>Insert Email</h2>
                            <input ref={forgotRef} style={styles.input} type="text" placeholder="Your email" />
                            <div>
                                <button style={styles.button} onClick={sendPasswordReset}>Send</button>
                                <button style={styles.button} onClick={() => setShowForgot(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;

// 🪄 Styles at the end
// 🪄 Styles at the end
const styles = {
    login: {
        fontFamily: '"Lucida Grande", Helvetica, sans-serif',
        minHeight: '100vh',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    module: {
        padding: '3%',
        boxShadow: '0 0 15px rgba(0,0,0,.45)',
        borderRadius: '10px',
        animation: 'fadein 2s',
        textAlign: 'center',
        minWidth: '280px',
    },
    input: {
        width: '90%',
        margin: '5px 0',
        padding: '10px',
        fontSize: '1em',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    button: {
        padding: '10px 15px',
        margin: '10px 5px',
        background: 'var(--bg2)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    modal: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    modalContent: {
        background: 'var(--bg)',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
    }
};