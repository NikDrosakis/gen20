import React from 'react';

function RecentPosts({ posts = [] }) {
    return (
        <div className="blog__details__recent">
            <h4>Recent Posts</h4>
            <div className="row">
                {posts.map((post, idx) => (
                    <div className="col-lg-4 col-md-6 col-sm-6" key={idx}>
                        <div className="blog__details__recent__item">
                            <img src={post.image} alt="" />
                            <h5>{post.title}</h5>
                            <span>{post.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecentPosts;
