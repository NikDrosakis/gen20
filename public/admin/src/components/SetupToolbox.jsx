import React from 'react';
import Setup from '../pages/Settings';
import './SetupToolbox.css';

export default function SetupToolbox({ onComplete }) {
    return (
    <div className="setup-toolbox-overlay">
    <section
    className="setup-toolbox"
    role="dialog"
    aria-modal="true"
    aria-labelledby="setup-toolbox-title"
    >
    <header className="setup-toolbox-header">
    <h2 id="setup-toolbox-title">
    Initial Setup Required
    </h2>
    <p>
    Complete the missing configuration values
    to continue.
    </p>
    </header>

    <Setup onSetupDataChange={(data) => {
    const complete = Array.isArray(data) &&
    data.every(item => item.val !== null);

    if (complete) {
onComplete?.();
}
}} />
</section>
</div>
);
}
