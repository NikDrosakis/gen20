// src/App.jsx
// Manifest-driven routing (gen20.net architecture). Header/Footer are gen20.art's own.
import { useLocation } from "react-router-dom";
import { useManifest } from "./ManifestContext";
import Area, { toItems } from "./Area";
import Header from "./Header";
import Footer from "./Footer";
import "./App.css";

export default function App() {
    const { pathname } = useLocation();
    const { manifest, loading, error } = useManifest();

    if (loading && !manifest) return <div className="gen-loading">Loading…</div>;
    if (error && !manifest) return <div className="gen-page-not-found">Manifest error: {error}</div>;
    if (!manifest) return <div className="gen-page-not-found">No manifest</div>;

    const PAGES = manifest.pages || {};
    const FIRST = Object.keys(PAGES)[0];
    const segments = pathname.split("/").filter(Boolean);

    // Routing: first level = classification/page, second level = ContentOne (post).
    let page;
    if (segments.length >= 2) {
        page = { m: [{ contentOne: {} }] };
    } else {
        const key = segments[0] || FIRST;
        page = PAGES[key] || PAGES.notFound;
    }
    if (!page) return <div className="gen-page-not-found">Not found</div>;

    const key = segments[0] || FIRST;
    const sl = toItems(page.sl);
    const m = toItems(page.m);
    const sr = toItems(page.sr);

    const width =
        sl.length && sr.length ? "w-3/5" : sl.length || sr.length ? "w-4/5" : "w-full";

    return (
        <div id="container" data-page={key}>
            <Header />
            <div className="gen-page-body">
                <Area items={sl} area="sl" />
                <main id="main-content" className={`gen-area-main ${width}`}>
                    <Area items={m} area="m" />
                </main>
                <Area items={sr} area="sr" />
            </div>
            <Footer />
        </div>
    );
}
