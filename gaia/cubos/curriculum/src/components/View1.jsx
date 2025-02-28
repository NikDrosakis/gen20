import React from "react";

const View1 = () => {
    const cuboData = {
        title: "Cubo Example",
        content: "This is a generated Cubo HTML block.",
        html: "<div id='root'></div>"
    };

    if (typeof window === "undefined") {
        // If accessed via API, return JSON
        return new Response(JSON.stringify(cuboData), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // Otherwise, render normal React UI
    return (
        <div>
            <h1>{cuboData.title}</h1>
            <p>{cuboData.content}</p>
        </div>
    );
};

export default View1;
