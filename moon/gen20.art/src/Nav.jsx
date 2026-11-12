// #name: Nav.jsx
// #title: a typical navigation
// #description: official horizontal navigation bar
// #version: 0.1.3
// #author: Nicolas
// #library: layout

import React, { useState, useEffect, useMemo } from "react";
import { useG } from "./GContext";
import { useTheme } from "./ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import Cookies from "js-cookie";
import { navigate } from "./navigation";
import "./Nav.css";

const getAuth = () => {
    const name = Cookies.get("GENNAME");
    const uid = Cookies.get("GENUID");
    const role = Cookies.get("GENROLE");

    return {
        isLoggedIn: Boolean(name && uid),
        username: name || "",
        isAdmin: role === "admin"
    };
};

// ✅ Keys που ΔΕΝ πρέπει να εμφανίζονται στο menu
// (εμφανίζονται ξεχωριστά ή είναι ειδικά)
const HIDDEN_FROM_MENU = new Set([
    "home",
    "login",
    "signup",
    "logout",
    "dashboard",
    "admin",
]);

export default function Nav() {
    const { G } = useG();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    const [auth, setAuth] = useState(getAuth);

    // ✅ Menu από G.menupages — με τη σειρά του object
    const menuItems = useMemo(() => {
        if (!G?.menupages) return [];

        return Object.entries(G.menupages)
            .filter(([key, title]) => {
                // Skip hidden keys
                if (HIDDEN_FROM_MENU.has(key)) return false;
                // Skip κενά titles
                if (typeof title !== "string") return false;
                if (title.trim() === "") return false;
                return true;
            })
            .map(([key, title]) => ({
                name: key,
                title,
                path: `/${key}`
            }));
    }, [G?.menupages]);

    // Authentication sync
    useEffect(() => {
        const syncAuth = () => setAuth(getAuth());

        syncAuth();

        window.addEventListener("gen20:auth-change", syncAuth);

        return () => {
            window.removeEventListener("gen20:auth-change", syncAuth);
        };
    }, []);

    const handleLogout = () => {
        ["GENNAME", "GENUID", "GENROLE", "GENIMG", "GENGRP"].forEach(name => {
            Cookies.remove(name, { path: "/" });
        });

        setAuth({
            isLoggedIn: false,
            username: "",
            isAdmin: false
        });

        window.dispatchEvent(new Event("gen20:auth-change"));
        navigate("/");
    };

    const handleNavigation = (event, path) => {
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }

        event.preventDefault();
        navigate(path);
    };

    const NavLink = ({ to, children, ...props }) => (
        <a
            href={to}
            onClick={(event) => {
                if (props.target || props.download) {
                    return;
                }

                handleNavigation(event, to);
            }}
            {...props}
        >
            {children}
        </a>
    );

    return (
        <nav className="nav">
            <div className="nav-inner">

                <div className="brand">
                    <NavLink to="/">Website Title</NavLink>
                </div>

                <div className="links">

                    {/* ✅ 1. Όλα τα menuItems από G.menupages — με τη σειρά */}
                    {menuItems.map(item => (
                        <NavLink key={item.name} to={item.path}>
                            {item.title}
                        </NavLink>
                    ))}

                    {/* ✅ 2. Dashboard — αν admin */}
                    {auth.isAdmin && (
                        <a href="/admin">Dashboard</a>
                    )}

                    {/* ✅ 3. Auth state — Welcome/Logout ή Login */}
                    {auth.isLoggedIn ? (
                        <>
                            <span className="welcome-text">
                                Welcome, {auth.username}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <NavLink to="/login">Login</NavLink>
                    )}

                    {/* ✅ 4. Theme toggle — τελευταίο */}
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label="Toggle dark/light mode"
                    >
                        {isDark ? <FaSun /> : <FaMoon />}
                        <span className="toggle-text">
                            {isDark ? "Light" : "Dark"}
                        </span>
                    </button>

                </div>
            </div>
        </nav>
    );
}