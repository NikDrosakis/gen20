import React, {useEffect, useState} from 'react';
import DB from "../contexts/DB";
const Breadcrumb = () => {
    const path = window.location.pathname.split('/')[1] || 'home';
    const [block, setBlock] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const dat = await DB.fetchPost(path,'b.sort asc');
            setBlock(dat?.[0] ?? {});
        };
        fetchData();
    }, []);

    return (
   <div className="breadcrumb-option spad" style={{
       backgroundImage: (path=='about' ? `url("/img/about-1.jpg")`:
           (path=='portfolio' ? `url("/img/about-2.jpg")` :`url("/img/about-3.jpg")` ))
   }}>
    <div className="container">
        <div className="row">
            <div className="col-lg-12 text-center">
                <div className="breadcrumb__text">
                    <h2>{ block.title }</h2>
                    <div className="breadcrumb__links">
                        <a href="/">Home</a>
                        <span>{path}</span>
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