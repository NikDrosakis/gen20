import asyncio
import websockets
import json

class WSClient:
    def __init__(self, uri: str):
        self.uri = uri
        self.websocket = None

    async def connect(self):
        """Establish WebSocket connection."""
        try:
            self.websocket = await websockets.connect(self.uri)
            print(f"Connected to {self.uri}")
        except Exception as e:
            print(f"Error connecting to WebSocket server: {e}")

    async def send_message(self, message: dict):
        """Send a message to the WebSocket server."""
        if self.websocket is None:
            print("WebSocket is not connected.")
            return

        try:
            await self.websocket.send(json.dumps(message))
            print(f"Message sent: {message}")
        except Exception as e:
            print(f"Error sending message: {e}")

    async def receive_message(self):
        """Receive a message from the WebSocket server."""
        if self.websocket is None:
            print("WebSocket is not connected.")
            return
        try:
            message = await self.websocket.recv()
            print(f"Message received: {message}")
            return json.loads(message)
        except Exception as e:
            print(f"Error receiving message: {e}")
            return None

    async def close(self):
        """Close the WebSocket connection."""
        if self.websocket is not None:
            await self.websocket.close()
            print("WebSocket connection closed.")
        else:
            print("No WebSocket connection to close.")
