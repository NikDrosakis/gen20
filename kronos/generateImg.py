# core/model_loader.py
import logging
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from transformers import CLIPTextModel, CLIPTokenizer
import torch

logging.basicConfig(level=logging.INFO)

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

models = load_models()
print(models)