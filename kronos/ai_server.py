from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import List
import asyncio
import json

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, websocket: WebSocket, message: str):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive the message from the GS.vox client
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Process the message, communicate with AI, and forward the response
            ai_response = await communicate_with_ai(message_data)

            # Send the AI response back to the client via WebSocket
            await manager.send_message(websocket, json.dumps(ai_response))

    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def communicate_with_ai(message_data):
    """This function routes messages to the appropriate AI service via FastAPI WebSocket client."""
    # Example message structure (adjust based on actual AI routing):
    prompt = message_data.get("prompt", "")
    max_tokens = message_data.get("max_tokens", 100)

    # Send the prompt to the AI WebSocket client and receive a response
    ai_response = await ai_websocket_client(prompt, max_tokens)

    return {"output": ai_response}

