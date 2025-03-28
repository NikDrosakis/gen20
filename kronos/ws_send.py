import asyncio
import websockets
import json

async def ws_send(message):
    uri = "wss://vivalibro.com:3010/?userid=2"  # Ensure this matches your WebSocket server URL and port
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(json.dumps(message))
            print(f"Message sent from Kronos Python: {message}")
    except Exception as e:
        print(f"Error sending message from Kronos Python: {e}")

# Test sending a message
if __name__ == "__main__":
    notification = {
        "type": "activity",
        "data": {
            "active_users": 5,
            "total_books": 280447,
        },
        "timestamp": "2024-10-13T12:34:56Z"
    }
    asyncio.run(ws_send(notification))
