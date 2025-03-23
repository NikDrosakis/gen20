from fastapi import APIRouter, HTTPException, Request
from .start import predict_text_gemini
from openai import OpenAI
router = APIRouter()

@router.post("/chat/completions")
async def chat_completions(request: Request):
    try:
        request_data = await request.json()
        text = request_data.get("text")

        if not text:
            raise HTTPException(status_code=400, detail="Missing 'text' parameter in request body.")

        project_id = "proj_4Fq4QSZquc2xM3PbTOJ8W2jB"
        model_id = "your-gemini-model-id"
        location = "us-central1" # Or your model's location

        response = predict_text_gemini(text, project_id, model_id, location)
        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    try:
        request_data = await request.json()
        text = request_data.get("text")

        if not text:
            raise HTTPException(status_code=400, detail="Missing 'text' parameter in request body.")

@router.post("/v1/chat/completions")
async def chat_completionsv1(request: Request):
    try
        client = OpenAI()
        response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[],
        temperature=1,
        max_tokens=2048,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={
        "type": "text"
        }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    try:
        request_data = await request.json()
        return {"response": response}

        if not text:
            raise HTTPException(status_code=400, detail="Missing 'text' parameter in request body.")

