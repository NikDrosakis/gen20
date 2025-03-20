import asyncio
import redis
import logging
import keyboard
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from core.Mari import Mari
from action import action_loop, add
from datetime import datetime
from core.WS import WSClient
from core.Watch import Watch
from core.Yaml import Yaml
import os
import io

# Logging setup
log_file_path = 'kronos.log'
log_file = open(log_file_path, 'a')
logger = logging.getLogger('kronos')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(io.StringIO())  # Dummy handler
logger.addHandler(handler)

def log(message, level=logging.INFO):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_message = f'{timestamp} - {level} - {message}\n'
    log_file.write(log_message)
    log_file.flush()

    if os.getenv('KRONOS_LOGGING_ENABLED') == 'true':
        if level == logging.ERROR:
            logger.error(message)
        elif level == logging.WARNING:
            logger.warning(message)
        elif level == logging.INFO:
            logger.info(message)
        else:
            print(message)

# Integrations
from services.deepseek.routes import router as deepseek_route
from services.gaia.routes import router as gaia_route

# Start FastAPI
app = FastAPI(
    title="Kronos API",
    docs_url="/apy/v1/docs",
    redoc_url="/apy/v1/redoc",
    openapi_url="/apy/v1/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includes
app.include_router(deepseek_route, prefix="/apy/v1/deepseek")
app.include_router(gaia_route, prefix="/apy/v1/gaia")

# WSManager Initialize
async def wsinit():
    ws_client = None
    try:
        log("Initializing WebSocket connection...")
        ws_client = WSClient(uri=settings.WEBSOCKET_URL)
        await ws_client.connect()
        log("Connected to WebSocket server!")

        message = {
            "system": "kronos",
            "domaffect": "*",
            "type": "open",
            "verba": "kronos pings",
            "userid": "1",
            "to": "1",
            "cast": "one",
        }

        await ws_client.send_message(message)

        response = await ws_client.receive_message()
        log(f"Received response: {response}")

    except Exception as e:
        log(f"WebSocket error: {e}", level=logging.ERROR)

    finally:
        if ws_client:
            log("Closing WebSocket connection...")
            await ws_client.close()

@app.on_event("startup")
async def startup():
    log("running startup")
    app.state.maria = Mari()
    log("Mari connection initialized")
    #app.state.solr = Solr(settings.DATABASE_SOLR_VIVALIBRO)
    # Send the notification asynchronously
    # Fetch actions from the database (using maria_admin instance)
    #logging.info("Executing Actions on startup...")
    #await action_loop()
     # Start watching the YAML file for changes
    #json= Yaml.read_yaml_and_convert_to_json("manifest.yml")
    #Watch.start_watching("manifest.yml", "systems", "yaml")
    # Start watching the YAML file for changes
    #await asyncio.gather(handle_shortcuts())
    # Start the periodic ping task
    #asyncio.create_task(periodic_ping())
    log("\n".join([str(route) for route in app.routes]))
   # You can import additional modules here, but no need to instantiate `Mari` again
    await wsinit()
    log("Startup completed")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,  # Enable auto-reload for development
        log_level=settings.LOG_LEVEL
    )