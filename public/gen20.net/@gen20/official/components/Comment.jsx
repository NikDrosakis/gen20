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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(form);
        // Clear form (optional)
        setForm({ name: '', email: '', website: '', comment: '' });
    };

    return (
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
            );
            };

            export default Comment;
