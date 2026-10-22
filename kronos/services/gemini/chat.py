import google.generativeai as genai
import os
import sys
import json
from fastapi import APIRouter, Request, HTTPException
from core.Maria import Maria
router = APIRouter()
mariadmin = Maria("gen_admin")
# Configure the Gemini API key
genai.configure(api_key="AIzaSyBzMZiTWZPLZuoPkPhCyeFGMa0DhCUcS3M")

# Load the Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")

# Initialize conversation history
conversation_history = {}

# Set default values for temperature and top_p
default_temperature = 1.0
default_top_p = 0.95

# Check for command-line arguments
if len(sys.argv) > 4:
    conversation_id = sys.argv[1]
    try:
        temperature = float(sys.argv[2])
        top_p = float(sys.argv[3])
    except ValueError:
        print("Invalid temperature or top_p, using default values.")
        temperature = default_temperature
        top_p = default_top_p
    prompt_text = sys.argv[4]
    print(f"Using conversation ID: {conversation_id}")
    print(f"Using temperature: {temperature}")
    print(f"Using top_p: {top_p}")
    print(f"Using prompt: {prompt_text}")
elif len(sys.argv) > 2:
    conversation_id = "01"
    try:
        temperature = float(sys.argv[1])
        top_p = float(sys.argv[2])
    except ValueError:
        print("Invalid temperature or top_p, using default values.")
        temperature = default_temperature
        top_p = default_top_p
    prompt_text = sys.argv[3]
 #   print(f"Using conversation ID: {conversation_id}")
  #  print(f"Using temperature: {temperature}")
  #  print(f"Using top_p: {top_p}")
   # print(f"Using prompt: {prompt_text}")
elif len(sys.argv) > 1:
    conversation_id = "default"
    temperature = default_temperature
    top_p = default_top_p
    prompt_text = "very short, very concise, answer. {sys.argv[1]}"
    print(f"Using conversation ID: {conversation_id}")
    print(f"Using temperature: {temperature}")
    print(f"Using top_p: {top_p}")
    print(f"Using prompt: {prompt_text}")
else:
    conversation_id = "default"
    temperature = default_temperature
    top_p = default_top_p
    prompt_text = "what is your name?."
    print(f"Using conversation ID: {conversation_id}")
    print(f"Using temperature: {temperature}")
    print(f"Using top_p: {top_p}")
    print("No prompt provided, using default prompt.")

# Ensure conversation history exists
if conversation_id not in conversation_history:
    conversation_history[conversation_id] = []

# Append the user's message to the conversation history
conversation_history[conversation_id].append({"role": "user", "content": prompt_text})

# Generate response using all previous messages
full_conversation = " ".join([msg["content"] for msg in conversation_history[conversation_id]])
response = model.generate_content(
    contents=full_conversation,
    generation_config=genai.types.GenerationConfig(
        temperature=temperature,
        top_p=top_p,
        top_k=40,
        presence_penalty = 0.0,
        frequency_penalty = 0.0
    )
)

# Append the AI's response to the conversation history
conversation_history[conversation_id].append({"role": "assistant", "content": response.text})

# Print the response
print(response.text)