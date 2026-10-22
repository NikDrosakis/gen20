export default function Footer() {
<footer id="company" className="footer">
    <div className="container">
        <div className="footer-grid">
            <div className="footer-brand">
                <div className="logo">🧬  © {currentYear} Niki Mourtzi official website</div>
                <p>Precision genomics for equitable medicine.</p>
                <a href="/rss.xml" className="rss-link" target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <circle cx="6.18" cy="17.82" r="2.18"/>
                        <path
                            d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
                    </svg>
                    RSS Feed
                </a>
                <div className="social-links">
                    <span>🔗 LinkedIn</span>
                    <span>🐦 Twitter</span>
                    <span>📧 Email</span>
                </div>
            </div>
            <div className="footer-links">
                <h4>Platform</h4>
                <ul>
                    <li>PGx engine</li>
                    <li>PRS Studio</li>
                    <li>Variant interpreter</li>
                    <li>Ancestry pipeline</li>
                </ul>
            </div>
            <div className="footer-links">
                <h4>Resources</h4>
                <ul>
                    <li>API docs</li>
                    <li>Whitepapers</li>
                    <li>Case studies</li>
                    <li>Regulatory</li>
                </ul>
            </div>
            <div className="footer-links">
                <h4>Company</h4>
                <ul>
                    <li>About</li>
                    <li>Careers</li>
                    <li>Press</li>
                    <li>Contact</li>
                </ul>
            </div>
        </div>
        <div className="footer-bottom">
            <p>© 2026 Gen20 — Corporate home for pharmacogenomics, polygenic risk scores, variant interpretation, and ancestry-informed pipelines.</p>
        </div>
    </div>
</footer>

    }