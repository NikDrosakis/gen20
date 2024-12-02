    window.onload = function() {
    // Build a system
    const ui = SwaggerUIBundle({
    url: "./swagger.json",  // Path to your OpenAPI file
    dom_id: '#swagger-ui',
    presets: [
    SwaggerUIBundle.presets.apis,
    SwaggerUIStandalonePreset
    ],
    layout: "StandaloneLayout"
});
};
