
import React from "react";
import "./Hello.css";

export default function Hello({
                                  name = "World",
                                  system = "GEN20",
                                  message = "One core. Many possibilities."
                              }) {
    return (
        <section className="hello-cubo">
            <div className="hello-glow" />

            <div className="hello-content">
                <div className="hello-top">
                    <span className="hello-mark">
                        <span className="hello-mark-dot" />
                        {system}
                    </span>

                    <span className="hello-version">CUBO / 01</span>
                </div>

                <div className="hello-main">
                    <span className="hello-overline">
                        A NEW CONNECTION
                    </span>

                    <h1 className="hello-title">
                        Hello<span className="hello-period">.</span>
                    </h1>

                    <p className="hello-name">
                        {name}
                    </p>

                    <p className="hello-message">
                        {message}
                    </p>
                </div>

                <div className="hello-footer">
                    <span className="hello-status">
                        <span className="hello-status-dot" />
                        SYSTEM ONLINE
                    </span>

                    <span className="hello-symbol">✳</span>
                </div>
            </div>
        </section>
    );
}
