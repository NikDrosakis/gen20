import React, {useMemo, useEffect, useState} from 'react';
import Menu from "./Menu";
const Header = ({ lang }) => {
    return (
        <header className="header">
            <div className="container">
                <div className="row">
                    <div className="col-lg-2">
                        <div className="header__logo">
                            <a href="/">
                                <img src="/media/gen_logo4.png" alt=""/>
                            </a>
                        </div>
                    </div>
                <Menu lang={lang} />
                </div>
                <div id="mobile-menu-wrap"></div>
            </div>
        </header>
    );
};

export default Header;