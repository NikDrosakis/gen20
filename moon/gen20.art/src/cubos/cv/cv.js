// /data/cv.js
export const cv = {
    personal: {
        name: "Website Title",
        title: "Website Title", // Added missing title
        subtitle: "Website Subtitle", // Added missing title
        email: "website@email.com",
        phone: "XXXXXXXXX",
        location: "Place"
    },

    education: [
        {
            id: 1, // Added id
            title: "PhD Genetics / Endocrinology",
            institution: "University of Athens", // Added missing institution
            period: "2018–2022",
            description: "Genetic basis of hypertension in mild primary hyperaldosteronism",
            thesis: "Genetic predictors of hypertension in endocrine disorders" // Added thesis
        },
        {
            id: 2, // Added id
            title: "MSc Clinical Biochemistry - Molecular Diagnostics",
            institution: "University of Crete", // Added missing institution
            period: "2014–2016",
            description: "Grade: 8.98 (Excellent)",
            thesis: null
        }
    ],

    experience: [
        {
            id: 1, // Added id
            title: "Research Consultant",
            org: "Galatea Bio, Miami",
            period: "2022–2025",
            description: "Leading bioinformatics consulting for genomic research projects",
            responsibilities: [ // Added responsibilities
                "NGS pipeline development",
                "Statistical genetics analysis",
                "Client collaboration"
            ]
        },
        {
            id: 2, // Added id
            title: "Researcher",
            org: "Northwestern University",
            period: "2019–2020",
            description: "Research on genetic basis of neurodegenerative diseases",
            responsibilities: [
                "Data analysis",
                "Manuscript preparation",
                "Collaborative research"
            ]
        }
    ],

    skills: [
        "NGS Analysis",
        "Polygenic Risk Scores",
        "Mendelian Randomization",
        "Python",
        "R",
        "SPSS"
    ],

    publications_count: 12, // Added missing field
    grants: [ // Added missing grants
        "Hellenic Foundation for Research & Innovation (2023)",
        "EU Horizon Research Grant (2022)"
    ]
};