import React, { useEffect, useRef, useState } from 'react';
import './Signup.css';

const Signup = () => {
    const emailRef = useRef();
    const passRef = useRef();
    const nameRef = useRef();        // username
    const fullnameRef = useRef();    // fullname - added this
    const [googleUser, setGoogleUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load Google Identity Services
    useEffect(() => {
        // Load Google script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        // Initialize Google One Tap
        script.onload = () => {
            window.google?.accounts.id.initialize({
                client_id: "75986003727.apps.googleusercontent.com",
                callback: handleCredentialResponse,
            });
        };

        // Facebook SDK (optional)
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: import.meta.env.VITE_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: false,
                version: 'v19.0',
            });
        };

        const fbScript = document.createElement('script');
        fbScript.src = 'https://connect.facebook.net/en_US/sdk.js';
        fbScript.async = true;
        fbScript.defer = true;
        document.head.appendChild(fbScript);

        return () => {
            // Cleanup
            document.head.removeChild(script);
            document.head.removeChild(fbScript);
        };
    }, []);

    // Google callback
    const handleCredentialResponse = (response) => {
        if (!response || !response.credential) {
            setError('Google sign-in failed');
            return;
        }

        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
            setGoogleUser(payload);
            setError('');
            console.log('Decoded Google JWT:', payload);

            // Auto-register with backend
            registerWithProvider({
                name: payload.name,
                fullname: payload.name,
                email: payload.email,
                provider: 'google',
                provider_id: payload.sub
            });
        } catch (err) {
            console.error('Google decode error:', err);
            setError('Failed to process Google sign-in');
        }
    };

    // Facebook login
    const loginWithFacebook = () => {
        if (!window.FB) {
            setError('Facebook SDK not loaded');
            return;
        }

        window.FB.login(
            (response) => {
                if (response.authResponse) {
                    window.FB.api('/me', { fields: 'name,email,picture' }, (userData) => {
                        if (userData && !userData.error) {
                            setGoogleUser({ name: userData.name, email: userData.email });
                            registerWithProvider({
                                name: userData.name,
                                fullname: userData.name,
                                email: userData.email,
                                provider: 'facebook',
                                provider_id: response.authResponse.userID
                            });
                        } else {
                            setError('Failed to get Facebook user data');
                        }
                    });
                } else {
                    setError('Facebook login cancelled or failed');
                }
            },
            { scope: 'email,public_profile' }
        );
    };

    // API call for provider signup
    const registerWithProvider = async (userData) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/v1/local/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    fullname: userData.fullname,
                    email: userData.email,
                    pass: Math.random().toString(36).slice(-12), // Random password for OAuth users
                    lang: 'en',
                //    provider: userData.provider,
               //     provider_id: userData.provider_id
                })
            });

            const result = await response.json();

            if (result.success) {
                setSuccess('Account created! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // If user already exists, try to login instead
                if (result.error === 'Email already registered') {
                    setError('Email already exists. Please login instead.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                } else {
                    setError(result.error || 'Signup failed');
                }
            }
        } catch (err) {
            console.error('Provider signup error:', err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Email/password signup
    const signupWithEmail = async () => {
        const name = nameRef.current?.value?.trim();
        const fullname = fullnameRef.current?.value?.trim();
        const email = emailRef.current?.value?.trim();
        const password = passRef.current?.value;

        // Validation
        if (!fullname) {
            setError('Full name is required');
            fullnameRef.current?.focus();
            return;
        }
        if (!name) {
            setError('Username is required');
            nameRef.current?.focus();
            return;
        }
        if (!email) {
            setError('Email is required');
            emailRef.current?.focus();
            return;
        }
        if (!password) {
            setError('Password is required');
            passRef.current?.focus();
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            passRef.current?.focus();
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError('Invalid email format');
            emailRef.current?.focus();
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/v1/local/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,           // username
                    fullname: fullname,   // full name
                    email: email,
                    pass: password,
                    lang: 'en'
                })
            });

            const result = await response.json();

            if (result.success) {
                setSuccess('Account created successfully! Redirecting to login...');
                // Clear form
                if (fullnameRef.current) fullnameRef.current.value = '';
                if (nameRef.current) nameRef.current.value = '';
                if (emailRef.current) emailRef.current.value = '';
                if (passRef.current) passRef.current.value = '';

                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError(result.error || 'Signup failed. Please try again.');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Google One Tap trigger
    const triggerGoogleSignup = () => {
        window.google?.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed()) {
                setError('Google One Tap not displayed. Please try email signup.');
            }
        });
    };

    return (
        <div className="signup-container">
            <div className="signup-module">
                <h2>Create Account</h2>

                {error && <div className="signup-error">{error}</div>}
                {success && <div className="signup-success">{success}</div>}

                <input
                    ref={fullnameRef}
                    className="signup-input"
                    type="text"
                    placeholder="Full Name"
                    disabled={loading}
                />
                <input
                    ref={nameRef}
                    className="signup-input"
                    type="text"
                    placeholder="Username"
                    disabled={loading}
                />
                <input
                    ref={emailRef}
                    className="signup-input"
                    type="email"
                    placeholder="Email Address"
                    disabled={loading}
                />
                <input
                    ref={passRef}
                    className="signup-input"
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    disabled={loading}
                />

                <div>
                    <button
                        className="signup-button"
                        onClick={signupWithEmail}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                    <button
                        className="signup-button signup-button-secondary"
                        onClick={() => window.location.href = '/login'}
                        disabled={loading}
                    >
                        Back to Login
                    </button>
                </div>

                <div className="signup-divider">
                    <span>or sign up with</span>
                </div>

                <button
                    className="signup-button"
                    onClick={triggerGoogleSignup}
                    disabled={loading}
                    style={{ background: '#db4437' }}
                >
                    Google
                </button>

                <button
                    className="signup-button"
                    onClick={loginWithFacebook}
                    disabled={loading}
                    style={{ background: '#4267B2', marginLeft: '10px' }}
                >
                    Facebook
                </button>

                {googleUser && (
                    <div style={{ marginTop: '20px', padding: '10px', background: '#e8f5e9', borderRadius: '8px' }}>
                        <p style={{ margin: 0, color: '#2e7d32' }}>
                            ✓ Signed in as: {googleUser.name}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;