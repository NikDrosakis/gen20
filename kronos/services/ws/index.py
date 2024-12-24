import asyncio
import json
from typing import Dict
from redis.asyncio import Redis
from fastapi import WebSocket, WebSocketDisconnect
from core.exceptions import AioredisTimeoutError
from messenger import Messenger  # Import the updated Messenger class

class WSManager:
    def __init__(self, redis_url: str):
        self.connected_clients: Dict[str, WebSocket] = {}
        self.redis_url = redis_url
        self.redis = Redis.from_url(redis_url, decode_responses=True)

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

        # Handle broadcasting or sending messages
        cast = message.get('cast')
        if cast == 'broadcast':
            await self.broadcast_message(message)  # Broadcast to all
        elif cast == 'one':
            recipient_id = message.get('to')
            if recipient_id and recipient_id in self.connected_clients:
                recipient_ws = self.connected_clients[recipient_id]
                await recipient_ws.send_text(json.dumps(message))

        # Handle dynamic message construction through Messenger
        if message.get('type') == 'dynamic':
            try:
                constructed_message = await Messenger.construct_default_message(message)
                if constructed_message:
                    await self.broadcast_message(constructed_message)
            except Exception as e:
                print(f"Error constructing dynamic message: {e}")

        # Example for 'html' type messages
        if message.get('type') == 'html':
            html_content = message.get('html')
            element_id = message.get('id')
            if html_content and element_id:
                await self.broadcast_message({'type': 'html', 'id': element_id, 'html': html_content})

    async def redis_listener(self):
        pubsub = self.redis.pubsub()
        await pubsub.subscribe("broadcast_channel
