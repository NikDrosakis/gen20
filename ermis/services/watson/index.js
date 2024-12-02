const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

const assistant = new AssistantV1({
    version: '2021-06-14',
    authenticator: new IamAuthenticator({
        apikey: 'YOUR_API_KEY', // Replace with your API key
    }),
    serviceUrl: 'YOUR_SERVICE_URL', // Replace with your service URL
});

const assistantId = 'YOUR_ASSISTANT_ID'; // Replace with your assistant ID

document.getElementById('chat-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        const userInput = event.target.value;
        sendMessage(userInput);
        event.target.value = '';
    }
});

async function sendMessage(text) {
    try {
        const response = await assistant.message({
            assistantId: assistantId,
            sessionId: 'YOUR_SESSION_ID', // Replace with your session ID
            input: {
                'message_type': 'text',
                'text': text
            }
        });

        const messages = response.result.output.generic;
        displayMessage(text, 'user');
        messages.forEach(msg => {
            if (msg.response_type === 'text') {
                displayMessage(msg.text, 'bot');
            }
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

function displayMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    messageElement.className = `message ${type}-message`;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('chat-container').scrollTop = document.getElementById('chat-container').scrollHeight;
}
