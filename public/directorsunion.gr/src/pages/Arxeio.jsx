// pages/Arxeio.jsx
import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import './Arxeio.css';

const Arxeio = ({ lang = 'el' }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(null);
    const [years, setYears] = useState([]);
    const [generating, setGenerating] = useState(false);

    const isGreek = lang === 'el';

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');
            const query = `SELECT
                               id, name, title, description, excerpt,
                               published, view_count, img
                           FROM ${publicdb}.content
                           WHERE status = 1 AND type = 'post'
                             AND published IS NOT NULL
                           ORDER BY published DESC`;

            const response = await fetch(`/api/v1/maria/fa?query=${encodeURIComponent(query)}`);
            const result = await response.json();

            let postsData = [];
            if (result.success && result.data) {
                postsData = result.data;
            }

            setPosts(postsData);

            const uniqueYears = [...new Set(postsData.map(p => {
                const date = p.published ? new Date(p.published) : new Date();
                return date.getFullYear();
            }))].sort((a, b) => b - a);

            setYears(uniqueYears);
            if (uniqueYears.length > 0) {
                setSelectedYear(uniqueYears[0]);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPostsByYear = (year) => {
        return posts.filter(p => {
            const date = p.published ? new Date(p.published) : new Date();
            return date.getFullYear() === year;
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return isGreek ? 'Μη διαθέσιμο' : 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date)) return isGreek ? 'Μη διαθέσιμο' : 'N/A';
            return date.toLocaleDateString(isGreek ? 'el-GR' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return isGreek ? 'Μη διαθέσιμο' : 'N/A';
        }
    };

    // Μορφοποίηση για ημερολόγιο
    const getCalendarDate = (dateString) => {
        if (!dateString) return { day: '--', month: '---' };
        try {
            const date = new Date(dateString);
            if (isNaN(date)) return { day: '--', month: '---' };
            const months = isGreek
                ? ['ΙΑΝ', 'ΦΕΒ', 'ΜΑΡ', 'ΑΠΡ', 'ΜΑΙ', 'ΙΟΥΝ', 'ΙΟΥΛ', 'ΑΥΓ', 'ΣΕΠ', 'ΟΚΤ', 'ΝΟΕ', 'ΔΕΚ']
                : ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            return {
                day: String(date.getDate()).padStart(2, '0'),
                month: months[date.getMonth()],
                year:date.getFullYear()
            };
        } catch (e) {
            return { day: '--', month: '---',year: '---', };
        }
    };

    // ✅ Δημιουργία HTML περιεχομένου για το PDF
    const generatePDFContent = (yearPosts, year) => {
        const title = isGreek ? 'Αρχείο ' : 'Index';
        const footerText = isGreek ? 'Δημιουργήθηκε στις' : 'Generated on';

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title} - ${year}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; background: white; }
                    h1 { text-align: center; color: #1a202c; font-size: 24px; }
                    h2 { text-align: center; color: #4a5568; font-size: 18px; margin-top: -10px; }
                    hr { margin: 20px 0; border: 1px solid #e2e8f0; }
                    .post { margin-bottom: 25px; padding: 10px; page-break-inside: avoid; }
                    .post-header { display: flex; justify-content: space-between; align-items: center; }
                    .post-title { color: #2d3748; margin: 0; font-size: 16px; }
                    .post-date { color: #718096; font-size: 11px; }
                    .post-excerpt { color: #4a5568; margin: 8px 0; line-height: 1.5; font-size: 13px; }
                    .post-divider { border-bottom: 1px solid #e2e8f0; margin-top: 8px; padding-bottom: 8px; }
                    .footer { text-align: center; color: #a0aec0; font-size: 11px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; }
    `;

        yearPosts.forEach((post, index) => {
            html += `
                .post-${index} { margin-bottom: 25px; padding: 10px; page-break-inside: avoid; }
            `;
        });

        html += `
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <h2>${year}</h2>
                <hr/>
        `;

        yearPosts.forEach((post, index) => {
            html += `
                <div class="post">
                    <div class="post-header">
                        <h3 class="post-title">${index + 1}. ${post.title || 'Untitled'}</h3>
                        <span class="post-date">${formatDate(post.published)}</span>
                    </div>
        `;

            if (post.img) {
                html += `
                    <div style="margin: 8px 0;">
                        <img src="${post.img}" alt="${post.title}" style="max-width:100%; max-height:150px; border-radius:4px;" />
                    </div>
            `;
            }

            if (post.excerpt) {
                html += `
                    <p class="post-excerpt">${post.excerpt}</p>
            `;
            }

            html += `
                    <div class="post-divider"></div>
                </div>
        `;
        });

        html += `
                <div class="footer">
                    <p>${footerText} ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
            </html>
        `;

        return html;
    };

    // ✅ Δημιουργία PDF
    const generatePDF = async () => {
        const yearPosts = getPostsByYear(selectedYear);
        if (yearPosts.length === 0) {
            alert(isGreek ? 'Δεν υπάρχουν αναρτήσεις για αυτό το έτος' : 'No posts for this year');
            return;
        }

        setGenerating(true);

        try {
            const htmlContent = generatePDFContent(yearPosts, selectedYear);
            const container = document.createElement('div');
            container.innerHTML = htmlContent;
            container.style.position = 'fixed';
            container.style.top = '-9999px';
            container.style.left = '-9999px';
            container.style.width = '100%';
            container.style.background = 'white';
            container.style.zIndex = '-1';
            document.body.appendChild(container);

            const opt = {
                margin: [10, 10, 10, 10],
                filename: `arxeio_${selectedYear}_posts.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };

            await html2pdf()
                .set(opt)
                .from(container)
                .save();

            document.body.removeChild(container);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(isGreek ? 'Σφάλμα κατά τη δημιουργία PDF' : 'Error generating PDF');
        } finally {
            setGenerating(false);
        }
    };

    const filteredPosts = selectedYear ? getPostsByYear(selectedYear) : [];

    if (loading) {
        return <div className="loading-state">{isGreek ? 'Φόρτωση...' : 'Loading...'}</div>;
    }

    return (
        <div className="arxeio-container">
            <div className="arxeio-header">
                <h1>{isGreek ? '📚 Αρχείο' : '📚 Index'}</h1>
                <div className="arxeio-controls">
                    <select
                        className="year-select"
                        value={selectedYear || ''}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button
                        className="pdf-button"
                        onClick={generatePDF}
                        disabled={generating || filteredPosts.length === 0}
                    >
                        {generating ? '⏳ Δημιουργία...' : '📄 Λήψη PDF'}
                    </button>
                </div>
            </div>

            <div className="arxeio-stats">
                <p>
                    {isGreek
                        ? `Σύνολο αναρτήσεων: ${posts.length} | Έτος ${selectedYear}: ${filteredPosts.length}`
                        : `Total posts: ${posts.length} | Year ${selectedYear}: ${filteredPosts.length}`
                    }
                </p>
            </div>

            {/* Archive Display */}
            <div className="arxeio-posts">
                {filteredPosts.length === 0 ? (
                    <div className="no-posts">
                        {isGreek
                            ? 'Δεν υπάρχουν αναρτήσεις για αυτό το έτος'
                            : 'No posts found for this year'
                        }
                    </div>
                ) : (
                    filteredPosts.map((post, index) => {
                        const calDate = getCalendarDate(post.published);
                        return (
                            <div key={post.id} className="arxeio-post">
                                <div className="post-calendar">
                                    <div className="calendar-day">{calDate.day}</div>
                                    <div className="calendar-month">{calDate.month}</div>
                                    <div className="calendar-year">{calDate.year}</div> {/* ← Πρόσθεσε αυτό */}
                                </div>
                                <div className="post-content">
                                    <div className="post-header">
                                        <h3>{post.title || 'Untitled'}</h3>
                                    </div>
                                    {post.excerpt && (
                                        <p className="post-excerpt">{post.excerpt}</p>
                                    )}
                                    <a href={`/post/${post.name}`} className="post-link">
                                        {isGreek ? 'Διαβάστε περισσότερα →' : 'Read more →'}
                                    </a>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Arxeio;