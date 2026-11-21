import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = ({ data, lang = 'el', path }) => {
    const navigate = useNavigate();
    const currentPath = path || window.location.pathname;
    const t = (el, en) => (lang === 'el' ? el : en);

    const suggestions = [
        { to: '/', label: t('Αρχική', 'Home') },
        { to: '/about', label: t('Σχετικά', 'About') },
        { to: '/contact', label: t('Επικοινωνία', 'Contact') },
    ];

    return (
        <div className="not-found">
            <div className="not-found__card">
                <div className="not-found__code">404</div>

                <div className="not-found__title">
                    {t('Η σελίδα δεν βρέθηκε', 'Page Not Found')}
                </div>

                <div className="not-found__desc">
                    {t('Η σελίδα που αναζητάτε δεν βρέθηκε.', 'The page you are looking for was not found.')}
                    <br />
                    {t('Η διαδρομή:', 'The path:')} <strong>{currentPath}</strong>{' '}
                    {t('δεν υπάρχει.', 'does not exist.')}
                </div>

                <div className="not-found__actions">
                    <button type="button" className="btn btn--primary" onClick={() => navigate(-1)}>
                        {t('◀ Πίσω', '◀ Go Back')}
                    </button>
                    <Link to="/" className="btn btn--success">
                        {t('🏠 Αρχική Σελίδα', '🏠 Home Page')}
                    </Link>
                </div>

                {data?.length > 0 && (
                    <div className="not-found__suggestions">
                        <h4>{t('💡 Προτεινόμενες σελίδες:', '💡 Suggested pages:')}</h4>
                        <ul>
                            {suggestions.map((s) => (
                                <li key={s.to}>
                                    <Link to={s.to}>{s.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotFound;