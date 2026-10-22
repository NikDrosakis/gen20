import React from "react";

const Tags = ({ tags = ["Wedding", "Event", "Couple"] }) => {
    return (
        <div className="blog__details__tags">
            <span>
                <i className="fa fa-tag"></i> Tag:
            </span>
            {tags.map((tag, index) => (
                <a key={index} href={`/tags/${tag.toLowerCase()}`}>
                    {tag}
                </a>
            ))}
        </div>
    );
};

export default Tags;
