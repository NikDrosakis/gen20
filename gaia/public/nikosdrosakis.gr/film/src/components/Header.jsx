import React from 'react';
import { Link } from "react-router-dom";
const Header = () => {
    const path = window.location.pathname.split('/')[1];
    return (
        <header className="header">
            <div className="container">
                <div className="row">
                    <div className="col-lg-2">
                        <div className="header__logo">
                            <a href="/">
                                <img src="img/logo.png" alt=""/>
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-10">
                        <div className="header__nav__option">
                            <nav className="header__nav__menu mobile-menu">
                                <ul>
                                    <li className={path === '' ? 'active' : ''}>
                                        <Link to="/">Home</Link>
                                    </li>
                                    <li className={path === 'about' ? 'active' : ''}>
                                        <Link to="/about">About</Link>
                                    </li>
                                    <li className={path === ' portfolio' ? 'active' : ''}>
                                        <Link to="/portfolio">Portfolio</Link>
                                    </li>
                                    <li className={path === 'services' ? 'active' : ''}>
                                        <Link to="/services">Services</Link>
                                    </li>
                                    <li className={path === 'pages' ? 'active' : ''}>
                                        <a href="/pages">Pages</a>
                                    </li>
                                        <li className={path === 'blog' ? 'active' : ''}>
                                            <Link to="/blog">Blog</Link>
                                        </li>
                                        <li className={path === 'blog-details' ? 'active' : ''}>
                                            <Link to="/blog-details">Blog Details</Link>
                                        </li>
                                    <li className={path === 'contact' ? 'active' : ''}>
                                        <Link to="/contact">Contact</Link>
                                    </li>
                                </ul>
                            </nav>
                            <div className="header__nav__social">
                                <a href="https://facebook.com/NikDrosakis">
                                    <i className="fa fa-facebook"/>
                                </a>
                                <a href="https://twitter.com/NikDrosakis">
                                    <i className="fa fa-twitter"/>
                                </a>
                                <a href="https://nikosdrosakis.gr">
                                    <i className="fa fa-dribbble"/>
                                </a>
                                <a href="https://instagram.com/NikDrosakis">
                                    <i className="fa fa-instagram"/>
                                </a>
                                <a href="https://youtube.com/@NikDrosakis">
                                    <i className="fa fa-youtube-play"/>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                    <div id="mobile-menu-wrap"></div>
            </div>
        </header>
    );
};

export default Header;