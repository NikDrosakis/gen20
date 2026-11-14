import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Home from "./Home";
import Page from "./Page";
import { useG } from "./GContext";

import "./Aggregator.css";

const SYSTEM = "moon";
const VERSION = "1.0.0";
const MANIFEST_URL = "/data/moon_manifest.json";

/**
 * Cubo registry.
 *
 * Installed Cubos are registered here.
 * The page manifest stores instances/configuration, not implementation code.
 */
const COMPONENTS = Object.freeze({});

const normalizePath = (pathname = "/") => {
    let decoded = pathname;

    try {
        decoded = decodeURIComponent(pathname);
    } catch {
        // Keep the original path if a malformed escape sequence is present.
    }

    const segments = decoded.split("/").filter(Boolean);
    return segments.length ? `/${segments.join("/")}` : "/";
};

const matchPattern = (pattern, pathname) => {
    const patternParts = normalizePath(pattern).split("/").filter(Boolean);
    const pathParts = normalizePath(pathname).split("/").filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};

    for (let index = 0; index < patternParts.length; index += 1) {
        const expected = patternParts[index];
        const actual = pathParts[index];

        if (expected.startsWith(":")) {
            params[expected.slice(1)] = actual;
            continue;
        }

        if (expected !== actual) return null;
    }

    return params;
};

const routeSpecificity = (route) => {
    const parts = normalizePath(route.pattern).split("/").filter(Boolean);
    const staticSegments = parts.filter(part => !part.startsWith(":")).length;

    return staticSegments * 100 + parts.length;
};

/**
 * Resolve the current URL exclusively from moon_manifest.json.
 *
 * Home is a special default composition, not an entry in pages.
 * Regular pages are keyed by slug or normalized relative path.
 */
export const resolveRoute = (manifest, pathname) => {
    const path = normalizePath(pathname);
    const routes = Array.isArray(manifest?.routing?.routes)
        ? [...manifest.routing.routes]
        : [];

    routes.sort((a, b) => routeSpecificity(b) - routeSpecificity(a));

    for (const route of routes) {
        const params = matchPattern(route.pattern, path);
        if (!params) continue;

        if (route.type === "home") {
            return {
                type: "home",
                route,
                params,
                page: manifest.home || { cubos: [] },
            };
        }

        if (route.type === "page") {
            const pageKey = route.page
                || (route.pageKey === "path"
                    ? path.slice(1)
                    : params[route.pageKey || "slug"]);

            const pageConfig = manifest.pages?.[pageKey];

            if (pageConfig) {
                return {
                    type: "page",
                    route,
                    params,
                    page: pageConfig,
                };
            }

            return {
                type: "notFound",
                route,
                params,
                page: null,
            };
        }
    }

    return {
        type: "notFound",
        route: null,
        params: {},
        page: null,
    };
};

export default function Aggregator({ className = "" }) {
    const location = useLocation();
    const { lang: contextLang } = useG();

    const [manifest, setManifest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const loadManifest = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(MANIFEST_URL, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                    cache: "no-cache",
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Manifest request failed: HTTP ${response.status}`);
                }

                const data = await response.json();

                if (!data || typeof data !== "object" || !data.routing) {
                    throw new Error("Invalid moon_manifest.json: routing is required.");
                }

                setManifest(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("[Moon Aggregator]", err);
                    setError(err.message || "Unable to load site manifest.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        loadManifest();

        return () => controller.abort();
    }, []);

    const lang = useMemo(() => {
        const supported = manifest?.site?.languages || [];
        const requested = contextLang || manifest?.site?.defaultLanguage || "el";

        return supported.includes(requested)
            ? requested
            : (manifest?.site?.defaultLanguage || "el");
    }, [contextLang, manifest]);

    const route = useMemo(
        () => manifest ? resolveRoute(manifest, location.pathname) : null,
        [manifest, location.pathname]
    );

    const renderCubos = useCallback((cubos = []) => {
        if (!Array.isArray(cubos)) return null;

        return cubos.map((cubo, index) => {
            if (!cubo || cubo.enabled === false) return null;

            const componentName = cubo.component || cubo.name;
            const Component = COMPONENTS[componentName];

            if (!Component) {
                if (import.meta.env.DEV) {
                    console.warn(
                        `[Moon Aggregator] Cubo component "${componentName}" is not registered.`,
                        cubo
                    );
                }
                return null;
            }

            return (
                <Component
                    key={cubo.id || `${componentName || "cubo"}-${index}`}
                    cubo={cubo}
                    config={cubo.config || {}}
                    lang={lang}
                    route={route}
                    system={SYSTEM}
                />
            );
        });
    }, [lang, route]);

    const messages = manifest?.i18n?.[lang] || manifest?.i18n?.el || {};

    if (loading) {
        return (
            <div className="moon-aggregator-state" role="status">
                {messages.loading || "Loading..."}
            </div>
        );
    }

    if (error || !manifest) {
        return (
            <div className="moon-aggregator-error" role="alert">
                {error || "Unable to load site manifest."}
            </div>
        );
    }

    let content = null;

    if (route?.type === "home") {
        content = (
            <Home
                cubos={route.page?.cubos || []}
                renderCubos={renderCubos}
            />
        );
    } else if (route?.type === "page") {
        content = (
            <Page
                page={route.page}
                renderCubos={renderCubos}
            />
        );
    } else {
        content = (
            <div className="moon-not-found" role="status">
                {messages.notFound || "Page not found."}
            </div>
        );
    }

    return (
        <div
            className={`gen-cubo-aggregator ${className}`.trim()}
            data-system={SYSTEM}
            data-version={VERSION}
            data-route={route?.route?.id || route?.type || "unknown"}
            data-lang={lang}
        >
            {content}
        </div>
    );
}

export { SYSTEM, VERSION, COMPONENTS, normalizePath, matchPattern };
