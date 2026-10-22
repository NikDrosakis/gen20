import React, {useEffect, useState} from "react";
import DB from "../contexts/DB";
import EditButton from '../modules/EditButton';
import NewButton from '../modules/NewButton';
import { useG } from '../contexts/GContext';
const Archive = () => {
    const { G } = useG();
    const path = window.location.pathname.split('/')[1];
    const [block, setBlock] = useState({});
    useEffect(() => {
        const fetchData = async () => {
            const data = await DB.fetchPost(path,'b.sort asc');
            setBlock(data?.[0] ?? {});
        };
        fetchData();
    }, []);

    return (
        <section className="blog spad">
            <div className="container">
                <div className="row">
                    {block.length > 0 ? (
                    block.slice(0, 3).map((b, index) => (
                    <div className="col-lg-4 col-md-6 col-sm-6">
                        <div className="blog__item">
                            <h4>What Makes Users Want to Share a Video on Social Media?</h4>
                            <ul>
                                <li>Jan 03, 2020</li>
                                <li>05 Comment</li>
                            </ul>
                            <p>We recently launched a new website for a Vital client and wanted to share some of the
                                cool
                                features we were able...</p>
                            <a href="/">Read more <span className="arrow_right"></span></a>
                        </div>
                    </div>
                      ))
                        ) : (
                        <p>Δεν υπάρχουν διαθέσιμα blocks αυτή τη στιγμή.</p>
                    )}
                    <NewButton postid={G.postid} lang="el" row="content" />
                </div>
            </div>
        </section>
    );
};

export default Archive;