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
import "./Contact.css";

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

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
            setFormData({ name: "", email: "", subject: "", message: "" });

            // Reset success message after 5 seconds
            setTimeout(() => setIsSubmitted(false), 5000);
        }, 1000);
    };

    const contactInfo = [
        {
            icon: <FaEnvelope />,
            title: "Email",
            content: "directorscreatorsunion@gmail.com",
            link: "mailto:directorscreatorsunion@gmail.com",
            color: "var(--primary)"
        },
        {
            icon: <FaPhone />,
            title: "Τηλ.",
            content: "+30 210 123 4567",
            link: "tel:+302101234567",
            color: "var(--secondary)"
        },
        {
            icon: <FaMapMarkerAlt />,
            title: "Διεύθυνση",
            content: "Athens, Greece",
            link: null,
            color: "var(--accent)"
        }
    ];

    const socialLinks = [
        {
            name: "Twitter",
            icon: <FaTwitter />,
            url: "https://twitter.com/directorsuniongr",
            color: "#1DA1F2"
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

                            <div className="contact-details">
                                <h2>Επικοινωνία</h2>
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
                        </div>

                        {/* Right Column - Contact Form */}
                        <div className="contact-form-section">
                            <div className="form-card">
                                <h2>Αποστολή Μηνύματος</h2>
                                <p className="form-subtitle">
                                    Θα απαντηθεί το γρηγορότερο
                                </p>

                                {isSubmitted && (
                                    <div className="success-message">
                                        <FaCheckCircle/>
                                        <div>
                                            <strong>Το μήνυμα στάλθηκε επιτυχώς!</strong>
                                            <p>Ευχαριστώ για το μήνυμα.</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-group">
                                        <label htmlFor="name">
                                            Όνομα <span className="required">*</span>
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
                                            Email <span className="required">*</span>
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
                                            θέμα <span className="required">*</span>
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
                                            placeholder="Κείμενο μηνύματος..."
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
                                                Στέλνει...
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane/>
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