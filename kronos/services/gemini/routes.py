import os
from fastapi import APIRouter, Request, HTTPException
import google.generativeai as genai
from core.Maria import Maria  # Import Maria class

router= APIRouter();
# Initialize Maria instance for gen_admin database access
mariadmin = Maria("gen_admin")

# Initialize the Gemini API key
genai.configure(api_key="AIzaSyBzMZiTWZPLZuoPkPhCyeFGMa0DhCUcS3M")  # Replace with your actual key

# Model Configuration
generation_config = {
    "temperature": 1.00,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Load the Gemini Model
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    generation_config=generation_config,
)
# API Endpoints
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

# Endpoint to get the list of databases
@router.get("/schema")
async def get_databases():
    try:
        databases = mariadmin.get_maria_tree()
        return {"databases": databases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching databases: {e}")

# Endpoint to get all tables with their corresponding databases
@router.get("/tables")
async def get_tables():
    try:
        tables_with_dbs = mariadmin.tables()
        return {"tables_with_dbs": tables_with_dbs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tables with databases: {e}")

# Endpoint to get metadata of a specific table (columns, types, comments, etc.)
@router.get("/table_meta/{table_name}")
async def get_table_meta(table_name: str):
    try:
        table_metadata = mariadmin.table_meta(table_name)
        if table_metadata is None:
            raise HTTPException(status_code=404, detail=f"Table {table_name} not found.")
        return {"table_metadata": table_metadata}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching table metadata: {e}")
