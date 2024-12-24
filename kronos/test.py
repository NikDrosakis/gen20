from transformers import DistilBertTokenizer, TFDistilBertForSequenceClassification
from datasets import load_dataset
import tensorflow as tf

# Load a dataset (for this example, we'll use a small subset from Hugging Face's datasets)
dataset = load_dataset("imdb", split="train[:1%]")  # Example: 1% of IMDB dataset

# Preprocess the text data
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
def preprocess_function(examples):
    return tokenizer(examples["text"], truncation=True, padding=True)

dataset = dataset.map(preprocess_function, batched=True)

# Load the pre-trained DistilBERT model for text classification
model = TFDistilBertForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)

# Define training arguments
batch_size = 8
epochs = 3
optimizer = tf.keras.optimizers.Adam(learning_rate=5e-5)

# Prepare dataset for training
train_dataset = dataset.shuffle(1000).batch(batch_size)

# Train the model
model.compile(optimizer=optimizer, loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), metrics=["accuracy"])
model.fit(train_dataset, epochs=epochs)
