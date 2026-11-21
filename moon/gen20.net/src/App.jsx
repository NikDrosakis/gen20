// src/App.jsx
import { useLocation } from "react-router-dom";
import { useG } from "./GContext";
import { useManifest } from "./ManifestContext";
import Area, { toItems } from "./Area";
import Header from "./Header";
import Footer from "./Footer";
import "./App.css";

export default function App() {
    const { pathname } = useLocation();
    const { G } = useG();
    const { manifest, loading, error } = useManifest();

    if (loading && !manifest) return <div className="gen-loading">Loading…</div>;
    if (error && !manifest) return <div className="gen-page-not-found">Manifest error: {error}</div>;
    if (!manifest) return <div className="gen-page-not-found">No manifest</div>;

    const PAGES = manifest.pages || {};
    const FIRST = Object.keys(PAGES)[0];
    const uri = pathname.split("/").filter(Boolean).join("/");
    const segments = uri.split("/");
    const key = uri || FIRST;

    // Routing: first level = classification/page, second level = ContentOne (post).
    // (ContentOne διαβάζει μόνο του το slug από το URL)
    let page;
    if (segments.length >= 2) {
        page = { ...(PAGES[segments[0]] || {}), m: [{ contentOne: {} }] };
    } else {
        page = PAGES[key] || PAGES.notFound;
    }
    page = page || PAGES.notFound;

    if (!page) return <div className="gen-page-not-found">Not found: {uri}</div>;

    const h = toItems(page.h),
        sl = toItems(page.sl),
        m = toItems(page.m),
        sr = toItems(page.sr),
        f = toItems(page.f);

    const width =
        sl.length && sr.length ? "w-3/5" : sl.length || sr.length ? "w-4/5" : "w-full";

    return (
        <div id="container" data-page={key} data-lang={G?.lang || "el"}>
            <Header cubos={h} />
            <div className="gen-page-body">
                <Area items={sl} area="sl" />
                <main id="main-content" className={`gen-area-main ${width}`}>
                    <Area items={m} area="m" />
                </main>
                <Area items={sr} area="sr" />
            </div>
            <Footer cubos={f} />
        </div>
    );
}