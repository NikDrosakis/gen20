import { Helmet } from 'react-helmet-async';
import Blog from "./Blog";
export default function Home() {
    return (
        <>
            <Helmet>
                <title>AntiCultura.com | Culture without borders. Ideas without noise. A multilingual journal.</title>
                <meta name="description" content="AntiCultura.com | Culture without borders. Ideas without noise. A multilingual journal." />

                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://anticultura.com/" />
                <meta property="og:title" content="AntiCultura.com | Culture without borders. Ideas without noise. A multilingual journal." />
                <meta property="og:description" content="AntiCultura.com | Culture without borders. Ideas without noise. A multilingual journal." />
                <meta property="og:image" content="https://anticultura.com/assets/logo.png" />
                <meta property="og:locale" content="el_GR" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="AntiCultura.com | Culture without borders. Ideas without noise. A multilingual journal." />
                <meta name="twitter:description" content="AntiCultura.com | Culture without borders. Ideas without noise. A multilingual journal." />
                <meta name="twitter:image" content="https://anticultura.com/assets/logo.png" />
            </Helmet>
        <div className="cv-page-container">
            <div className="centered-container">
                <div className="home">
                    <header className="hero">
                        <div className="hero-image">
                            <img src="/assets/bg.jpg" alt="AntiCultura.com"/>
                        </div>
                    </header>
                    <Blog/>
                </div>
                </div>
                </div>
                </>
                );
                }