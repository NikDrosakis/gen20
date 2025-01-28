import asyncio
import redis
import logging
import keyboard
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from core.Mari import Mari
#from pysolr import Solr

#from connection import get_db_connection
from action import action_loop, add
from datetime import datetime  # Import datetime module
from core.WS import WSClient, wsinit
from core.Watch import Watch
from core.Yaml import Yaml

# Configure logging
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')
# Integrations
from services.deepseek.routes import router as deepseek_route
#from services.bloom.routes import router as bloom_route
#from services.bloom.task_book_summaries import router as bloom_route
#from services.claude.routes import router as claude_route
#from services.gptneo.routes import router as gptneo_route
# from services.llama.routes import router as llama_route
# from services.transformers.routes import router as transformers_route
#from services.cohere.routes import router as cohere_route
# from services.solr.routes import router as solr_route
#from services.gemini.routes import router as gemini_route
# from services.tensorflow.routes import router as tensorflow_route
#from services.openai.genai import router as openai_route
#from services.gaia.routes import router as gaia_route
# Import the send_notification function

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
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Includes
app.include_router(deepseek_route, prefix="/apy/v1/deepseek") #llm
#app.include_router(bloom_route, prefix="/apy/v1/bloom") #pretrained
#app.include_router(claude_route, prefix="/apy/v1/claude")
#app.include_router(gptneo_route, prefix="/apy/v1/gptneo")
# app.include_router(llama_route, prefix="/apy/v1/llama")
#app.include_router(transformers_route, prefix="/apy/v1/transformers")
#app.include_router(cohere_route, prefix="/apy/v1/cohere")
# app.include_router(solr_route, prefix="/apy/v1/solr")
#app.include_router(gemini_route, prefix="/apy/v1/gemini")
# app.include_router(tensorflow_route, prefix="/apy/v1/tensorflow")
#app.include_router(openai_route, prefix="/apy/v1/openai")
#app.include_router(gaia_route, prefix="/apy/v1/gaia")

# WSManager Initialize
# ws_manager = WSManager(settings.REDIS_URL)

@app.on_event("startup")
async def startup():
    print("running startup")
    app.state.maria = Mari()
    logging.info("Mari connection initialized")
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
    print("\n".join([str(route) for route in app.routes]))
   # You can import additional modules here, but no need to instantiate `Mari` again
    #await wsinit()
    logging.info("Startup completed")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,  # Enable auto-reload for development
        log_level=settings.LOG_LEVEL
    )
