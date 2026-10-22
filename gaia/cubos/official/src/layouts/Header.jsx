import React, {useMemo, useEffect, useState} from 'react';
import Menu from "../components/Menu";
const Header = () => {
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
                <Menu/>
                </div>
                <div id="mobile-menu-wrap"></div>
            </div>
        </header>
    );
};

export default Header;