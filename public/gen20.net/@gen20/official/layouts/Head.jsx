import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { useG } from '../contexts/GContext';

const Head = ({ url }) => {
    const {G} = useG();
    const HTTP = import.meta.env.VITE_HTTP;
    const [tags, setTags] = useState([]);
    //const headArray = typeof G.head === 'string' ? JSON.parse(G.head) : G.head;
    const headArray = [
        { type: "title", content: "Admin GEN20" },
        { type: "meta", attrs: { name: "description", content: "Videograph Template" } },
        { type: "meta", attrs: { name: "keywords", content: "Videograph, unica" } },
        { type: "meta", attrs: { name: "viewport", content: "width=device-width, initial-scale=1.0" } },
        { type: "meta", attrs: { "http-equiv": "X-UA-Compatible", content: "ie=edge" } },

        // Open Graph
        { type: "meta", attrs: { property: "og:type", content: "website" } },
        { type: "meta", attrs: { property: "og:url", content: "https://gen20.net" } },
        { type: "meta", attrs: { property: "og:title", content: "Gen20" } },
        { type: "meta", attrs: { property: "og:description", content: "Art and Technology Official." } },
        { type: "meta", attrs: { property: "og:image", content: "/img/logo2_en.png" } },
        { type: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { type: "meta", attrs: { property: "og:image:height", content: "630" } },

        // Twitter
        { type: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
        { type: "meta", attrs: { name: "twitter:url", content: "https://gen20.net" } },
        { type: "meta", attrs: { name: "twitter:title", content: "Gen20" } },
        { type: "meta", attrs: { name: "twitter:description", content: "Art and Technology Official." } },
        { type: "meta", attrs: { name: "twitter:image", content: "/img/logo2_en.png" } },

        // Favicon
        { type: "link", attrs: { rel: "icon", href: `${HTTP}/asset/img/icon.png` } },

        // Stylesheets
        { type: "link", attrs: { rel: "stylesheet", href: "css/bootstrap.min.css" } },
        { type: "link", attrs: { rel: "stylesheet", href: "css/elegant-icons.css" } },
        { type: "link", attrs: { rel: "stylesheet", href: "css/owl.carousel.css" } },
        { type: "link", attrs: { rel: "stylesheet", href: "css/magnific-popup.css" } },
        { type: "link", attrs: { rel: "stylesheet", href: "css/slicknav.min.css" } },
        { type: "link", attrs: { rel: "stylesheet", href: "css/style.css" } },

        // Scripts

    ];


    return (
        <Helmet>
            {headArray.map((tag, i) => {
                const {type, content, attrs} = tag;
                switch (type) {
                    case 'title':
                        return <title key={i}>{content}</title>;
                    case 'meta':
                        return <meta key={i} {...attrs} />;
                    case 'link':
                        return <link key={i} {...attrs} />;
                    case 'script':
                        return <script key={i} {...attrs}></script>;
                    default:
                        return null;
                }
            })}
        </Helmet>
    );
}
export default Head;
