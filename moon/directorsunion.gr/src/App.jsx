// App.jsx — manifest-driven lazy routing
import { Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import { ThemeProvider } from "./ThemeContext";
import ErrorBoundary from "./ErrorBoundary";
import FootMenu from "./FootMenu";
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
        key = "post";               // ContentOne
        props.name = segments[1];
    } else if (segments.length === 1) {
        const seg = segments[0];
        key = PAGES[seg] ? seg : "blog";   // γνωστό static route, αλλιώς Blog (classification)
        props.classification = seg;
        props.pageName = seg;
    }

    if (loading) {
        return <div className="page-loading">Loading…</div>;
    }

    const pageDef = PAGES[key] || PAGES.home;
    const Comp = pageDef ? REGISTRY[pageDef.page] : null;

    return (
        <ErrorBoundary>
            <ThemeProvider>
                <Header />
                <Suspense fallback={<div className="page-loading">Loading…</div>}>
                    {Comp ? <Comp {...props} /> : <div>Not found</div>}
                </Suspense>
                <FootMenu />
            </ThemeProvider>
        </ErrorBoundary>
    );
}
