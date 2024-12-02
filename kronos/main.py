import redis
import logging
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from core.Maria import Maria
from pysolr import Solr
from config import settings
from connection import get_db_connection
import websockets
import asyncio
from datetime import datetime  # Import datetime module
from ws_send import ws_send

logging.basicConfig(level=logging.DEBUG)
# Integrations
from services.claude.routes import router as claude_route
#from services.bloom.task_book_summaries import router as bloom_route
#from services.gptneo.routes import router as gptneo_route
# from services.llama.routes import router as llama_route
# from services.transformers.routes import router as transformers_route
from services.cohere.routes import router as cohere_route
# from services.solr.routes import router as solr_route
from services.gemini.routes import router as gemini_route
# from services.tensorflow.routes import router as tensorflow_route
from services.openai.genai import router as openai_route
from services.gaia.routes import router as gaia_route
# Import the send_notification function

# Start FastAPI
app = FastAPI(
    title="Gen20 Python Integrations (Kronos)",
    docs_url="/apy/v1/docs",
    redoc_url="/apy/v1/redoc",
    openapi_url="/apy/v1/openapi.json"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def periodic_ping():
    while True:
        notification = {
            "userid": "1",
            "type": "activity",
            "cast": "broadcast",
            "cid":3701232,
            "uid":1,
            "to":1,
            "text": "Message from Kronos, Kronos loaded!!",
            "data": {
                "active_users": 5,
                "total_books": 280447,
            },
            "timestamp": datetime.utcnow().isoformat()  # Use UTC for consistency
        }
        # Send a ping notification via WebSocket
        await ws_send(notification)

        # Wait for 60 seconds before sending the next ping
        await asyncio.sleep(60)

# Initialize Redis client
app.state.redis_client = redis.Redis(
    host='localhost',
    port=6379,
    password='yjF1f7uiHttcp',
    decode_responses=True  # Automatically decode responses to strings
)

# Includes
app.include_router(claude_route, prefix="/apy/v1/claude")
#app.include_router(bloom_route, prefix="/apy/v1/bloom")
#app.include_router(gptneo_route, prefix="/apy/v1/gptneo")
# app.include_router(llama_route, prefix="/apy/v1/llama")
#app.include_router(transformers_route, prefix="/apy/v1/transformers")
app.include_router(cohere_route, prefix="/apy/v1/cohere")
# app.include_router(solr_route, prefix="/apy/v1/solr")
app.include_router(gemini_route, prefix="/apy/v1/gemini")
# app.include_router(tensorflow_route, prefix="/apy/v1/tensorflow")
app.include_router(openai_route, prefix="/apy/v1/openai")
app.include_router(gaia_route, prefix="/apy/v1/gaia")

# WSManager Initialize
# ws_manager = WSManager(settings.REDIS_URL)

@app.on_event("startup")
async def startup():
    app.state.maria_vivalibro = Maria(settings.DATABASE_VIVALIBRO)
    app.state.maria_admin = Maria(settings.DATABASE_GPM)
    #app.state.solr = Solr(settings.DATABASE_SOLR_VIVALIBRO)
    # Send the notification asynchronously
    # Start the periodic ping task
    asyncio.create_task(periodic_ping())


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,  # Enable auto-reload for development
        log_level=settings.LOG_LEVEL
    )
