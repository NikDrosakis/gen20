import React from 'react';
import {useG} from "../contexts/GContext";
const Breadcrumb = () => {
    const path = window.location.pathname.split('/')[1] || 'home';
    const { G } = useG();
    console.log(path)
    console.log(G.menupages)
    return (
   <div className="breadcrumb-option spad" style={{
       backgroundImage: (path==='about' ? `url("/img/about-1.jpg")`:
           (path==='portfolio' ? `url("/img/about-2.jpg")` :`url("/img/about-3.jpg")` ))
   }}>
    <div className="container">
        <div className="row">
            <div className="col-lg-12 text-center">
                <div className="breadcrumb__text">
                    <div className="breadcrumb__links">
                        <span>{G.menupages[path]}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
)
    ;
};

export default Breadcrumb;