// Journal.js
import React, { useEffect, useState } from 'react';
import pug from 'pug';
import menuTemplate from './Journal.pug';  // Import the Pug file as a module

export default function Journal() {
    const [menuItems, setMenuItems] = useState([]);

    // Fetch the menu items from the backend API
    useEffect(() => {
        fetch('https://gen20.gr/cubos/index.php?cubo=journal&file=public.php')
            .then((response) => response.json())
            .then((data) => setMenuItems(data))
            .catch((error) => console.error('Error fetching menu items:', error));
    }, []);

    // Compile the Pug template with the fetched menu items
    const htmlOutput = pug.render(menuTemplate, { menuItems });

    return (
        <div
            className="menu-container"
            dangerouslySetInnerHTML={{ __html: htmlOutput }}  // Inject the compiled HTML into the component
        />
    );
}
