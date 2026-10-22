// pages/DynamicPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';

const DynamicPage = ({ pageName: propPageName, pageType, pageData: propPageData, lang: propLang }) => {
    const params = useParams();
    const lang = propLang || Cookies.get('lang') || 'el';

    // Get data from props (passed from App)
    const pageName = propPageName || params.name || window.location.pathname.split('/')[1] || 'home';
    const pageData = propPageData;

    if (!pageData) {
        return <div className="error-state">Page data not available</div>;
    }

    const title = lang === 'el'
        ? (pageData.title_el || pageData.title || pageName)
        : (pageData.title || pageData.title_el || pageName);

    const description = lang === 'el'
        ? (pageData.description_el || pageData.description_en)
        : (pageData.description_en || pageData.description_el);

    // If type is 'component', load custom component dynamically
    if (pageData.type === 'component') {
        console.log(`./pages/${pageName.charAt(0).toUpperCase() + pageName.slice(1)}.jsx`);
        const CustomComponent = React.lazy(() =>
            import(`./pages/${pageName.charAt(0).toUpperCase() + pageName.slice(1)}.jsx`)
                .catch(() => ({ default: () => <div>Component not found</div> }))
        );

        return (
            <React.Suspense fallback={<div>Loading component...</div>}>
                <CustomComponent pageData={pageData} lang={lang} pageName={pageName} />
            </React.Suspense>
        );
    }

    // For type='page', render content directly
    return (
        <>
            <Helmet>
                <title>{title} | GEN20</title>
                <meta name="description" content={description?.substring(0, 160)} />
            </Helmet>

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">{title}</h1>
                {description && (
                    <div className="page-content" dangerouslySetInnerHTML={{ __html: description }} />
                )}
            </div>
        </>
    );
};

export default DynamicPage;