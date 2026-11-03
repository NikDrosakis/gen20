import React, {useMemo, useEffect, useState} from 'react';
import Nav from "./Nav";
const Header = ({ lang }) => {
    return (
        <header className="header">
            <div className="container">
                <div className="row">
                    <div className="col-lg-2">
                        <div className="header__logo">
                            <a href="/">
                                <img src="/media/gen_logo3.png" alt=""/>
                            </a>
                        </div>
                    </div>
                <Nav lang={lang} />
                </div>
                <div id="mobile-menu-wrap"></div>
            </div>
        </header>
    );
};

export default Header;