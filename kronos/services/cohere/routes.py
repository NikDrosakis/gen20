from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import cohere
router = APIRouter()
# Pydantic model to validate the user input
class UserInput(BaseModel):
    user_input: str

# Initialize Cohere API client
co = cohere.Client("kCt3uAMGFqMF8bkinkIdyjcR2dRdM6Fao9nUyLxG")

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.post("/stream")
async def cohere_stream(input_data: UserInput):
    try:
        # Call Cohere's generate API
        response = co.generate(
            model="command-r-plus-08-2024",  # Choose the model
            prompt=f"User: {input_data.user_input}\nChatbot:",
            max_tokens=500,
            temperature=0.7,
            stream=True  # Enable streaming from Cohere
        )

        # Iterate through the streaming response tokens
        for token in response:
            yield token.text  # Send each token as part of the stream

    except cohere.error.CohereError as e:
        yield f"Error: {str(e)}"

# Define the streaming chat route
@router.post("/chat")
async def generate_chat_response(input_data: UserInput):
    try:
        # Call Cohere's generate API without stream=True
        response = co.generate(
            model="command-r-plus-08-2024",  # Choose the model
            prompt=f"User: {input_data.user_input}\nChatbot:",
            max_tokens=500,
            temperature=0.7
        )

        # Convert response to plain text and yield each part
        async def generate_text():
            try:
                text = response.generations[0].text
                for token in text.split():  # Split text into tokens for streaming
                    yield token + " "  # Adding space between tokens
            except Exception as e:
                yield f"Error: {str(e)}"
            response = {"generated_text": "Here's the response from the model."}
        return StreamingResponse(generate_text(), media_type="text/plain")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during text generation: {str(e)}")

