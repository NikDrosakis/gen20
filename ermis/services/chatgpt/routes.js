'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const router = express.Router();
const { PredictionServiceClient } = require('@google-cloud/aiplatform');

// Instantiates a client
const aiplatformClient = new PredictionServiceClient();

// Prediction function to be used with the /predict endpoint
async function predictHandler(req, res) {
    const { text } = req.body;  // Extract 'text' from request body

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = 'europe-west1'; // Replace with your model's region
    const endpointId = 'your-endpoint-id'; // Replace with your actual endpoint ID
    const endpoint = `projects/${projectId}/locations/${location}/endpoints/${endpointId}`;

    // Construct request
    const instances = [{ content: text }]; // Use the text from the request body
    const request = {
        endpoint,
        instances,
    };

    try {
        const [response] = await aiplatformClient.predict(request);
        console.log('Prediction result:', response);
        res.json({ prediction: response });
    } catch (err) {
        console.error('Error during prediction:', err);
        res.status(500).json({ error: err.message });
    }
}

// Define the /predict route
router.post('/predict', predictHandler);

// Export the router
module.exports = router;
