import React, {useEffect, useState} from 'react';
import DB from "../contexts/DB";
import EditButton from '../modules/EditButton';

const HomeSection = () => {
    const path = window.location.pathname.split('/')[1] || 'home';
    console.log(path)
    const [block, setBlock] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const data = await DB.fetchPost(path,'b.sort asc');
            setBlock(data?.[0] ?? {});
        };
        fetchData();
    }, []);
    return (
        <section className="services spad">
            <div className="container">
                <div className="row">
                    <div className="">
                        <div className="services__title">
                            <div className="section-title">
                                <span>{path}</span>
                                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                                    Από την Artes Mundi στη Γενιά 20
                                </h2>
                            </div>
                            <div
                                id={`block-${block.id}`}
                                dangerouslySetInnerHTML={{__html: block.content}}
                            ></div>
                            <EditButton blockId={block.id} uri="ai-guide" row="content" editable={true} lang="el"/>
                            <a href="/" className="primary-btn">
                                Περισσότερα
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default HomeSection;
