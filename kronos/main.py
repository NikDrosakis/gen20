import asyncio
import logging
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from core.Mari import Mari
from datetime import datetime
from core.WS import WSClient
import os
import io

# --------------------------------------------------
# Logging
# --------------------------------------------------

log_file_path = '/var/www/gs/data/gen20.net/kronos.txt'
log_file = open(log_file_path, 'a')
logger = logging.getLogger('kronos')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(io.StringIO())
logger.addHandler(handler)


def log(message, level=logging.INFO, **extra):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    extra_str = ' '.join(f'{k}={v}' for k, v in extra.items())
    log_message = f'[{timestamp}] [{level}] {message}'
    if extra_str:
        log_message += f' | {extra_str}'
    log_message += '\n'

    log_file.write(log_message)
    log_file.flush()

    if os.getenv('KRONOS_LOGGING_ENABLED') == 'true':
        logger.log(level, message)


# --------------------------------------------------
# Services
# --------------------------------------------------

from services.deepseek.routes import router as deepseek_route
from services.gaia.routes import router as gaia_route
from services.sketch.routes import router as sketch_route


# --------------------------------------------------
# App
# --------------------------------------------------

app = FastAPI(
    title="Kronos API",
    docs_url="/apy/v1/docs",
    redoc_url="/apy/v1/redoc",
    openapi_url="/apy/v1/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(deepseek_route, prefix="/apy/v1/deepseek")
app.include_router(gaia_route, prefix="/apy/v1/gaia")
app.include_router(sketch_route, prefix="/apy/v1/sketch")


# --------------------------------------------------
# WebSocket client (persistent) — μιλάει με god
# --------------------------------------------------

_ws_client = None
_ws_connected = False


def _make_cid(a: str, b: str) -> str:
    """Conversation ID — αλφαβητικά, ίδιο και για τις δύο κατευθύνσεις."""
    return f"{a}-{b}" if a < b else f"{b}-{a}"


async def ws_loop():
    """Persistent WebSocket — μένει ανοιχτό, reconnect σε αποτυχία."""
    global _ws_client, _ws_connected

    while True:
        try:
            log("WS connecting", event="ws.connect")
            _ws_client = WSClient(uri=settings.WEBSOCKET_URL)
            await _ws_client.connect()
            _ws_connected = True
            log("WS connected", event="ws.connected")

            # Στείλε "hello"
            hello = {
                "type": "message",
                "cid": _make_cid("kronos:1", "god:1"),
                "uid": "kronos:1",
                "c": "kronos is online",
                "modified": int(datetime.now().timestamp())
            }
            await _ws_client.send_message(hello)
            log(f"WS out: {hello}", event="ws.out")

            # Loop — διάβασε μηνύματα
            while True:
                msg = await _ws_client.receive_message()
                log(f"WS in: {msg}", event="ws.in")

                if not isinstance(msg, dict):
                    continue

                msg_type = msg.get("type", "")
                msg_uid = msg.get("uid", "")
                msg_cid = msg.get("cid", "")
                msg_text = msg.get("c", "")

                # Αν είναι "ask" → απάντησε
                if msg_type == "ask":
                    reply = {
                        "type": "message",
                        "cid": _make_cid("kronos:1", msg_uid or "sol:1"),
                        "uid": "kronos:1",
                        "c": f"kronos received: {msg_text}",
                        "modified": int(datetime.now().timestamp())
                    }
                    await _ws_client.send_message(reply)
                    log(f"WS out: {reply}", event="ws.out")

                # Αν είναι "message" → log + απάντηση (προαιρετικά)
                elif msg_type == "message":
                    log(f"Message from {msg_uid}: {msg_text[:120]}", event="msg.in")

                    # Απάντηση — αν το msg είναι προς kronos
                    if msg.get("uid") != "kronos:1":
                        reply = {
                            "type": "message",
                            "cid": msg_cid or _make_cid("kronos:1", msg_uid),
                            "uid": "kronos:1",
                            "c": f"kronos received: {msg_text}",
                            "modified": int(datetime.now().timestamp())
                        }
                        await _ws_client.send_message(reply)
                        log(f"WS out: {reply}", event="ws.out")

        except Exception as e:
            _ws_connected = False
            log(f"WS error: {e}", level=logging.ERROR, event="ws.error")
            if _ws_client:
                try:
                    await _ws_client.close()
                except Exception:
                    pass
                _ws_client = None

            log("WS reconnecting in 5s", event="ws.reconnect")
            await asyncio.sleep(5)


# --------------------------------------------------
# (προαιρετικό) local WS — για debug / sol real-time
# --------------------------------------------------

connected_clients = []


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    log("WS local client connected", event="ws.local.connect")
    try:
        while True:
            data = await websocket.receive_text()
            log(f"WS local in: {data[:120]}", event="ws.local.in")
    except Exception:
        pass
    finally:
        if websocket in connected_clients:
            connected_clients.remove(websocket)
        log("WS local client disconnected", event="ws.local.disconnect")


# --------------------------------------------------
# Startup
# --------------------------------------------------

@app.on_event("startup")
async def startup():
    log("running startup")
    app.state.maria = Mari()
    log("Mari connection initialized")

    from cubos import aggregator as cubos
    cubos.register_all()

    log("\n".join([str(route) for route in app.routes]))

    # Background task — ΔΕΝ μπλοκάρει
    asyncio.create_task(ws_loop())

    log("Startup completed")


# --------------------------------------------------
# Main
# --------------------------------------------------

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=False,
        log_level=settings.LOG_LEVEL
    )