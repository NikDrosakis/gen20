import React from "react";

/**
 * Home is the default composition.
 * It is not a CMS page and has no page record.
 * Its only content is the Cubos declared in moon_manifest.json.
 */
export default function Home({ cubos = [], renderCubos }) {
    return (
        <div className="gen-home" data-composition="home">
            {typeof renderCubos === "function" ? renderCubos(cubos) : null}
        </div>
    );
}
