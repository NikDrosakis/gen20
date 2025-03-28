'use strict';
require('dotenv').config();

function main(endpoint, text) {
    // Imports the Aiplatform library
    const { PredictionServiceClient } = require('@google-cloud/aiplatform');
    // Instantiates a client
    const aiplatformClient = new PredictionServiceClient();

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const modelId = 'gemini-1.0-pro'; // Replace with your actual model ID
    const location = 'europe-west1'; // Replace with your model's region
    const endpointId = 'predict'; // Replace with your endpoint ID
    //const endpoint = `projects/${projectId}/locations/${location}/endpoints/${endpointId}`;

    // Run request
    async function callPredict() {
        // Construct request
        const instances = [{ content: text }]; // Use the text argument here
        const request = {
            endpoint,
            instances,
        };

        try {
            const [response] = await aiplatformClient.predict(request);
            console.log(response);
        } catch (err) {
            console.error('Error during prediction:', err);
        }
    }

    callPredict();
}

process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
});

// Call main with the command-line arguments
main(...process.argv.slice(2));
