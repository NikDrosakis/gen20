
import React from "react";

import manifest from "./manifest.json";
import installed from "./installed.json";

import Hello from "./Hello.jsx";

// ============================================================
// GEN20 CUBO AGGREGATOR
// ============================================================

const SYSTEM = "moon";
const VERSION = "1.0.0";

const COMPONENTS = {
    hello: Hello,
};

// ============================================================
// MANIFEST / INSTALLED
// ============================================================

const MANIFEST = manifest || {};
const INSTALLED = installed || {};

const MANIFEST_CUBOS = Array.isArray(MANIFEST.cubos)
    ? MANIFEST.cubos
    : [];

const INSTALLED_CUBOS = INSTALLED.cubos || {};

// ============================================================
// HELPERS
// ============================================================

const getInstalled = (name) => {
    const item = INSTALLED_CUBOS[name];

    if (typeof item === "boolean") {
        return item;
    }

    return item?.installed === true;
};

const getComponent = (name) => COMPONENTS[name] || null;

const normalizeCubo = (cubo) => {
    const name = cubo.name;

    const installedState = getInstalled(name);
    const Component = getComponent(name);

    return {
        name,
        enabled: cubo.enabled === true,
        installed: installedState,
        available: Boolean(Component),

        location: cubo.location || null,
        package: cubo.package || null,

        register: cubo.register || null,
        register_line: cubo.register_line || null,
        signature: cubo.signature || null,

        endpoints: cubo.endpoints || [],
        files: cubo.files || [],

        aggregator_line:
            INSTALLED_CUBOS[name]?.aggregator_line || null,

        Component,
    };
};

// ============================================================
// REGISTRY
// ============================================================

const CUBOS = MANIFEST_CUBOS.map(normalizeCubo);

const ACTIVE_CUBOS = CUBOS.filter(
    cubo =>
        cubo.enabled &&
        cubo.installed &&
        cubo.available
);

const DISABLED_CUBOS = CUBOS.filter(
    cubo => !cubo.enabled
);

const NOT_INSTALLED_CUBOS = CUBOS.filter(
    cubo => cubo.enabled && !cubo.installed
);

const MISSING_COMPONENTS = CUBOS.filter(
    cubo => cubo.enabled && cubo.installed && !cubo.available
);

// ============================================================
// AGGREGATOR
// ============================================================

export default function Aggregator({
                                       cubos = ACTIVE_CUBOS,
                                       system = SYSTEM,
                                       className = "",
                                       props = {},
                                   }) {
    return (
        <div
            className={`gen-cubo-aggregator ${className}`}
            data-system={system}
            data-version={VERSION}
        >
            {cubos.map(cubo => {
                const Component = cubo.Component;

                if (!Component) return null;

                return (
                    <Component
                        key={cubo.name}
                        {...props}
                        cubo={cubo}
                        system={system}
                    />
                );
            })}
        </div>
    );
}

// ============================================================
// PUBLIC API
// ============================================================

export {
    SYSTEM,
    VERSION,

    MANIFEST,
    INSTALLED,

    CUBOS,
    ACTIVE_CUBOS,
    DISABLED_CUBOS,
    NOT_INSTALLED_CUBOS,
    MISSING_COMPONENTS,

    getInstalled,
    getComponent,
    normalizeCubo,
};
