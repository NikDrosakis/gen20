import { useState } from 'react';
import './Mail.css';

export const Mail = ({
                         onSubmit,
                         endpoint = '/api/v1/local/sendMail',
                         title = 'Leave a Message',
                         buttonText = 'Send Message',
                         className = '',
                     }) => {
    const initialForm = {
        name: '',
        email: '',
        website: '',
        comment: '',
    };

    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({
        success: false,
        message: '',
    });

    const handleChange = ({ target }) => {
        const { name, value } = target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (status.message) {
            setStatus({ success: false, message: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            website: form.website.trim(),
            comment: form.comment.trim(),
        };

        if (!payload.name || !payload.email || !payload.comment) {
            setStatus({
                success: false,
                message: 'Please complete all required fields.',
            });
            return;
        }

        setLoading(true);
        setStatus({ success: false, message: '' });

        try {
            let result;

            if (onSubmit) {
                result = await onSubmit(payload);
            } else {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.message || 'Failed to send message.'
                    );
                }
            }

            if (result?.success === false) {
                throw new Error(
                    result.message || 'Failed to send message.'
                );
            }

            setStatus({
                success: true,
                message: result?.message || 'Message sent successfully!',
            });

            setForm(initialForm);

        } catch (err) {
            console.error('[Mail]', err);

            setStatus({
                success: false,
                message: err.message || 'Error sending message.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`container spad ${className}`}>
            <div className="row">
                <div className="blog__details__comment">
                    <h4>{title}</h4>

                    <form onSubmit={handleSubmit}>
                        <div className="input__list">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                autoComplete="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                maxLength={120}
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                maxLength={254}
                            />

                            <input
                                type="url"
                                name="website"
                                placeholder="Website"
                                value={form.website}
                                onChange={handleChange}
                                maxLength={500}
                            />
                        </div>

                        <textarea
                            name="comment"
                            placeholder="Comment"
                            value={form.comment}
                            onChange={handleChange}
                            required
                            maxLength={10000}
                        />

                        {status.message && (
                            <div
                                className={`mail-status ${
                                    status.success ? 'success' : 'error'
                                }`}
                                role="status"
                                aria-live="polite"
                            >
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="site-btn"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : buttonText}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Mail;
