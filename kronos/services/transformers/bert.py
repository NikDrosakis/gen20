from transformers import BertForSequenceClassification, BertTokenizer
import torch
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from tqdm import tqdm

# 1. Define Dataset Class
class TextClassificationDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]

        inputs = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )

        return {
            "input_ids": inputs["input_ids"].squeeze(),
            "attention_mask": inputs["attention_mask"].squeeze(),
            "labels": torch.tensor(label, dtype=torch.long)
        }


# 2. Prepare Data
texts = [
    "This movie was amazing!",
    "I hated this film.",
    "The acting was superb.",
    "It was a terrible experience.",
    "I loved the plot."
]
labels = [1, 0, 1, 0, 1]  # 1 for positive, 0 for negative
max_length = 128
batch_size = 8
learning_rate = 2e-5
num_epochs = 3

# 3. Load BERT Model and Tokenizer
model_name = "bert-large-uncased"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForSequenceClassification.from_pretrained(model_name, num_labels=2) # 2 for binary classification

# 4. Create Dataset and DataLoader
dataset = TextClassificationDataset(texts, labels, tokenizer, max_length)
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

# 5. Optimizer and Loss Function
optimizer = AdamW(model.parameters(), lr=learning_rate)

# 6. Training Loop
if torch.cuda.is_available():
    model = model.to("cuda")
    print("GPU available, model moved to GPU")
else:
    print("GPU not available, model running on CPU")

for epoch in range(num_epochs):
    model.train()
    total_loss = 0
    progress_bar = tqdm(dataloader, desc=f"Epoch {epoch+1}/{num_epochs}")
    for batch in progress_bar:
        optimizer.zero_grad()
        input_ids = batch["input_ids"]
        attention_mask = batch["attention_mask"]
        labels = batch["labels"]

        if torch.cuda.is_available():
            input_ids = input_ids.to("cuda")
            attention_mask = attention_mask.to("cuda")
            labels = labels.to("cuda")

        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        total_loss += loss.item()
        loss.backward()
        optimizer.step()
        progress_bar.set_postfix({"loss": loss.item()})

    avg_loss = total_loss / len(dataloader)
    print(f"Epoch {epoch+1} Average Loss: {avg_loss}")

# 7. Evaluation (Inference)
model.eval()
test_text = "A donkey can fly"
inputs = tokenizer(test_text, add_special_tokens=True, max_length=max_length, padding="max_length", truncation=True, return_tensors="pt")
if torch.cuda.is_available():
    inputs = {k: v.to("cuda") for k, v in inputs.items()}
with torch.no_grad():
    outputs = model(**inputs)
    probabilities = torch.softmax(outputs.logits, dim=-1) # Apply softmax
    predictions = torch.argmax(probabilities, dim=-1)
    print(f"Prediction: {predictions.item()}")
    print(test_text)
    print(f"Probabilities: {probabilities.tolist()}")