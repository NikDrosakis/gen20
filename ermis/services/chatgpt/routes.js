'use strict';

require('dotenv').config();
const express = require('express');
/**
 * @type {express.Application}
 * Express application object
 */
const app = express();
/**
 * @type {express.Router}
 * Express router object
 */
const router = express.Router();
const { PredictionServiceClient } = require('@google-cloud/aiplatform');

/**
 * @type {PredictionServiceClient}
 * Google Cloud AI Platform Prediction Service Client
 */
// Instantiates a client
const aiplatformClient = new PredictionServiceClient();

/**
 *  Handles prediction requests using Google Cloud AI Platform.
 *  @name post/predict
 *  @route {POST} /predict
 *  @params {
 "text": {
 "type": "string",
 "description": "The text to be used for prediction",
 "in": "body",
 "required": true
 }
 }
 */
async function predictHandler(req, res) {
    /**
     * @type {string}
     * The text to be used for prediction.
     */
    const { text } = req.body;  // Extract 'text' from request body
    /**
     * @type {string}
     * The Google cloud project id
     */
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    /**
     * @type {string}
     * The location of the AI Platform endpoint.
     */
    const location = 'europe-west1'; // Replace with your model's region
    /**
     * @type {string}
     * The AI Platform endpoint id.
     */
    const endpointId = 'your-endpoint-id'; // Replace with your actual endpoint ID
    /**
     * @type {string}
     * The AI Platform endpoint full name.
     */
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
router.stack.push({
    keys: 'post/predict',
    path: '/predict',
    params: {
        "text": {
            "type": "string",
            "description": "The text to be used for prediction",
            "in": "body",
            "required": true
        }
    }
});

// Export the router
module.exports = router;