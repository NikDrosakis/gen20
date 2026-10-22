import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useTheme } from '../contexts/ThemeContext';
import './Login.css';

const Login = () => {
    const { theme, toggleTheme } = useTheme();
    const emailRef = useRef();
    const passRef = useRef();
    const forgotRef = useRef();
    const [showForgot, setShowForgot] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load Google Sign-In script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: "75986003727.apps.googleusercontent.com",
                    callback: handleCredentialResponse,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById('glogin'),
                    {
                        theme: theme === 'dark' ? 'filled_black' : 'outline',
                        size: 'large',
                        width: '100%'
                    }
                );
            }
        };

        return () => {
            script.remove();
        };
    }, [theme]);

    const handleLogin = async () => {
        const email = emailRef.current.value;
        const pass = passRef.current.value;

        if (!email || !pass) {
            alert('Please enter email and password');
            return;
        }

        setLoading(true);
        const username = 'nikos';
        const password = '130177';

        try {
            const res = await fetch(`/api/v1/local/login?email=${encodeURIComponent(email)}&pass=${encodeURIComponent(pass)}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
                }
            });

            const json = await res.json();
console.log(json);
            if (json.data && json.data.success) {
                Cookies.set('GENNAME', json.data.data.name);
                Cookies.set('GENUID', json.data.data.id);
                Cookies.set('GENIMG', json.data.data.img);
                Cookies.set('lang', json.data.data.lang);
                Cookies.set('GENGRP', json.data.data.usergrpid);
                Cookies.set('GENROLE', json.data.data.permission);
                window.location.href = '/';
            } else {
                alert('Login failed: ' + (json.data?.error || 'Invalid credentials'));
            }
        } catch (e) {
            alert('Login error: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCredentialResponse = (response) => {
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
            setGoogleUser(payload);

            // Handle Google login success
            Cookies.set('GENNAME', payload.name);
            Cookies.set('GENUID', payload.uid);
            Cookies.set('GENIMG', payload.img);
            Cookies.set('lang', payload.locale?.split('-')[0] || 'el');

            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } catch (error) {
            console.error('Google login error:', error);
            alert('Google login failed');
        }
    };

    const sendPasswordReset = async () => {
        const email = forgotRef.current.value;
        if (!email) {
            alert('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/v1/local/forgotPass=${encodeURIComponent(email)}`);
            const text = await res.text();
            alert(text === 'yes' ? 'Password reset link sent to your email' : 'Cannot send reset email');
            if (text === 'yes') {
                setShowForgot(false);
            }
        } catch (error) {
            alert('Request error...');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            <div className="login-module">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                </div>

                <div className="login-form">
                    <input
                        ref={emailRef}
                        className="login-input"
                        type="email"
                        placeholder="Email"
                        onKeyPress={handleKeyPress}
                        autoComplete="email"
                    />
                    <input
                        ref={passRef}
                        className="login-input"
                        type="password"
                        placeholder="Password"
                        onKeyPress={handleKeyPress}
                        autoComplete="current-password"
                    />

                    <div className="login-buttons">
                        <button
                            className="login-btn login-btn-primary"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Enter'}
                        </button>
                        <button
                            className="login-btn login-btn-secondary"
                            onClick={() => window.location.href = '/signup'}
                        >
                            Signup
                        </button>
                    </div>

                    <div className="google-login-wrapper">
                        {!googleUser ? (
                            <div id="glogin" className="google-btn"></div>
                        ) : (
                            <div className="google-user-info">
                                <img src={googleUser.picture} alt={googleUser.name} />
                                <p>Welcome, {googleUser.name}</p>
                                <button
                                    className="login-btn login-btn-secondary"
                                    onClick={() => setGoogleUser(null)}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className="login-link-btn"
                        onClick={() => setShowForgot(true)}
                    >
                        Forgot Password?
                    </button>
                </div>

                {showForgot && (
                    <div className="login-modal">
                        <div className="login-modal-content">
                            <h3>Reset Password</h3>
                            <input
                                ref={forgotRef}
                                className="login-input"
                                type="email"
                                placeholder="Your email"
                            />
                            <div className="login-modal-buttons">
                                <button
                                    className="login-btn login-btn-primary"
                                    onClick={sendPasswordReset}
                                    disabled={loading}
                                >
                                    {loading ? 'Sending...' : 'Send'}
                                </button>
                                <button
                                    className="login-btn login-btn-secondary"
                                    onClick={() => setShowForgot(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;