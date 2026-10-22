import React, { useEffect, useState } from "react";
import DB from "../contexts/DB";

const TeamSection = () => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await DB.maria('fa', 'SELECT fullname, title, img, name FROM gen_gen20net.user WHERE status=2');
                setGroups(Array.isArray(res) ? res : []);
            } catch (err) {
                console.error("Error fetching team:", err);
                setGroups([]);
            }
        };
        fetchGroups();
    }, []);

    return (
        <section className="team spad set-bg" style={{ backgroundImage: `url("/img/team-bg.jpg")` }}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="section-title team__title">
                            <span>Nice to meet</span>
                            <h2>Η Ομάδα</h2>
                        </div>
                    </div>
                </div>
                <div className="row">
                    {groups.map((member, index) => (
                        <div className="col-lg-3 col-md-6 col-sm-6 p-0" key={index}>
                            <div
                                className={`team__item ${index % 3 === 1 ? "team__item--second" : index % 3 === 2 ? "team__item--third" : ""} set-bg`}
                                style={{ backgroundImage: `url(/img/${member.img || "/img/default-user.jpg"})` }}
                            >
                                <div className="team__item__text">
                                    <h4>{member.fullname}</h4>
                                    <p>{member.title}</p>
                                    <a
                                        href={`/profile?name=${encodeURIComponent(member.name)}`}
                                        className="primary-btn team__btn"
                                        style={{marginTop: '10px', display: 'inline-block'}}
                                    >
                                        Προφίλ
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                    {groups.length > 0 && (
                        <div className="col-lg-12 p-0">
                        <div className="team__btn">
                                <a href="/team" className="primary-btn">Γνώρισε την Ομάδα</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TeamSection;
