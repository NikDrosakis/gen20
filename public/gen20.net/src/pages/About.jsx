// pages/About.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Cookies from 'js-cookie';
import TeamSection from "../components/TeamSection";
import EditButton from '../modules/EditButton';

const About = () => {
    const { pageName } = useParams();
    const lang = Cookies.get('lang') || 'el';
    const [aboutData, setAboutData] = useState(null);
    const [loading, setLoading] = useState(true);
    const publicdb = "gen_" + window.location.hostname.replace(/\./g, '');

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const response = await fetch(`/api/v1/maria/f?folder=select * from ${publicdb}.content where name='about' and status=1`);
                const data = await response.json();

                if (data.success && data.data) {
                    setAboutData(data.data);
                }
            } catch (error) {
                console.error('Error fetching about data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, [publicdb]);

    if (loading) {
        return <div className="loading-state">Loading...</div>;
    }

    if (!aboutData) {
        return <div className="error-state">About content not found</div>;
    }

    const title = lang === 'el' ? (aboutData.title_el || aboutData.title_en) : (aboutData.title_en || aboutData.title_el);
    const description = lang === 'el' ? (aboutData.description_el || aboutData.description_en) : (aboutData.description_en || aboutData.description_el);
    const img = aboutData.img || '/img/icons/si-3.png';

    return (
        <>
           <section className="about spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="about__text">
                                <div className="section-title">
                                    <span>Gen20</span>
                                    <h2>{lang === 'el' ? 'Τέχνη & Τεχνολογία' : 'Art & Technology'}</h2>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-6">
                                        <div className="services__item">
                                            <div className="services__item__icon">
                                                <img src={img} alt={title || 'Icon'} />
                                            </div>
                                            <h4>{title}</h4>
                                            <EditButton lang={lang} />
                                            <div
                                                className="about__pic__item"
                                                style={{ backgroundImage: `url(/media/${aboutData.img || 'logo.png'})` }}
                                            ></div>
                                            <div
                                                dangerouslySetInnerHTML={{ __html: description || '' }}
                                            ></div>
                                            <EditButton lang={lang} />
                                        </div>
                                    </div>
                                </div>
                                <div className="about__text__desc">
                                    <p>{description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <TeamSection lang={lang} />
        </>
    );
};

export default About;