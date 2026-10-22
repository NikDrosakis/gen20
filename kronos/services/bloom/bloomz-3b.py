from transformers import pipeline

# Load model
generator = pipeline("text-generation", model="bigscience/bloomz-3b")

from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.post("/generate")
async def generate(prompt: str, max_tokens: int = 50):
    try:
        result = generator(prompt, max_length=max_tokens)
        return {"output": result[0]["generated_text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))