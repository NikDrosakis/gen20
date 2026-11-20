// components/Breadcrumb.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Breadcrumb.css';

// ✅ Static page titles
const STATIC_PAGE_TITLES = {
    home: { en: "Home", el: "Αρχική" },
    about: { en: "About", el: "Σχετικά" },
    services: { en: "Services", el: "Υπηρεσίες" },
    research: { en: "Research", el: "Έρευνα" },
    publications: { en: "Publications", el: "Δημοσιεύσεις" },
    blog: { en: "Blog", el: "Ιστολόγιο" },
    gallery: { en: "Gallery", el: "Γκαλερί" },
    contact: { en: "Contact", el: "Επικοινωνία" },
    login: { en: "Login", el: "Σύνδεση" },
    signup: { en: "Signup", el: "Εγγραφή" },
    profile: { en: "Profile", el: "Προφίλ" },
    book: { en: "Tickets", el: "Εισιτήρια" },
    publisher: { en: "Book", el: "Βιβλίο" },
    sumud: { en: "Sumud", el: "Sumud" },
    foco: { en: "Foco", el: "Foco" },
    cv: { en: "CV", el: "Βιογραφικό" },
};

export const Breadcrumb = ({ path }) => {
    const [pageTitle, setPageTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const lang = Cookies.get('lang') || 'el';
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    // Get the current page name from path
    const pageName = path || window.location.pathname.split('/')[1] || 'home';

    useEffect(() => {
        const fetchPageTitle = async () => {
            // First check static map
            if (STATIC_PAGE_TITLES[pageName]) {
                setPageTitle(STATIC_PAGE_TITLES[pageName][lang] || STATIC_PAGE_TITLES[pageName].en);
                setLoading(false);
                return;
            }

            // Try to fetch from database (for dynamic pages)
            try {
                const response = await fetch(`/api/v1/maria/f?folder=select id,title, title_el from ${publicdb}.content where name='${pageName}' and type='page'`);
                const data = await response.json();

                if (data.success && data.data && data.data.length > 0) {
                    const page = data.data[0];
                    const title = lang === 'el' ? (page.title_el || page.title_en) : (page.title_en || page.title_el);
                    setPageTitle(title || pageName);
                } else {
                    // Fallback: capitalize page name
                    setPageTitle(pageName.charAt(0).toUpperCase() + pageName.slice(1));
                }
            } catch (error) {
                console.error('Error fetching page title:', error);
                setPageTitle(pageName.charAt(0).toUpperCase() + pageName.slice(1));
            } finally {
                setLoading(false);
            }
        };

        fetchPageTitle();
    }, [pageName, lang, publicdb]);

    if (loading) {
        return (
            <div className="breadcrumb-option spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 text-center">
                            <div className="breadcrumb__text">
                                <div className="breadcrumb__links">
                                    <span>Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="breadcrumb-option spad">
            </div>
            <div className="container">
                <div className="row">
                    <Link className="breadcrumb-link" to="/book">
                        {lang === 'el' ? 'Εισιτήρια' : 'Tickets'}
                    </Link>
                    <Link className="breadcrumb-link" to="/publisher">
                        {lang === 'el' ? 'Βιβλίο' : 'Book'}
                    </Link>

                    <div className="col-lg-12 text-center">
                        <div className="breadcrumb__text">
                            <div className="breadcrumb__links">
                                <span>{pageTitle}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default Breadcrumb;
