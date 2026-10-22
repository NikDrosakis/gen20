import React from 'react';

function PreviousPosts({ prevPost, nextPost }) {
    return (
        <div className="blog__details__option">
            <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-6">
                    <a href={prevPost?.link || "/"} className="blog__details__option__item">
                        <h5><i className="fa fa-angle-left"></i> Previous posts</h5>
                        <div className="blog__details__option__item__img">
                            <img src={prevPost?.image || "img/blog/prev.jpg"} alt=""/>
                        </div>
                        <div className="blog__details__option__item__text">
                            <h6>{prevPost?.title || "Default previous post title"}</h6>
                            <span>{prevPost?.date || "Unknown date"}</span>
                        </div>
                    </a>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6">
                    <a href={nextPost?.link || "/"} className="blog__details__option__item blog__details__option__item--right">
                        <h5>Previous posts <i className="fa fa-angle-right"></i></h5>
                        <div className="blog__details__option__item__img">
                            <img src={nextPost?.image || "img/blog/next.jpg"} alt=""/>
                        </div>
                        <div className="blog__details__option__item__text">
                            <h6>{nextPost?.title || "Default next post title"}</h6>
                            <span>{nextPost?.date || "Unknown date"}</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default PreviousPosts;
