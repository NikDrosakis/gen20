connected_clients = []

async def notify_clients(notification):
    if connected_clients:  # Only send if there are connected clients
        for client in connected_clients:
            try:
                await client.send(json.dumps(notification))
            except Exception as e:
                print(f"Error sending notification: {e}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Message received from client: {data}")  # Echo the received message
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print("Client disconnected")