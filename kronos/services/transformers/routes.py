from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import pipeline
generator = pipeline("text-generation", model="gpt2")
router = APIRouter()

@router.get('/')
def read_root():
    return {'message': 'Welcome to transformers'}

# Load a Hugging Face text generation model (GPT-2 in this case)
#
#
#
generator = pipeline("text-generation", model="gpt2")
# Define a Pydantic model for the input
class TextGenerationInput(BaseModel):
    prompt: str
    max_length: int = 500  # Default value of 50 if not provided


# /pedia endpoint for generating poetic analysis or suggestions
@router.post("/pedia/")
async def pedia_analysis(input: TextGenerationInput):
    try:
        # Generate text based on the provided prompt (poet's verse)
        results = generator(input.prompt, max_length=input.max_length, num_return_sequences=1)

        # Extract generated text for analysis or poetic suggestions
        generated_text = results[0]['generated_text']

        # Here, you can filter or modify the generated_text to match your needs.
        # For instance, extracting metaphors, rhymes, or literary devices.

        # Return the generated poetic analysis
        return {"analysis": generated_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Define the route for text generation
@router.post("/generate/")
async def generate_text(input: TextGenerationInput):
    try:
        # Generate text based on the provided prompt
        results = generator(input.prompt, max_length=input.max_length, num_return_sequences=1)
        return {"generated_text": results[0]['generated_text']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

sentiment_analyzer = pipeline("sentiment-analysis")

@router.post("/sentiment/")
async def analyze_sentiment(text: str):
    results = sentiment_analyzer(text)
    return {"sentiment": results}


