import React, { useEffect, useState } from "react";
import DB from "../contexts/DB";
import { useG } from '../contexts/GContext';
import EditButton from '../modules/EditButton';
const AboutSection = ({path,lang}) => {
    const { G } = useG();
    const [block, setBlock] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await DB.fetchPost(path, 'b.sort asc');
                console.log("Fetched block data:", data);
                setBlock(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching block data:", err);
                setBlock([]);
            }
        };
        fetchData();
    }, [path]);

    return (
        <section className="about spad">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <div className="about__text">
                            <div className="section-title">
                                <span>Gen20</span>
                                <h2>Τέχνη & Τεχνολογία</h2>
                            </div>
                            <div className="row">
                                {block.length > 0 ? (
                                    block.slice(0, 3).map((b, index) => (
                                        <div className="col-lg-6 col-md-6 col-sm-6" key={index}>
                                            <div className="services__item">
                                                <div className="services__item__icon">
                                                    <img src={b.icon || `/img/icons/si-3.png`} alt={b.title || 'Icon'}/>
                                                </div>
                                                <h4 blockId={b.id} row="title">{b.title || 'Χωρίς τίτλο'}</h4>
                                                <div
                                                    className="about__pic__item"
                                                    style={{backgroundImage: `url(/img/${b.img || 'logo.png'})`}}
                                                ></div>
                                                <p
                                                    id={`block-${b.id}`}
                                                    dangerouslySetInnerHTML={{__html: b.content || 'Χωρίς περιεχόμενο.'}}
                                                />
                                                <EditButton blockId={b.id} uri="ai-guide" row="content" editable={true}
                                                            lang="el"/>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>Δεν υπάρχουν διαθέσιμα blocks αυτή τη στιγμή.</p>
                                )}
                            </div>
                            <div className="about__text__desc">
                                <p>
                                    {G?.set?.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
