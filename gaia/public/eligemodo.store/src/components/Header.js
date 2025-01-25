import React from "react";
import { Link } from "react-router-dom";
const Header=()=>{
    return (
        <header>
            <nav>
                <Link to="/">Home</Link> |
                <Link to="/privacy">Terms</Link>
            </nav>
            <h1>Elige Modo v.0.9.0</h1>
            <div className="site-mobile-menu">
                <div className="site-mobile-menu-header">
                    <div className="site-mobile-menu-close mt-3">
                        <span className="icon-close2 js-menu-toggle"></span>
                    </div>
                </div>
                <div className="site-mobile-menu-body"></div>
            </div>
        </header>
    );
}

export default Header;