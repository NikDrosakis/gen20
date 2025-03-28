// services/watson/watson.js

const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

// Create an instance of the Watson Assistant client
const assistant = new AssistantV1({
  version: '2021-06-14', // Use the appropriate version
  authenticator: new IamAuthenticator({
    apikey: process.env.WATSON_APIKEY, // Your Watson API key
  }),
  serviceUrl: process.env.WATSON_URL, // Your Watson service URL
});

const workspaceId = process.env.WATSON_WORKSPACE_ID; // Your Watson workspace ID

// Function to send message to Watson Assistant
async function sendMessage(message) {
  const response = await assistant.message({
    assistantId: workspaceId,
    sessionId: 'your-session-id', // You should manage sessions properly
    input: {
      'message_type': 'text',
      'text': message
    }
  });
  return response.result.output.generic;
}
module.exports = { sendMessage };
