from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import requests
import logging
from config import settings
from core.Mari import Mari
maria = Mari()
router = APIRouter()
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# DeepSeek API configuration
client = OpenAI(
    api_key=settings.DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com",
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather of a location, the user should supply a location first",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    }
                },
                "required": ["location"]
            },
        }
    },
]

# Pydantic models for request/response validation
class TextGenerationRequest(BaseModel):
    prompt: str
    max_tokens: int = 100

class TextClassificationRequest(BaseModel):
    text: str
    categories: list[str]

class NERRequest(BaseModel):
    text: str

class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, description="The input text for generating content.")
    target_language: str = Field(..., description="The target language for translation.")
    max_tokens: int = Field(default=150, description="Maximum number of tokens for the response.")

class QARequest(BaseModel):
    question: str
    context: str

# Helper function to call DeepSeek API
def call_deepseek_api(endpoint: str, payload: dict):
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post(f"{settings.DEEPSEEK_BASE_URL}/{endpoint}", headers=headers, json=payload)
    if response.status_code != 200:
        logger.error(f"DeepSeek API error: {response.status_code}, {response.text}")
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()

# Route for text generation
@router.post("/generate-text")
async def generate_text(request: TextGenerationRequest):
    try:
        # Construct the messages for the chat model
        messages = [
            {"role": "system", "content": "You are a helpful assistant"},
            {"role": "user", "content": request.prompt},
        ]

        # Call the DeepSeek API
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            max_tokens=request.max_tokens,
            stream=False
        )

        # Extract and return the generated content
        generated_text = response.choices[0].message.content
        return {"generated_text": generated_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text generation failed: {str(e)}")

# Route for text classification
@router.post("/classify-text")
async def classify_text(request: TextClassificationRequest):
    """
    Classify text into predefined categories using DeepSeek.
    """
    payload = {
        "model": "deepseek-classification",
        "text": request.text,
        "categories": request.categories
    }
    response = call_deepseek_api("classify", payload)
    return {"classification": response["category"]}

# Route for named entity recognition (NER)
@router.post("/extract-entities")
async def extract_entities(request: NERRequest):
    """
    Extract named entities from text using DeepSeek.
    """
    payload = {
        "model": "deepseek-ner",
        "text": request.text
    }
    response = call_deepseek_api("ner", payload)
    return {"entities": response["entities"]}

# Route for language translation
@router.post("/translate-text")
async def translate_text(request: TranslationRequest):
    """
    Translate text to a target language using DeepSeek.
    """
    payload = {
        "model": "deepseek-translation",
        "text": request.text,
        "target_language": request.target_language
    }
    response = call_deepseek_api("translate", payload)
    return {"translated_text": response["translation"]}

# Route for question answering
@router.post("/answer-question")
async def answer_question(request: QARequest):
    """
    Answer a question based on context using DeepSeek.
    """
    payload = {
        "model": "deepseek-qa",
        "question": request.question,
        "context": request.context
    }
    response = call_deepseek_api("qa", payload)
    return {"answer": response["answer"]}

# Health check endpoint
@router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Run the FastAPI app
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)