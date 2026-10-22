import React, { useMemo } from 'react';
import Header from "./Header";
import Footer from "./Footer";
import { useG } from "../contexts/GContext";
import Telegram from "../components/Telegram";

export default function Skeleton({ children }) {
    const { G } = useG();
    const PAGECUBO = G?.PAGECUBO || {};
    console.log("PAGECUBO:", PAGECUBO);

    const hasLeftSidebar = PAGECUBO.sl && PAGECUBO.sl.length > 0;
    const hasRightSidebar = PAGECUBO.sr && PAGECUBO.sr.length > 0;
    const hasFooter = PAGECUBO.f && PAGECUBO.f.length > 0;

    const mainpageWidthClass = useMemo(() => {
        if (!hasLeftSidebar && !hasRightSidebar) return "w-full";        // 100%
        if (!hasLeftSidebar || !hasRightSidebar) return "w-4/5";         // 80%
        return "w-3/5";                                                  // 60%
    }, [hasLeftSidebar, hasRightSidebar]);

    return (
        <div id="container" className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1" id="main-content">
                {hasLeftSidebar && (
                    <aside id="sidebar-left" className="w-64 bg-gray-100 p-4 border-r">
                        {PAGECUBO.sl.map((cubo, i) => (
                            <div key={i} className="cubo mb-4">
                                {JSON.stringify(cubo)}
                            </div>
                        ))}
                    </aside>
                )}
                <main
                    className={`${mainpageWidthClass} p-6 overflow-auto`}
                >
                    {children}
                </main>
                {hasRightSidebar && (
                    <aside id="sidebar-right" className="w-64 bg-gray-50 p-4 border-l">
                        {PAGECUBO.sr.map((cubo, i) => (
                            <div key={i} className="cubo mb-4">
                                {JSON.stringify(cubo)}
                            </div>
                        ))}
                    </aside>
                )}
            </div>
            {hasFooter && <Footer />}
            <Telegram />
        </div>
    );
}
