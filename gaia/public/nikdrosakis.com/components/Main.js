// components/Main.js
import React, { useEffect, useState } from 'react';
import NavBar from './NavBar'; // Adjust import according to your structure
import Footer from './Footer'; // Adjust import according to your structure
import FallbackSpinner from './FallbackSpinner'; // Adjust import according to your structure
import Home from '../pages/Home';
import endpoints from '../constants/endpoints';
import dynamic from 'next/dynamic';


function Main() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(process.env.NEXT_PUBLIC_HTTP_API + endpoints.routes, {
                    method: 'GET',
                });
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    if (!data) {
        return <FallbackSpinner />; // Show loading spinner while fetching data
    }

    return (
        <div className="Main">
            <NavBar />
            <main className="main">
                {/* Render Home component */}
                <Home />
                {/* Render dynamic routes based on fetched data */}
                {data.sections.map((dat) => {
                    const DynamicPage = dynamic(() => import('../pages/' + dat.component), {
                        loading: () => <FallbackSpinner />,
                    });

                    return (
                        <div key={dat.headerTitle}>
                            {/* If you want to include a header for each dynamic page */}
                            <h2>{dat.headerTitle}</h2>
                            <DynamicPage header={dat.headerTitle} />
                        </div>
                    );
                })}
            </main>
            <Footer />
        </div>
    );
}

export default Main;
