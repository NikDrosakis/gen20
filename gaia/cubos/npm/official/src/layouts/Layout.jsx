import React from 'react';
import Header from "./Header";
import Footer from "./Footer";
//G.MAINCUBO setup with main pages
export default function Layout({ children }) {
    return (
        <div id="container" className="min-h-screen flex flex-col">
            <Header/>
            <div className="flex flex-1" id="main-content">
                <aside id="sidebar-left" className="w-64 bg-gray-100 p-4 border-r">
                    this is sidebar left includes
                </aside>
                <main id="mainpage2" className="flex-1 p-6 bg-white overflow-auto">
                    {children}
                </main>
                <aside id="sidebar-right" className="w-64 bg-gray-50 p-4 border-l">
                    this is sidebar right includes
                </aside>
            </div>
                <Footer />
        </div>
    );
}
