// /pages/Research.jsx
export default function Research() {
    return (
        <div className="research-page-container">
            <div className="centered-container">
                <div className="research-header">
                    <h1>Research Focus</h1>
                    <p className="subtitle">
                        From genomic variation to systems-level disease understanding
                    </p>
                    <div className="contact-image-container"><img alt="Bioinformatics Research Illustration"
                                                                  className="contact-image" src="/assets/asset_4.png"/>
                    </div>

                </div>

                <div className="research-grid">
                    <div className="research-card">
                        <h2>🧠 Neurogenetics & Dementia</h2>
                        <p>
                            Polygenic risk scores, Alzheimer's disease genetics, and cognitive
                            decline modeling using longitudinal cohort data (HELIAD study and
                            international collaborations).
                        </p>
                    </div>

                    <div className="research-card">
                        <h2>📊 Statistical Genetics</h2>
                        <p>
                            Mendelian randomization, rare variant association studies, and
                            genome-wide risk modeling integrating multi-cohort datasets.
                        </p>
                    </div>

                    <div className="research-card">
                        <h2>🧬 NGS & Bioinformatics Pipelines</h2>
                        <p>
                            Whole genome/exome analysis using GATK best practices, CNV detection,
                            and variant annotation pipelines across large-scale datasets.
                        </p>
                    </div>

                    <div className="research-card">
                        <h2>⚕️ Translational Genomics</h2>
                        <p>
                            Bridging clinical phenotypes with genomic variation in metabolic,
                            endocrine, and neurodegenerative diseases.
                        </p>
                    </div>

                    <div className="research-card">
                        <h2>🚀 Direction</h2>
                        <p>
                            Building computational frameworks that connect genotype → phenotype →
                            clinical prediction with scalable, reproducible pipelines.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}