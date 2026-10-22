import React, { useEffect, useState } from 'react';

export default function Menu() {
    const [menuHTML, setMenuHTML] = useState('');

    useEffect(() => {
        // Fetch the menu HTML from the API
        fetch('https://gen20.gr/cubos/index.php?cubo=menuweb&file=public.php')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text(); // Parse the response as plain text (HTML)
            })
            .then((html) => {
                setMenuHTML(html); // Store the HTML in state
            })
            .catch((error) => console.error('Fetch error:', error));
    }, []);

    return (
        <div
            className="main-nav"
            dangerouslySetInnerHTML={{ __html: menuHTML }}
        ></div>
    );
}