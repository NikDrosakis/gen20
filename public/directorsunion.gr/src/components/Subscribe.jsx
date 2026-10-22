// components/Subscribe.jsx
import { useState } from "react";
import "./Subscribe.css";
export default function Subscribe() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
    const [message, setMessage] = useState("");

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email
        if (!email) {
            setStatus("error");
            setMessage("Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            setStatus("error");
            setMessage("Please enter a valid email address");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            // Replace with your actual API endpoint
            const response = await fetch("/api/v1/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus("success");
                setMessage("Thank you for subscribing! 🎉");
                setEmail("");
                // Clear success message after 5 seconds
                setTimeout(() => {
                    setStatus(null);
                    setMessage("");
                }, 5000);
            } else {
                throw new Error(data.message || "Subscription failed");
            }
        } catch (error) {
            console.error("Subscribe error:", error);
            setStatus("error");
            setMessage(error.message || "Something went wrong. Please try again.");
            // Clear error message after 5 seconds
            setTimeout(() => {
                if (status === "error") {
                    setStatus(null);
                    setMessage("");
                }
            }, 5000);
        }
    };

    // Demo fallback (remove in production)
    const handleDemoSubmit = (e) => {
        e.preventDefault();

        if (!email) {
            setStatus("error");
            setMessage("Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            setStatus("error");
            setMessage("Please enter a valid email address");
            return;
        }

        setStatus("loading");

        // Simulate API call
        setTimeout(() => {
            setStatus("success");
            setMessage("Thank you for subscribing! 🎉");
            setEmail("");
            setTimeout(() => {
                setStatus(null);
                setMessage("");
            }, 5000);
        }, 1000);
    };

    // Use demo version if API not ready
    const useDemo = true; // Set to false when API is ready
    const onSubmit = useDemo ? handleDemoSubmit : handleSubmit;

    return (
        <div className="newsletter-banner">
            <h3>📧 Never miss an insight</h3>
            <p>Subscribe to get the latest research updates delivered to your inbox</p>

            <form className="newsletter-form" onSubmit={onSubmit}>
                <input
                    type="email"
                    placeholder="Your email address"
                    className="newsletter-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                />
                <button
                    type="submit"
                    className="newsletter-button"
                    disabled={status === "loading"}
                >
                    {status === "loading" ? "Subscribing..." : "Subscribe"}
                </button>
            </form>

            {message && (
                <div className={`newsletter-message ${status}`}>
                    {status === "success" && <span className="message-icon">✅</span>}
                    {status === "error" && <span className="message-icon">❌</span>}
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
}