@app.post("/ws_send")
async def ws_receive(notification: dict):
    # Process incoming notification if needed
    # Example: Validate and log the notification
    print("Received notification:", notification)

    # Send to WebSocket server
    await ws_receive(notification)

    return {"status": "Notification received and forwarded"}