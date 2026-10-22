// /pages/Contact.jsx
import { useState } from "react";
import {
    FaEnvelope,
    FaPhone,
    FaExclamationCircle,
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
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/v1/local/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
                setFormData({ name: "", email: "", subject: "", message: "" });
                setTimeout(() => setIsSubmitted(false), 5000);
            } else {
                setError(data.error || "Failed to send message. Please try again.");
            }
        } catch (e) {
            console.error('Error sending message:', e);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: <FaEnvelope />,
            title: "Email",
            content: "niki.mourtzi@research.edu",
            link: "mailto:niki.mourtzi@research.edu",
            color: "var(--primary)"
        },
        {
            icon: <FaPhone />,
            title: "Phone",
            content: "+30 210 123 4567",
            link: "tel:+302101234567",
            color: "var(--secondary)"
        },
        {
            icon: <FaMapMarkerAlt />,
            title: "Location",
            content: "Athens, Greece",
            link: null,
            color: "var(--accent)"
        }
    ];

    const socialLinks = [
        {
            name: "LinkedIn",
            icon: <FaLinkedin />,
            url: "https://linkedin.com/in/niki-mourtzi",
            color: "#0077b5"
        },
        {
            name: "GitHub",
            icon: <FaGithub />,
            url: "https://github.com/nikimourtzi",
            color: "#333"
        },
        {
            name: "Twitter",
            icon: <FaTwitter />,
            url: "https://twitter.com/nikimourtzi",
            color: "#1DA1F2"
        },
        {
            name: "ResearchGate",
            icon: <FaBook />,
            url: "https://researchgate.net/profile/Niki-Mourtzi",
            color: "#00D0B0"
        },
        {
            name: "Google Scholar",
            icon: <FaUserGraduate />,
            url: "https://scholar.google.com/citations?user=yourID",
            color: "#4285F4"
        }
    ];

    const researchInterests = [
        { icon: <FaDna />, text: "Genomics" },
        { icon: <FaMicroscope />, text: "Bioinformatics" },
        { icon: <FaChartLine />, text: "Statistical Genetics" },
        { icon: <FaBook />, text: "Neurogenetics" }
    ];

    return (
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
                                    src="/media/blog/asset_1.png"
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
                                        <FaCheckCircle/>
                                        <div>
                                            <strong>Message sent successfully!</strong>
                                            <p>Thank you for reaching out. I'll respond shortly.</p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="error-message">
                                        <FaExclamationCircle/>
                                        <div>
                                            <strong>Error!</strong>
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-group">
                                        <label htmlFor="name">
                                            Full Name <span className="required">*</span>
                                        </label>
                                        <input
                                            disabled={isLoading}
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
                                            disabled={isLoading}
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
                                            disabled={isLoading}
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
                                                <FaPaperPlane/>
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
                );
                }