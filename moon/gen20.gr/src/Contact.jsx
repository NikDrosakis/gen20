// /pages/Contact.jsx
import { useState } from "react";
import {
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaTwitter,
    FaGithub,
    FaLinkedin,
    FaUserGraduate,
    FaChartLine,
    FaDna,
    FaMicroscope,
    FaBook,
    FaCheckCircle,
    FaPaperPlane
} from "react-icons/fa";
import { MdSchool } from "react-icons/md";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
            setFormData({ name: "", email: "", subject: "", message: "" });
            setTimeout(() => setIsSubmitted(false), 5000);
        }, 1000);
    };

    const contactInfo = [
        { icon: <FaEnvelope />, title: "Email", content: "niki.mourtzi@research.edu", link: "mailto:niki.mourtzi@research.edu", color: "var(--primary)" },
        { icon: <FaPhone />, title: "Phone", content: "+30 210 123 4567", link: "tel:+302101234567", color: "var(--secondary)" },
        { icon: <FaMapMarkerAlt />, title: "Location", content: "Athens, Greece", link: null, color: "var(--accent)" }
    ];

    const socialLinks = [
        { name: "LinkedIn", icon: <FaLinkedin />, url: "https://linkedin.com/in/niki-mourtzi", color: "#0077b5" },
        { name: "GitHub", icon: <FaGithub />, url: "https://github.com/nikimourtzi", color: "#333" },
        { name: "Twitter", icon: <FaTwitter />, url: "https://twitter.com/nikimourtzi", color: "#1DA1F2" },
        { name: "ResearchGate", icon: <FaBook />, url: "https://researchgate.net/profile/Niki-Mourtzi", color: "#00D0B0" },
        { name: "Google Scholar", icon: <FaUserGraduate />, url: "https://scholar.google.com/citations?user=yourID", color: "#4285F4" }
    ];

    const researchInterests = [
        { icon: <FaDna />, text: "Genomics" },
        { icon: <FaMicroscope />, text: "Bioinformatics" },
        { icon: <FaChartLine />, text: "Statistical Genetics" },
        { icon: <FaBook />, text: "Neurogenetics" }
    ];

    return (
        <>
            <style>{`
                /* ==================== RESET ==================== */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                h1, h2, p {
                    color: inherit;
                }

                /* ==================== DARK/LIGHT MODE VARIABLES ==================== */

                /* Light Mode (Default) */
                :root {
                    --primary: #2c5f8a;
                    --secondary: #4a90e2;
                    --accent: #e67e22;
                    --accent-bg: rgba(230, 126, 34, 0.1);
                    --accent-border: #e67e22;
                    --text: #2c3e50;
                    --text-light: #7f8c8d;
                    --text-h: #2c3e50;
                    --bg: #ffffff;
                    --bg-light: #f8f9fa;
                    --border: #e9ecef;
                    --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15);
                    --social-bg: #f1f3f5;
                    --transition: all 0.3s ease;
                    --navbar-bg: rgba(255, 255, 255, 0.95);
                    --card-bg: #ffffff;
                    --code-bg: #f8f9fa;
                }

                /* Dark Mode */
                body.dark-mode {
                    --primary: #6ba5d1;
                    --secondary: #7fb4e8;
                    --accent: #f39c12;
                    --accent-bg: rgba(243, 156, 18, 0.15);
                    --accent-border: #f39c12;
                    --text: #ecf0f1;
                    --text-light: #bdc3c7;
                    --text-h: #ffffff;
                    --bg: #1a1a2e;
                    --bg-light: #16213e;
                    --border: #2c3e50;
                    --shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.4);
                    --social-bg: #0f3460;
                    --navbar-bg: rgba(26, 26, 46, 0.95);
                    --card-bg: #16213e;
                    --code-bg: #0f3460;
                }

                /* Smooth transition for theme switching */
                body,
                body * {
                    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                }

                body {
                    background: var(--bg);
                    color: var(--text);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                }

                /* ==================== PAGE CONTAINERS ==================== */
                .contact-page-container {
                    width: 100%;
                    min-height: calc(100vh - 73px);
                    background: var(--bg);
                    display: flex;
                    justify-content: center;
                }

                .centered-container {
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    padding: 2rem 24px;
                }

                /* ==================== CONTACT PAGE ==================== */
                .contact-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem 24px;
                }

                .contact-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    padding: 2rem;
                    background: linear-gradient(135deg, var(--bg-light), var(--bg));
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .contact-header h1 {
                    color: var(--primary);
                }

                .contact-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    margin-bottom: 3rem;
                }

                .contact-info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .contact-image-container {
                    width: 100%;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: var(--shadow);
                }

                .contact-image {
                    width: 100%;
                    height: auto;
                    display: block;
                    transition: transform 0.3s ease;
                }

                .contact-image:hover {
                    transform: scale(1.02);
                }

                /* Contact Details */
                .contact-details,
                .social-links-section,
                .availability-section {
                    background: var(--bg-light);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .contact-details h2,
                .social-links-section h2 {
                    margin-bottom: 1.5rem;
                    color: var(--primary);
                }

                .info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .info-icon {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg);
                    border-radius: 50%;
                    font-size: 1.2rem;
                }

                .info-content h3 {
                    font-size: 0.9rem;
                    color: var(--text-light);
                    margin-bottom: 0.25rem;
                }

                .info-content a {
                    color: var(--text);
                    text-decoration: none;
                    font-weight: 500;
                }

                .info-content a:hover {
                    color: var(--primary);
                    text-decoration: underline;
                }

                /* Social Links */
                .social-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 1rem;
                }

                .social-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: var(--bg);
                    border: 1px solid transparent;
                    border-radius: 8px;
                    text-decoration: none;
                    color: var(--text);
                    transition: var(--transition);
                }

                .social-card:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow);
                    border-color: var(--border);
                }

                .social-icon {
                    font-size: 1.3rem;
                }

                /* Research Interests */
                .research-interests {
                    background: var(--bg-light);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .interests-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .interest-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--bg);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    font-size: 0.9rem;
                    transition: var(--transition);
                }

                .interest-tag:hover {
                    background: var(--primary);
                    color: white;
                    transform: translateY(-2px);
                }

                /* Availability Section */
                .availability-section ul {
                    list-style: none;
                    padding: 0;
                }

                .availability-section li {
                    padding: 0.5rem 0;
                    color: var(--text-light);
                }

                .availability-section li:before {
                    content: "✓";
                    color: var(--primary);
                    font-weight: bold;
                    margin-right: 0.5rem;
                }

                /* Contact Form */
                .contact-form-section {
                    background: var(--bg-light);
                    padding: 2rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }

                .form-card h2 {
                    margin-bottom: 0.5rem;
                    color: var(--primary);
                }

                .form-subtitle {
                    color: var(--text-light);
                    margin-bottom: 1.5rem;
                }

                .contact-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-weight: 500;
                    color: var(--text);
                }

                .required {
                    color: #e74c3c;
                }

                .form-group input,
                .form-group textarea {
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 1rem;
                    background: var(--bg);
                    color: var(--text);
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(44, 95, 138, 0.1);
                }

                .submit-button {
                    background: var(--primary);
                    color: white;
                    padding: 0.875rem;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: var(--transition);
                }

                .submit-button:hover:not(:disabled) {
                    background: var(--secondary);
                    transform: translateY(-2px);
                }

                .submit-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .success-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .spinner {
                    width: 1rem;
                    height: 1rem;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Institutions Section */
                .map-section {
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid var(--border);
                }

                .map-section h2 {
                    text-align: center;
                    margin-bottom: 1.5rem;
                    color: var(--primary);
                }

                .institutions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .institution {
                    padding: 1.5rem;
                    background: var(--bg-light);
                    border-radius: 12px;
                    text-align: center;
                    transition: var(--transition);
                    border: 1px solid var(--border);
                }

                .institution:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-hover);
                    border-color: var(--primary);
                }

                .institution h3 {
                    margin-bottom: 0.5rem;
                    color: var(--primary);
                }

                /* ==================== RESPONSIVE DESIGN ==================== */
                @media (max-width: 768px) {
                    .contact-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }

                    .centered-container {
                        padding: 1rem 16px;
                    }

                    .contact-container {
                        padding: 1rem 16px;
                    }
                }

                /* ==================== ANIMATIONS ==================== */
                @keyframes slideIn {
                    from {
                        transform: translateY(-10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .success-message {
                    animation: slideIn 0.3s ease;
                }
            `}</style>

            <div className="contact-page-container">
                <div className="centered-container">
                    <div className="contact-container">
                        <div className="contact-header">
                            <div className="contact-header-content">
                                <h1>Get in Touch</h1>
                                <p className="subtitle">
                                    Interested in collaboration, research opportunities, or have questions about my work?
                                </p>
                                <p>I'd love to hear from you!</p>
                            </div>
                        </div>

                        <div className="contact-grid">
                            {/* Left Column - Contact Info and Image */}
                            <div className="contact-info-section">
                                <div className="contact-image-container">
                                    <img
                                        src="/assets/asset_1.png"
                                        alt="Bioinformatics Research Illustration"
                                        className="contact-image"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/400x300?text=Bioinformatics+Research";
                                            e.target.onerror = null;
                                        }}
                                    />
                                </div>

                                <div className="research-interests">
                                    <h3>🔬 Research Areas</h3>
                                    <div className="interests-grid">
                                        {researchInterests.map((interest, idx) => (
                                            <div key={idx} className="interest-tag">
                                                {interest.icon}
                                                <span>{interest.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="contact-details">
                                    <h2>Contact Information</h2>
                                    <div className="info-list">
                                        {contactInfo.map((info, index) => (
                                            <div key={index} className="info-item">
                                                <div className="info-icon" style={{color: info.color}}>
                                                    {info.icon}
                                                </div>
                                                <div className="info-content">
                                                    <h3>{info.title}</h3>
                                                    {info.link ? (
                                                        <a href={info.link}>{info.content}</a>
                                                    ) : (
                                                        <p>{info.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="social-links-section">
                                    <h2>Connect Online</h2>
                                    <div className="social-grid">
                                        {socialLinks.map((social, index) => (
                                            <a
                                                key={index}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-card"
                                                style={{borderColor: social.color}}
                                            >
                                                <div className="social-icon" style={{color: social.color}}>
                                                    {social.icon}
                                                </div>
                                                <span>{social.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div className="availability-section">
                                    <h3>📅 Research Availability</h3>
                                    <p>I'm open to:</p>
                                    <ul>
                                        <li>🤝 Research collaborations</li>
                                        <li>🎓 Mentoring opportunities</li>
                                        <li>📊 Bioinformatics consulting</li>
                                        <li>🗣 Conference speaking engagements</li>
                                        <li>📝 Peer review for journals</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right Column - Contact Form */}
                            <div className="contact-form-section">
                                <div className="form-card">
                                    <h2>Send a Message</h2>
                                    <p className="form-subtitle">
                                        I'll get back to you within 2-3 business days
                                    </p>

                                    {isSubmitted && (
                                        <div className="success-message">
                                            <FaCheckCircle />
                                            <div>
                                                <strong>Message sent successfully!</strong>
                                                <p>Thank you for reaching out. I'll respond shortly.</p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="contact-form">
                                        <div className="form-group">
                                            <label htmlFor="name">
                                                Full Name <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Dr. Jane Smith"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="email">
                                                Email Address <span className="required">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="jane.smith@example.com"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="subject">
                                                Subject <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                placeholder="Research collaboration inquiry"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="message">
                                                Message <span className="required">*</span>
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows="6"
                                                placeholder="Tell me about your research interests, collaboration ideas, or questions..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="submit-button"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner"></span>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <div className="form-footer">
                                        <p>
                                            <small>
                                                By submitting this form, you agree to my
                                                <a href="/privacy"> privacy policy</a>.
                                            </small>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Section */}
                        <div className="map-section">
                            <h2>📍 Research Locations</h2>
                            <div className="institutions">
                                <div className="institution">
                                    <h3>🏥 Northwestern University</h3>
                                    <p>Chicago, IL, USA</p>
                                    <small>Postdoctoral Research Fellow</small>
                                </div>
                                <div className="institution">
                                    <h3>🏛 National and Kapodistrian University of Athens</h3>
                                    <p>Athens, Greece</p>
                                    <small>PhD in Bioinformatics & Genetics</small>
                                </div>
                                <div className="institution">
                                    <h3>🧬 HELIAD Study Center</h3>
                                    <p>Crete, Greece</p>
                                    <small>Research Collaborator</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}