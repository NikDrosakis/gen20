// /hooks/useAnalytics.js
import { trackEvent } from '../components/GoogleAnalytics';

export const useAnalytics = () => {
    // Track page view (για manual tracking αν χρειαστεί)
    const trackPageView = (pageName) => {
        trackEvent('page_view', 'Page View', `${pageName} page viewed`, null, window.location.pathname);
    };

    // Track button click
    const trackButtonClick = (buttonName, pageName) => {
        trackEvent('click', 'Button Click', `${buttonName} clicked on ${pageName}`, null, window.location.pathname);
    };

    // Track form submission
    const trackFormSubmit = (formName, pageName, success = true) => {
        trackEvent('form_submit', 'Form Submission', `${formName} submitted on ${pageName}`, success ? 1 : 0, window.location.pathname);
    };

    // Track link click
    const trackLinkClick = (linkText, pageName) => {
        trackEvent('link_click', 'Link Click', `${linkText} clicked on ${pageName}`, null, window.location.pathname);
    };

    // Track download
    const trackDownload = (fileName, pageName) => {
        trackEvent('download', 'Download', `${fileName} downloaded from ${pageName}`, null, window.location.pathname);
    };

    // Track search
    const trackSearch = (searchTerm, pageName) => {
        trackEvent('search', 'Search', `${searchTerm} searched on ${pageName}`, null, window.location.pathname);
    };

    return {
        trackPageView,
        trackButtonClick,
        trackFormSubmit,
        trackLinkClick,
        trackDownload,
        trackSearch
    };
};