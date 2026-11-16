
import React from "react";

const styles = `
h3, h4, h5 {
    margin: .5em 0;
    font-weight: bold;
}
p {
    margin: .5em 0;
    font-size: 14px;
    line-height: 1.5;
}
.item {
    background: var(--bg2);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 10px;
    margin: 15px 0;
    box-shadow: var(--shadow);
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
}
.item-media { margin-bottom: 10px; }
.item img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}
.SmallImage, .SmallImageDetail, .SmallImageFacts {
    font-size: 14px;
}
.LargeImage { font-size: 18px; }
.item-title { font-size: 16px; }
.item-subtitle { font-size: 14px; }
.item-date {
    font-size: 12px;
    opacity: .7;
    margin-bottom: 5px;
}
.item-summary, .item-quote {
    font-size: 14px;
    line-height: 1.4;
}
.item-facts {
    list-style: none;
    padding: 0;
    margin: 0;
}
.item-facts li {
    background: var(--bg3);
    border-radius: 4px;
    padding: 5px;
    margin-bottom: 5px;
}
.item-quote {
    font-style: italic;
    border-left: 3px solid var(--border);
    padding-left: 10px;
    margin: 10px 0;
}
.item-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
}
.Gallery-img {
    width: 100%;
    height: auto;
    object-fit: cover;
}
.item-recommendations { padding-left: 20px; }
.item-author {
    font-size: 12px;
    opacity: .75;
    margin-top: 5px;
}
.Event {
    background: var(--bg3);
    border-left: 3px solid var(--primary);
    padding: 10px;
}
`;

// ---- JSON normalization ----

const getData = (content) => {
    if (!content?.json) return {};

    if (typeof content.json === "object") {
        return content.json;
    }

    try {
        return JSON.parse(content.json);
    } catch {
        return {};
    }
};

// ---- Shared components ----

const MediaLink = ({ uri, img, title }) => {
    if (!img) return null;

    const image = <img src={img} alt={title || ""} />;

    return (
        <div className="item-media">
            {uri ? <a href={uri}>{image}</a> : image}
        </div>
    );
};

const ItemHeader = ({ p, level = "h4" }) => {
    const Heading = level;

    return (
        <div className="item-content">
            <Heading className="item-title">{p.title}</Heading>
            {p.subtitle && (
                <h5 className="item-subtitle">{p.subtitle}</h5>
            )}
            {p.published && (
                <div className="item-date">{p.published}</div>
            )}
            {p.excerpt && <p>{p.excerpt}</p>}
        </div>
    );
};

const Author = ({ name }) =>
    name ? <div className="item-author">— {name}</div> : null;

// ---- Individual renderers ----

const renderSmallImage = (p, data) => (
    <div className="item SmallImage">
        <MediaLink uri={p.url} img={p.img} title={p.title} />
        <ItemHeader p={p} />
    </div>
);

const renderLargeImage = (p) => (
    <div className="item LargeImage">
        <MediaLink uri={p.url} img={p.img} title={p.title} />
        <ItemHeader p={p} level="h3" />
    </div>
);

const renderSmallImageDetail = (p) => (
    <div className="item SmallImageDetail">
        <MediaLink uri={p.url} img={p.img} title={p.title} />
        <ItemHeader p={p} />
    </div>
);

const renderBlockquote = (p, data) => (
    <blockquote className="item Blockquote">
        <p className="item-quote">{p.excerpt}</p>
        <Author name={data.author} />
    </blockquote>
);

const renderSmallImageFacts = (p, data) => (
    <div className="item SmallImageFacts">
        <MediaLink uri={p.url} img={p.img} title={p.title} />
        <ItemHeader p={p} />

        {Array.isArray(data.facts) && (
            <ul className="item-facts">
                {data.facts.map((fact, i) => (
                    <li key={i}>{fact}</li>
                ))}
            </ul>
        )}
    </div>
);

const renderVideoThumbnail = (p) => (
    <div className="item VideoThumbnail">
        <MediaLink uri={p.url} img={p.img} title={p.title} />
        <ItemHeader p={p} />
    </div>
);

const renderGallery = (p, data) => (
    <div className="item Gallery">
        <h3>{p.title}</h3>

        <div className="item-gallery">
            {(data.gallery || []).map((image, i) => (
                <a
                    href={image.url || image.img}
                    key={image.id || i}
                >
                    <img
                        className="Gallery-img"
                        src={image.img}
                        alt={image.title || p.title}
                    />
                </a>
            ))}
        </div>
    </div>
);

const renderRecommendations = (p, data) => (
    <div className="item Recommendations">
        <h3>{p.title}</h3>

        <ul className="item-recommendations">
            {(data.recommendations || []).map((item, i) => (
                <li key={item.id || i}>
                    {item.url
                        ? <a href={item.url}>{item.title}</a>
                        : item.title || item}
                </li>
            ))}
        </ul>
    </div>
);

const renderOpinion = (p, data) => (
    <div className="item Opinion">
        <h3>{p.title}</h3>
        <Author name={data.author} />
        <p>{p.excerpt}</p>
    </div>
);

const renderEvent = (p, data) => (
    <div className="item Event">
        <h3>{p.title}</h3>
        {p.published && <span className="item-date">{p.published}</span>}
        <p>{p.excerpt}</p>
        <Author name={data.author} />
    </div>
);

// ---- Template map ----

const TEMPLATES = {
    SmallImage: renderSmallImage,
    LargeImage: renderLargeImage,
    SmallImageDetail: renderSmallImageDetail,
    Blockquote: renderBlockquote,
    SmallImageFacts: renderSmallImageFacts,
    VideoThumbnail: renderVideoThumbnail,
    Gallery: renderGallery,
    Recommendations: renderRecommendations,
    Opinion: renderOpinion,
    Event: renderEvent
};

// ---- Item dispatcher ----

const JournalItem = ({ content }) => {
    const data = getData(content);
    const template = data.template || content.type;
    const render = TEMPLATES[template];

    if (!render) return null;

    return render(content, data);
};

// ---- Journal container ----

const Journal = ({ posts = [] }) => {
    return (
        <>
            <style>{styles}</style>

            <div id="output">
                {posts.map((post) => (
                    <JournalItem
                        key={post.id}
                        content={post}
                    />
                ))}
            </div>
        </>
    );
};

export default Journal;
