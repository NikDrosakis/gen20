from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/deepseek-coder-6.7b-base", trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained("deepseek-ai/deepseek-coder-6.7b-base", trust_remote_code=True)

# Explicitly set the model to run on the CPU
model.to("cpu")

# Input text
input_text = "#write a quick sort algorithm"

# Tokenize the input and move to the CPU
inputs = tokenizer(input_text, return_tensors="pt").to("cpu")

# Generate output
outputs = model.generate(**inputs, max_length=128)

# Decode and print the output
print(tokenizer.decode(outputs[0], skip_special_tokens=True))