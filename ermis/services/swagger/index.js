//Swagger for Ending Points
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger.json");

// Serve Swagger UI
app.use("/ermis/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    explorer: true, // Allows for exploration of endpoints
    swaggerOptions: {
        urls: [
            {
                url: '/swagger.json', // Your swagger.json endpoint
                name: 'ermis API Docs'
            }
        ],
    }
}));