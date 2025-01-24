// Skills.js
import React from 'react';
import dynamic from 'next/dynamic'; // Ensure you're importing dynamic from next/dynamic
import Header from './Header';
import FallbackSpinner from './FallbackSpinner';

// Lazy load the Skillset component
const Skillset = dynamic(() => import('/var/www/gs/cubos/Skillset/Skillset.js'), {
    loading: () => <FallbackSpinner />, // Show a loading spinner while the component is being loaded
});

const Skills = (props) => {
    const { header } = props;

    return (
        <>
            <Header title={header} /> {/* Render the Header with the given title */}
            <Skillset header={header} /> {/* Render the dynamically loaded Skillset component */}
        </>
    );
};

export default Skills;
