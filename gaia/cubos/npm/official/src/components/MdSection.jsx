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
                            <div className="blog__details__tags">
                                <span><i className="fa fa-tag"></i> Tag:</span>
                                <a href="/">Wedding</a>
                                <a href="/">Event</a>
                                <a href="/">Couple</a>
                            </div>
                            <div className="blog__details__option">
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-6">
                                        <a href="/" className="blog__details__option__item">
                                            <h5><i className="fa fa-angle-left"></i> Previous posts</h5>
                                            <div className="blog__details__option__item__img">
                                                <img src="img/blog/prev.jpg" alt=""/>
                                            </div>
                                            <div className="blog__details__option__item__text">
                                                <h6>Looking for Music & Sounds for my new Android...</h6>
                                                <span>Nov 27, 2019</span>
                                            </div>
                                        </a>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-6">
                                        <a href="/" className="blog__details__option__item blog__details__option__item--right">
                                            <h5>Previous posts <i className="fa fa-angle-right"></i></h5>
                                            <div className="blog__details__option__item__img">
                                                <img src="img/blog/next.jpg" alt=""/>
                                            </div>
                                            <div className="blog__details__option__item__text">
                                                <h6>Looking for Music & Sounds for my new Android...</h6>
                                                <span>Nov 27, 2019</span>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="blog__details__recent">
                                <h4>Recent Posts</h4>
                                <div className="row">
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="blog__details__recent__item">
                                            <img src="img/blog/ri-1.jpg" alt=""/>
                                            <h5>What are the steps of a body lift procedure?</h5>
                                            <span>Dec 06, 2019</span>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="blog__details__recent__item">
                                            <img src="img/blog/ri-2.jpg" alt=""/>
                                            <h5>What are the steps of a body lift procedure?</h5>
                                            <span>Dec 06, 2019</span>
                                        </div>
                                    </div>
                                    <div className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="blog__details__recent__item">
                                            <img src="img/blog/ri-3.jpg" alt=""/>
                                            <h5>How to shop for a cosm surgery procedure</h5>
                                            <span>Dec 06, 2019</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="blog__details__comment">
                                <h4>Leave a comment</h4>
                                <form action="#">
                                    <div className="input__list">
                                        <input type="text" placeholder="Name"/>
                                        <input type="text" placeholder="Email"/>
                                        <input type="text" placeholder="Website"/>
                                    </div>
                                    <textarea placeholder="Comment"></textarea>
                                    <button type="submit" className="site-btn">Send Message</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MdSection;