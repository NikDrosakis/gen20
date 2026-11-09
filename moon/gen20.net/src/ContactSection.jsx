import React from "react";
const ContactSection = () => {
    return (
        <>
            <section className="contact-widget spad">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 col-md-6">
                            <div className="contact__widget__item">
                                <div className="contact__widget__item__icon">
                                    <i className="fa fa-map-marker"></i>
                                </div>
                                <div className="contact__widget__item__text">
                                    <h4>Διεύθυνση</h4>
                                    <p>Skouloufia Rethymno Crete</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="contact__widget__item">
                                <div className="contact__widget__item__icon">
                                    <i className="fa fa-envelope"></i>
                                </div>
                                <div className="contact__widget__item__text">
                                    <h4>Email</h4>
                                    <p>info@gen20.net</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="contact__widget__item">
                                <div className="contact__widget__item__icon">
                                    <i className="fa fa-youtube-play"></i>
                                </div>
                                <div className="contact__widget__item__text">
                                    <h4>YouTube</h4>
                                    <p><a href="https://youtube.com/@nikdrosakis" target="_blank" rel="noopener noreferrer">youtube.com/@nikdrosakis</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`
          .contact-widget {
              background: var(--bg2);
              padding-bottom: 70px;
          }

          .contact__widget__item {
              margin-bottom: 30px;
          }

          .contact__widget__item__icon {
              height: 70px;
              width: 70px;
              border: 1px solid rgba(225, 225, 225, 0.5);
              line-height: 80px;
              text-align: center;
              border-radius: 50%;
              float: left;
              margin-right: 30px;
          }

          .contact__widget__item__icon i {
              font-size: 30px;
              color: var(--text);
          }

          .contact__widget__item__text {
              overflow: hidden;
              padding-top: 7px;
          }

          .contact__widget__item__text h4 {
              font-size: 22px;
              color: var(--text);
              font-weight: 700;
              margin-bottom: 10px;
          }

          .contact__widget__item__text p {
              margin-bottom: 0;
              word-break: break-word;
          }

          .contact__widget__item__text p a {
              color: var(--text);
              text-decoration: none;
          }
        `}</style>
            </section>
        </>
    );
};

export default ContactSection;
