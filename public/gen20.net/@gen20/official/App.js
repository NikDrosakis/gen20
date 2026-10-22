import React, { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import DB from "./contexts/DB";
import Skeleton from "./layouts/Skeleton";
import Head from "./layouts/Head";
import { useG } from './contexts/GContext';
import Gen from "./contexts/Gen";

const App = () => {
    const { G } = useG();

    const path = window.location.pathname.split('/')[1] || 'home';
    const lang = Gen.coo('lang') || "el";
    const routeConfig = useMemo(() => {
        if (!G?.menupages) return [];
        return Object.entries(G.menupages)
            .filter(([path, page]) => page && typeof page === "string")
            .map(([pathKey, pageName]) => {
                const cleanedPath = pathKey.charAt(0).toUpperCase() + pathKey.slice(1).replace(/\s+/g, '');
                return {
                    path: `/${pathKey === "home" ? "" : pathKey}`,
                    component: lazy(() => import(`./pages/${cleanedPath}`))
                };
            });
    }, [G]);


    console.log(G.publicdb);
    console.log(G.menupages);
    console.log(G.PAGECUBO);
    useEffect(() => {
        const loadData = async () => {
            const res = await DB.fetchPost(path);
            console.log("Localized post", res);
        };
        loadData();
    }, [lang, path]);


    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Skeleton>
            <Routes>
                {routeConfig.length === 0 ? (
                    <Route path="*" element={<div>Loading menu...</div>} />
                ) : (
                    routeConfig.map(({ path, component: Component }) => (
                        <Route
                            key={path}
                            path={path}
                            element={
                                <>
                                    <Head />  {/* <-- inside route rendering */}
                                    <Component lang={lang} path={path} />
                                </>
                            }
                        />
                    ))
                )}
            </Routes>
            </Skeleton>
        </Suspense>
    );
};

export default App;
