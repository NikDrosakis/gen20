from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from typing import List
import json
router = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Wait for any message sent from GS.vox client
            data = await websocket.receive_text()

            # Example: Handle the received message (forward to other services or process)
            # Assuming the message contains JSON data
            try:
                message_data = json.loads(data)
                print(f"Received message from client: {message_data}")

                # Process the message or send it to another FastAPI route
                response = kronos.generate_text(message_data['prompt'], message_data.get('max_tokens', 100))

                # Respond with the generated output or any processing result
                await websocket.send_text(json.dumps({"output": response}))
            except json.JSONDecodeError:
                await websocket.send_text("Error: Invalid message format.")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Reusing the Kronos instance from earlier example
kronos = Kronos()

@router.post("/generate/")
async def generate_text(request: GenerateRequest):
    if request.provider:
        kronos.set_model_provider(request.provider)
    cached_response = kronos.get_cached_response(request.prompt)
    if cached_response:
        return {"output": cached_response, "cached": True}

    try:
        output = kronos.generate_text(request.prompt, request.max_tokens)
        kronos.cache_response(request.prompt, output)
        return {"output": output, "cached": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
