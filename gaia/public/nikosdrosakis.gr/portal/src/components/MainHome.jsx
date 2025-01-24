import React, { useEffect, useState } from "react";
import axios from "axios";
const MainHome = () => {
    const [media, setMedia] = useState([]);
    useEffect(() => {
        const fetchData = async () =>{
            const api= axios.create({
                baseURL: process.env.REACT_APP_HTTP_API,
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const username='nikos';
            const password='130177';
            api.interceptors.request.use((config) => {
                config.headers.Authorization = 'Basic ' + btoa(username+' '+password);
                return config;
            });
            api.get("media")
                .then((res) => {
                    const dat= res.data.val;
                    setMedia(dat)
                })
                .catch((err) => err);
        }
        fetchData();
    }, []);
    console.log(media);
    return (
        <div className="container-fluid" data-aos="fade" data-aos-delay="500">
            <div className="row">
            {
                media.map(item =>
                    <div>
                        <div className="image-wrap-2">
                            <div className="image-info">
                            </div>
                            <img src={ "/images/" + item.filename } alt={ item.filename } className="img-fluid"/>
                        </div>
                    </div>
                )
            }
        </div>
        </div>
    );
}

export default MainHome;