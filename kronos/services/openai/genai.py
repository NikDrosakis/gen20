from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import time
import google.generativeai as genai

router = APIRouter()

# Define the data model for training data
class TrainingDataItem(BaseModel):
    text_input: str
    output: str

class GenerateContentRequest(BaseModel):
    input_text: str

# Define a base model and initial training data
base_model = "models/gemini-1.5-flash-001-tuning"
training_data = [
"input: what is GEN20",
  "output: GEN20 is an advanced, modular system designed to facilitate the development of interactive and dynamic applications. It integrates multiple technologies, including PHP, FastAPI, Node.js, and React Native, to provide a comprehensive solution for various web and mobile needs. The system comprises several key components, each serving a specific role, and leverages AI technologies to enhance functionality and user experience.",
  "input: what's the purpose of this system?",
  "output: The purpose of this system is to develop smart applications that harness the power of AI and modern web technologies to enhance mental and scientific knowledge. The goal is to utilize the vast resources available online while integrating AI capabilities to create useful, scalable applications. These tools aim to improve the way people interact with information, providing smarter, faster, and more insightful solutions.By using a combination of PHP, Node.js, React Native, and FastAPI, along with AI integrations such as Gemini and Cohere, the system bridges the gap between raw data and practical, intelligent applications. The overall vision is to empower users to unlock the potential of digital resources, elevating both individual and collective understanding.",
  "input: what's the main goal ?",
  "output: To provide a modular smart system, creating useful applications upgrading values, freedom in educational resources, upgrading mental and scientific concepts through programming, using the great sources of knowledge that exist on the internet, but also the contribution of AI",
  "input: what's the current ecosystem state?",
  "output: - The php api & to core in php8.3 (with 5 different utilizing core class methods accessing all type of data and buffers)- Vanillajs and decoupling from main libraries)- Layout & cubos- Use flexibility with drag & drop in admin- Generative AIs- solr neo4j, elasticsearch,- Ta kronos, wsi rising service modularity- Go and Rust as the young power- The gpm as it progresses- The admin > grid with the channels is small and disfunctional- the 270k vivalibro book titles saved in db in one night",
  "input: what are the key technologies?",
  "output: - **PHP**: Core backend API system.- **FastAPI**: Manages Gemini & Cohere services.- **Node.js**: Handles notifications with WebSocket and Redis PubSub.- **React**: Web Development- **React Native**: Mobile app development.- **Cubos**: UI widgets and layout components.- **Databases: MariaDB, Redis, MongoDB, Solr, Neo4j, ElasticSearch for Data indexing and graph database.- **PHP composer- **Primitive: GO- **Primitive: Rust",
  "input: Some important names and abbrevs?",
  "output: One-file: Fast way of writing code, on top",
  "input: the subsystems?",
  "output: VIVALIBRO:vivalibro, poetabook, nikdrosakis, all integrated domains PUBLIC_MOB:REACT NATIVE > vivalibro, all android applicationsCUBO:PHP & REACT > REUSABLE modules FOR PUBLICCORE:PHP classes + COMPOSER ADMIN:PHP COMMON DASHBOARD merge with GPM using also maria.gpm Kronos:COMMON python INTEGRATOR WSI:COMMON nodejs INTEGRATORCLI:low level, crons, backups, tasks using also maria.gpmRUS:INTEGRATOR rustGO:INTEGRATOR golang",
  "input: what's the progress of Kronos?",
  "output: # GPY > GEN20accessed in APY, python fastapi runs with uvicorn in venv## v.1 August20241. Rewritten Apifast from Fast API python2. Router & Service logic of integration3. Generative AIs experimenting with Gemini4. Core.Maria rewritten in python and tried as the Core API with gs.apy but Pedantic problems5. Swagger docs added ## v.2 September 20241. Generative AIs experimentations2. Solved pedantic 3. Guvicorn running uvicorn4. gpu.sh automation and then gscli fast functions5. Added Transformers, Tensorflow and Solr along with 10 not active AIs 6. javascript accessed from browser console.## v.3 WORKING October 20241. Activate & organize generative AIs tasks2. Automate processes & communication2. Scrape automation (together WITH GSCLI) service as Soup3. Kafka connect communication4. WS connect communication5. improve gs.js functionality",
  "input: what's the Core progress?",
  "output: # CORE > GEN20## v.1 August 20241. One INstance for all => Internal Mother Gaia abstracted, Vivalibro, GPM2. Upgrade to PHP 8.3 php CLASS becomes the core 3. core Maria rewriten, from Redis GRedis 4. Composer added extending functionality ## v.2 September 20241. One instance each system, Routing, multiple classes extending Gaia or traits2. PHP Gateway core API is PHP3. js library rewriten with gs.api methods to access even local class methods## v.3 October 20241. CURL communication with all subsystems, WSI, GPY, GO, RUST2. Improve access and class relations",
  "input: the dev WSI until now?",
  "output: # WSI > GEN20- WebSocket Integrations## v.1 JULY 20241. Rewritten from GaiaCMS nodejs & apijs API with WS as a module## v.2 August - September 20241. Router & Service logic of integration2. Generative AIs experimenting with Gemini3. Not the main API (PHP API)4. Included swagger docs## v.3 WORKING October 20241. Added Mongo service ok2. WS connected3. Kafka connected4. Generative AIs5. Connect with core6. Improve gs.js",
  "input: how many months of dev untill now?",
  "output: ",
]

@router.post("/tune-model")
async def tune_model():
    try:
        operation = genai.create_tuned_model(
            display_name="increment",
            source_model=base_model,
            epoch_count=20,
            batch_size=4,
            learning_rate=0.001,
            training_data=training_data,
        )

        for status in operation.wait_bar():
            time.sleep(10)  # Wait for a while to avoid overloading the API

        result = operation.result()
        return {"model_name": result.name, "status": "Model tuned successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tuning model: {e}")

@router.post("/generate")
async def generate_content(request: GenerateContentRequest):
    try:
        model = genai.GenerativeModel(model_name=request.input_text)
        result = model.generate_content(request.input_text)
        return {"generated_text": result.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating content: {e}")

# Additional function to plot the loss curve (optional)
@router.get("/plot-loss")
async def plot_loss():
    try:
        snapshots = []  # Fetch your actual snapshots
        # sns.lineplot(data=snapshots, x='epoch', y='mean_loss')  # Uncomment if using seaborn
        return {"status": "Loss curve plotted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error plotting loss curve: {e}")

# To include this router in your main FastAPI application
# from fastapi import FastAPI
# app = FastAPI()
# app.include_router(router, prefix="/gemini", tags=["Gemini Model"])
