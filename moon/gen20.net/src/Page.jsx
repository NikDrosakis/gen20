import React from "react";

/**
 * Generic manifest-driven page.
 * Page content is composed only from Cubos.
 */
export default function Page({ page: pageConfig, renderCubos }) {
    const cubos = Array.isArray(pageConfig?.cubos)
        ? pageConfig.cubos
        : [];

    return (
        <div
            className="gen-page"
            data-page-id={pageConfig?.id || ""}
        >
            {typeof renderCubos === "function" ? renderCubos(cubos) : null}
        </div>
    );
}
