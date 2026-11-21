// src/CuboBoundary.jsx
// Περιβάλλει κάθε cubo σε ErrorBoundary — αν σπάσει το render,
// εμφανίζει μικρό fallback αντί να ρίξει όλη τη σελίδα.
import React from "react";
import ErrorBoundary from "./ErrorBoundary";

export default function CuboBoundary({ name, children }) {
    return (
        <ErrorBoundary
            fallback={() => (
                <div
                    className="cubo-boundary cubo-boundary--broken"
                    data-cubo={name}
                    title={`Cubo "${name}" failed to render`}
                >
                    <small>⚠️ {name}</small>
                </div>
            )}
        >
            <div className="cubo-boundary" data-cubo={name}>
                {children}
            </div>
        </ErrorBoundary>
    );
}
