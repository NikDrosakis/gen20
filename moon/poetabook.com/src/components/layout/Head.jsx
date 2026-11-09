import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { useG } from '../contexts/GContext';

const Head = ({ url }) => {
    const {G} = useG();
    const HTTP = process.env.REACT_APP_HTTP;
    const [tags, setTags] = useState([]);
    //const headArray = typeof G.head === 'string' ? JSON.parse(G.head) : G.head;
    const headArray = [
        { type: "title", content: "Admin GEN20" },
        { type: "meta", attrs: { name: "description", content: "Γενιά 20 Επίσημη Ιστοσελίδα - Gen20 Official Website" } },
        { type: "meta", attrs: { name: "keywords", content: "Γενιά 20, Gen20" } },
        { type: "meta", attrs: { name: "viewport", content: "width=device-width, initial-scale=1.0" } },
        { type: "meta", attrs: { "http-equiv": "X-UA-Compatible", content: "ie=edge" } },

        // Open Graph
        { type: "meta", attrs: { property: "og:type", content: "website" } },
        { type: "meta", attrs: { property: "og:url", content: "https://poetabook.gr" } },
        { type: "meta", attrs: { property: "og:title", content: "Poetabook" } },
        { type: "meta", attrs: { property: "og:description", content: "Γενιά 20 Επίσημη Ιστοσελίδα - Gen20 Official Website" } },
        { type: "meta", attrs: { property: "og:image", content: "/media/logo2_en.png" } },
        { type: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { type: "meta", attrs: { property: "og:image:height", content: "630" } },
        // Twitter
        { type: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
        { type: "meta", attrs: { name: "twitter:url", content: "https://poetabook.gr" } },
        { type: "meta", attrs: { name: "twitter:title", content: "Gen20" } },
        { type: "meta", attrs: { name: "twitter:description", content: "Art and Technology Official." } },
        { type: "meta", attrs: { name: "twitter:image", content: "/media/logo2_en.png" } },

        // Favicon
        { type: "link", attrs: { rel: "icon", href: `${HTTP}/media/gen_logo3.png` } },

        // Stylesheets
        { type: "link", attrs: { rel: "stylesheet", href: "css/elegant-icons.css" } },
        { type: "link", attrs: { rel: "stylesheet", href: "css/owl.carousel.css" } },
        { type: "link", attrs: { rel: "stylesheet", href: "css/magnific-popup.css" } },
        { type: "link", attrs: { rel: "stylesheet", href: "css/slicknav.min.css" } },

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
