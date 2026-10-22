import React from 'react';

const ShareToolbox = ({ url, title, description, image, className }) => {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title || 'Check this out';
    const shareDescription = description || '';
    const shareImage = image || 'https://nikimourtzi.com/assets/niki.png';
console.log(shareUrl,shareTitle,shareDescription,shareImage);
    const shareOnFacebook = () => {
        // Add cache-busting parameter
        const cacheBuster = `fb_share_${Date.now()}`;
        const urlWithCache = `${shareUrl}${shareUrl.includes('?') ? '&' : '?'}v=${cacheBuster}`;

        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlWithCache)}`;
        window.open(fbUrl, '_blank', 'width=600,height=400');
    };  // <-- ΜΟΝΟ ΕΝΑ }; ΕΔΩ

    const shareOnLinkedIn = () => {
        const liUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareDescription)}`;
        window.open(liUrl, '_blank', 'width=600,height=500');
    };

    const shareOnTwitter = () => {
        const tweetText = `${shareTitle} - ${shareUrl}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    };

    const buttonStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: '#f1f5f9',
        color: '#475569',
        margin: '0 4px'
    };

    const containerStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 0'
    };

    const labelStyles = {
        fontSize: '14px',
        color: '#64748b',
        fontWeight: '500'
    };

    // Facebook Icon SVG
    const FacebookIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/>
        </svg>
    );

    // LinkedIn Icon SVG
    const LinkedInIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C0.792 0 0 0.774 0 1.729v20.542C0 23.227 0.792 24 1.771 24h20.451c0.979 0 1.771-0.773 1.771-1.729V1.729C24 0.774 23.208 0 22.225 0z"/>
        </svg>
    );

    // Twitter/X Icon SVG
    const TwitterIcon = () => (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
    );

    return (
        <div style={containerStyles} className={className}>
            <span style={labelStyles}>Share:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
                {/* Facebook Button */}
                <button
                    onClick={shareOnFacebook}
                    style={buttonStyles}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1877f2';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    aria-label="Share on Facebook"
                    title="Share on Facebook"
                >
                    <FacebookIcon />
                </button>

                {/* LinkedIn Button */}
                <button
                    onClick={shareOnLinkedIn}
                    style={buttonStyles}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0a66c2';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    aria-label="Share on LinkedIn"
                    title="Share on LinkedIn"
                >
                    <LinkedInIcon />
                </button>

                {/* Twitter Button */}
                <button
                    onClick={shareOnTwitter}
                    style={buttonStyles}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#000000';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    aria-label="Share on Twitter/X"
                    title="Share on Twitter/X"
                >
                    <TwitterIcon />
                </button>
            </div>
        </div>
    );
};

export default ShareToolbox;