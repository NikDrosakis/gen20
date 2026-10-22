import React, {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import DB from "../contexts/DB";
const BlogDetailsSection = () => {
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
                                <ReactMarkdown>{block.content}</ReactMarkdown>
                            </div>
                            <div className="blog__details__quote">
                                <p>Create horizontal, square and vertical videos that are ready to be exported to your
                                    Instagram video stories and posts. Perfect for any social network!</p>
                                <h6>Max Desmarais</h6>
                                <i className="fa fa-quote-right"></i>
                            </div>
                            <div className="blog__details__desc">
                                <p>An average Internet user watches about 1.5 hours of online video every day. This means
                                    that video can be a powerful marketing tool for getting your message before the eyes of
                                    millions of people. However, not all videos are created equal.</p>
                                <p>Some of them are inherently more shareable on social media than others. Here’s a quick
                                    look at how to make users want to share your videos on social media.</p>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetailsSection;