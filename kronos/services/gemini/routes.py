import os
from fastapi import APIRouter, Request, HTTPException
import google.generativeai as genai
import mimetypes

router = APIRouter()

# Configure Gemini API key
genai.configure(api_key="AIzaSyBzMZiTWZPLZuoPkPhCyeFGMa0DhCUcS3M") # Replace with your actual key 

# Model Configuration
generation_config = {
  "temperature": 1.00,
  "top_p": 0.95,
  "top_k": 64,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}
conversation_history = []

# Model Configuration
generation_config = {
    "temperature": 1.00,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
conversation_history = {}

# Load the Gemini Model
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
)

def upload_to_gemini(file_path):
    """Uploads the given file to Gemini."""
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        # Upload file (assuming this is correct; replace with actual method if different)
        file = genai.upload_file("./store/GEN20.v0.42.txt")  # Use the correct method as per Gemini's documentation
        return file  # Return the response from the file upload

    except Exception as e:
        print(f"Error during file upload: {e}")
        return None

@router.post("/chat")
async def chat_with_gemini(request: Request):
    try:
        # 1. Get the message from the request body
        request_data = await request.json()
        message = request_data.get("message")
        if not message:
            raise HTTPException(status_code=400, detail="Missing 'message' field in request body")

        # 2. Handle file uploads (if needed):
        file_path = request_data.get("file_path")
        if file_path:
            file = upload_to_gemini(file_path)
            response = model.generate_content([message, file.uri])
        else:
            response = model.generate_content([message])

        # 3. Return the Gemini response
        return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interacting with Gemini: {e}")

@router.post("/conversation")
async def continue_conversation(request: Request):
    try:
        # Get the message and conversation ID from the request body
        request_data = await request.json()
        message = request_data.get("message")
        conversation_id = request_data.get("conversation_id")

        if not message:
            raise HTTPException(status_code=400, detail="Missing 'message' field in request body")

        # Ensure conversation history exists
        if conversation_id not in conversation_history:
            conversation_history[conversation_id] = []

        # Append the user's message to the conversation history
        conversation_history[conversation_id].append({"role": "user", "content": message})

        # Generate response using all previous messages
        full_conversation = " ".join([msg["content"] for msg in conversation_history[conversation_id]])
        inputs = tokenizer(full_conversation, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=150, num_return_sequences=1)

        # Decode the response
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Append the AI's response to the conversation history
        conversation_history[conversation_id].append({"role": "assistant", "content": response_text})

        return {"response": response_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing the conversation: {e}")
