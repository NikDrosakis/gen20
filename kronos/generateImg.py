import logging
logging.basicConfig(level=logging.INFO)

from transformers import pipeline

# Load a valid model
model = pipeline('text-to-image', model='stabilityai/stable-diffusion-2-1')

# Generate an image
image = model("A beautiful landscape")
