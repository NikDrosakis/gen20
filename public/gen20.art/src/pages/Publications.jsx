// /pages/Publications.jsx
import { publications } from "../data/publications";
import "./Publications.css";
export default function Publications() {
    return (
        <div className="publications-page-container">
            <div className="centered-container">
                <div className="research-header">
                    <h1>Publications</h1>
                    <p className="subtitle">
                        Selected peer-reviewed articles and research outputs
                    </p>
                    <div className="contact-image-container"><img alt="Bioinformatics Research Illustration"
                                                                  className="contact-image" src="/assets/asset_3.png"/>
                    </div>
                </div>

                {publications.map((pub) => (
                    <div key={pub.id} className="publication-item">
                        <div className="publication-title">{pub.title}</div>
                        <div className="publication-authors">{pub.authors}</div>
                        <div className="publication-journal">{pub.journal}</div>
                        <div className="publication-year">Year: {pub.year} | DOI: {pub.doi}</div>
                        <p className="cv-item-description mt-2">{pub.abstract}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}