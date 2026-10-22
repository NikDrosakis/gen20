import { Helmet } from 'react-helmet-async';
export default function Home() {
    return (
        <>
            <Helmet>
                <title>Niki Mourtzi | Bioinformatics & Genomics Researcher</title>
                <meta name="description" content="Επίσημη ιστοσελίδα της Δρ. Νίκης Μούρτζη – Ερευνήτρια Βιοπληροφορικής και Γονιδιωματικής. Εξειδίκευση στη Φαρμακογονιδιωματική, Πολυγονιδιακές Βαθμολογίες Κινδύνου και Ανάλυση Γονιδιώματος." />

                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://nikimourtzi.com/" />
                <meta property="og:title" content="Niki Mourtzi | Bioinformatics & Genomics Researcher" />
                <meta property="og:description" content="Επίσημη ιστοσελίδα της Δρ. Νίκης Μούρτζη – Ερευνήτρια Βιοπληροφορικής και Γονιδιωματικής." />
                <meta property="og:image" content="https://nikimourtzi.com/assets/niki.png" />
                <meta property="og:locale" content="el_GR" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Niki Mourtzi | Bioinformatics Researcher" />
                <meta name="twitter:description" content="Επίσημη ιστοσελίδα της Δρ. Νίκης Μούρτζη – Ερευνήτρια Βιοπληροφορικής και Γονιδιωματικής." />
                <meta name="twitter:image" content="https://nikimourtzi.com/assets/niki.png" />
            </Helmet>
        <div className="cv-page-container">
            <div className="centered-container">
                <div className="home">

                    <header className="hero">
                        <div className="hero-text">
                            <h1>Niki Mourtzi</h1>
                            <p className="subtitle">
                                Geneticist · Bioinformatics Researcher · Clinical Scientist
                            </p>
                        </div>

                        <div className="hero-image">
                            <img src="/assets/niki.png" alt="Niki Mourtzi"/>
                        </div>
                    </header>

                    <section className="grid">

                        <div className="card">
                            <h2>Focus</h2>
                            <p>
                                Polygenic risk scores, Alzheimer’s disease genetics, and cognitive
                                decline modeling using large-scale cohort studies.
                            </p>
                        </div>

                        <div className="card">
                            <h2>Methods</h2>
                            <p>
                                NGS pipelines, Mendelian randomization, CNV analysis, and statistical
                                genomics across multi-cohort datasets.
                            </p>
                        </div>

                        <div className="card">
                            <h2>Experience</h2>
                            <p>
                                Northwestern University · Duke University · HELIAD Study · Industry
                                bioinformatics consulting.
                            </p>
                        </div>

                        <div className="card">
                            <h2>Direction</h2>
                            <p>
                                Translating genomic variation into predictive clinical models and
                                scalable research pipelines.
                            </p>
                        </div>

                    </section>

                </div>
                </div>
                </div>
                </>
                );
                }