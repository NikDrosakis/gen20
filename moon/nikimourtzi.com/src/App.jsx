// App.jsx — manifest-driven lazy routing
import { Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import Footer from "./Footer";
import ErrorBoundary from "./ErrorBoundary";
import { ThemeProvider } from "./ThemeContext";
import { useManifest } from "./ManifestContext";
import "./App.css";

// lazy registry: όλα τα *.jsx (τα pages φορτώνονται on-demand)
const modules = import.meta.glob("./*.jsx");
const REGISTRY = {};
for (const [path, loader] of Object.entries(modules)) {
    const name = path.split("/").pop().replace(/\.jsx$/, "");
    REGISTRY[name] = lazy(loader);
}

export default function App() {
    const { pathname } = useLocation();
    const { manifest, loading } = useManifest();

    const segments = pathname.split("/").filter(Boolean);
    const PAGES = manifest?.pages || {};

    let key = "home";
    const props = {};

    if (segments.length === 0) {
        key = "home";
    } else if (segments.length >= 2 && segments[0] === "post") {
        key = "postOne";            // ContentOne
        props.name = segments[1];
    } else if (segments.length === 1) {
        const seg = segments[0];
        const lower = seg.toLowerCase();
        key = PAGES[seg] ? seg : (PAGES[lower] ? lower : "home");
    }

    if (loading) {
        return <div className="page-loading">Loading…</div>;
    }

    const pageDef = PAGES[key] || PAGES.home;
    const Comp = pageDef ? REGISTRY[pageDef.page] : null;

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <Navigation />
                <Suspense fallback={<div className="page-loading">Loading…</div>}>
                    {Comp ? <Comp {...props} /> : <div>Not found</div>}
                </Suspense>
                <Footer />
            </ThemeProvider>
        </ErrorBoundary>
    );
}
