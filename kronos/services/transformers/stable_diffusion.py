# core/model_loader.py
import logging
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from transformers import CLIPTextModel, CLIPTokenizer
import torch
from fastapi import APIRouter, Request, HTTPException
from io import BytesIO
from base64 import b64encode
from fastapi.responses import HTMLResponse
import json


logging.basicConfig(level=logging.INFO)

router = APIRouter()
actiongrp = "stable_diffusion"
a = []

def load_models():
    """Loads the Stable Diffusion model components on CPU."""
    print("Loading Stable Diffusion model on CPU...")
    model_id = "stabilityai/stable-diffusion-2-1"

    # Load tokenizer and text encoder
    tokenizer = CLIPTokenizer.from_pretrained(model_id, subfolder="tokenizer")
    text_encoder = CLIPTextModel.from_pretrained(model_id, subfolder="text_encoder")

    # Load the scheduler
    scheduler = DPMSolverMultistepScheduler.from_pretrained(model_id, subfolder="scheduler")

    # Load the pipeline
    pipeline = StableDiffusionPipeline.from_pretrained(
        model_id,
        scheduler=scheduler,
        text_encoder=text_encoder,
        tokenizer=tokenizer,
        torch_dtype=torch.float32, # Use float32 for CPU
    )
    pipeline = pipeline.to("cpu") # Explicitly move to CPU
    return pipeline

# Load the model when the module is loaded
model = load_models()

# 1. Generate Image Endpoint
a.append({
    "actiongrp": actiongrp,
    "name": "stable_diffusion_generate_image",
    "description": "Generates an image from text using the Stable Diffusion model.",
    "meta": "generate_image",
    "endpoint": "/generate_image",
    "method": "POST",
    "params": json.dumps({
        "prompt": "string"
    })
})
@router.post("/generate_image", response_class=HTMLResponse)
async def generate_image(request: Request):
    try:
        request_data = await request.json()
        prompt = request_data.get("prompt")

        if not prompt:
            raise HTTPException(status_code=400, detail="Missing 'prompt' field in request body")

        with torch.no_grad():
            image = model(prompt).images[0]
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = b64encode(buffered.getvalue()).decode()
        html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Generated Image</title>
            </head>
            <body>
                <h1>Generated Image</h1>
                <img src="data:image/png;base64,{img_str}" alt="Generated Image">
            </body>
            </html>
        """
        return html_content

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating image: {e}")

