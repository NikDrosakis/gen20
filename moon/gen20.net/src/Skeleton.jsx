import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Aggregator from "./Aggregator";
import { useG } from "./GContext";
import "./Skeleton.css";

/**
 * Skeleton owns the global shell.
 * Aggregator owns manifest loading, route resolution and page composition.
 */
export default function Skeleton() {
    const { lang } = useG();

    return (
        <div id="container" className="skeleton-container">
            <Header lang={lang} />

            <div className="skeleton-main" id="main-content">
                <main className="skeleton-main-content w-full">
                    <Aggregator />
                </main>
            </div>

            <Footer />
        </div>
    );
}
