import requests
from transformers import BertForSequenceClassification, BertTokenizer
import torch

# 1. API Call
api_url = "https://vivalibro.com/api/v1/maria/flist?expression=select%20description%20from%20gen_admin.cubo"
try:
    response = requests.get(api_url)
    response.raise_for_status()  # Raise an exception for bad status codes
    data = response.json()
except requests.exceptions.RequestException as e:
    print(f"Error making API request: {e}")
    exit()

# 2. Data Extraction (Assuming a JSON list)
if isinstance(data, dict) and 'data' in data and isinstance(data['data'], list):
    texts = [item for item in data['data'] if item is not None] # Filter out null values
else:
    print("API response is not a dictionary with a 'data' list. Please check the API response format.")
    exit()

# 3. Load BERT Model and Tokenizer
model_name = "bert-base-uncased"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForSequenceClassification.from_pretrained(model_name, num_labels=2)

# 4. Preprocessing and Inference
max_length = 128
for text in texts:
    inputs = tokenizer(text, add_special_tokens=True, max_length=max_length, padding="max_length", truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=-1)
        predictions = torch.argmax(probabilities, dim=-1)
        print(f"Text: {text}")
        print(f"Prediction: {predictions.item()}")
        print(f"Probabilities: {probabilities.tolist()}")