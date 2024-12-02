require('dotenv').config();
const OpenAI = require('openai'); // Import the OpenAI package
const openai = new OpenAI({apikey:"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"}); // Instantiate OpenAI

async function generateCompletion() {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { "role": "user", "content": "write a haiku about ai" }
            ]
        });
        console.log(completion);
    } catch (error) {
        console.error('Error generating completion:', error);
    }
}

// Call the function
generateCompletion();