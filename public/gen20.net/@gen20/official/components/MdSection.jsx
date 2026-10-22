import React, {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import DB from "../contexts/DB";
import EditButton from "../modules/EditButton";
const MdSection = () => {
    const path = window.location.pathname.split('/')[1];
    const [block, setBlock] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const data = await DB.fetchPost(path,'b.sort asc');
            setBlock(data?.[0] ?? {});

        };
        fetchData();
    }, []);

    return (
        <div className="blog-details spad">
            <div className="container">
                <div className="row d-flex justify-content-center">
                    <div className="col-lg-8">
                        <div className="blog__details__content">
                            <div className="blog__details__text">
                             <div id={`block-${block.id}`} dangerouslySetInnerHTML={{__html: block.content}}></div>
                            <EditButton blockId={block.id} row="content" editable={true} lang="el"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MdSection;