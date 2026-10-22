import React, { useState } from 'react';
const Comment = ({ onSubmit }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        website: '',
        comment: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        const baseURL = import.meta.env.VITE_HTTP_API;
        const username = 'nikos';
        const password = '130177';
        e.preventDefault();
        const headers = {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + btoa(`${username}:${password}`)
        };

        try {
            const res = await fetch(`${baseURL}local/sendZohoMail`, {
                method: 'POST',
                headers,
                body: JSON.stringify(form),
            });
            const result = await res.json();
            if (result.success) alert('Message sent!');
            else alert('Failed to send.');
        } catch (err) {
            console.error(err);
            alert('Error sending message.');
        }
        setForm({ name: '', email: '', website: '', comment: '' });
    };


    return (
        <>
            <div className="container spad">
                <div className="row">
                    <div className="blog__details__comment">
                        <h4>Leave a Message</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="input__list">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    name="website"
                                    placeholder="Website"
                                    value={form.website}
                                    onChange={handleChange}
                                />
                            </div>
                            <textarea
                                name="comment"
                                placeholder="Comment"
                                value={form.comment}
                                onChange={handleChange}
                            />
                            <button type="submit" className="site-btn">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`            
                .blog__details__comment {
                    margin: 0 auto;
                    box-shadow: var(--shadow);
                    padding:20px;
                    background:var(--bg2);
                }
                .blog__details__comment h4 {
                    color: var(--text);
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: 35px;
                    text-align: center;
                }
                .blog__details__comment form textarea {
                    height: 120px;
                    width: 100%;
                    border: 1px solid var(--border);
                    background: transparent;
                    font-size: 16px;
                    color: #adadad;
                    padding-top: 12px;
                    padding-left: 20px;
                    font-weight: 300;
                    margin-bottom: 14px;
                    resize: none;
                }
                .blog__details__comment form textarea::placeholder {
                    color: #adadad;
                }
            `}</style>
        </>
    );
};

export default Comment;
