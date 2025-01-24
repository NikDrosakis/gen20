import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import FallbackSpinner from '../components/FallbackSpinner';
import NavBarWithRouter from '../components/NavBar';
import Home from '../pages/Home';
import endpoints from '../constants/endpoints';
import Footer from "../components/Footer";
// Lazy load the Skills component
const Skills = React.lazy(() => import('/var/www/gs/cubos/Skills/Skills.jsx'));

function Main() {
    const [data, setData] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_HTTP_API + endpoints.routes, {
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

    return (
        <div className="Main">
            <NavBarWithRouter />
            <main className="main">
                <Suspense fallback={<FallbackSpinner />}>
                    <Routes>
                        {/* Route for Home */}
                        <Route exact path="/" element={<Home />} />

                        {/* Dynamic routes based on fetched data */}
                        {data && data.sections.map((dat) => {
                            const Page = React.lazy(() => import('./pages/' + dat.component));
                            return (
                                <Route
                                    key={dat.headerTitle}
                                    path={dat.path}
                                    element={<Page header={dat.headerTitle} />}
                                />
                            );
                        })}

                        {/* Route for Skills component */}
                        <Route
                            exact
                            path="/skills"
                            element={React.lazy(() => import('/var/www/gs/cubos/Skills/Skills.js'))}
                        />
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}


export default Main;
