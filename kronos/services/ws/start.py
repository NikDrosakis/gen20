import asyncio
import json
from typing import Dict
import aioredis
from fastapi import WebSocket, WebSocketDisconnect
from core.exceptions import AioredisTimeoutError

class WSManager:
    def __init__(self, redis_url: str):
        self.connected_clients: Dict[str, WebSocket] = {}
        self.redis_url = redis_url

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.connected_clients[client_id] = websocket
        try:
            while True:
                data = await websocket.receive_text()
                await self.handle_message(websocket, client_id, data)
        except WebSocketDisconnect:
            del self.connected_clients[client_id]
            print(f"Client {client_id} disconnected.")

    async def handle_message(self, websocket: WebSocket, client_id: str, data: str):
        try:
            message = json.loads(data)
        except json.JSONDecodeError:
            print("Error: Invalid JSON data received.")
            return

        if message.get('type') == 'PING':
            await websocket.send_text(json.dumps({'type': 'PONG'}))
            return

        # Add your logic for different message types from ws.js
        cast = message.get('cast')
        if cast == 'broadcast':
            await self.broadcast_message(message)  # Broadcast to all
        elif cast == 'one':
            recipient_id = message.get('to')
            if recipient_id and recipient_id in self.connected_clients:
                recipient_ws = self.connected_clients[recipient_id]
                await recipient_ws.send_text(json.dumps(message))

        # --- Example logic for "N" type messages (counters) ---
        if message.get('type') == 'N':
            try:
                counters = await self.get_counters()
                await self.broadcast_message({'type': 'N', 'text': counters, 'class': "c_square cblue"})
            except Exception as e:
                print(f"Error getting counters: {e}")

        # --- Add other message type handling logic from ws.js here ---
        # Example for 'html' type:
        if message.get('type') == 'html':
            html_content = message.get('html')
            element_id = message.get('id')
            if html_content and element_id:
                await self.broadcast_message({'type': 'html', 'id': element_id, 'html': html_content})

    # Example placeholder for getting counters (replace with your actual logic)
    async def get_counters(self):
        # ... (Your logic to fetch counter data, e.g., from Redis or a database) ...
        return {"example_counter": 10}

    async def redis_listener(self):
        redis = await aioredis.from_url(self.redis_url, decode_responses=True)  # Create connection once
        pubsub = redis.pubsub()
        await pubsub.subscribe("broadcast_channel")

        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True)
                if message is not None:
                    try:
                        data = json.loads(message["data"])
                        await self.broadcast_message(data)
                    except json.JSONDecodeError:
                        print(f"Invalid JSON message received: {message['data']}")
        except AioredisTimeoutError as e:
            print(f"Redis timeout error: {e}")
        finally:
            await pubsub.unsubscribe("broadcast_channel") # Unsubscribe when done
            await redis.close() # Close the connection gracefully

    async def broadcast_message(self, message: dict):
        for client_id, ws in self.connected_clients.items():
            await ws.send_text(json.dumps(message))

    async def start_listener(self):
        asyncio.create_task(self.redis_listener())