from fastapi import APIRouter, Request, HTTPException
from transformers import GPTNeoForCausalLM, GPT2Tokenizer
import torch

router = APIRouter()

# Load GPT-Neo model and tokenizer
model_name = "EleutherAI/gpt-neo-2.7B"  # You can use other GPT-Neo models if needed
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPTNeoForCausalLM.from_pretrained(model_name)

@router.post("/chat")
async def chat_with_gpt_neo(request: Request):
    try:
        # Get the message from the request body
        request_data = await request.json()
        message = request_data.get("message")
        if not message:
            raise HTTPException(status_code=400, detail="Missing 'message' field in request body")

        # Tokenize the input message and generate a response
        inputs = tokenizer(message, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=600, num_return_sequences=10)

        # Decode the response
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Return the GPT-Neo response
        return {"response": response_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interacting with GPT-Neo: {e}")

@router.post("/conversation")
async def continue_conversation(request: Request):
    try:
        # Get the message and conversation ID from the request body
        request_data = await request.json()
        message = request_data.get("message")
        conversation_id = request_data.get("conversation_id")

        if not message:
            raise HTTPException(status_code=400, detail="Missing 'message' field in request body")

        # Append the user's message to the conversation history
        if conversation_id not in conversation_history:
            conversation_history[conversation_id] = []
        conversation_history[conversation_id].append({"role": "user", "content": message})

        # Generate response using the full conversation history
        conversation_history_text = " ".join([msg["content"] for msg in conversation_history[conversation_id]])
        inputs = tokenizer(conversation_history_text, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=150, num_return_sequences=1)

        # Decode the response
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Add the model's response to the conversation history
        conversation_history[conversation_id].append({"role": "system", "content": response_text})

        return {
            "conversation_id": conversation_id,
            "response": response_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during conversation: {e}")

# Store conversation history
conversation_history = {}
