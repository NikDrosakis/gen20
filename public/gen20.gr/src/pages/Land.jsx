import { useEffect, useRef } from 'react';
function Land() {
    const heroRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.fade-up, .fade-left, .fade-right, .fade-scale').forEach((el) => {
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                background: 'red',
                color: 'white',
                zIndex: 9999,
                padding: '10px'
            }}>
                🟢 LAND COMPONENT RENDERED
            </div>
            <header className="hero">
                <div className="hero-overlay"></div>
                <div className="container hero-container">
                    <div className="hero-content fade-up" ref={heroRef}>
                        <span className="hero-badge">Precision Medicine Reimagined</span>
                        <h1 className="hero-title">
                            From Genotype to<br />
                            Therapy
                        </h1>
                        <p className="hero-description">
                            Enterprise-grade pharmacogenomics, polygenic risk scoring, ancestry-informed variant interpretation,
                            and regulatory-ready genomic pipelines — unified on one platform.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-primary">Request Demo</button>
                            <button className="btn-secondary">Watch Overview →</button>
                        </div>
                    </div>
                    <div className="hero-image fade-right">
                        <div className="hero-illustration">
                            <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
                                <rect x="100" y="150" width="300" height="200" rx="20" fill="url(#grad1)" opacity="0.9"/>
                                <circle cx="250" cy="200" r="40" fill="white" opacity="0.9"/>
                                <path d="M250 160 L250 240 M210 200 L290 200" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round"/>
                                <circle cx="150" cy="120" r="15" fill="#8b5cf6" opacity="0.8"/>
                                <circle cx="350" cy="120" r="15" fill="#ec4899" opacity="0.8"/>
                                <circle cx="200" cy="100" r="10" fill="#06b6d4" opacity="0.8"/>
                                <circle cx="300" cy="100" r="10" fill="#f59e0b" opacity="0.8"/>
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{stopColor:'#3b82f6',stopOpacity:0.2}} />
                                        <stop offset="100%" style={{stopColor:'#8b5cf6',stopOpacity:0.2}} />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </header>

            <section className="partners">
                <div className="container">
                    <p className="partners-title">Trusted by leading institutions</p>
                    <div className="partner-logos">
                        <span className="partner-logo">🏥 Mayo Clinic</span>
                        <span className="partner-logo">🔬 Broad Institute</span>
                        <span className="partner-logo">🧬 Illumina</span>
                        <span className="partner-logo">💊 Pfizer</span>
                        <span className="partner-logo">🏛️ NIH</span>
                    </div>
                </div>
            </section>

            <section id="solutions" className="solutions">
                <div className="container">
                    <div className="section-header fade-up">
                        <span className="section-tag">Capabilities</span>
                        <h2 className="section-title">Integrated genomic intelligence</h2>
                        <p className="section-subtitle">
                            One platform that bridges clinical pharmacogenetics, complex risk prediction, and diverse ancestry representation.
                        </p>
                    </div>
                    <div className="solutions-grid">
                        <div className="solution-card fade-up">
                            <div className="card-image">
                                <img src="https://placehold.co/400x200/3b82f6/white?text=PGx+Analysis" alt="Pharmacogenomics" style={{width: '100%', borderRadius: '1rem'}} />
                            </div>
                            <div className="card-icon">💊</div>
                            <h3>Pharmacogenomics (PGx)</h3>
                            <p>Interpretation of <strong>CYP450, DPYD, TPMT, HLA</strong> and 150+ genes with CPIC/DPWG level A/B evidence.</p>
                            <ul className="feature-list">
                                <li>Phenotype assignment (IM, NM, PM, UM)</li>
                                <li>Drug-gene interaction alerts</li>
                                <li>Dosing recommendations</li>
                            </ul>
                        </div>
                        <div className="solution-card fade-up delay-1">
                            <div className="card-image">
                                <img src="https://placehold.co/400x200/8b5cf6/white?text=PRS+Modeling" alt="Polygenic Risk Scores" style={{width: '100%', borderRadius: '1rem'}} />
                            </div>
                            <div className="card-icon">📊</div>
                            <h3>Polygenic Risk Scores</h3>
                            <p>Custom PRS models for CAD, T2D, breast cancer, and psychiatric outcomes — with ancestry-specific calibration.</p>
                            <ul className="feature-list">
                                <li>LDpred2, PRS-CS, Clumping+Thresholding</li>
                                <li>Transferability metrics</li>
                                <li>GWAS summary stats browser</li>
                            </ul>
                        </div>
                        <div className="solution-card fade-up delay-2">
                            <div className="card-image">
                                <img src="https://placehold.co/400x200/06b6d4/white?text=Variant+Interpretation" alt="Variant Interpretation" style={{width: '100%', borderRadius: '1rem'}} />
                            </div>
                            <div className="card-icon">🧬</div>
                            <h3>Variant Interpretation</h3>
                            <p>ACMG/AMP-guided classification with ClinGen, gnomAD, and in-silico predictors (SIFT, PolyPhen, REVEL).</p>
                            <ul className="feature-list">
                                <li>Star-allele nomenclature</li>
                                <li>Structural variant handling</li>
                                <li>Rare variant prioritization</li>
                            </ul>
                        </div>
                        <div className="solution-card fade-up delay-3">
                            <div className="card-image">
                                <img src="https://placehold.co/400x200/10b981/white?text=Ancestry+Pipeline" alt="Ancestry-Informed Pipelines" style={{width: '100%', borderRadius: '1rem'}} />
                            </div>
                            <div className="card-icon">🌍</div>
                            <h3>Ancestry-Informed Pipelines</h3>
                            <p>Reduce Eurocentric bias with reference panels from <strong>1kGP, HGDP, and CAAPA</strong>.</p>
                            <ul className="feature-list">
                                <li>Global & local ancestry inference</li>
                                <li>Race-aware imputation</li>
                                <li>FST & PCA visualization</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section id="platform" className="platform">
                <div className="container">
                    <div className="platform-grid">
                        <div className="platform-content fade-left">
                            <span className="section-tag">Enterprise pipeline</span>
                            <h2 className="section-title">One workflow, from FASTQ to report</h2>
                            <p>Our HIPAA/GxP-ready platform orchestrates somatic and germline analysis with traceability and version control.</p>
                            <div className="feature-item">
                                <div className="feature-icon">⚙️</div>
                                <div><strong>Modular DAG engine</strong> – BWA, STAR, GATK, DeepVariant, GLnexus, samtools</div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🔒</div>
                                <div><strong>Provenance & compliance</strong> – Audit logs, VCF signature, GCP/AWS private deployment</div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🌐</div>
                                <div><strong>Ancestry-aware QC</strong> – HWE, missingness, identity-by-descent, outlier removal</div>
                            </div>
                            <button className="btn-primary">Read technical overview →</button>
                        </div>
                        <div className="platform-visual fade-right">
                            <div className="pipeline-illustration">
                                <svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="120" y="20" width="160" height="50" rx="10" fill="#3b82f6" opacity="0.9"/>
                                    <text x="200" y="50" textAnchor="middle" fill="white" fontSize="12">FASTQ</text>
                                    <line x1="200" y1="70" x2="200" y2="100" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrow)"/>
                                    <rect x="120" y="100" width="160" height="50" rx="10" fill="#8b5cf6" opacity="0.9"/>
                                    <text x="200" y="130" textAnchor="middle" fill="white" fontSize="12">Alignment BWA/STAR</text>
                                    <line x1="200" y1="150" x2="200" y2="180" stroke="#8b5cf6" strokeWidth="3"/>
                                    <rect x="120" y="180" width="160" height="50" rx="10" fill="#ec4899" opacity="0.9"/>
                                    <text x="200" y="210" textAnchor="middle" fill="white" fontSize="12">Variant Calling GATK</text>
                                    <line x1="200" y1="230" x2="200" y2="260" stroke="#ec4899" strokeWidth="3"/>
                                    <rect x="120" y="260" width="160" height="50" rx="10" fill="#06b6d4" opacity="0.9"/>
                                    <text x="200" y="290" textAnchor="middle" fill="white" fontSize="12">Annotation</text>
                                    <line x1="200" y1="310" x2="200" y2="340" stroke="#06b6d4" strokeWidth="3"/>
                                    <rect x="120" y="340" width="160" height="50" rx="10" fill="#10b981" opacity="0.9"/>
                                    <text x="200" y="370" textAnchor="middle" fill="white" fontSize="12">PRS + PGx</text>
                                    <defs>
                                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                                            <path d="M0,0 L10,5 L0,10 Z" fill="#3b82f6"/>
                                        </marker>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="science" className="science">
                <div className="container">
                    <div className="section-header fade-up">
                        <span className="section-tag">Validation & research</span>
                        <h2 className="section-title">Peer-reviewed, clinically deployed</h2>
                        <p className="section-subtitle">Our methods power leading academic medical centers and pharma R&D.</p>
                    </div>
                    <div className="science-grid">
                        <div className="science-stat fade-up">
                            <div className="science-icon">🔬</div>
                            <div className="science-number">1.2M+</div>
                            <div className="science-label">WGS/WES samples processed</div>
                        </div>
                        <div className="science-stat fade-up delay-1">
                            <div className="science-icon">🌍</div>
                            <div className="science-number">45+</div>
                            <div className="science-label">Ancestries in reference panel</div>
                        </div>
                        <div className="science-stat fade-up delay-2">
                            <div className="science-icon">💊</div>
                            <div className="science-number">22</div>
                            <div className="science-label">PGx gene-drug pairs</div>
                        </div>
                    </div>
                    <div className="publication-grid">
                        <div className="pub-card">
                            <div className="pub-icon">📄</div>
                            <div><em>Nature Med.</em> – Transferable PRS across global cohorts, 2024</div>
                        </div>
                        <div className="pub-card">
                            <div className="pub-icon">📄</div>
                            <div><em>Clin. Pharm. Ther.</em> – Ancestry-aware star allele caller, 2023</div>
                        </div>
                        <div className="pub-card">
                            <div className="pub-icon">📄</div>
                            <div><em>Bioinformatics</em> – PGx variant interpretation framework, 2025</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="testimonials">
                <div className="container">
                    <div className="section-header fade-up">
                        <span className="section-tag">Testimonials</span>
                        <h2 className="section-title">Trusted by genomics leaders</h2>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card fade-up">
                            <div className="testimonial-avatar">👩‍⚕️</div>
                            <p className="testimonial-text">"Gen20's PGx pipeline reduced our variant interpretation time by 70% while maintaining 99.9% accuracy."</p>
                            <p className="testimonial-author">Dr. Sarah Chen</p>
                            <p className="testimonial-title">Director of Pharmacogenomics, Stanford Medicine</p>
                        </div>
                        <div className="testimonial-card fade-up delay-1">
                            <div className="testimonial-avatar">👨‍🔬</div>
                            <p className="testimonial-text">"The ancestry-informed PRS models outperformed all existing tools in our multi-ethnic cohort study."</p>
                            <p className="testimonial-author">Prof. James Wilson</p>
                            <p className="testimonial-title">Lead Researcher, Broad Institute</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="cta-background"></div>
                <div className="container cta-container">
                    <div className="cta-content fade-scale">
                        <h2>Ready to power your genomic medicine program?</h2>
                        <p>Deploy production-ready pipelines for pharmacogenetics, PRS, and ancestry-informed interpretation today.</p>
                        <div className="cta-buttons">
                            <button className="btn-primary-large">Request enterprise demo</button>
                            <button className="btn-outline-light">Access whitepapers</button>
                        </div>
                    </div>
                </div>
            </section>

            <footer id="company" className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="logo">🧬 Gen20.gr</div>
                            <p>Precision genomics for equitable medicine.</p>
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
        </>
    );
}

export default Land