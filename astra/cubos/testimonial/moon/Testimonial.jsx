import React from "react";
import "./Testimonial.css";

export default function Testimonial({ quote = "", author = "", role = "" }) {
    return (
        <section className="testimonial-cubo">
            <blockquote className="testimonial-quote">
                {quote}
            </blockquote>
            {author && (
                <cite className="testimonial-author">
                    {author}
                    {role ? <span className="testimonial-role"> — {role}</span> : null}
                </cite>
            )}
        </section>
    );
}
