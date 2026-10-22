from fastapi import FastAPI, APIRouter
from pydantic import BaseModel
from transformers import GPT2LMHeadModel, GPT2Tokenizer

# Initialize FastAPI app
app = FastAPI()

# Initialize the APIRouter
router = APIRouter()

# Load GPT-2 model and tokenizer
model_name = "gpt2"  # You can replace this with a different GPT-2 model variant
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPT2LMHeadModel.from_pretrained(model_name)

# Define the input model for the prompt request
class PromptRequest(BaseModel):
    prompt: str
    max_length: int = 50  # Default maximum length for generated text

# Create a route for text generation
@app.post("/generate")
async def generate_text(request: PromptRequest):
    # Encode the input prompt
    inputs = tokenizer.encode(request.prompt, return_tensors="pt")

    # Generate output
    outputs = model.generate(inputs, max_length=request.max_length, num_return_sequences=1)

    # Decode and return the output
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return {"generated_text": generated_text}
