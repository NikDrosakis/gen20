import React from 'react';
import { Link } from "react-router-dom";
import LanguageSelector from "../modules/LanguageSelector";
import ThemeToggle from "./ThemeToggle";
const Header = () => {
    const path = window.location.pathname.split('/')[1];
    return (
        <header className="header">
            <div className="container">
                <div className="row">
                    <div className="col-lg-2">
                        <div className="header__logo">
                            <a href="/">
                                <img src="img/logo2_en.png" alt=""/>
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-10">
                        <div className="header__nav__option">
                            <nav className="header__nav__menu mobile-menu">
                                <ul>
                                    <li className={path === '' ? 'active' : ''}>
                                        <Link to="/">Αρχική</Link>
                                    </li>
                                    <li className={path === 'about' ? 'active' : ''}>
                                        <Link to="/about">Σχετικά</Link>
                                    </li>
                                    <li className={path === 'blog-details' ? 'active' : ''}>
                                        <Link to="/programming">Πληροφορική</Link>
                                    </li>
                                    <li className={path === 'services' ? 'active' : ''}>
                                        <Link to="/services">Έργα</Link>
                                    </li>
                                    <li className={path === 'theatre' ? 'active' : ''}>
                                        <Link to="/theatre">Θέατρο</Link>
                                    </li>
                                    <li className={path === 'film' ? 'active' : ''}>
                                        <Link to="/film">Ταινίες</Link>
                                    </li>
                                    <li className={path === 'contact' ? 'active' : ''}>
                                        <Link to="/contact">Επικοινωνία</Link>
                                    </li>
                                    <li><LanguageSelector/></li>
                                    <li><ThemeToggle/></li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
                <div id="mobile-menu-wrap"></div>
            </div>
        </header>
    );
};

export default Header;