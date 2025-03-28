import websockets
import asyncio
import json

async def ai_websocket_client(prompt: str, max_tokens: int = 100):
    """Communicates with AI via WebSocket and returns the response."""
    uri = "wss://vivalibro.com:3010/"  # The WebSocket URL of the AI service

    async with websockets.connect(uri) as websocket:
        # Create and send the message (e.g., prompt for AI text generation)
        message = json.dumps({
            "prompt": prompt,
            "max_tokens": max_tokens
        })

        await websocket.send(message)

        # Wait and receive the AI's response
        response = await websocket.recv()
        ai_data = json.loads(response)

        return ai_data["output"]
