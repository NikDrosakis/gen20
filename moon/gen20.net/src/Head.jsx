import { Helmet } from 'react-helmet';
import { useG } from '../../contexts/GContext';

const Head = ({ url }) => {
    const { G } = useG();
    const HTTP = import.meta.env.VITE_HTTP;
    const set = G?.set ?? {};

    // Επιστρέφει τιμή από G.set με βάση name/property, αλλιώς το default
    const resolve = (attrs, fallback) => {
        if (!attrs) return fallback;
        const key = attrs.name || attrs.property;
        return (key && set[key] != null) ? set[key] : fallback;
    };

    const headArray = [
        { type: 'title', content: resolve({ name: 'title' }, 'Γενιά 20 - Gen20') },

        { type: 'meta', attrs: { name: 'description', content: resolve({ name: 'description' }, 'Γενιά 20 Επίσημη Ιστοσελίδα - Gen20 Official Website') } },
        { type: 'meta', attrs: { name: 'keywords', content: resolve({ name: 'keywords' }, 'Γενιά 20, Gen20') } },
        { type: 'meta', attrs: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' } },
        { type: 'meta', attrs: { 'http-equiv': 'X-UA-Compatible', content: 'ie=edge' } },

        // Open Graph
        { type: 'meta', attrs: { property: 'og:type', content: resolve({ property: 'og:type' }, 'website') } },
        { type: 'meta', attrs: { property: 'og:url', content: resolve({ property: 'og:url' }, url || 'https://gen20.net') } },
        { type: 'meta', attrs: { property: 'og:title', content: resolve({ property: 'og:title' }, 'Gen20') } },
        { type: 'meta', attrs: { property: 'og:description', content: resolve({ property: 'og:description' }, 'Γενιά 20 Επίσημη Ιστοσελίδα - Gen20 Official Website') } },
        { type: 'meta', attrs: { property: 'og:image', content: resolve({ property: 'og:image' }, '/media/gen_logo4.png') } },
        { type: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { type: 'meta', attrs: { property: 'og:image:height', content: '630' } },

        // Twitter
        { type: 'meta', attrs: { name: 'twitter:card', content: resolve({ name: 'twitter:card' }, 'summary_large_image') } },
        { type: 'meta', attrs: { name: 'twitter:url', content: resolve({ name: 'twitter:url' }, url || 'https://gen20.net') } },
        { type: 'meta', attrs: { name: 'twitter:title', content: resolve({ name: 'twitter:title' }, 'Gen20') } },
        { type: 'meta', attrs: { name: 'twitter:description', content: resolve({ name: 'twitter:description' }, 'Art and Technology Official.') } },
        { type: 'meta', attrs: { name: 'twitter:image', content: resolve({ name: 'twitter:image' }, '/media/gen_logo4.png') } },

        // Favicon
        { type: 'link', attrs: { rel: 'icon', href: resolve({ name: 'favicon' }, `${HTTP}/media/gen_logo4.png`) } },
    ];

    return (
        <Helmet>
            {headArray.map((tag, i) => {
                const { type, content, attrs } = tag;
                switch (type) {
                    case 'title':
                        return <title key={i}>{content}</title>;
                    case 'meta':
                        return <meta key={i} {...attrs} />;
                    case 'link':
                        return <link key={i} {...attrs} />;
                    case 'script':
                        return <script key={i} {...attrs} />;
                    default:
                        return null;
                }
            })}
        </Helmet>
    );
};

export default Head;