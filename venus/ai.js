import OpenAI from 'openai';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

import { Configuration, OpenAIApi } from 'openai';
import http from 'http';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

server.on('request', async (req, res) => {
    switch (req.url) {
        case '/':
            const config = {
                model: 'gpt-4',
                stream: true,
                messages: [
                    {
                        content: 'Once upon a time',
                        role: 'user',
                    },
                ],
            };

            try {
                const completion = await openai.chat.completions.create(config);
                res.writeHead(200, {
                    'Content-Type': 'text/plain; charset=utf-8',
                });

                for await (const chunk of completion) {
                    const [choice] = chunk.choices;
                    const { content } = choice.delta;
                    const bufferFull = res.write(content) === false;
                    if (bufferFull) {
                        await new Promise((resolve) => res.once('drain', resolve));
                    }
                }
                res.end();
            } catch (error) {
                console.error(error);
                res.statusCode = 500;
                res.end('Internal Server Error');
            }
            break;

        default:
            res.statusCode = 404;
            res.end();
    }
});
