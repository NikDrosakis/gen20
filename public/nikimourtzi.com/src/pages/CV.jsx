// /pages/CV.jsx
import { cv } from "../data/cv";
import "./CV.css";

export default function CV() {
    return (
        <div className="cv-page-container">
            <div className="centered-container">
                <div className="cv-header">
                    <h1>{cv.personal.name}</h1>
                    <p className="subtitle">Geneticist & Bioinformatics Researcher</p>
                    <p>📧 {cv.personal.email} | 📱 {cv.personal.phone} | 📍 {cv.personal.location}</p>
                </div>

                <section className="cv-section">
                    <div className="contact-image-container"><img alt="Bioinformatics Research Illustration"
                                                                  className="contact-image" src="/media/blog/asset_2.png"/>
                    </div>
                    <h2>🎓 Education</h2>
                    {cv.education.map((edu, index) => (
                        <div key={index} className="cv-item">
                            <h3>{edu.title}</h3>
                            <div className="cv-item-meta">{edu.period}</div>
                            <p className="cv-item-description">{edu.description}</p>
                        </div>
                    ))}
                </section>

                <section className="cv-section">
                    <h2>💼 Research Experience</h2>
                    {cv.experience.map((exp, index) => (
                        <div key={index} className="cv-item">
                            <h3>{exp.title}</h3>
                            <div className="cv-item-meta">{exp.org} | {exp.period}</div>
                            <p className="cv-item-description">{exp.description}</p>
                        </div>
                    ))}
                </section>

                <section className="cv-section">
                    <h2>🛠 Technical Skills</h2>
                    <ul className="skills-list">
                        {cv.skills.map((skill, idx) => (
                            <li key={idx}>{skill}</li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}