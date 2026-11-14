// src/Area.jsx
import { Suspense, lazy } from "react";
import ContentOne from "./ContentOne";
import ContentLoop from "./ContentLoop";

// src/cubos/team/Team.jsx → REGISTRY["team"]
const files = import.meta.glob("./cubos/*/*.jsx");
const REGISTRY = {};
for (const [path, loader] of Object.entries(files)) {
    const [, folder, file] = path.match(/\.\/cubos\/([^/]+)\/([^/]+)\.jsx$/) || [];
    if (folder && file.toLowerCase() === folder.toLowerCase()) {
        REGISTRY[folder.toLowerCase()] = lazy(loader);
    }
}

const CONTENT = { contentOne: ContentOne, contentLoop: ContentLoop };

// area (πίνακας ή object με αριθμητικά keys) → [{ kind, name, props }]
export const toItems = (area) => {
    if (!area) return [];
    const list = Array.isArray(area)
        ? area
        : Object.keys(area).sort((a, b) => a - b).map((k) => area[k]);

    return list.flatMap((item) =>
        Object.entries(item).map(([kind, val]) => {
            if (kind === "cubo") {
                const [name, props] = typeof val === "string" ? [val, {}] : Object.entries(val)[0];
                return { kind, name, props };
            }
            return { kind, name: kind, props: val };   // contentOne / contentLoop
        })
    );
};

export default function Area({ items = [], area }) {
    if (!items.length) return null;
    return (
        <div className={`gen-area gen-area-${area}`}>
            <Suspense fallback={null}>
                {items.map((it, i) => {
                    const C = it.kind === "cubo" ? REGISTRY[String(it.name).toLowerCase()] : CONTENT[it.kind];
                    return C ? <C key={`${it.kind}-${it.name}-${i}`} {...(it.props || {})} /> : null;
                })}
            </Suspense>
        </div>
    );
}