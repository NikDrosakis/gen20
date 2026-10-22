// pages/Film.jsx
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './Film.css';

const Film = () => {
    const lang = Cookies.get('lang') || 'el';
    const [activeTab, setActiveTab] = useState('bio');
    const [showAllAwards, setShowAllAwards] = useState(false);

    // Profile data (can be fetched from API later)
    const profileData = {
        name: "NIKOS DROSAKIS",
        username: "NIKOSDROSAKIS",
        title: "Director / Screenwriter",
        avatarImage: "https://filmfreeway-production-storage-01-storage.filmfreeway.com/users/avatars/002/391/277/original/17457f64f3-avatar.jpg?1715828845",
        backgroundImage: "https://filmfreeway-production-storage-01-storage.filmfreeway.com/assets/public/000/471/630/c57f44cd7bc2a77504ac5cf0dbcd7ef8a3655732/original/coverphoto.jpg?1615146163",
        intro: "Writing poetry and exploring the poetry in filmmaking",
        bio: `Acting & Drama graduate at 2003 & Camera/Lights at 2008. Directed two short films (Timor Mortis, 2008 & The garbage saints, 2020), one feature documentary (The little others, 2011) with Official Selections at: the Drama Festival (2009), Thessaloniki Documentary (2011) and Docfest Chalkida (2011). Also directed the documentary "The art of uniqueness" for ERT2 (Greek television).
        
Ten years as a stage actor, director and playwright, he has recently published the poetry collection "Εγκλεισμός Ονείρου" (Inclusion of Dream).`,
        contacts: {
            email: "nikosdrosakis@gmail.com",
            website: "http://nikosdrosakis.gr",
            facebook: "https://www.facebook.com/nikdrosakis",
            instagram: "https://instagram.com/nikdrosakis",
            twitter: "https://twitter.com/NikosDrosakis",
            youtube: "https://www.youtube.com/c/nikosdros",
            linkedin: "https://linkedin.com/in/drosakis"
        },
        personalDetails: {
            birth_date: { value: "January 13, 1977" },
            birth_place: { value: "Athens" },
            current_city: { value: "Palaio Faliro" },
            height: { value: "1.76" },
            gender: { value: "Male" },
            ethnicity: { value: "Greek" },
            eye_color: { value: "Brown" }
        },
        photos: [
            "https://filmfreeway-production-storage-01-storage.filmfreeway.com/assets/public/000/409/226/a613517bc7e089efe669323946b33a4dff9b7679/thumb/postertimormortis1.jpg?1603272254",
            "https://filmfreeway-production-storage-01-storage.filmfreeway.com/assets/public/000/409/319/66d4e43c4b40c779815a5e8a35395174dcf1a58b/thumb/c84092243f92c45384733c5a22908046.jpg?1603285764"
        ],
        filmography: {
            projects: [{
                id: 2040810,
                title: "The garbage saints",
                poster: "https://filmfreeway-production-storage-01-storage.filmfreeway.com/press_kits/posters/001/658/524/original/5302492090-poster.jpg?1615145882",
                genre: "Documentary, Short",
                year: 2020,
                role: "Writer, Producer, Director"
            }]
        },
        awards: [
            { title: "Finalist", project: "The garbage saints", festival: "Roma Short Film Festival", location: "Rome", year: 2021 },
            { title: "Official Competition Selection", project: "The garbage saints", festival: "Greek Documentary Festival - Docfest", location: "Chalkida", year: 2020 },
            { title: "Official Selection", project: "The garbage saints", festival: "Mediterranean Film Festival Cannes", location: "Cannes", year: 2020 },
            { title: "Finalist", project: "The garbage saints", festival: "Rome Independent Prisma Awards", location: "Rome", year: 2020 },
            { title: "Semi-Finalist", project: "The garbage saints", festival: "Madrid Film Awards", location: "Madrid", year: null },
            { title: "Nominee", project: "The garbage saints", festival: "The Continental Film Festival", location: "Barcelona", year: null },
            { title: "Nominee", project: "The garbage saints", festival: "Roshani International Short Film Festival 2021", location: "Aurangabad, Maharashtra", year: null },
            { title: "2-Months Session Best Short Documentary Award Winner", project: "The garbage saints", festival: "International Halicarnassus Film Festival", location: "Bodrum", year: null }
        ],
        quotes: ["\"Man is the measure of all things\" - Protagoras"]
    };

    const visibleAwards = showAllAwards ? profileData.awards : profileData.awards.slice(0, 3);

    return (
        <div className="film-page">
            <div className="film-container">
                <div className="film-tabs">
                    <button
                        className={`film-tab ${activeTab === 'bio' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bio')}
                    >
                        {lang === 'el' ? 'Βιογραφικό' : 'Bio'}
                    </button>
                    <button
                        className={`film-tab ${activeTab === 'filmography' ? 'active' : ''}`}
                        onClick={() => setActiveTab('filmography')}
                    >
                        {lang === 'el' ? 'Φιλμογραφία' : 'Filmography'}
                    </button>
                    <button
                        className={`film-tab ${activeTab === 'awards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('awards')}
                    >
                        {lang === 'el' ? 'Βραβεία' : 'Awards'}
                    </button>
                </div>

                <div className="film-content">
                    <div className="film-main">
                        {activeTab === 'bio' && (
                            <div className="film-bio">
                                <div className="film-photos">
                                    {profileData.photos.map((photo, idx) => (
                                        <div key={idx} className="film-photo">
                                            <img src={photo} alt={`Photo ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                                <div className="film-bio-text">
                                    <p>{profileData.bio}</p>
                                </div>
                                {profileData.quotes.length > 0 && (
                                    <div className="film-quotes">
                                        <h3>{lang === 'el' ? 'Αποφθέγματα' : 'Quotes'}</h3>
                                        {profileData.quotes.map((quote, idx) => (
                                            <blockquote key={idx}>"{quote}"</blockquote>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'filmography' && (
                            <div className="film-filmography">
                                {profileData.filmography.projects.map((project, idx) => (
                                    <div key={idx} className="film-project">
                                        <div className="film-project-poster">
                                            <img src={project.poster} alt={project.title} />
                                        </div>
                                        <div className="film-project-info">
                                            <h3>{project.title}</h3>
                                            <p className="film-project-genre">{project.genre}</p>
                                            <p className="film-project-year">{project.year}</p>
                                            <p className="film-project-role">{project.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'awards' && (
                            <div className="film-awards">
                                {visibleAwards.map((award, idx) => (
                                    <div key={idx} className="film-award">
                                        <div className="film-award-year">{award.year || ''}</div>
                                        <div className="film-award-content">
                                            <h4>{award.title}</h4>
                                            <p className="film-award-project">{award.project}</p>
                                            <p className="film-award-festival">{award.festival}</p>
                                            <p className="film-award-location">{award.location}</p>
                                        </div>
                                    </div>
                                ))}
                                {profileData.awards.length > 3 && (
                                    <button
                                        className="film-show-more"
                                        onClick={() => setShowAllAwards(!showAllAwards)}
                                    >
                                        {showAllAwards ? (lang === 'el' ? 'Show Less' : 'Show Less') : (lang === 'el' ? 'Show All Awards' : 'Show All Awards')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Film;