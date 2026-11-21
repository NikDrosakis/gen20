// /Contact.jsx
import { useState } from "react";
import useMail from '../../useMail';

import {
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaTwitter,
    FaChartLine,
    FaDna,
    FaMicroscope,
    FaBook,
    FaCheckCircle,
    FaPaperPlane,
    FaExclamationCircle
} from "react-icons/fa";

import "./Contact.css";
import { useG } from "../../GContext";

export default function Contact() {
    const { send, loading, error, success, reset } = useMail();
    const { G } = useG();
    const settings = G?.set || {};

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    // Contact information
    const contactInfo = [
        {
            icon: <FaEnvelope />,
            title: "Email",
            content: settings.email || "",
            link: settings.email
                ? `mailto:${settings.email}`
                : null,
            color: "var(--primary)"
        },
        {
            icon: <FaPhone />,
            title: "Τηλ.",
            content: settings.tel || "",
            link: settings.tel
                ? `tel:${settings.tel}`
                : null,
            color: "var(--secondary)"
        },
        {
            icon: <FaMapMarkerAlt />,
            title: "Διεύθυνση",
            content: settings.address || "",
            link: null,
            color: "var(--accent)"
        }
    ];

    // Social links
    const socialLinks = [
        {
            name: "Twitter",
            icon: <FaTwitter />,
            url: "https://twitter.com/directorsuniongr",
            color: "#1DA1F2"
        }
    ];

    // Research interests
    const researchInterests = [
        { icon: <FaDna />, text: "Genomics" },
        { icon: <FaMicroscope />, text: "Bioinformatics" },
        { icon: <FaChartLine />, text: "Statistical Genetics" },
        { icon: <FaBook />, text: "Neurogenetics" }
    ];

    // Form changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        try {
            await send({
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                comment: formData.message,
                fromName: settings.title || 'GEN20 Platform',
            });
        } catch (err) {
            console.error(err);
        }

    };

    return (
        <div className="contact-page-container">
            <div className="centered-container">
                <div className="contact-container">

                    <div className="contact-grid">

                        {/* Left Column - Contact Info and Image */}

                        <div className="contact-info-section">

                            <div className="contact-image-container">
                                {settings.bg && (
                                    <img
                                        src={`/media/${settings.bg}`}
                                        alt={settings.title || "Contact"}
                                        className="contact-image"
                                    />
                                )}
                            </div>

                            <div className="contact-details">

                                <h2>Επικοινωνία</h2>

                                <div className="info-list">

                                    {contactInfo
                                        .filter(info => info.content)
                                        .map((info, index) => (
                                            <div
                                                key={index}
                                                className="info-item"
                                            >
                                                <div
                                                    className="info-icon"
                                                    style={{
                                                        color: info.color
                                                    }}
                                                >
                                                    {info.icon}
                                                </div>

                                                <div className="info-content">

                                                    <h3>{info.title}</h3>

                                                    {info.link ? (
                                                        <a href={info.link}>
                                                            {info.content}
                                                        </a>
                                                    ) : (
                                                        <p>{info.content}</p>
                                                    )}

                                                </div>
                                            </div>
                                        ))}

                                </div>
                            </div>

                            {/* Social Links */}

                            {socialLinks.length > 0 && (
                                <div className="social-links">
                                    {socialLinks.map((social, index) => (
                                        <a
                                            key={index}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={social.name}
                                            style={{
                                                color: social.color
                                            }}
                                        >
                                            {social.icon}
                                        </a>
                                    ))}
                                </div>
                            )}

                        </div>

                        {/* Right Column - Contact Form */}

                        <div className="contact-form-section">

                            <div className="form-card">

                                <h2>Αποστολή Μηνύματος</h2>

                                <p className="form-subtitle">
                                    Θα απαντηθεί το γρηγορότερο
                                </p>

                                {/* Success */}

                                {success && (
                                    <div className="success-message">
                                        <FaCheckCircle />
                                        <div>
                                            <strong>
                                                Το μήνυμα στάλθηκε επιτυχώς!
                                            </strong>
                                            <p>
                                                Ευχαριστούμε για την επικοινωνία.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}

                                {error && (
                                    <div className="error-message">
                                        <FaExclamationCircle />
                                        <div>
                                            {error}
                                        </div>
                                    </div>
                                )}

                                {/* Form */}

                                <form
                                    onSubmit={handleSubmit}
                                    className="contact-form"
                                >

                                    <div className="form-group">

                                        <label htmlFor="name">
                                            Όνομα
                                            <span className="required">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            maxLength={120}
                                            autoComplete="name"
                                            placeholder="Το όνομά σας"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label htmlFor="email">
                                            Email
                                            <span className="required">*</span>
                                        </label>

                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            maxLength={254}
                                            autoComplete="email"
                                            placeholder="your@email.com"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label htmlFor="subject">
                                            Θέμα
                                            <span className="required">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            maxLength={200}
                                            placeholder="Θέμα επικοινωνίας"
                                        />

                                    </div>

                                    <div className="form-group">

                                        <label htmlFor="message">
                                            Μήνυμα
                                            <span className="required">*</span>
                                        </label>

                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            maxLength={10000}
                                            rows={6}
                                            placeholder="Γράψτε το μήνυμά σας..."
                                        />

                                    </div>

                                    <button
                                        type="submit"
                                        className="submit-button"
                                        disabled={loading}
                                    >

                                        {loading ? (
                                            <>
                                                <span className="spinner" />
                                                Αποστολή...
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                Αποστολή
                                            </>
                                        )}

                                    </button>

                                </form>

                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
