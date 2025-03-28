import React, {useEffect, useState} from 'react';
import axios from "axios";
const ServicesSection = () => {
    const path = window.location.pathname.split('/')[1];
    const [data, setData] = useState(null);
    useEffect(() => {
        const api= axios.create({baseURL: process.env.REACT_APP_HTTP_API});
        const username='nikos';
        const password='130177';
        api.interceptors.request.use((config) => {
            config.headers.Authorization = 'Basic ' + btoa(username+':'+password);
            return config;
        }, null, { synchronous: true });
        const fetchData = async () =>{
            api.get("post?id=28")
                .then((res) => {
                    const dat= res.data.val;
                    setData(dat)
                })
                .catch((err) => err);
        }
        fetchData();
    }, []);
    console.log(data);
return (
    <section className="services spad">
        <div className="container">
            <div className="row">
                <div className="col-lg-4">
                    <div className="services__title">
                        <div className="section-title">
                            <span>{ path }</span>
                            <h2>Nik Drosakis</h2>
                        </div>
                        <p>One Featured Film, two short films and two television docs is the account for now. Just at the beginning.
                        </p>
                        <a href="/" className="primary-btn">
                            View all services
                        </a>
                    </div>
                </div>
                <div className="col-lg-8">
                    <div className="row">
                        {data ? data.map(block => {
                            <div className="col-lg-6 col-md-6 col-sm-6">
                                <div className="services__item">
                                    <div className="services__item__icon">
                                        <img src={`/img/icons/si-${block.sort}.png`} alt=""/>
                                    </div>
                                    <h4>{block.tit}</h4>
                                    <p>{block.cont}</p>
                                </div>
                            </div>
                        }) : '' }
                    </div>
                </div>
            </div>
        </div>
    </section>
);
};

export default ServicesSection;