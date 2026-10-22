import React from "react";
const ContactSection=()=>{
    return (
        <section className="contact-widget spad">
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 col-md-6 col-md-6 col-md-3">
                        <div className="contact__widget__item">
                            <div className="contact__widget__item__icon">
                                <i className="fa fa-map-marker"></i>
                            </div>
                            <div className="contact__widget__item__text">
                                <h4>Address</h4>
                                <p>Palaio Faliro, Attiki</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-md-6 col-md-3">
                        <div className="contact__widget__item">
                            <div className="contact__widget__item__icon">
                                <i className="fa fa-phone"></i>
                            </div>
                            <div className="contact__widget__item__text">
                                <h4>Email</h4>
                                <p>nikosdrosakis@gmail.com</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-md-6 col-md-3">
                        <div className="contact__widget__item">
                            <div className="contact__widget__item__icon">
                                <i className="fa fa-map-marker"></i>
                            </div>
                            <div className="contact__widget__item__text">
                                <h4>Youtube</h4>
                                <p>https://youtube.com/@nikdrosakis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default ContactSection;