// src/Nav.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { useG } from "./GContext";
import { useManifest } from "./ManifestContext";
import "./Nav.css";

// --- helpers (παίρνουν PAGES ως όρισμα, όχι module-scope) ---

const inMenu = (key, PAGES) =>
    key !== "notFound" && !key.includes("*") && PAGES[key].menu !== false;

const findParent = (key, keys) => {
    const parts = key.split("/");
    while (parts.length > 1) {
        parts.pop();
        const p = parts.join("/");
        if (keys.has(p)) return p;
    }
    return null;
};

const bySort = (a, b, PAGES) =>
    (PAGES[a.key].sort ?? 0) - (PAGES[b.key].sort ?? 0);

const buildMenu = (PAGES, HOME) => {
    const keys = Object.keys(PAGES).filter((k) => inMenu(k, PAGES));
    const set = new Set(keys);
    const nodes = {};

    keys.forEach((key) => {
        const page = PAGES[key];
        nodes[key] = {
            key,
            label: page.label || page.title || key,
            path: key === HOME ? "/" : `/${key}`,
            children: [],
        };
    });

    const roots = [];
    keys.forEach((key) => {
        const parent = findParent(key, set);
        (parent ? nodes[parent].children : roots).push(nodes[key]);
    });

    const sortTree = (list) => {
        list.sort((a, b) => bySort(a, b, PAGES));
        list.forEach((n) => sortTree(n.children));
    };
    sortTree(roots);
    return roots;
};

const isActive = (item, activeKey) =>
    item.key === activeKey || item.children.some((c) => isActive(c, activeKey));

export default function Nav() {
    const { pathname } = useLocation();
    const { G } = useG();
    const { manifest } = useManifest();

    const lang = G?.lang || Cookies.get("lang") || "el";

    const PAGES = manifest?.pages || {};
    const HOME = Object.keys(PAGES)[0];
    const activeKey = pathname.split("/").filter(Boolean).join("/") || HOME;

    const [menuOpen, setMenuOpen] = useState(false);

    const userid = Cookies.get("GENUID");
    const myimg = Cookies.get("GENIMG");
    const myname = Cookies.get("GENNAME");
    const myrole = Cookies.get("GENROLE");
    const isAdmin = (myrole === "admin" || myrole === "1") && !!userid;

    // χτίσιμο μενού όταν αλλάξει το manifest
    const MENU = useMemo(() => buildMenu(PAGES, HOME), [manifest]);

    // κλείνει το mobile menu σε κάθε αλλαγή σελίδας
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // κλείνει στο scroll
    useEffect(() => {
        if (!menuOpen) return;
        const close = () => setMenuOpen(false);
        window.addEventListener("scroll", close);
        return () => window.removeEventListener("scroll", close);
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/v1/local/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const json = await res.json();

            if (json.success) {
                ["GENUID", "GENIMG", "GENNAME", "GENROLE"].forEach((c) =>
                    Cookies.remove(c, { path: "/" })
                );
                window.location.href = "/";
            } else {
                alert("Logout failed: " + (json.data?.error || "Unknown error"));
            }
        } catch (e) {
            alert("Logout error: " + e.message);
        }
    };

    const renderItem = (item) => {
        const active = isActive(item, activeKey);

        if (userid && item.key === "login") {
            return (
                <li key={item.key} className={active ? "active" : ""}>
                    <button className="bare" onClick={handleLogout}>
                        {lang === "el" ? "Αποσύνδεση" : "Logout"}
                    </button>
                </li>
            );
        }

        return (
            <li key={item.key} className={active ? "active" : ""}>
                <Link to={item.path}>{item.label}</Link>
                {item.children.length > 0 && (
                    <ul className="dropdown">{item.children.map(renderItem)}</ul>
                )}
            </li>
        );
    };

    const menu = useMemo(
        () => MENU.map(renderItem),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [MENU, activeKey, userid, lang]
    );

    return (
        <div className="col-lg-10">
            <div className="header__nav__option">
                <button
                    id="mobileMenuToggle"
                    className="mobile-menu-toggle"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Toggle Menu"
                >
                    &#9776;
                </button>

                <nav className={`header__nav__menu ${menuOpen ? "active" : ""}`}>
                    <ul>
                        {menu}

                        {isAdmin && (
                            <li key="admin">
                                <a href="/admin/page">📊 Admin Panel</a>
                            </li>
                        )}

                        {userid && (
                            <li key="profile">
                                <Link to={`/profile?name=${encodeURIComponent(myname || "")}`}>
                                    <img
                                        className="navicon"
                                        src={`${window.location.origin}/media/${myimg}`}
                                        alt="Profile"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/assets/default-avatar.png";
                                        }}
                                    />
                                </Link>
                            </li>
                        )}

                        <li key="language">
                            <LanguageSelector currentLang={lang} />
                        </li>
                        <li key="theme">
                            <ThemeToggle />
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}